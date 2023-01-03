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

    this.viewModel.connections.forEach(connection => {
      this.drawConnection(connection);
    });

    this.viewModel.nodes.forEach((node, index) => {
      this.drawNode(index);
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

  drawNode(index) {
    const position = this.viewModel.getPosition(index);
    const size = this.viewModel.getSize(index);
    const shape = this.viewModel.getShape(index);
    const color = this.viewModel.getColor(index);
    const x = position.x;
    const y = position.y;
    const width = size.width;
    const height = size.height;

    switch (shape) {
      case shapes.circle:
        // draw selection
        if (this.viewModel.getSelectedNode() === index) {
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
        // draw selection
        if (this.viewModel.getSelectedNode() === index) {
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
        // draw selection
        if (this.viewModel.getSelectedNode() === index) {
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
        // draw selection
        if (this.viewModel.getSelectedNode() === index) {
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

  drawConnection(connection) {
    const start = this.viewModel.getPosition(connection.start);
    const end = this.viewModel.getPosition(connection.end);
    const startAttachPosition = this.viewModel.getConnectionStartAttachPosition(connection.start, connection.end);
    const endAttachPosition = this.viewModel.getConnectionEndAttachPosition(connection.start, connection.end);
    const startAttachPoint = this.getAttachPoint(start, startAttachPosition);
    const endAttachPoint = this.getAttachPoint(end, endAttachPosition);

    this.ctx.beginPath();
    this.ctx.moveTo(startAttachPoint.x, startAttachPoint.y);
    this.ctx.lineTo(endAttachPoint.x, endAttachPoint.y);
    this.ctx.stroke();
  }

  getNodeAtPosition(position) {
    const nodes = this.viewModel.nodes;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const nodePosition = this.viewModel.getPosition(i);
      const nodeSize = this.viewModel.getSize(i);
      const nodeShape = this.viewModel.getShape(i);
      const x = nodePosition.x;
      const y = nodePosition.y;
      const width = nodeSize.width;
      const height = nodeSize.height;
      switch (nodeShape) {
        case shapes.circle:
          if (Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2) < Math.pow(width / 2, 2)) {
            return i;
          }
          break;
        case shapes.rectangle:
          if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
            return i;
          }
          break;
        case shapes.triangle:
          if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
            return i;
          }
          break;
        case shapes.diamond:
          if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
            return i;
          }
          break;
      }
    }
    return null;
  }
}