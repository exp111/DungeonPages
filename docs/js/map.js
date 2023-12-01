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
        for (let i in this.Dungeons) {
            let d = this.Dungeons[i];
            ret.appendChild(d.DOMObject);
            d.OnTileClick = (e) => {
                if (this.OnTileClick) {
                    this.OnTileClick({
                        "tile": e.tile
                    })
                }
            };
        }
        return ret;
    }
    static FromJson(json) {
        let map = new Map();

        for (let i in json.dungeons) {
            let d = json.dungeons[i];
            map.Dungeons.push(Dungeon.FromJson(d));
        }
        //TODO: monsters, traps
        map.Monsters = json.monster,
            map.Traps = map.Traps;
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