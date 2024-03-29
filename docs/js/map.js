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

    CanChangeMonsterAttacks() {
        //TODO: also check monster attack + dice diff to see if its possible?
        for (let i in this.Dungeons) {
            let dungeon = this.Dungeons[i];
            // Can't have items collected here yet
            if (!dungeon.Active && !dungeon.Completed)
                continue;
            for (let j in dungeon.Items) {
                let item = dungeon.Items[j];
                if (!item.CanBeUsed())
                    continue;
                switch (item.Subtype) {
                    case "coin":
                        return true;
                    case "poison": // can kill monster
                        return true;
                }
            }
        }
        return false;
    }
    UnselectDungeon() {
        let dungeon = this.SelectedDungeon;
        if (dungeon != null) {
            dungeon.Active = false;
            dungeon.UpdateUI();
            this.SelectedDungeon = null;
        }
    }

    HasActiveDungeon() {
        return this.SelectedDungeon != null;
    }

    HasFinishedGame() {
        for (let i in this.Dungeons) {
            let dungeon = this.Dungeons[i];
            if (!dungeon.Completed)
                return false;
        }
        return true;
    }

    CanSelectDungeon(dungeon) {
        if (dungeon.Completed)
            return false;

        if (this.HasActiveDungeon())
            return false;

        if (dungeon.IsBoss) {
            // gets if every non boss dungeon is complete
            let nonBossComplete = this.Dungeons.every(d => d.IsBoss || d.Completed);
            if (!nonBossComplete)
                return false;
        }
        return true;
    }

    SelectDungeon(dungeon) {
        this.SelectedDungeon = dungeon;
        dungeon.Active = true;
        dungeon.UpdateUI();
    }

    FinishDungeon() {
        let dungeon = this.SelectedDungeon;
        if (dungeon != null) {
            dungeon.Completed = true;
            this.UnselectDungeon();
        }
    }

    CheckTrap(tile) {
        if (tile.Type != "trap")
            return;
        // get trap
        let trap = this.Traps.find(t => t.Type == tile.Subtype);
        if (trap == null) {
            console.error(`Did not find trap ${tile.Subtype}`);
            return;
        }
        if (trap.Disarm <= tile.Value) // disarmed
            return;
        //TODO: do effect
        console.log(`Activated trap ${trap.Name} with effect ${trap.Effect}`);
        trap.ActivateEffect();
    }

    OnReroll() {
        for (let i in this.Traps) {
            this.Traps[i].OnReroll();
        }
    }

    CheckWanderingMonsters(results) {
        // Check if any two evil dice have the same value
        let dungeon = this.SelectedDungeon;
        if (dungeon == null)
            return false;
        if (dungeon.Dice < 2)
            return false;
        let rolled = {};
        for (let i in results) {
            let dice = results[i];
            // only check evil dice
            if (!dice.IsEvil)
                continue;

            let val = dice.Value;
            // check if the value has been rolled before
            if (rolled[val] != null)
                return true;
            // add to the storage
            rolled[val] = true;
        }
        return false;
    }

    CheckMonsterAttack(results) {
        let damage = 0;
        let dungeon = this.SelectedDungeon;
        if (dungeon == null)
            return damage;
        // get a dict which contains which evil dice values or lower were rolled
        let rolled = {};
        for (let i in results) {
            let dice = results[i];
            if (!dice.IsEvil)
                continue;

            // set all values higher than the value to true
            for (let j = 1; j <= dice.Value; j++) {
                rolled[j] = true;
            }
        }
        // check which alive monsters can attack
        for (let i in dungeon.Monsters) {
            let monster = dungeon.Monsters[i];
            // check if its a alive monster
            if (!monster.Collected) {
                let m = this.Monsters.find(m => m.Type == monster.Subtype);
                if (m == null) {
                    console.log(`Did not find monster ${monster.Subtype}`);
                    continue;
                }
                // check if the attack value or higher was rolled
                let atk = m.GetATK(monster, dungeon);
                if (rolled[atk] != null) {
                    let dmg = m.GetDMG(monster, dungeon);
                    damage += dmg;
                    console.debug(`Received ${dmg} (${m.Damage} + ${dmg - m.Damage}) dmg from ${m.Name} with a roll ${atk}+ (${m.Attack} + ${atk - m.Attack})`)
                }
            }
        }
        return damage;
    }

    GetMonsterXP(monsters) {
        let xp = 0;
        for (let i in monsters) {
            let monster = monsters[i];
            let m = this.Monsters.find(m => m.Type == monster.Subtype);
            if (m == null) {
                console.error(`Did not find monster ${monster.Subtype}`);
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
        let monsterWrapper = document.createElement("div");
        monsterWrapper.classList.add("legend-monsters");
        legend.appendChild(monsterWrapper);
        let monsterHeader = document.createElement("div");
        monsterHeader.classList.add("legend-monsters-header");
        monsterHeader.innerText = "Monsters";
        monsterWrapper.appendChild(monsterHeader);
        let monsters = document.createElement("div");
        monsters.classList.add("monsters");
        monsterWrapper.appendChild(monsters);
        for (let i in this.Monsters) {
            let m = this.Monsters[i];
            monsters.appendChild(m.DOMObject);
        }
        /// traps
        let trapWrapper = document.createElement("div");
        trapWrapper.classList.add("legend-traps");
        legend.appendChild(trapWrapper);
        let trapHeader = document.createElement("div");
        trapHeader.classList.add("legend-traps-header");
        trapHeader.innerText = "Traps";
        trapWrapper.appendChild(trapHeader);
        let traps = document.createElement("div");
        traps.classList.add("traps");
        trapWrapper.appendChild(traps);
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
    IsBoss = false;
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
    Monsters = [];
    Items = [];
    Entry = [];
    Exit = [];

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
    IsFinished(sequential = false) {
        // find the entry
        let entry = this.Entry;
        if (entry == null) {
            console.error("No entry found");
            return false;
        }

        let marked = {};
        marked[entry.GetID()] = true;
        let queue = [entry];
        // basic dfs
        while (queue.length > 0) {
            let tile = queue.pop();
            // get reachable tiles
            let tiles = this.GetTileNeighbours(tile);
            for (let i in tiles) {
                let newTile = tiles[i];
                // check if marked
                let id = newTile.GetID();
                if (marked[id] != null) // skip already marked ones
                    continue;
                // end check
                if (newTile.Type == "exit")
                    return true;
                // no need to check for traversable as we cant explore non traversable ones?
                // valid searchtarget check
                if (newTile.IsExplored()) {
                    // if we need a sequential path, check for val diff > 1
                    if (sequential) {
                        // doesnt matter for the entry
                        if (tile.Type != "entry" &&
                            Math.abs(tile.Value - newTile.Value) > 1)
                            continue;
                    }
                    marked[id] = true;
                    queue.push(newTile);
                }
            }
        }
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

    CheckForCollection(tile, monsters) {
        //TODO: move this into map?
        let tiles = this.GetTileNeighbours(tile);
        for (let i in tiles) {
            let other = tiles[i];
            // already collected
            if (other.Collected)
                continue;
            let result = false;
            switch (other.Type) {
                case "item": {
                    //TODO: this code should probably not be here?
                    // check if there are two identical numbers adjacent
                    let collected = {};
                    let adjacent = this.GetTileNeighbours(other);
                    for (let i in adjacent) {
                        let adj = adjacent[i];

                        // no number => not important for us
                        let val = adj.Value;
                        if (val == null)
                            continue;

                        // if we already have this value this one is collected
                        if (collected[val] != null) {
                            result = true;
                            break;
                        }
                        // else mark it for the future
                        collected[val] = true;
                    }
                    break;
                }
                case "monster": {
                    // get the monster
                    let monster = monsters.find(m => m.Type == other.Subtype);
                    if (monster == null) {
                        console.error(`Monster ${other.Subtype} in Tile (${other.GetID()}) not found.`);
                        continue;
                    }
                    // check if number of (adjacent values >= DEF) is >= than hp
                    //TODO: code probably also shouldnt be here?
                    let dmg = 0;
                    let adjacent = this.GetTileNeighbours(other);
                    let def = monster.GetDEF(other, this);
                    let hp = monster.GetHP(other, this);
                    for (let i in adjacent) {
                        let adj = adjacent[i];
                        let value = adj.Value;
                        // no number => not important
                        if (value == null)
                            continue;
                        if (value >= def) {
                            dmg += 1;
                            if (dmg >= hp) {
                                result = true
                                break;
                            }
                        }
                    }
                    break;
                }
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
        return character.CanReachTile(this, tile);
    }

    CheckTileReachable(tile, totalRange, stepFunc) {
        let range = {};
        let queue = [tile];
        // start range
        range[tile.GetID()] = 0;
        // basic dfs
        while (queue.length > 0) {
            let t = queue.pop();
            // get reachable tiles
            let tiles = stepFunc(t, this.Grid);
            let tID = t.GetID();
            for (let i in tiles) {
                let newTile = tiles[i];
                // check if marked
                let id = newTile.GetID();
                if (range[id] != null) // skip already marked ones
                    continue;

                //TODO: do we need to move this next to the push?
                range[id] = range[tID] + 1;
                // end check
                if (newTile.IsExplored())
                    return true;

                // valid searchtarget check
                if (!newTile.IsTraversable())
                    continue;

                // if this tile is at the edge of our range, dont search further from it
                if (range[id] >= totalRange)
                    continue;
                queue.push(newTile);
            }
        }
        return false;
    }

    GetTileNeighbours(tile) {
        return Tile.GetOrthogonalNeighbours(tile, this.Grid);
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

    Init() {
        this.CalculateGrid();
        // cache monsters, items, entry+exit
        for (let i in this.Tiles) {
            let tile = this.Tiles[i];
            switch (tile.Type) {
                case "monster":
                    this.Monsters.push(tile);
                    break;
                case "item":
                    this.Items.push(tile);
                    break;
                case "entry":
                    this.Entry = tile;
                    break;
                case "exit":
                    this.Exit = tile;
                    break;
                default:
                    break;
            }
        }
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
            dungeon.IsBoss = json.boss;
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
        dungeon.Init();
        dungeon.CreateDOM();
        return dungeon;
    }
}

class Tile {
    Type = ""; // space, wall, monster, trap, entry, exit, item, toggleable //TODO: enum
    Subtype = ""; // depends on the monster/trap/item/toggleable
    Width = 1;
    Height = 1;
    Uses = 1;
    // Runtime
    DOMObject = null;
    Value = null;
    X = 0;
    Y = 0;
    Unlocked = false;
    Collected = false;
    Used = false;
    UsedCount = 0;
    Selected = false;

    GetID() {
        return `${this.X},${this.Y}`;
    }

    ToJson() {
        let ret = {
            "type": this.Type,
            "subtype": this.Subtype,
            "width": this.Width,
            "height": this.Height,
            "uses": this.Uses
        };
        //TODO: dont add values if they're default
        return ret;
    }

    CanBeUsed() {
        return this.Collected && !this.Used;
    }

    Use() {
        this.UsedCount++;
        if (this.UsedCount >= this.Uses)
            this.Used = true;
    }

    IsTraversable() {
        switch (this.Type) {
            case "wall":
                return this.Unlocked;
            case "trap":
                return this.Value != null; // only marked traps can be traversed
            case "space":
                return true;
            case "toggleable": {
                switch (this.Subtype) {
                    case "lock":
                        return this.Unlocked;
                    default:
                        return false;
                }
            }
            default:
                return false;
        }
    }

    IsExplored() {
        switch (this.Type) {
            case "entry":
                return true;
            case "wall":
            case "toggleable":
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
            case "wall":
                return this.Unlocked;
            case "trap":
            case "space":
                return true;
            case "toggleable": {
                switch (this.Subtype) {
                    case "lock":
                        return this.Unlocked;
                    default:
                        return false;
                }
            }
            default:
                return false;
        }
    }

    static GetOrthogonalNeighbours(tile, grid) {
        //INFO: this assumes we have a rectangular grid
        let ret = [];
        if (tile.X > 0) // left
            for (let i = 0; i < tile.Height; i++)
                ret.push(grid[tile.X - 1][tile.Y + i]);
        if (tile.Y > 0) // top
            for (let i = 0; i < tile.Width; i++)
                ret.push(grid[tile.X + i][tile.Y - 1]);
        if ((tile.X + tile.Width) < grid.length) // right
            for (let i = 0; i < tile.Height; i++)
                ret.push(grid[tile.X + tile.Width][tile.Y + i]);
        if ((tile.Y + tile.Height) < grid[tile.X].length) // down
            for (let i = 0; i < tile.Width; i++)
                ret.push(grid[tile.X + i][tile.Y + tile.Height]);
        return ret;
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
        if (this.Uses > 1)
            this.DOMObject.classList.add(`uses-${this.Uses}`);
        if (this.UsedCount > 0 && this.UsedCount < this.Uses)
            this.DOMObject.classList.add(`used-${this.UsedCount}`);
        this.DOMObject.classList.toggle("unlocked", this.Unlocked);
        this.DOMObject.classList.toggle("collected", this.Collected);
        this.DOMObject.classList.toggle("used", this.Used);
        this.DOMObject.classList.toggle("selected", this.Selected);
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
        if (json.uses != null)
            tile.Uses = json.uses;
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

    GetATK(tile, dungeon) {
        switch (this.Effect) {
            default:
                return this.Attack;
        }
    }

    GetDMG(tile, dungeon) {
        switch (this.Effect) {
            case "berserk":
                // Check if any adjacent tiles are marked
                let adjacent = dungeon.GetTileNeighbours(tile);
                if (adjacent.some(t => t.Value != null))
                    return this.Damage + 1;
                return this.Damage;
            default:
                return this.Damage;
        }
    }

    GetDEF(tile, dungeon) {
        switch (this.Effect) {
            case "steadfast":
                // get the amount of alive monsters of this monster's type
                let amount = dungeon.Monsters.filter(m => !m.Collected && m.Subtype == tile.Subtype).length;
                if (amount == 1)
                    return this.Defense + 1;
                return this.Defense;
            default:
                return this.Defense;
        }
    }

    GetHP(tile, dungeon) {
        return this.HP;
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
    // Runtime
    DOMObject = null;
    Counter = 0;
    Storage = 0;

    ActivateEffect() {
        switch (this.Effect) {
            case "fog":
                // set all dice as used and reduce range by 2 (no lower than 1)
                //TODO: we got a dependency :weary:
                let pool = Global.dice;
                for (let i in pool.Dice) {
                    let dice = pool.Dice[i];
                    dice.Used = true;
                    dice.UpdateUI();
                }
                let char = Global.character;
                char.RangeMod -= 2;
                // set the counter to 2 (next round should be skipped, round after gets range back)
                this.Counter = 2;
                break;
            default:
                console.error(`Unknown Trap Effect ${this.Effect}`);
                break;
        }
    }

    OnReroll() {
        switch (this.Effect) {
            case "fog":
                switch (this.Counter) {
                    case 2: // first round after effect
                        this.Counter--;
                        break;
                    case 1: // restore the range
                        //TODO: another dependency
                        let char = Global.character;
                        char.RangeMod += 2;
                        this.Storage = 0;
                        this.Counter = 0;
                        break;
                }
                break;
        }
    }

    GetDescription() {
        switch (this.Effect) {
            case "fog":
                return "When Marked, reroll all dice and begin a new turn. Reduce your Range by 2 this turn (But no lower than 1).";
            default:
                return `Unknown Effect: ${this.Effect}`;
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