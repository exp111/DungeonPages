const GOOD_DICE_COUNT = 3;
const EVIL_DICE_COUNT = 3;

class Dice {
    IsEvil = false;
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
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        let obj = this.DOMObject;
        // good
        obj.classList.toggle("evil", this.IsEvil);
        // add pips
        obj.innerHTML = "";
        for (let i = 0; i < this.Value; i++) {
            let pip = document.createElement("span");
            pip.classList.add("pip");
            obj.appendChild(pip);
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
        //TODO: get active dice?
        for (let i in this.Dice) {
            let dice = this.Dice[i];
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