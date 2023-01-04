class View {
  canvas;
  ctx;
  viewModel;

  constructor(canvas, viewModel) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.viewModel = viewModel;
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
    const x = position.x;
    const y = position.y;
    const width = size.width;
    const height = size.height;

    switch (shape) {
      case shapes.circle:
        // draw hover
        if (this.viewModel.getHoveredNode() === index) {
          this.ctx.beginPath();
          this.ctx.fillStyle = colors.blue;
          this.ctx.arc(x, y, width / 2 + 3, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.stroke();
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(x, y, width / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        break;
      case shapes.rectangle:
        // draw hover
        if (this.viewModel.getHoveredNode() === index) {
          this.ctx.beginPath();
          this.ctx.fillStyle = colors.blue;
          this.ctx.rect(x - 5, y - 5, width + 10, height + 10);
          this.ctx.fill();
          this.ctx.fillStyle = color;
          this.ctx.stroke();
        }
        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
        break;
      case shapes.triangle:
        // draw hover
        if (this.viewModel.getHoveredNode() === index) {
          this.ctx.beginPath();
          this.ctx.fillStyle = colors.blue;
          this.ctx.moveTo(x - 5, y - 5);
          this.ctx.lineTo(x + width + 5, y - 5);
          this.ctx.lineTo(x + width / 2, y + height + 5);
          this.ctx.lineTo(x - 5, y - 5);
          this.ctx.fill();
          this.ctx.fillStyle = color;
          this.ctx.stroke();
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width / 2, y + height);
        this.ctx.lineTo(x, y);
        this.ctx.fill();
        break;
      case shapes.diamond:
        // draw hover
        if (this.viewModel.getHoveredNode() === index) {
          this.ctx.beginPath();
          this.ctx.fillStyle = colors.blue;
          this.ctx.moveTo(x - 5, y);
          this.ctx.lineTo(x + width / 2, y + height / 2 + 5);
          this.ctx.lineTo(x + width + 5, y);
          this.ctx.lineTo(x + width / 2, y - height / 2 - 5);
          this.ctx.lineTo(x - 5, y);
          this.ctx.fill();
          this.ctx.fillStyle = color;
          this.ctx.stroke();
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width / 2, y + height / 2);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width / 2, y - height / 2);
        this.ctx.lineTo(x, y);
        this.ctx.fill();
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
    this.ctx.strokeStyle = colors.black;
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
    this.ctx.strokeStyle = colors.black;
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
      const x = nodePosition.x;
      const y = nodePosition.y;
      const width = nodeSize.width;
      const height = nodeSize.height;
      switch (nodeShape) {
        case shapes.circle:
          if (Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2) < Math.pow(width / 2, 2)) {
            return children[i];
          }
          break;
        case shapes.rectangle:
          if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
            return children[i];
          }
          break;
        case shapes.triangle:
          if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
            return children[i];
          }
          break;
        case shapes.diamond:
          if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
            return children[i];
          }
          break;
      }
    }
    return null;
  }
}