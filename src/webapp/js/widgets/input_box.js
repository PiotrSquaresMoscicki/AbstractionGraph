class InputBox {
    hasInput = false;
    htmlInputBox = null;
    text = "";
    position = {x: 0, y: 0};
    size = {width: 100, height: 20};
    callback = null;

    // show function takes a node to set the position and size of the input box. It also takes a 
    // callback function that is called when the input is finished.
    show(position, callback) {
        console.log(position);
        this.position = position;
        this.callback = callback;
        this.setInput(true);
    }

    setInput(hasInput) {
        this.hasInput = hasInput;
        if (hasInput) {
            // print pos
            console.log(this.position);
            this.htmlInputBox = document.createElement("input");
            this.htmlInputBox.type = "text";
            this.htmlInputBox.style.position = "fixed";
            // center input box around the position
            this.htmlInputBox.style.left = this.position.x - this.size.width / 2 + "px";
            this.htmlInputBox.style.top = this.position.y - this.size.height / 2 + "px";
            this.htmlInputBox.style.width = this.size.width + "px";
            this.htmlInputBox.style.height = this.size.height + "px";

            //end input on enter or escape
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
            this.htmlInputBox = null;
            this.callback(this.text);

            // reset callback
            this.callback = null;
        }
    }

    onMouseDown(position) {
        // only check if the input should be lost
        if (position.x < this.position.x || position.x > this.position.x + this.size.width
            || position.y < this.position.y || position.y > this.position.y + this.size.height)
        {
            this.setInput(false);
        }
    }
}