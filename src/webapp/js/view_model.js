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