class ContextMenuItem {
    text = "";
    action = null;

    constructor(text, action) {
        this.text = text;
        this.action = action;
    }
}

class ContextMenu {
    visible = false;
    items = [];
    hoveredItemIdx = -1;

    position = {x: 0, y: 0};
    itemSize = {width: 150, height: 20};

    backgroundColor = "#eeeeee";
    textColor = "#000000";
    borderColor = "#000000";
    borderWith = 1;
    hoverColor = "#aaaaaa";

    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        // add context menu handler to canvas
        this.canvas.addEventListener("contextmenu", event => {
            event.preventDefault();
            this.visible = true;
            this.position = this.getMousePosition(event);
        });
    }

    onMouseMove = event => {
        if (!this.visible) 
            return;

        const position = this.getMousePosition(event);

        this.hoveredItemIdx = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (position.x >= this.position.x 
                && position.x <= this.position.x + this.itemSize.width 
                && position.y >= this.position.y + this.itemSize.height * i 
                && position.y <= this.position.y + this.itemSize.height * (i + 1)) 
            {
                this.hoveredItemIdx = i;
                break;
            }
        }
    }    

    onMouseUp = event => {
        if (!this.visible) 
            return;

        const position = this.getMousePosition(event);

        for (let i = 0; i < this.items.length; i++) {
            if (position.x >= this.position.x
                && position.x <= this.position.x + this.itemSize.width
                && position.y >= this.position.y + this.itemSize.height * i
                && position.y <= this.position.y + this.itemSize.height * (i + 1))
            {
                this.items[i].action();
                break;
            }
        }

        this.visible = false;
    }

    draw(ctx) {
        if (!this.visible) 
            return;

        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderWith;

        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.itemSize.width, this.itemSize.height * this.items.length);
        ctx.fill();
        ctx.stroke();

        if (this.hoveredItemIdx >= 0) {
            ctx.fillStyle = this.hoverColor;
            ctx.beginPath();
            ctx.rect(this.position.x, this.position.y + this.itemSize.height * this.hoveredItemIdx, this.itemSize.width, this.itemSize.height);
            ctx.fill();
        }

        ctx.fillStyle = this.textColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        for (let i = 0; i < this.items.length; i++) {
            ctx.fillText(this.items[i].text, this.position.x + 5, this.position.y + this.itemSize.height * (i + 0.5));
        }
    }
    

  getMousePosition(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }
}