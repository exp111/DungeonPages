class Help {
    BGGLink = "https://boardgamegeek.com/boardgame/374145/dungeon-pages-core-set";
    GithubLink = "https://github.com/exp111/DungeonPages";
    // Runtime
    ButtonDOMObject = null;
    DOMObject = null;
    WrapperObject = null;
    TutorialWindowObject = null;
    TutorialTextObject = null;
    Visible = false;
    TutorialActive = false;
    TutorialStep = 0;
    TutorialText = "";

    constructor() {
        this.CreateDOM();
    }

    CreateDOM() {
        let obj = null;
        // Button
        obj = document.createElement("button");
        obj.classList.add("help-button");
        obj.innerText = "Help";
        obj.onclick = () => this.SetVisible(true);
        this.ButtonDOMObject = obj;
        // Menu
        obj = document.createElement("div");
        obj.classList.add("help");
        this.DOMObject = obj;
        /// Close Button
        let close = document.createElement("button");
        close.classList.add("help-close-button");
        close.innerText = "Close";
        close.onclick = () => Global.help.SetVisible(false);
        obj.appendChild(close);
        // Menu Wrapper
        let wrapper = document.createElement("div");
        wrapper.classList.add("help-wrapper");
        this.WrapperObject = wrapper;
        obj.appendChild(wrapper);
        /// Menu
        let menu = document.createElement("div");
        menu.classList.add("help-menu");
        wrapper.appendChild(menu);
        //// Header
        let header = document.createElement("div");
        header.classList.add("help-menu-header");
        header.innerText = "Help";
        menu.appendChild(header);
        //// Content
        let content = document.createElement("div");
        content.classList.add("help-menu-content");
        content.innerHTML = `<span>What is Dungeon Pages?</span></br>
        Dungeon Pages is a one page roll-and-write board game. If you want more info, check out the <a href="${this.BGGLink}">BoardGameGeek page</a>.</br>
        <span>How does this game work?</span></br>
        You can start the tutorial by pressing the "Tutorial" button.</br>
        <span>I have a question/problem/bug or I want something changed/added/removed!</span></r>
        Please open a issue on <a href="${this.GithubLink}">GitHub</a>.
        `;
        menu.appendChild(content);
        // Tutorial button
        let tutorial = document.createElement("button");
        tutorial.classList.add("help-tutorial-button");
        tutorial.innerText = "Tutorial";
        tutorial.onclick = () => this.StartTutorial();
        wrapper.appendChild(tutorial);
        // Tutorial window
        let tutWindow = document.createElement("div");
        tutWindow.classList.add("help-tutorial-window");
        this.TutorialWindowObject = tutWindow;
        /// Content
        let tutText = document.createElement("p");
        tutText.classList.add("help-tutorial-text");
        this.TutorialTextObject = tutText;
        tutWindow.appendChild(tutText);
        /// Next button
        let tutNext = document.createElement("button");
        tutNext.classList.add("help-tutorial-next");
        tutNext.innerText = "Next";
        tutNext.onclick = () => this.NextStep();
        tutWindow.appendChild(tutNext);
        obj.appendChild(tutWindow);

        this.UpdateDOM();
    }

    SetVisible(val) {
        this.Visible = val;
        // Cancel the tutorial, if active
        this.RemoveFocus();
        this.TutorialActive = false;
        this.UpdateDOM();
    }

    StartTutorial() {
        this.TutorialActive = true;
        this.TutorialStep = 0;
        this.NextStep();
    }

    NextStep() {
        switch (this.TutorialStep) {
            case 0: // Intro
                this.StepPos(`In Dungeon Pages you play as a character trying to explore various dungeons.
                You win the game by completing all dungeons. To complete dungeons you need to roll dice to explore dungeons, collect items and defeat enemies.`,
                    "50%", "50%");
                break;
            case 1: // Intro Character
                this.StepEl(`This is your character. Here you can see your HP, your XP and your items and abilities.`, "character");
                break;
            default:
                this.RemoveFocus();
                this.TutorialActive = false;
                break;
        }
        this.TutorialStep++;
        this.UpdateDOM();
    }

    StepPos(text, right, top) {
        this.RemoveFocus();
        this.TutorialText = text;
        let style = this.TutorialWindowObject.style;
        // set pos
        style.right = right;
        style.top = top;
        // offset window to the center
        style.transform = "translate(50%, -50%)";
    }

    StepEl(text, className) {
        this.RemoveFocus();
        let el = document.getElementsByClassName(className)[0];
        this.TutorialText = text;
        el.classList.add("tutorial-focus");
        //TODO: move under/above el
    }

    RemoveFocus() {
        let el = document.getElementsByClassName("tutorial-focus");
        for (let e of el) {
            e.classList.remove("tutorial-focus");
        }
    }

    UpdateDOM() {
        this.DOMObject.classList.toggle("visible", this.Visible);
        this.WrapperObject.classList.toggle("hidden", this.TutorialActive);
        this.TutorialWindowObject.classList.toggle("visible", this.TutorialActive);
        this.TutorialTextObject.innerText = this.TutorialText;
    }
}