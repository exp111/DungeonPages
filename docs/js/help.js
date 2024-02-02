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
                this.StepPos("In Dungeon Pages you play as a character trying to explore various dungeons. "+
                    "You win the game by completing all dungeons. " +
                    "To complete dungeons you need to roll dice to explore dungeons, collect items and defeat enemies.",
                    "50%", "50%");
                break;
            case 1: // Intro Character
                this.StepEl("This is your character. Here you can see your HP, XP, items and abilities. " +
                    "When your remaining health points reach zero, you lose the game.",
                    "character");
                break;
            case 2: // Intro Dungeon
                this.StepEl("These are the dungeons you can explore. " +
                    "There are 4 minor dungeons and one boss dungeon. " +
                    "To explore a dungeon, you need to select it. Once a dungeon is selected you need to finish it before you can explore the other dungeons. " +
                    "The boss dungeon requires you to complete all other dungeons first.",
                    "dungeons");
                break;
            case 3: // Intro Legend
                this.StepEl("This is the legend that contains informations about monsters and traps inside the dungeons, like when they attack, their damage, defense, XP reward and optionally special effects.",
                    "legend");
                break;
            case 4: // Intro phases
                this.StepEl("The gameplay is split into multiple game phases. " +
                    "The active phase is marked at the top. The game tries to automatically skip phases where you can't do anything, however sometimes you need to manually proceed into the next phase by clicking on it.",
                    "phases");
                break;
            case 5: // Explain phase "Select Dungeon"
                this.StepEl("This is the first phase where you need to select a dungeon to explore. " +
                    "The order in which to explore dungeons doesn't matter except for the boss dungeon always being last. " +
                    "Dungeons are not always ordered by difficulty.",
                    "SelectDungeon");
                break;
            case 6: // Explain phase "Roll"
                this.StepEl("The Roll phase consists of you rolling the dice and optionally adjusting the results using special effects like your ability, items, weapons or relics.",
                    "Roll");
                break;
            case 7: // Explain dice interface + good, evil dice
                this.StepEl("This is the dice area where all dice are shown. Not usable dice are greyed out. You start the game with one Good dice. " +
                    "The white dice are Good Dice and can be unlocked by leveling up. The black dice are Evil Dice, which count varies from dungeon to dungeon and are the only dice that trigger monster attacks. " +
                    "If two Evil dice show the same dice face, they will trigger wandering monsters in the dungeon, which will attack you for 1 damage. " +
                    "This will even trigger when all monsters inside the dungeon are defeated.",
                    "dicepool")
                break;
            case 8: // Explain phase "Monster" (when do monsters attack, wandering monster, auto skip except there is a dmg reduction ability)
                this.StepEl("The Monster phase consists of the remaining monsters inside the dungeon attacking your character. " +
                    "They can only attack when any Evil Dice has a dice face equal to or higher than their attack trigger, which is the ATK stat listed in the legend. " +
                    "If they attack, they will deal the damage (DMG) listed in the legend." +
                    "This phase is skipped automatically unless you receive damage and have a way to reducing that damage.",
                    "Monster");
                break;
            case 9: // Explain phase "Explore" (use ALL rolled dice, use items+abilities, if chest is reached dungeon is finished, how are items collected/monsters defeated)
                this.StepEl("In the Explore phase you need to use all dice to explore the dungeon. " +
                    "This is done by first selecting a dice and then a empty space inside the dungeon to mark with that number. " +
                    "Notice that you only mark spaces within range of any other marked space or the entrance door and can not count range through walls, locked doors, undefeated monster, uncollected items or unmarked traps. " +
                    "The dungeon is finished immediately after completing a path of marked orthogonally adjacent spaces from the door to the treasure chest. " +
                    "You may use effects from items, abilities or relics to change the value of dice. " +
                    "To collect items you need to mark the adjacent spaces with at least 2 times the same number. " +
                    "To defeat enemies you need to mark an adjacent space with a number equal or higher than its defense (DEF) for each point of its health (HP). " +
                    "Traps have to marked before they can be passed. If a trap is marked with a value that is smaller than its Disarm value, it will trigger its effect. " +
                    "After all dice have been used, the next turn will start with the Roll phase.",
                    "Explore")
                break;
            case 10: // Weapons + Range
                this.StepEl("Your character has multiple weapons which can be unlocked during your adventure. " +
                    "Each character starts with a weapon. " +
                    "Each weapon has a range value, which controls the range in which spaces can be marked, as well as one or multiple effects. " +
                    "Some weapons have special effects, but most only have at least one direction that controls the direction in which range can be counted from spaces.",
                    "character-weapons")
                break;
            case 11: // Explain phase "Finish" (explain sequential line, get rewards)
                this.StepEl("The Finish phase is only reached after a dungeon has been completed. " +
                    "If at the end of a dungeon there is a marked path in which each value is within 1 of the value of the previous space (equal, +1, -1), the path is considered sequential. " +
                    "If you created a sequential path, you will gain extra rewards: 1 XP per filled column in the dungeon, as well as the XP rewards for each monster defeated. You can now also select a weapon or relic to unlock, if the XP threshold is met. " +
                    "Else you will gain no experience and will only keep the items gained.",
                    "Finish");
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