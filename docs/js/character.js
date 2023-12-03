class Character {
    Name = "";
    Ability = null;
    Health = null;
    Experience = null;
    Weapons = null;
    Relics = [];
    DOMObject = null;

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character");
        this.DOMObject = ret;
        // Name
        let name = document.createElement("div");
        name.classList.add("character-name");
        name.innerText = this.Name;
        ret.appendChild(name);
        // Health
        ret.appendChild(this.Health.DOMObject);
        // Ability
        ret.appendChild(this.Ability.DOMObject)
        // XP
        ret.appendChild(this.Experience.DOMObject);
        // Weapons
        ret.appendChild(this.Weapons.DOMObject);
        // Relics
        return ret;
    }

    static FromJson(json) {
        let ret = new Character();
        ret.Name = json.name;
        ret.Ability = Ability.FromJson(json.ability);
        ret.Health = Health.FromJson(json.health);
        ret.Experience = Experience.FromJson(json.bonuses);
        ret.Weapons = Weapons.FromJson(json.weapons);
        for (let i in json.relics) {
            let r = json.relics[i];
            ret.Relics.push(Relic.FromJson(r));
        }
        ret.CreateDOM();
        return ret;
    }
}

class Health {
    Elements = [];
    Lost = 0;
    Unlocked = 0;
    DOMObject = null;

    CreateDOM() {
        // Wrapper
        let ret = document.createElement("div");
        ret.classList.add("character-health");
        this.DOMObject = ret;
        // Elements
        for (let i in this.Elements) {
            let count = this.Elements[i];
            let element = document.createElement("div");
            element.classList.add("character-health-element");
            if (i == 0) {
                // first one is bigger
                element.style.setProperty("grid-column-end", "span 3");
            }
            /// checkmark
            let check = document.createElement("input");
            check.type = "checkbox";
            check.classList.add("character-health-check");
            check.disabled = true;
            element.appendChild(check);
            /// icons
            let icons = document.createElement("div");
            icons.classList.add("character-health-icons");
            for (let i = 0; i < count; i++) {
                let icon = document.createElement("div");
                icon.classList.add("character-health-icon");
                icons.appendChild(icon);
            }
            element.appendChild(icons);
            ret.appendChild(element);
        }
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        // Element checkboxes
        let checks = this.DOMObject.getElementsByClassName("character-health-check");
        for (let i = 0; i < checks.length; i++) {
            let check = checks[i];
            check.checked = i <= this.Unlocked;
        }
        // Health
        let icons = this.DOMObject.getElementsByClassName("character-health-icon");
        for (let i = 0; i < icons.length; i++) {
            let icon = icons[i];
            icon.classList.toggle("checked", i < this.Lost);
        }
    }

    static FromJson(json) {
        let ret = new Health();
        ret.Elements = json;
        ret.CreateDOM();
        return ret;
    }
}

class Ability {
    Name = "";
    Type = "";
    DOMObject = null;

    CreateDOM() {
        let ret = document.createElement("div");
        this.DOMObject = ret;
        // Name
        let name = document.createElement("div");
        name.innerText = this.Name;
        ret.appendChild(name);
        //TODO: description?
        // return it
        return ret;
    }

    static FromJson(json) {
        let ret = new Ability();
        ret.Name = json.name;
        ret.Type = json.type;
        ret.CreateDOM();
        return ret;
    }
}

class Experience {
    Bonuses = []; // XP Bonuses
    BonusesUnlocked = 0;
    Earned = 0;
    DOMObject = null;

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-xp");
        this.DOMObject = ret;
        // Points
        let points = document.createElement("div");
        points.classList.add("character-xp-points");
        for (let i = 0; i < 3; i++) {
            let grid = document.createElement("div");
            grid.classList.add("character-xp-points-part");
            for (let j = 0; j < 25; j++) {
                let p = document.createElement("input");
                p.classList.add("character-xp-point");
                p.type = "checkbox";
                p.disabled = true;
                grid.appendChild(p);
            }
            points.appendChild(grid);
        }
        ret.appendChild(points);
        // Bonuses
        let bonuses = document.createElement("div");
        bonuses.classList.add("character-xp-bonuses");
        for (let i in this.Bonuses) {
            let bonus = this.Bonuses[i];
            bonuses.appendChild(bonus.DOMObject);
        }
        ret.appendChild(bonuses);
        // update ui
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        let points = this.DOMObject.getElementsByClassName("character-xp-point");
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            point.checked = i < this.Earned;
        }
        //TODO: call child update?
    }

    static FromJson(json) {
        let ret = new Experience();
        for (let i in json) {
            let b = json[i];
            ret.Bonuses.push(Bonus.FromJson(b));
        }
        ret.CreateDOM();
        return ret;
    }
}
class Bonus {
    Treshold = 0;
    Type = ""; // die, potion, tactics, range, rerollGood, rerollEvil, rerollAny
    Amount = 1;
    Unlocked = false;
    DOMObject = null;

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-xp-bonus");
        this.DOMObject = ret;
        // treshold
        let treshold = document.createElement("div");
        /// checkbox before treshold
        let check = document.createElement("input");
        check.classList.add("character-xp-bonus-checkbox");
        check.type = "checkbox";
        check.disabled = true;
        treshold.innerText = `${this.Treshold}XP`;
        treshold.prepend(check);
        ret.appendChild(treshold);
        // bonus
        let bonusWrap = document.createElement("div");
        bonusWrap.classList.add("character-xp-bonus-info");
        let amount = document.createElement("div");
        if (this.Amount > 1)
            amount.innerText = `+${this.Amount}`;
        else
            amount.innerText = "+";
        bonusWrap.appendChild(amount);
        let bonus = document.createElement("div");
        bonus.classList.add("bonus");
        bonus.classList.add(`bonus-${this.Type}`);
        bonusWrap.appendChild(bonus);
        ret.appendChild(bonusWrap);
        // update ui
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        let checks = this.DOMObject.getElementsByClassName("character-xp-bonus-checkbox");
        for (let i = 0; i < checks.length; i++) {
            let check = checks[i];
            check.checked = this.Unlocked;
        }
    }

    static FromJson(json) {
        let ret = new Bonus();
        ret.Treshold = json.treshold;
        ret.Type = json.type;
        if (json.amount != null)
            ret.Amount = json.amount;
        ret.CreateDOM();
        return ret;
    }
}

class Weapons {
    Weapons = [];
    DOMObject = null;

    CanReachTile(tile, grid) {
        for (let i in this.Weapons) {
            let weapon = this.Weapons[i];
            if (!weapon.Unlocked)
                continue;
            if (weapon.CanReachTile(tile, grid))
                return true;
        }
        return false;
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-weapons");
        this.DOMObject = ret;
        let weapons = document.createElement("div");
        weapons.classList.add("character-weapons-list");
        ret.appendChild(weapons);
        for (let i in this.Weapons) {
            let w = this.Weapons[i];
            weapons.appendChild(w.DOMObject);
        }
        return ret;
    }

    static FromJson(json) {
        let ret = new Weapons();
        for (let i in json) {
            let w = json[i];
            ret.Weapons.push(Weapon.FromJson(w));
        }
        ret.CreateDOM();
        return ret;
    }
}

class Weapon {
    Name = "";
    Treshold = 0;
    Range = 1;
    Effects = []; // Ortho,Diag,straightVert,StraightHori,DiagLine //TODO: enum
    //TODO: alt effects like reroll 1
    DOMObject = null;
    Unlocked = false;

    CanReachTile(tile, grid) {
        if (this.Range == 0)
            return false;

        function canMark(tile, grid, depth, range, getAvailableTiles) {
            // get tiles that are available from here
            let tiles = getAvailableTiles(tile, grid);
            let canGoDeeper = depth < (range - 1);
            for (let i in tiles) {
                let newTile = tiles[i];
                // is it explored? then we mark our origin
                if (newTile.IsExplored())
                    return true;
                // is it traversable? next tile
                if (!newTile.IsTraversable())
                    continue;

                // we can move through so get the next tile, if we still have range
                if (canGoDeeper)
                {
                    // if we can mark any tiles from this one, we can mark our origin
                    if (canMark(newTile, grid, depth + 1, range, getAvailableTiles)) {
                        return true;
                    }
                }
            }
            return false;
        }

        for (let i in this.Effects) {
            let effect = this.Effects[i];
            let func = null;
            switch (effect) {
                case "ortho":
                    func = function (tile, grid) {
                        let ret = [];
                        if (tile.X > 0) // left
                            ret.push(grid[tile.X - 1][tile.Y]);
                        if (tile.Y > 0) // top
                            ret.push(grid[tile.X][tile.Y - 1]);
                        if ((tile.X + tile.Width) < grid.length) // right
                            ret.push(grid[tile.X + tile.Width][tile.Y]);
                        if ((tile.Y + tile.Height) < grid[tile.X].length) // down
                            ret.push(grid[tile.X][tile.Y + tile.Height]);
                        return ret;
                    }
                    break;
                case "straightVert":
                    func = function (tile, grid) {
                        let ret = [];
                        if (tile.Y > 0) // prev
                            ret.push(grid[tile.X][tile.Y - 1]);
                        if ((tile.Y + tile.Height) < grid[tile.X].length) // next
                            ret.push(grid[tile.X][tile.Y + tile.Height]);
                        return ret;
                    }
                    break;
                case "straightHori":
                    func = function (tile, grid) {
                        let ret = [];
                        if (tile.X > 0) // prev
                            ret.push(grid[tile.X - 1][tile.Y]);
                        if ((tile.X + tile.Width) < grid.length) // next
                            ret.push(grid[tile.X + tile.Width][tile.Y]);
                        return ret;
                    }
                    break;
                default:
                    console.log(`Unknown Effect: ${effect}`);
            }
            if (func) {
                if (canMark(tile, grid, 0, this.Range, func))
                    return true;
            }
        }
        return false;
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-weapons-weapon");
        this.DOMObject = ret;
        // Name
        let name = document.createElement("div");
        /// Checkbox before name
        let check = document.createElement("input");
        check.classList.add("character-weapons-weapon-checkbox");
        check.type = "checkbox";
        check.disabled = true;
        name.innerText = `${this.Name} (${this.Treshold})`;
        name.prepend(check);
        ret.appendChild(name);
        // Range
        let range = document.createElement("div");
        range.innerText = this.Range;
        ret.appendChild(range);
        // Effects
        let effects = document.createElement("div");
        effects.classList.add("character-weapons-weapon-effects");
        ret.appendChild(effects);
        for (let i in this.Effects) {
            let e = this.Effects[i];
            let ef = document.createElement("div");
            ef.classList.add("effect");
            ef.classList.add(`effect-${e}`);
            effects.appendChild(ef);
        }
        // update ui
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        let checks = this.DOMObject.getElementsByClassName("character-weapons-weapon-checkbox");
        for (let i = 0; i < checks.length; i++) {
            let check = checks[i];
            check.checked = this.Unlocked;
        }
    }

    static FromJson(json) {
        let ret = new Weapon();
        ret.Name = json.name;
        if (json.treshold != null)
            ret.Treshold = json.treshold;
        ret.Range = json.range;
        ret.Effects = json.effects;
        ret.Unlocked = ret.Treshold == 0; // default unlocked
        ret.CreateDOM();
        return ret;
    }
}

class Relic {
    Name = "";
    Treshold = 0;
    Ability = ""; //TODO: these

    static FromJson(json) {
        let ret = new Relic();
        ret.Name = json.name;
        ret.Treshold = json.treshold;
        ret.Ability = json.ability;
        return ret;
    }
}