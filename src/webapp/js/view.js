class View {
  canvas;
  ctx;
  viewModel;
  comntextMenu;

  constructor(canvas, viewModel) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.viewModel = viewModel;

    // initialize context menu
    this.contextMenu = new ContextMenu(this.canvas);

    // add test items to context menu
    this.contextMenu.items.push({
      text: "Add node",
      action: () => {
        console.log("Add node");
      }
    });
    this.contextMenu.items.push({
      text: "Add connection",
      action: () => {
        console.log("Add connection");
      }
    });
    
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  resize = () => {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
    this.draw();
  };

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawGrid();

    this.drawCreatedConnection();

    this.drawChildNodesAndConnections(this.viewModel.getDisplayedLayer());

    this.drawLayerIndex();

    this.contextMenu.draw(this.ctx);
  }

  drawChildNodesAndConnections(parent) {
    const children = this.viewModel.getChildren(parent);
    children.forEach(child => {
      const outputNodes = this.viewModel.getOutputNodes(child);
      outputNodes.forEach(outputNode => {
        this.drawConnection(child, outputNode);
      });
    });
    children.forEach(child => {
      this.drawNode(child);
    });
  }

  drawGrid() {
    const gridSize = this.viewModel.gridSize;
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#dbdbdb";
    this.ctx.lineWidth = 1;

    for (let x = 0; x < width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (let y = 0; y < height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    
    this.ctx.stroke();
  }

  // Writes currently displayed layer index in the top left corner of the canvas
  drawLayerIndex() {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "#000000";
    this.ctx.fillText(this.viewModel.getDisplayedLayer(), 10, 30);
  }

  drawNode(index) {
    const position = this.viewModel.getNodePosition(index);
    const size = this.viewModel.getNodeSize(index);
    const shape = this.viewModel.getNodeShape(index);
    const color = this.viewModel.getNodeColor(index);

    switch (shape) {
      case Shape.oval:
        // draw hover
        if (this.viewModel.getHoveredNode() === index) {
          var hoverSize = {
            width: size.width + 8,
            height: size.height + 8
          };
          this.drawOvalAtPosition(position, hoverSize, Color.blue);
        }
        this.drawOvalAtPosition(position, size, color);
        break;
      case Shape.rectangle:
        // draw hover
        if (this.viewModel.getHoveredNode() === index) {
          var hoverSize = {
            width: size.width + 8,
            height: size.height + 8
          };
          this.drawRectangleAtPosition(position, hoverSize, Color.blue);
        }
        this.drawRectangleAtPosition(position, size, color);
        break;
    }
  }

  drawConnection(start, end) {
    // get start node position
    const startNodePosition = this.viewModel.getNodePosition(start);
    // get end node position
    const endNodePosition = this.viewModel.getNodePosition(end);
    // draw line
    this.ctx.beginPath();
    // draw wide black line
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = Color.black;
    this.ctx.moveTo(startNodePosition.x, startNodePosition.y);
    this.ctx.lineTo(endNodePosition.x, endNodePosition.y);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  drawCreatedConnection() {
    // check if created connection start node is not null
    if (this.viewModel.getCreatedConnectionStartNode() === null) {
      return;
    }
    // get start node position
    const start = this.viewModel.getNodePosition(this.viewModel.getCreatedConnectionStartNode());
    // get end position
    const end = this.viewModel.getCreatedConnectionEndPosition();
    // draw line
    this.ctx.beginPath();
    // draw wide black line
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = Color.black;
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  getNodeAtPosition(position) {
    // get displayed layer
    const displayedLayer = this.viewModel.getDisplayedLayer();
    const children = this.viewModel.getChildren(displayedLayer);
    // find node at position
    for (let i = 0; i < children.length; i++) {
      const nodePosition = this.viewModel.getNodePosition(children[i]);
      const nodeSize = this.viewModel.getNodeSize(children[i]);
      const nodeShape = this.viewModel.getNodeShape(children[i]);
      switch (nodeShape) {
        case Shape.oval:
          if (this.isPointInOval(position, nodePosition, nodeSize)) {
            return children[i];
          }
          break;
        case Shape.rectangle:
          if (this.isPointInRectangle(position, nodePosition, nodeSize)) {
            return children[i];
          }
          break;
      }
    }
    return null;
  }

  drawCircleAtPosition(position, radius, color) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = Color.black;
    this.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  isPointInCircle(point, position, radius) {
    return Math.pow(point.x - position.x, 2) + Math.pow(point.y - position.y, 2) < Math.pow(radius, 2);
  }

  drawOvalAtPosition(position, size, color) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = Color.black;
    this.ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  isPointInOval(point, position, size) {
    const x = (point.x - position.x) / (size.width / 2);
    const y = (point.y - position.y) / (size.height / 2);
    return Math.pow(x, 2) + Math.pow(y, 2) < 1;
  }

  drawRectangleAtPosition(position, size, color) {
    // draw rectangle centered at position
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = Color.black;
    this.ctx.rect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
    this.ctx.fill();
    this.ctx.stroke();
  }

  isPointInRectangle(point, position, size) {
    return (
      point.x >= position.x - size.width / 2 &&
      point.x <= position.x + size.width / 2 &&
      point.y >= position.y - size.height / 2 &&
      point.y <= position.y + size.height / 2
    );
  }
}