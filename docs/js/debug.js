class Debug {
    IsDebug = false;
    ForceDiceResults = false;
    DOMObject = null;
    DiceResults = [];
    // Events
    UnlockAll = null;
    GiveXP = null;
    GiveDmg = null;

    constructor() {
        if (window.location.protocol == "file:" || window.location.hostname == "localhost") {
            this.IsDebug = true;
        }
        else {
            return;
        }
        this.CreateDOM();
    }

    GetRollResults() {
        let ret = [];
        for (let i = 0; i < this.DiceResults.length; i++) {
            ret.push(Number(this.DiceResults[i].value));
        }
        return ret;
    }

    CreateDOM() {
        let base = this;
        let ret = document.createElement("div");
        ret.classList.add("debug");
        this.DOMObject = ret;
        ret.innerHTML = `
        <button id="debug-unlockAll">Unlock All</button>
        <div id="debug-diceResults">
            <input id="debug-overwriteDice" type="checkbox" />
            <label for="debug-overwriteDice">Overwrite Dice:</label>
            <input type="number" min="1" max="6" value="1" />
            <input type="number" min="1" max="6" value="2" />
            <input type="number" min="1" max="6" value="3" />
            <input type="number" min="1" max="6" value="4" />
            <input type="number" min="1" max="6" value="5" />
            <input type="number" min="1" max="6" value="6" />
        </div>
        <div>
            <input id="debug-xp" type="number" value="1" min="0" max="75" />
            <button id="debug-giveXP">Give XP</button>
        </div>
        <div>
            <input id="debug-dmg" type="number" value="1" min="0" max="30" />
            <button id="debug-giveDmg">Give Dmg</button>
        </div>
        `;
        // Unlock all
        let unlockAll = ret.querySelector("#debug-unlockAll");
        unlockAll.onclick = (_) => {
            if (this.UnlockAll) {
                this.UnlockAll();
            }
        }
        // Dice results
        let resultCheckbox = ret.querySelector("#debug-overwriteDice");
        resultCheckbox.onchange = (_) => base.ForceDiceResults = resultCheckbox.checked;
        /// add all result inputs to the list
        ret.querySelectorAll("#debug-diceResults > input[type=number]").forEach((e) => {
           base.DiceResults.push(e);
        });
        // Experience
        let xp = ret.querySelector("#debug-xp");
        let xpButton = ret.querySelector("#debug-giveXP");
        xpButton.onclick = (_) => {
            if (this.GiveXP) {
                this.GiveXP(Number(xp.value));
            }
        }
        // Dmg
        let dmg = ret.querySelector("#debug-dmg");
        let dmgButton = ret.querySelector("#debug-giveDmg");
        dmgButton.onclick = (_) => {
            if (this.GiveDmg) {
                this.GiveDmg(Number(dmg.value));
            }
        }
        return ret;
    }
}