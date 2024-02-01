class Help {
    // Runtime
    ButtonDOMObject = null;
    DOMObject = null;
    Visible = false;

    constructor() {
        this.CreateDOM();
    }

    CreateDOM() {
        let obj = null;
        // Button
        obj = document.createElement("button");
        obj.classList.add("help-button");
        obj.innerText = "Help";
        obj.onclick = () => Global.help.SetVisible(true);
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
        this.UpdateDOM();
    }

    SetVisible(val) {
        this.Visible = val;
        this.UpdateDOM();
    }

    UpdateDOM() {
        this.DOMObject.classList.toggle("visible", this.Visible);
    }
}