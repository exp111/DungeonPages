class Character {
    Name = "";
    Ability = null;
    Health = null;
    Experience = null; // XP unlocks
    Weapons = [];
    Relics = [];
    DOMObject = null;

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("character");
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
        // Relics
        this.DOMObject = ret;
        return ret;
    }

    static FromJson(json) {
        let ret = new Character();
        ret.Name = json.name;
        ret.Ability = Ability.FromJson(json.ability);
        ret.Health = Health.FromJson(json.health);
        ret.Experience = Experience.FromJson(json.bonuses);
        for (let i in json.weapons) {
            let w = json.weapons[i];
            ret.Weapons.push(Weapon.FromJson(w));
        }
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
        this.DOMObject = ret;
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
        // Name
        let name = document.createElement("div");
        name.innerText = this.Name;
        ret.appendChild(name);
        //TODO: description?
        // return it
        this.DOMObject = ret;
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
        this.DOMObject = ret;
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

class Weapon {
    Name = "";
    Treshold = 0;
    Range = 1;
    Effects = []; // Ortho,Diag,StraightLine,DiagLine //TODO: enum
    //TODO: alt effects like reroll 1

    static FromJson(json) {
        let ret = new Weapon();
        ret.Name = json.name;
        if (json.treshold != null)
            ret.Treshold = json.treshold;
        ret.Range = json.Range;
        ret.Effects = json.effects;
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