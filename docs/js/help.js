class Help {
    BGGLink = "https://boardgamegeek.com/boardgame/374145/dungeon-pages-core-set";
    GithubLink = "https://github.com/exp111/DungeonPages";
    // Runtime
    ButtonDOMObject = null;
    DOMObject = null;
    Visible = false;
    TutorialActive = false;

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
        tutorial.classList.add("help-tutorial");
        tutorial.innerText = "Tutorial";
        tutorial.onclick = () => this.StartTutorial();
        wrapper.appendChild(tutorial);

        this.UpdateDOM();
    }

    SetVisible(val) {
        this.Visible = val;
        this.UpdateDOM();
    }

    StartTutorial() {
        this.TutorialActive = true;
        this.UpdateDOM();
    }

    UpdateDOM() {
        let help = this.DOMObject;
        help.classList.toggle("visible", this.Visible);
        let menu = help.getElementsByClassName("help-wrapper")[0];
        menu.classList.toggle("hidden", this.TutorialActive);
    }
}