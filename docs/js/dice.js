const GOOD_DICE_COUNT = 3;
const EVIL_DICE_COUNT = 3;

class Dice {
    IsEvil = false;
    Used = true;
    Value = 1;
    // Runtime
    DOMObject = null;

    constructor(evil) {
        this.IsEvil = evil;
        this.CreateDOM();
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("dicepool-dice");
        this.DOMObject = ret;
        // add pips
        for (let i = 0; i < 6; i++) {
            let pip = document.createElement("span");
            pip.classList.add("pip");
            ret.appendChild(pip);
        }
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        let obj = this.DOMObject;
        // good
        obj.classList.toggle("evil", this.IsEvil);
        // used
        obj.classList.toggle("used", this.Used);
        // mark pips
        let pips = obj.getElementsByClassName("pip");
        for (let i = 0; i < pips.length; i++) {
            let pip = pips[i];
            pip.classList.toggle("active", i < this.Value);
        }
    }
}

class DicePool {
    Dice = [];
    GoodDice = [];
    EvilDice = [];
    // Runtime
    DOMObject = null;
    OnDiceClick = null;

    constructor() {
        this.CreateDice();
        this.CreateDOM();
    }

    Reroll() {
        //TODO: check if all dice were used
        //TODO: get active dice?
        for (let i in this.Dice) {
            let dice = this.Dice[i];
            dice.Used = false;
            dice.Value = Math.floor(Math.random() * 6) + 1;
            dice.UpdateUI();
        }
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("dicepool");
        this.DOMObject = ret;
        // add button
        let reroll = document.createElement("button");
        reroll.classList.add("dicepool-button");
        reroll.onclick = (e) => this.Reroll();
        reroll.innerText = "Reroll";
        ret.appendChild(reroll);
        // add dice
        for (let i in this.Dice) {
            let d = this.Dice[i];
            ret.appendChild(d.DOMObject);
            // listen to click
            d.DOMObject.onclick = (e) => {
                if (this.OnDiceClick) {
                    this.OnDiceClick({
                        "dice": d
                    });
                }
            };
        }
        return ret;
    }

    CreateDice() {
        for (let i = 0; i < GOOD_DICE_COUNT; i++) {
            let d = new Dice(false);
            this.Dice.push(d);
            this.GoodDice.push(d);
        }
        for (let i = 0; i < EVIL_DICE_COUNT; i++) {
            let d = new Dice(true);
            this.Dice.push(d);
            this.EvilDice.push(d);
        }
    }
}