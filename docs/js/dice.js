const GOOD_DICE_COUNT = 3;
const EVIL_DICE_COUNT = 3;

class Dice {
    IsEvil = false;
    Value = 1;
    // Runtime
    DOMObject = null;
    Used = true;
    Active = false;
    Disabled = true;
    Selected = false; // selected for abilities/items

    constructor(evil) {
        this.IsEvil = evil;
        this.CreateDOM();
    }

    Reroll() {
        this.Value = Math.floor(Math.random() * 6) + 1;
        this.Used = false;
        this.UpdateUI();
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
        // active
        obj.classList.toggle("active", this.Active);
        // disabled
        obj.classList.toggle("disabled", this.Disabled);
        // selected
        obj.classList.toggle("selected", this.Selected);
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
    SelectedDice = null;
    AvailableGood = 1;
    AvailableEvil = 0;
    // Objects
    DOMObject = null;
    Buttons = null;
    // Events
    OnDiceClick = null;

    constructor() {
        this.CreateDice();
        this.UpdateDice();
        this.CreateDOM();
    }

    SetAvailableDice(good, evil) {
        // set
        this.AvailableGood = good;
        this.AvailableEvil = evil;
        // reset
        this.UnselectDice();
        for (let i in this.Dice) {
            let dice = this.Dice[i];
            dice.Used = true;
        }
        // update dice
        this.UpdateDice();
    }

    UpdateDice() {
        for (let i in this.GoodDice) {
            let dice = this.GoodDice[i];
            dice.Disabled = i >= this.AvailableGood;
            dice.UpdateUI();
        }
        for (let i in this.EvilDice) {
            let dice = this.EvilDice[i];
            dice.Disabled = i >= this.AvailableEvil;
            dice.UpdateUI();
        }
    }

    CanUseDice(dice) {
        return dice != null && !dice.Used && !dice.Disabled;
    }

    UseDice(tile) {
        if (!this.CanUseDice(this.SelectedDice))
            return false;

        let dice = this.SelectedDice;
        // mark tile
        tile.Value = dice.Value;
        tile.UpdateUI();
        // use dice
        this.SelectedDice = null;
        dice.Used = true;
        dice.Active = false;
        dice.UpdateUI();
        return true;
    }

    SelectDice(dice) {
        if (dice.Active || dice.Used || dice.Disabled)
            return false;
        // remove last active dice
        if (this.SelectedDice != null) {
            this.UnselectDice();
        }
        // select the new dice
        this.SelectedDice = dice;
        dice.Active = true;
        dice.UpdateUI();
        return true;
    }

    UnselectDice() {
        let dice = this.SelectedDice;
        if (dice == null)
            return;

        dice.Active = false;
        dice.UpdateUI();
    }

    SetDice(results) {
        for (let i in results) {
            let res = results[i];
            let dice = this.Dice[i];
            dice.Value = res;
            dice.UpdateUI();
        }
    }

    GetRollResults() {
        let ret = [];
        for (let i in this.Dice) {
            let dice = this.Dice[i];
            if (dice.Disabled)
                continue;

            if (dice.Used)
                continue;

            ret.push(dice);
        }
        return ret;
    }

    CanReroll() {
        for (let i in this.Dice) {
            let dice = this.Dice[i];
            if (!dice.Used)
                return false;
        }
        return true;
    }

    Reroll() {
        // check if all dice were used
        if (!this.CanReroll())
            return null;

        // go through each dice and reroll
        let ret = [];
        for (let i in this.Dice) {
            let dice = this.Dice[i];
            if (dice.Disabled) // disabled
                continue;

            dice.Active = false;
            dice.Reroll();
            ret.push(dice);
        }
        return ret;
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("dicepool");
        this.DOMObject = ret;
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
        this.Buttons = document.createElement("div");
        this.Buttons.classList.add("dicepool-buttons");
        ret.appendChild(this.Buttons);
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