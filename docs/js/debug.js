class Debug {
    IsDebug = false;
    ForceDiceResults = false;
    DOMObject = null;
    DiceResults = [];
    // Events
    UnlockAll = null;
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
        let unlockAll = document.createElement("button");
        unlockAll.innerText = "Unlock All";
        unlockAll.onclick = (_) => {
            if (this.UnlockAll) {
                this.UnlockAll();
            }
        }
        // Dice results
        let resultCheckbox = document.createElement("input");
        resultCheckbox.type = "checkbox";
        resultCheckbox.onchange = (_) => base.ForceDiceResults = resultCheckbox.checked;
        ret.appendChild(resultCheckbox);
        let label = document.createElement("label");
        label.innerText = "Overwrite Dice:";
        ret.appendChild(label);
        for (let i = 0; i < 6; i++) {
            let res = document.createElement("input");
            res.type = "number";
            res.value = i + 1;
            res.min = "1";
            res.max = "6";
            this.DiceResults.push(res);
            ret.appendChild(res);
        }
        ret.appendChild(unlockAll);
        return ret;
    }
}