class InputBox {
    hasInput = false;
    htmlInputBox = null;
    text = "";
    position = {x: 0, y: 0};
    size = {width: 100, height: 20};
    backgroundColor = "#eeeeee";
    textColor = "#000000";

    constructor(position, size) {
        this.position = position;
        this.size = size;
    }

    setInput(hasInput) {
        this.hasInput = hasInput;
        if (hasInput) {
            this.htmlInputBox = document.createElement("input");
            this.htmlInputBox.type = "text";
            this.htmlInputBox.style.position = "absolute";
            this.htmlInputBox.style.left = this.position.x + "px";
            this.htmlInputBox.style.top = this.position.y + "px";
            this.htmlInputBox.style.width = this.size.width + "px";
            this.htmlInputBox.style.height = this.size.height + "px";
            this.htmlInputBox.style.backgroundColor = this.backgroundColor;
            this.htmlInputBox.style.color = this.textColor;
            this.htmlInputBox.style.border = "none";

            // end input on enter or escape
            this.htmlInputBox.onkeydown = (event) => {
                if (event.key == "Enter" || event.key == "Escape") {
                    this.setInput(false);
                }
            };
            
            document.body.appendChild(this.htmlInputBox);
            this.htmlInputBox.focus();
        } else {
            this.text = this.htmlInputBox.value;
            document.body.removeChild(this.htmlInputBox);
        }
    }

    onMouseUp(position) {
        // only check if the input should be lost
        if (position.x < this.position.x || position.x > this.position.x + this.size.width
            || position.y < this.position.y || position.y > this.position.y + this.size.height)
        {
            this.setInput(false);
        }
    }
}