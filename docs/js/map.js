class Map {
    Dungeons = [];
    Monsters = [];
    Traps = [];
    
    static FromJson(json) {
        let map = new Map();

        for (let i in json.dungeons)
        {
            let d = json.dungeons[i];
            map.Dungeons.appendChild(d);
        }
        map.Monsters = json.monster,
        map.Traps = map.Traps;
        //map.CreateDOM();
        return map;
    }
}

class Dungeon {
    Name = "";
    isBoss = false;
    Rows = 6;
    Columns = 6;
    Dice = 1;
    Tiles = [];
    DOMObject = null;

    CreateDOM() {
        // Create the grid
        let ret = document.createElement("div");
        ret.classList.add("grid");
        ret.style.setProperty("--row-count", this.Rows);
        ret.style.setProperty("--column-count", this.Columns);
        // then add the tiles
        for (let i in this.Tiles)
        {
            let t = this.Tiles[i];
            ret.appendChild(t.DOMObject);
        }
        // then return
        this.DOMObject = ret;
        return ret;
    }
    static FromJson(json) {
        let dungeon = new Dungeon();

        dungeon.Name = json.name;
        dungeon.Rows = json.rows,
        dungeon.Columns = json.columns;
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

    CreateDOM() {
        // Create tile
        let ret = document.createElement("div");
        ret.classList.add("tile");
        ret.classList.add(`tile-${this.Type}`);
        if (this.Subtype)
            ret.classList.add(`tile-${this.Subtype}`);
        ret.style.setProperty("grid-column-end", `span ${this.Width}`);
        ret.style.setProperty("grid-row-end", `span ${this.Height}`);
        // return it
        this.DOMObject = ret;
        return ret;
    }

    static FromJson(json) {
        let tile = new Tile();
        tile.Type = json.type;
        if (json.subtype != null)
            tile.Subtype = json.subtype;
        if (json.w != null)
            tile.Width = json.w;
        if (json.h != null)
            tile.Height = json.h;
        tile.CreateDOM(tile);
        return tile;
    }
}