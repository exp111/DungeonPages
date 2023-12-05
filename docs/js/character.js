class Character {
    Name = "";
    Ability = null;
    Health = null;
    Experience = null;
    Weapons = null;
    Relics = null;
    DOMObject = null;
    // Runtime
    GoodDice = 1;
    RangeMod = 0;

    GotDamage(damage) {
        this.Health.GotDamage(damage);
    }

    IsDead() {
        return this.Health.IsDead();
    }

    CanReachTile(tile, grid) {
        return this.Weapons.CanReachTile(tile, grid, this.RangeMod);
    }

    GotExperience(xp) {
        let bonuses = this.Experience.GotExperience(xp);
        for (let i in bonuses) {
            let bonus = bonuses[i];
            switch (bonus.Type) {
                case "dice":
                    this.GoodDice += bonus.Amount;
                    break;
                case "potion":
                    this.Health.GotPotion(bonus.Amount);
                    break;
                case "range":
                    this.RangeMod += bonus.Amount;
                    break;
                default:
                    break;
            }
        }
    }

    GotPotion(amount) {
        this.Health.GotPotion(amount);
    }

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
        ret.appendChild(this.Relics.DOMObject);
        return ret;
    }

    static FromJson(json) {
        let ret = new Character();
        ret.Name = json.name;
        ret.Ability = Ability.FromJson(json.ability);
        ret.Health = Health.FromJson(json.health);
        ret.Experience = Experience.FromJson(json.bonuses);
        ret.Weapons = Weapons.FromJson(json.weapons);
        ret.Relics = Relics.FromJson(json.relics);
        ret.CreateDOM();
        return ret;
    }
}

class Health {
    Elements = [];
    Lost = 0;
    Unlocked = 0;
    DOMObject = null;
    // Runtime
    Max = 0;

    IsDead() {
        return this.Lost >= this.Max;
    }

    GotDamage(amount) {
        let now = this.Lost + amount;
        this.Lost = Math.min(Math.max(now, 0), this.Max);
        this.UpdateUI();
    }

    GotPotion(amount) {
        for (let i = 1; i <= amount; i++) {
            if (i >= this.Elements.length) // sanity check
                break;
            this.Max += this.Elements[this.Unlocked + i];
        }
        this.Unlocked += amount;
        this.UpdateUI();
    }

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
        ret.Max = ret.Elements[0];
        return ret;
    }
}

class Ability {
    Name = "";
    Type = "";
    // Runtime
    DOMObject = null;

    GetDescription() {
        switch (this.Type) {
            case "sacrificeDouble":
                return "Sacrifice a Good Die. Choose a die result of 3 or less and double it.";
            default:
                return `Unknown Ability ${this.Type}`;
        }
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-ability");
        this.DOMObject = ret;
        // Text
        let txt = document.createElement("span");
        txt.classList.add("character-ability-text");
        ret.appendChild(txt);
        /// Name
        let name = document.createElement("b");
        name.innerText = `${this.Name}:`;
        txt.appendChild(name);
        /// Description
        let desc = document.createElement("span");
        desc.innerText = this.GetDescription();
        txt.appendChild(desc);
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
    Earned = 0;
    DOMObject = null;

    GotExperience(xp) {
        this.Earned += xp;
        this.UpdateUI();
        let ret = [];
        for (let i in this.Bonuses) {
            let bonus = this.Bonuses[i];
            if (this.Earned >= bonus.Treshold) {
                bonus.Unlocked = true;
                bonus.UpdateUI();
                ret.push(bonus);
            }
        }
        return ret;
    }

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
    Type = ""; // dice, potion, tactics, range, rerollGood, rerollEvil, rerollAny
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
    // Runtime
    DOMObject = null;

    CanReachTile(tile, grid, rangeMod) {
        for (let i in this.Weapons) {
            let weapon = this.Weapons[i];
            if (!weapon.Unlocked)
                continue;
            if (weapon.CanReachTile(tile, grid, rangeMod))
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
    // Runtime
    DOMObject = null;
    Unlocked = false;

    //TODO: move these out of here? idk
    CanReachTile(tile, grid, rangeMod) {
        // can not go lower than 1 range
        let totalRange = Math.max(this.Range + rangeMod, 1);

        for (let i in this.Effects) {
            let effect = this.Effects[i];
            let func = null;
            //TODO: actually we would need to add more tiles if our w/h is > 1, 
            //      but this isn't really important as we dont have traversable tiles with w/h>1
            switch (effect) {
                case "ortho":
                    func = function (tile) {
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
                    func = function (tile) {
                        let ret = [];
                        if (tile.Y > 0) // prev
                            ret.push(grid[tile.X][tile.Y - 1]);
                        if ((tile.Y + tile.Height) < grid[tile.X].length) // next
                            ret.push(grid[tile.X][tile.Y + tile.Height]);
                        return ret;
                    }
                    break;
                case "straightHori":
                    func = function (tile) {
                        let ret = [];
                        if (tile.X > 0) // prev
                            ret.push(grid[tile.X - 1][tile.Y]);
                        if ((tile.X + tile.Width) < grid.length) // next
                            ret.push(grid[tile.X + tile.Width][tile.Y]);
                        return ret;
                    }
                    break;
                case "diag":
                    func = function (tile) {
                        let ret = [];
                        let xPrev = tile.X > 0;
                        let yPrev = tile.Y > 0;
                        let xNext = (tile.X + tile.Width) < grid.length;
                        let yNext = (tile.Y + tile.Height) < grid[tile.X].length;
                        if (xPrev && yPrev) // top left
                            ret.push(grid[tile.X - 1][tile.Y - 1]);
                        if (xNext && yPrev) // top right
                            ret.push(grid[tile.X + 1][tile.Y - 1]);
                        if (xPrev && yNext) // bot left
                            ret.push(grid[tile.X - 1][tile.Y + 1]);
                        if (xNext && yNext) // bot right
                            ret.push(grid[tile.X + 1][tile.Y + 1]);
                        return ret;
                    }
                    break;
                default:
                    console.log(`Unknown Effect: ${effect}`);
            }

            if (func) {
                let range = {};
                let queue = [tile];
                // start range
                range[tile.GetID()] = 0;
                // basic dfs
                while (queue.length > 0) {
                    let t = queue.pop();
                    // get reachable tiles
                    let tiles = func(t);
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
        if (this.Treshold > 0)
            name.innerText = `${this.Name} (${this.Treshold} XP)`;
        else
            name.innerText = `${this.Name} (${this.Treshold} XP)`;
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

class Relics {
    Relics = [];
    //Runtime
    DOMObject = null;

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-relics");
        this.DOMObject = ret;
        let relics = document.createElement("div");
        relics.classList.add("character-relics-list");
        ret.appendChild(relics);
        for (let i in this.Relics) {
            let r = this.Relics[i];
            relics.appendChild(r.DOMObject);
        }
        return ret;
    }

    static FromJson(json) {
        let ret = new Relics();
        for (let i in json) {
            let r = json[i];
            ret.Relics.push(Relic.FromJson(r));
        }
        ret.CreateDOM();
        return ret;
    }
}

class Relic {
    Name = "";
    Treshold = 0;
    Charges = 0;
    Effect = "";
    Amount = 1;
    // Runtime
    DOMObject = null;
    Unlocked = false;
    ChargesUsed = 0;

    GetDescription() {
        switch (this.Effect) {
            case "rerollGood":
                return `You may reroll ${this.Amount} Good Die.`;
            case "ignoreDmg":
                return `Ignore ${this.Amount} damage (Once per turn)`;
            case "markDice":
                return `Choose a die. Mark that result ${this.Amount + 1} times (Once per turn).`;
            case "discardEvil":
                return `Discard ${this.Amount} Evil Dice after resolving Wandering Monsters.`;
            default:
                return `Unknown Effect: ${this.Effect}`;
        }
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-relics-relic");
        this.DOMObject = ret;
        // Checkbox 
        let check = document.createElement("input");
        check.classList.add("character-relics-relic-checkbox");
        check.type = "checkbox";
        check.disabled = true;
        ret.appendChild(check);
        // Text
        let txt = document.createElement("span");
        txt.classList.add("character-relics-relic-text");
        ret.appendChild(txt);
        /// Name
        let name = document.createElement("b");
        name.innerText = `${this.Name} (${this.Treshold} XP):`;
        txt.appendChild(name);
        /// Desc
        let desc = document.createElement("span");
        desc.innerText = this.GetDescription();
        txt.appendChild(desc);
        // Charges
        let charges = document.createElement("div");
        charges.classList.add("character-relics-relic-charges");
        ret.appendChild(charges);
        for (let i = 0; i < this.Charges; i++) {
            let charge = document.createElement("div");
            charge.classList.add("charge");
            charges.appendChild(charge);
        }
        // update ui
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        // unlock checkboxes
        let checks = this.DOMObject.getElementsByClassName("character-relics-relic-checkbox");
        for (let i = 0; i < checks.length; i++) {
            let check = checks[i];
            check.checked = this.Unlocked;
        }
        // charges
        let charges = this.DOMObject.getElementsByClassName("charge");
        for (let i = 0; i < charges.length; i++) {
            let charge = charges[i];
            charge.classList.toggle("used", this.ChargesUsed > i);
        }
    }

    static FromJson(json) {
        let ret = new Relic();
        ret.Name = json.name;
        ret.Treshold = json.treshold;
        ret.Charges = json.charges;
        ret.Effect = json.effect;
        if (json.Amount)
            ret.Amount = json.amount;
        ret.CreateDOM();
        return ret;
    }
}