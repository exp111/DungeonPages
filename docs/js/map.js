class Map {
    Dungeons = [];
    Monsters = [];
    Traps = [];
    DOMObject = null;
    // Events
    OnTileClick = null;

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
            d.OnTileClick = (e) => {
                if (this.OnTileClick) {
                    this.OnTileClick({
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
    DOMObject = null;
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
                        "tile": t
                    })
                }
            };
        }
        ret.appendChild(grid);
        // then return
        return ret;
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
        dungeon.CreateDOM();
        return dungeon;
    }
}

class Tile {
    Type = ""; // space, wall, monster, trap, entry, exit, item //TODO: enum
    Subtype = ""; // depends on the monster/trap/item
    Width = 1;
    Height = 1;
    DOMObject = null;

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

    CreateDOM() {
        // Create tile
        let ret = document.createElement("div");
        this.DOMObject = ret;
        this.UpdateDOM();
        // return it
        return ret;
    }

    UpdateDOM() {
        // clear
        this.DOMObject.className = "";
        // then add the classes
        this.DOMObject.classList.add("tile");
        this.DOMObject.classList.add(`tile-${this.Type}`);
        if (this.Subtype)
            this.DOMObject.classList.add(`tile-${this.Subtype}`);
        this.DOMObject.style.setProperty("grid-column-end", `span ${this.Width}`);
        this.DOMObject.style.setProperty("grid-row-end", `span ${this.Height}`);
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