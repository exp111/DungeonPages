class Phases {
    /* Phases:
    Select Dungeon
    Roll
    Monster Damage
    Explore
    Finish
    TODO: dead
     */
    Phase = "SelectDungeon";
    // Runtime
    DOMObject = null;
    /// Objects
    SelectDungeon = null;
    Roll = null;
    Monster = null;
    Explore = null;
    Finish = null;
    // Events
    OnPhaseSelected = null;

    constructor() {
        this.CreateDOM();
    }

    SelectPhase(phase) {
        this.Phase = phase;
        this.UpdateUI();
    }

    CreateDOM() {
        let ret = document.createElement("div");
        ret.classList.add("phases");
        this.DOMObject = ret;
        // Title
        let title = document.createElement("span");
        title.textContent = "Phases: ";
        ret.appendChild(title);

        let base = this;
        function addPhase(name, phase) {
            let button = document.createElement("button");
            button.classList.add("phase");
            button.innerText = name;
            button.onclick = (_) => {
                if (base.OnPhaseSelected) {
                    base.OnPhaseSelected({
                        "current": base.Phase,
                        "phase": phase != null ? phase : name
                    });
                }
            }
            ret.appendChild(button);
            return button;
        }

        // Phase Buttons
        this.SelectDungeon = addPhase("Select Dungeon", "SelectDungeon");
        this.Roll = addPhase("Roll");
        this.Monster = addPhase("Monster");
        this.Explore = addPhase("Explore");
        this.Finish = addPhase("Finish");
        this.UpdateUI();
        return ret;
    }

    UpdateUI() {
        this.SelectDungeon.disabled = this.Phase != "Finish";
        this.SelectDungeon.classList.toggle("active", this.Phase == "SelectDungeon");
        this.Roll.disabled = this.Phase != "Explore";
        this.Roll.classList.toggle("active", this.Phase == "Roll");
        this.Monster.disabled = this.Phase != "Roll";
        this.Monster.classList.toggle("active", this.Phase == "Monster");
        this.Explore.disabled = this.Phase != "Monster";
        this.Explore.classList.toggle("active", this.Phase == "Explore");
        this.Finish.disabled = true;
        this.Finish.classList.toggle("active", this.Phase == "Finish");
    }
}