// Node is the internal class for storing data inside the model. It has two fields: 
// parent - index of the parent node in the model array of nodes
// children - array of indices of the children nodes in the model array of nodes
class Node {
  constructor(parent) {
    this.parent = parent;
    this.children = [];
  }

  parent = null;
  children = [];
}

// Connection is the internal class for storing data inside the model. It has two fields:
// input - index of the input node in the model array of nodes
// output - index of the output node in the model array of nodes
class Connection {
  input = null;
  output = null;
}

// Model representing a graph of nodes and connections. Each node can have multiple input and output
// connections. Each connection as an input and an output node. Nodes are identified by instances 
// of the Index type. Nodes can have child nodes. The model is a tree of nodes that can connect with
// each other. Children can't be connected with its parents.
class Model {
  nodes = [];
  connections = [];
  
  // getters

  getParent(index) {
    return this.nodes[index].parent;
  }

  getChildren(index) {
    return this.nodes[index].children;
  }
  
  getInputNodesIndices(index) {
    return this.connections.filter(connection => connection.output === index).map(connection => connection.input);
  }

  getOutputNodesIndices(index) {
    return this.connections.filter(connection => connection.input === index).map(connection => connection.output);
  }
  
  getConnectionIndex(start, end) {
    return this.connections.findIndex(connection => connection.input === start && connection.output === end);
  }

  // setters

  addNode(parent) {
    const index = this.nodes.length;
    this.nodes.push(new Node(parent));
    return index;
  }

  addConnection(input, output) {
    this.connections.push(new Connection(input, output));
  }

  removeConnection(input, output) {
    this.connections = this.connections.filter(connection => connection.input !== input && connection.output !== output);
  }

  removeConnections(index) {
    this.connections = this.connections.filter(connection => connection.input !== index && connection.output !== index);
  }

  removeNode(index) {
    this.nodes = this.nodes.filter(node => node.parent !== index && !node.children.includes(index));
    this.removeConnections(index);
  }
}

const shapes = {
  circle: "circle",
  rectangle: "rectangle",
  triangle: "triangle",
  diamond: "diamond",
};

const colors = {
  red: "red",
  green: "green",
  blue: "blue",
  yellow: "yellow",
};

const connectionAttachPositions = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};

// Proxy model for the view. It provides a simplified interface for the view to interact with the model.
// It also provides a way to listen to changes in the model. It also contains additional data required 
// to visualize the model like nodes positions, connections positions, sizes, shapes and colors.
class ViewModel extends Model {
  // nodes properties
  positions = [];
  sizes = [];
  shapes = [];
  colors = [];
  
  // connections properties
  connectionStartAttachPositions = [];
  connectionEndAttachPositions = [];

  // drag and drop
  draggedNode = null;
  initialNodePosition = null;
  InitialMousePosition = null;

  // selection
  selectedNode = null;

  // grid
  gridSize = 20;

  // getters

  getPosition(index) {
    return this.positions[index];
  }

  getSize(index) {
    return this.sizes[index];
  }

  getShape(index) {
    return this.shapes[index];
  }

  getColor(index) {
    return this.colors[index];
  }

  getConnectionStartAttachPosition(index) {
    return this.connectionStartAttachPositions[index];
  }

  getConnectionEndAttachPosition(index) {
    return this.connectionEndAttachPositions[index];
  }

  // setters

  addNode(parent) {
    const index = super.addNode(parent);
    this.positions[index] = { x: 0, y: 0 };
    this.sizes[index] = { width: 0, height: 0 };
    this.shapes[index] = shapes.circle;
    this.colors[index] = colors.red;
    return index;
  }

  addConnection(input, output) {
    super.addConnection(input, output);
    this.connectionStartAttachPositions.push(connectionAttachPositions.top);
    this.connectionEndAttachPositions.push(connectionAttachPositions.top);
  }

  removeConnection(input, output) {
    super.removeConnection(input, output);
    this.connectionStartAttachPositions = this.connectionStartAttachPositions.filter(connection => connection.input !== input && connection.output !== output);
    this.connectionEndAttachPositions = this.connectionEndAttachPositions.filter(connection => connection.input !== input && connection.output !== output);
  }

  removeConnections(index) {
    super.removeConnections(index);
    this.connectionStartAttachPositions = this.connectionStartAttachPositions.filter(connection => connection.input !== index && connection.output !== index);
    this.connectionEndAttachPositions = this.connectionEndAttachPositions.filter(connection => connection.input !== index && connection.output !== index);
  }

  removeNode(index) {
    this.removeConnections(index);
    super.removeNode(index);
    this.positions = this.positions.filter((_, i) => i !== index);
    this.sizes = this.sizes.filter((_, i) => i !== index);
    this.shapes = this.shapes.filter((_, i) => i !== index);
    this.colors = this.colors.filter((_, i) => i !== index);
  }

  setNodePosition(index, position) {
    this.positions[index] = position;
  }

  setNodeSize(index, size) {
    this.sizes[index] = size;
  }

  setNodeShape(index, shape) {
    this.shapes[index] = shape;
  }

  setNodeColor(index, color) {
    this.colors[index] = color;
  }

  setConnectionStartAttachPosition(start, end, position) {
    const index = this.getConnectionIndex(start, end);
    this.connectionStartAttachPositions[index] = position;
  }

  setConnectionEndAttachPosition(start, end, position) {
    const index = this.getConnectionIndex(start, end);
    this.connectionEndAttachPositions[index] = position;
  }

  // drag and drop

  setDraggedNode(index) {
    this.draggedNode = index;
  }

  setInitialNodePosition(position) {
    this.initialNodePosition = position;
  }

  setInitialMousePosition(position) {
    this.initialMousePosition = position;
  }

  getDraggedNode() {
    return this.draggedNode;
  }

  getInitialNodePosition() {
    return this.initialNodePosition;
  }

  getInitialMousePosition() {
    return this.initialMousePosition;
  }

  // selection

  setSelectedNode(index) {
    this.selectedNode = index;
  }

  getSelectedNode() {
    return this.selectedNode;
  }
}

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

    // draw connection points
    if (this.viewModel.getSelectedNode() === index) {
      this.drawConnectionPoints(position);
    }
  }

  drawConnectionPoints(position) {
    this.drawConnectionPoint(position, connectionAttachPositions.top);
    this.drawConnectionPoint(position, connectionAttachPositions.right);
    this.drawConnectionPoint(position, connectionAttachPositions.bottom);
    this.drawConnectionPoint(position, connectionAttachPositions.left);
  }

  drawConnectionPoint(position, attachPosition) {
    // get attach point
    const attachPoint = this.getAttachPointPosition(position, attachPosition);

    // draw attach point
    this.ctx.beginPath();
    this.ctx.fillStyle = colors.blue;
    this.ctx.arc(attachPoint.x, attachPoint.y, 5, 0, 2 * Math.PI);
    this.ctx.fill();
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

  getAttachPointPosition(position, attachPosition) {
    const size = this.viewModel.getSize(this.viewModel.getSelectedNode());
    const width = size.width;
    const height = size.height;
    switch (attachPosition) {
      case connectionAttachPositions.top:
        return {
          x: position.x,
          y: position.y - height / 2 - 10
        };
      case connectionAttachPositions.right:
        return {
          x: position.x + width / 2 + 10,
          y: position.y
        };
      case connectionAttachPositions.bottom:
        return {
          x: position.x,
          y: position.y + height / 2 + 10
        };
      case connectionAttachPositions.left:
        return {
          x: position.x - width / 2 - 10,
          y: position.y
        };
    }
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

class Controller {
  viewModel;
  view;
  
  constructor(viewModel, view) {
    this.viewModel = viewModel;
    this.view = view;
    this.view.draw();

    this.view.canvas.addEventListener("mousedown", this.onMouseDown);
    this.view.canvas.addEventListener("mousemove", this.onMouseMove);
    this.view.canvas.addEventListener("mouseup", this.onMouseUp);
  }

  onMouseDown = event => {
    const position = this.getMousePosition(event);
    var node = this.view.getNodeAtPosition(position);

    if (node === null) {
      node = this.viewModel.addNode(-1);
      this.viewModel.setNodePosition(node, position);
      this.viewModel.setNodeSize(node, { width: 50, height: 50 });
    }
    
    this.viewModel.setDraggedNode(node);
    this.viewModel.setSelectedNode(node);
    const nodePosition = this.viewModel.getPosition(node);
    this.viewModel.setInitialNodePosition(nodePosition);
    this.viewModel.setInitialMousePosition(position);

    this.updateCursor(position);
    this.view.draw();
  }

  onMouseMove = event => {
    const position = this.getMousePosition(event);
    
    if (this.viewModel.draggedNode !== null) {
      const node = this.viewModel.draggedNode;
      const nodePosition = this.viewModel.getInitialNodePosition();
      const mousePosition = this.viewModel.getInitialMousePosition();
      var newNodePosition = {
        x: nodePosition.x + position.x - mousePosition.x,
        y: nodePosition.y + position.y - mousePosition.y
      };
      // snap to grid
      newNodePosition.x = Math.round(newNodePosition.x / 20) * 20 + 10;
      newNodePosition.y = Math.round(newNodePosition.y / 20) * 20 + 10;
      this.viewModel.setNodePosition(node, newNodePosition);
      this.view.draw();
    }
    
    this.updateCursor(position);
  }

  onMouseUp = event => {
    // if we were dragging a node, stop dragging
    if (this.viewModel.draggedNode !== null) {
      this.viewModel.setDraggedNode(null);
      this.view.draw();
    }

    // get mouse position and update the cursor
    const position = this.getMousePosition(event);
    this.updateCursor(position);
  }

  getMousePosition(event) {
    const rect = this.view.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  updateCursor(position) {
    const node = this.view.getNodeAtPosition(position);
    if (node !== null) {
      if (this.viewModel.draggedNode !== null) {
        this.view.canvas.style.cursor = "grabbing";
      } else {
        this.view.canvas.style.cursor = "pointer";
      }
    } else {
      this.view.canvas.style.cursor = "default";
    }
  }
}

const viewModel = new ViewModel();
const view = new View(document.getElementById("draw"), viewModel);
const controller = new Controller(viewModel, view);
