class Map {
    Dungeons = [];
    Monsters = [];
    Traps = [];
    // Runtime
    DOMObject = null;
    SelectedDungeon = null;
    // Events
    OnTileClick = null;
    OnDungeonClick = null;

    HasActiveDungeon() {
        return this.SelectedDungeon != null;
    }

    SelectDungeon(dungeon) {
        this.SelectedDungeon = dungeon;
        dungeon.Active = true;
        dungeon.UpdateUI();
    }

    FinishDungeon() {
        let dungeon = this.SelectedDungeon;
        this.SelectedDungeon = null;
        dungeon.Active = false;
        dungeon.Completed = true;
        dungeon.UpdateUI();
    }

    GetMonsterXP(monsters) {
        let xp = 0;
        for (let i in monsters) {
            let monster = monsters[i];
            let m = this.Monsters.find(m => m.Type == monster);
            if (m == null) {
                console.error(`Did not find monster ${monster}`);
                continue;
            }
            xp += m.XP;
        }
        return xp;
    }

    //TODO: can we do this automatically
    ToJson() {
        let ret = {
            dungeons: [],
            monsters: [],
            traps: [],
        };
        for (let i in this.Dungeons) {
            let d = this.Dungeons[i];
            ret.dungeons.push(d.ToJson());
        }
        //TODO: monsters, traps
        return ret;
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("map");
        this.DOMObject = ret;
        // dungeons
        let dungeons = document.createElement("div");
        dungeons.classList.add("dungeons");
        ret.appendChild(dungeons);
        for (let i in this.Dungeons) {
            let d = this.Dungeons[i];
            dungeons.appendChild(d.DOMObject);
            // listen to event and propagate
            d.DOMObject.onclick = (e) => {
                if (this.OnDungeonClick) {
                    this.OnDungeonClick({
                        "dungeon": d
                    });
                }
            };
            d.OnTileClick = (e) => {
                if (this.OnTileClick) {
                    this.OnTileClick({
                        "dungeon": e.dungeon,
                        "tile": e.tile
                    })
                }
            };
        }
        // monsters + traps
        let legend = document.createElement("div");
        legend.classList.add("legend");
        ret.appendChild(legend);
        /// monsters
        let monsters = document.createElement("div");
        monsters.classList.add("monsters");
        legend.appendChild(monsters);
        for (let i in this.Monsters) {
            let m = this.Monsters[i];
            monsters.appendChild(m.DOMObject);
        }
        /// traps
        let traps = document.createElement("div");
        traps.classList.add("traps");
        legend.appendChild(traps);
        for (let i in this.Traps) {
            let t = this.Traps[i];
            traps.appendChild(t.DOMObject);
        }
        return ret;
    }

    static FromJson(json) {
        let map = new Map();

        for (let i in json.dungeons) {
            let d = json.dungeons[i];
            map.Dungeons.push(Dungeon.FromJson(d));
        }
        for (let i in json.monsters) {
            let m = json.monsters[i];
            map.Monsters.push(Monster.FromJson(m));
        }
        for (let i in json.traps) {
            let t = json.traps[i];
            map.Traps.push(Trap.FromJson(t));
        }
        map.CreateDOM();
        return map;
    }
}

class Dungeon {
    Name = "";
    isBoss = false;
    Rows = 6;
    Columns = 6;
    Dice = 1;
    Width = 1;
    Height = 1;
    Tiles = [];
    // Runtime
    DOMObject = null;
    Grid = [];
    Active = false;
    Completed = false;
    //TODO: dots

    ToJson() {
        let ret = {
            "name": this.Name,
            "rows": this.Rows,
            "columns": this.Columns,
            "dice": this.Dice,
            "width": this.Width,
            "height": this.Height,
            "tiles": []
        }
        for (let i in this.Tiles) {
            let t = this.Tiles[i];
            ret.tiles.push(t.ToJson());
        }
        return ret;
    }

    // Check if the dungeon has a path between entry and exit
    IsFinished() {
        // find the entry
        let entry = null;
        for (let i in this.Tiles) {
            let tile = this.Tiles[i];
            if (tile.Type == "entry") {
                entry = tile;
                break;
            }
        }
        if (entry == null) {
            console.error("No entry found");
            return false;
        }

        let marked = {};
        let base = this;

        function findExit(tile) {
            // get next step tiles
            let tiles = base.GetTileNeighbours(tile);

            for (let i in tiles) {
                let newTile = tiles[i];
                let id = `${newTile.X},${newTile.Y}`;
                if (marked[id] != null) // skip already marked ones
                    continue;
                marked[id] = true;
                // check
                if (newTile.Type == "exit")
                    return true;
                // no need to check for traversable as we cant explore non traversable ones?
                if (newTile.IsExplored()) {
                    if (findExit(newTile)) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (findExit(entry))
            return true;
        return false;
    }

    CalculateXP() {
        let xp = 0;
        let enemies = [];
        for (let x = 0; x < this.Grid.length; x++) {
            let complete = true;
            for (let y = 0; y < this.Grid[x].length; y++) {
                let tile = this.Grid[x][y];
                // Add defeated monsters to the list
                if (tile.Type == "monster" && tile.Collected) {
                    enemies.push(tile);
                }

                if (tile.IsTraversable() && !tile.IsExplored()) {
                    complete = false;
                    break;
                }
            }
            // Completed columns give one xp
            if (complete) {
                xp += 1;
            }
        }
        return {
            "xp": xp,
            "enemies": enemies
        };
    }

    CheckForCollection(tile) {
        //TODO: move this into map or give the monsters into this func
        let tiles = this.GetTileNeighbours(tile);
        for (let i in tiles) {
            let other = tiles[i];
            // already collected
            if (other.Collected)
                continue;
            let result = false;
            switch (other.Type) {
                case "item":
                    // check if there are two identical numbers adjacent
                    let collected = {};
                    let adjacent = this.GetTileNeighbours(other);
                    //TODO: this code should probably not be here?
                    for (let i in adjacent) {
                        let adj = adjacent[i];

                        // no number => not important for us
                        let val = adj.Value;
                        if (val == null)
                            continue;

                        // if we already have this value this one is collected
                        if (collected[val] != null)
                        {
                            result = true;
                            break;
                        }
                        // else mark it for the future
                        collected[val] = true;
                    }
                    break;
                case "monster":
                    //TODO: monster
                    break;
                default:
                    continue;
            }
            // mark it as collected
            if (result) {
                other.Collected = true;
                other.UpdateUI();
            }
        }
    }

    CanReachTile(tile, character) {
        let weapons = character.Weapons;
        return weapons.CanReachTile(tile, this.Grid);
    }

    GetTileNeighbours(tile) {
        //INFO: this assumes we have a rectangular grid
        let ret = [];
        if (tile.X > 0) // left
            for (let i = 0; i < tile.Height; i++)
                ret.push(this.Grid[tile.X - 1][tile.Y + i]);
        if (tile.Y > 0) // top
            for (let i = 0; i < tile.Width; i++)
                ret.push(this.Grid[tile.X + i][tile.Y - 1]);
        if ((tile.X + tile.Width) < this.Grid.length) // right
            for (let i = 0; i < tile.Height; i++)
                ret.push(this.Grid[tile.X + tile.Width][tile.Y + i]);
        if ((tile.Y + tile.Height) < this.Grid[tile.X].length) // down
            for (let i = 0; i < tile.Width; i++)
                ret.push(this.Grid[tile.X + i][tile.Y + tile.Height]);
        return ret;
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("dungeon");
        this.DOMObject = ret;
        // title bar
        let title = document.createElement("div");
        title.classList.add("dungeon-title");
        ret.appendChild(title);
        /// name tag
        let name = document.createElement("div");
        name.classList.add("dungeon-name");
        name.innerText = this.Name;
        title.appendChild(name);
        /// icons
        let dices = document.createElement("div");
        dices.classList.add("dungeon-dices");
        // wandering dice
        if (this.Dice >= 2) {
            let wandering = document.createElement("div");
            wandering.classList.add("dungeon-wandering-dice");
            dices.appendChild(wandering);
        }
        for (let i = 0; i < this.Dice; i++) {
            let dice = document.createElement("div");
            dice.classList.add("dungeon-dice");
            dices.appendChild(dice);
        }
        title.appendChild(dices);

        // Create the grid
        let grid = document.createElement("div");
        grid.classList.add("dungeon-grid");
        grid.style.setProperty("--row-count", this.Rows);
        grid.style.setProperty("--column-count", this.Columns);
        ret.style.setProperty("grid-column-end", `span ${this.Width}`);
        ret.style.setProperty("grid-row-end", `span ${this.Height}`);
        // then add the tiles
        for (let i in this.Tiles) {
            let t = this.Tiles[i];
            grid.appendChild(t.DOMObject);
            // trigger event on click
            t.DOMObject.onclick = (e) => {
                if (this.OnTileClick) {
                    this.OnTileClick({
                        "dungeon": this,
                        "tile": t
                    })
                }
            };
        }
        ret.appendChild(grid);
        // then return
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        let obj = this.DOMObject;
        obj.classList.toggle("active", this.Active);
        obj.classList.toggle("completed", this.Completed);
    }

    CalculateGrid() {
        // preallocate grid
        this.Grid = new Array(this.Columns);
        for (let i = 0; i < this.Grid.length; i++)
            this.Grid[i] = new Array(this.Rows);
        // add the tiles
        for (let i = 0; i < this.Tiles.length; i++) {
            let t = this.Tiles[i];
            // calculate pos
            let x = 0;
            let y = 0;
            let offset = 0;
            do {
                x = (i + offset) % this.Columns;
                y = Math.floor((i + offset) / this.Columns);
                offset += 1;
            } while (this.Grid[x][y] != null); // check if the pos is free
            // put the tile into the grid, including the width
            for (let w = 0; w < t.Width; w++) {
                for (let h = 0; h < t.Height; h++) {
                    this.Grid[x + w][y + h] = t;
                }
            }
            t.X = x;
            t.Y = y;
        }
    }

    static FromJson(json) {
        let dungeon = new Dungeon();

        dungeon.Name = json.name;
        dungeon.Rows = json.rows,
            dungeon.Columns = json.columns;
        if (json.width != null)
            dungeon.Width = json.width;
        if (json.height != null)
            dungeon.Height = json.height;
        if (json.boss != null)
            dungeon.isBoss = json.boss;
        dungeon.Dice = json.dice;
        for (let i in json.tiles) {
            let t = json.tiles[i];
            dungeon.Tiles.push(Tile.FromJson(t));
        }
        // Check if we have the right amount of tiles
        let count = 0;
        let should = dungeon.Rows * dungeon.Columns;
        for (let i in dungeon.Tiles) {
            let t = dungeon.Tiles[i];
            count += (t.Width * t.Height);
        }
        if (count != should) {
            console.error(`Not enough/Too many Tiles in dungeon ${dungeon.Name} (has: ${count}, should: ${should})`)
        }
        dungeon.CalculateGrid();
        dungeon.CreateDOM();
        return dungeon;
    }
}

class Tile {
    Type = ""; // space, wall, monster, trap, entry, exit, item //TODO: enum
    Subtype = ""; // depends on the monster/trap/item
    Width = 1;
    Height = 1;
    // Runtime
    DOMObject = null;
    Value = null;
    X = 0;
    Y = 0;
    Collected = false;

    ToJson() {
        let ret = {
            "type": this.Type,
            "subtype": this.Subtype,
            "width": this.Width,
            "height": this.Height
        };
        //TODO: dont add values if they're default
        return ret;
    }

    IsTraversable() {
        switch (this.Type) {
            //TODO: locked door
            case "trap":
                return this.Value != null; // only marked traps can be traversed
            case "space":
                return true;
            default:
                return false;
        }
    }

    IsExplored() {
        switch (this.Type) {
            case "entry":
                return true;
            case "trap":
            case "space":
                return this.Value != null; // marked
            default:
                return false;
        }
    }

    CanBeMarked() {
        // already marked
        if (this.Value != null)
            return false;

        switch (this.Type) {
            case "trap":
            case "space":
                return true;
            default:
                return false;
        }
    }

    CreateDOM() {
        // Create tile
        let ret = document.createElement("div");
        this.DOMObject = ret;
        this.UpdateUI();
        // return it
        return ret;
    }

    UpdateUI() {
        // clear
        this.DOMObject.className = "";
        // then add the classes
        this.DOMObject.classList.add("tile");
        this.DOMObject.classList.add(`tile-${this.Type}`);
        if (this.Subtype)
            this.DOMObject.classList.add(`tile-${this.Subtype}`);
        this.DOMObject.classList.toggle("collected", this.Collected);
        this.DOMObject.style.setProperty("grid-column-end", `span ${this.Width}`);
        this.DOMObject.style.setProperty("grid-row-end", `span ${this.Height}`);
        this.DOMObject.innerText = this.Value;
    }

    static FromJson(json) {
        let tile = new Tile();
        tile.Type = json.type;
        if (json.subtype != null)
            tile.Subtype = json.subtype;
        if (json.width != null)
            tile.Width = json.width;
        if (json.height != null)
            tile.Height = json.height;
        tile.CreateDOM(tile);
        return tile;
    }
}

class Monster {
    Name = "";
    Type = "";
    Attack = 0;
    Damage = 0;
    Defense = 0;
    HP = 0;
    XP = 1;
    Effect = null;
    DOMObject = null;

    GetDescription() {
        switch (this.Effect) {
            case "steadfast":
                return `If there is only one ${this.Name}, this enemy has +1 DEF.`;
            case "berserk":
                return "Deals +1 damage when attacking if there is a marked space adjacent to this enemy";
            default:
                return "Unknown";
        }
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("monsters-monster");
        this.DOMObject = ret;
        // Title
        let title = document.createElement("div");
        title.classList.add("monsters-monster-title");
        ret.appendChild(title);
        /// Icon
        let icon = document.createElement("div");
        icon.classList.add("monsters-monster-title-icon");
        icon.classList.add(`tile-${this.Type}`);
        title.appendChild(icon);
        /// Name
        let name = document.createElement("div");
        name.classList.add("monsters-monster-title-name");
        name.innerText = this.Name;
        title.appendChild(name);
        // Stats
        let stats = document.createElement("div");
        stats.classList.add("monsters-monster-stats");
        ret.appendChild(stats);
        /// simple func to minimize boilerplate for each stat
        function add(val, txt) {
            let el = document.createElement("div");
            el.classList.add("monsters-monster-stats-stat");
            el.appendChild(new Text(val));
            el.appendChild(document.createElement("br"));
            el.appendChild(new Text(txt));
            stats.appendChild(el);
        }
        add(`${this.Attack}+`, "ATK");
        add(`${this.Damage}`, "DMG");
        add(`${this.Defense}+`, "DEF");
        add(`${this.HP}`, "HP");
        add(`${this.XP}`, "XP");
        // effect
        if (this.Effect) {
            let effect = document.createElement("div");
            effect.classList.add("monsters-monster-effect");
            effect.innerText = this.GetDescription();
            ret.appendChild(effect);
        }
        return ret;
    }

    static FromJson(json) {
        let ret = new Monster();
        ret.Name = json.name;
        ret.Type = json.type;
        ret.Attack = json.attack;
        ret.Damage = json.damage;
        ret.Defense = json.defense;
        ret.HP = json.hp;
        if (json.xp != null)
            ret.XP = json.xp;
        if (json.effect != null)
            ret.Effect = json.effect;
        ret.CreateDOM();
        return ret;
    }
}

class Trap {
    Name = "";
    Type = "";
    Disarm = 0;
    Effect = null; //Fog //TODO: enum
    DOMObject = null;

    GetDescription() {
        switch (this.Effect) {
            case "fog":
                return "When Marked, reroll all dice and begin a new turn. Reduce your Range by 2 this turn (But no lower than 1).";
            default:
                return "Unknown";
        }
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("traps-trap");
        this.DOMObject = ret;
        // Title
        let title = document.createElement("div");
        title.classList.add("traps-trap-title");
        ret.appendChild(title);
        /// Icon
        let icon = document.createElement("div");
        icon.classList.add("traps-trap-title-icon");
        icon.classList.add(`tile-${this.Type}`);
        title.appendChild(icon);
        /// Name
        let name = document.createElement("div");
        name.classList.add("traps-trap-title-name");
        name.innerText = this.Name;
        title.appendChild(name);
        // Stats
        let stats = document.createElement("div");
        stats.classList.add("traps-trap-stats");
        ret.appendChild(stats);
        let dis = document.createElement("div");
        dis.classList.add("traps-trap-stats-stat");
        dis.innerText = "Disarm";
        stats.appendChild(dis);
        let val = document.createElement("div");
        val.classList.add("traps-trap-stats-stat");
        val.innerText = this.Disarm;
        stats.appendChild(val);
        // effect
        if (this.Effect) {
            let effect = document.createElement("div");
            effect.classList.add("traps-trap-effect");
            effect.innerText = this.GetDescription();
            ret.appendChild(effect);
        }
        return ret;
    }

    static FromJson(json) {
        let ret = new Trap();
        ret.Name = json.name;
        ret.Type = json.type;
        ret.Disarm = json.disarm;
        if (json.effect != null)
            ret.Effect = json.effect;
        ret.CreateDOM();
        return ret;
    }
}