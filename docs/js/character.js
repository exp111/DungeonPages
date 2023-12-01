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
            if (i == 0)
            {
                // first one is bigger
                element.style.setProperty("grid-column-end", "span 3");
            }
            /// checkmark
            let check = document.createElement("input");
            check.type = "checkbox";
            check.classList.add("character-health-check");
            check.disabled = true;
            check.checked = i <= this.Unlocked;
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
        return ret;
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
                p.checked = (i * 25 + j) < this.Earned;
                grid.appendChild(p);
            }
            points.appendChild(grid);
        }
        ret.appendChild(points);
        return ret;
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

    static FromJson(json) {
        let ret = new Bonus();
        ret.Treshold = json.treshold;
        ret.Type = json.type;
        if (json.amount != null)
            ret.Amount = json.amount;
        return ret;
    }
}

class Weapons {
    Weapons = [];
    DOMObject = null;

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
    Effects = []; // Ortho,Diag,StraightLine,DiagLine //TODO: enum
    //TODO: alt effects like reroll 1
    DOMObject = null;
    Unlocked = false;

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character-weapons-weapon");
        this.DOMObject = ret;
        // Name
        let name = document.createElement("div");
        /// Checkbox before name
        let check = document.createElement("input");
        check.type = "checkbox";
        check.checked = this.Unlocked;
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
        return ret;
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