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

// Proxy model for the view. It provides a simplified interface for the view to interact with the model.
// It also provides a way to listen to changes in the model. It also contains additional data required 
// to visualize the model like nodes positions, sizes, shapes and colors.
// The view model represents the state of the model and the view. It's easy to represent nodes on the 
// same layer (it's just an ordinary graph) but if we want to see different layers of abstraction we 
// need to provide a way for the user to travel between these layers. The main idea is to represent 
// all children of the same parent as one graph (one layer). If we want to go a layer above we can 
// scroll out (the previous graph is hidden and the new graph of the previous parent and its siblings
// is shown). If we want to go a layer below we can scroll in (the current graph is hidden and the new
// graph of the hovered node and its children is shown).
class ViewModel extends Model {
  // nodes properties
  positions = [];
  sizes = [];
  shapes = [];
  colors = [];

  // drag and drop
  draggedNode = null;
  initialNodePosition = null;
  initialMousePosition = null;

  // hover and selection
  hoveredNode = null;

  // grid
  gridSize = 20;

  constructor() {
    super();
    // add position, size, shape and color for the root node
    this.positions = [{ x: 0, y: 0 }];
    this.sizes = [{ width: 0, height: 0 }];
    this.shapes = [shapes.circle];
    this.colors = [colors.red];
  }

  // getters

  getNodePosition(index) {
    return this.positions[index];
  }

  getNodeSize(index) {
    return this.sizes[index];
  }

  getNodeShape(index) {
    return this.shapes[index];
  }

  getNodeColor(index) {
    return this.colors[index];
  }

  // setters

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

  addNode(parent) {
    const index = super.addNode(parent);
    this.positions[index] = { x: 0, y: 0 };
    this.sizes[index] = { width: 0, height: 0 };
    this.shapes[index] = shapes.circle;
    this.colors[index] = colors.red;
    return index;
  }

  removeNode(index) {
    this.removeConnections(index);
    super.removeNode(index);
    this.positions = this.positions.filter((_, i) => i !== index);
    this.sizes = this.sizes.filter((_, i) => i !== index);
    this.shapes = this.shapes.filter((_, i) => i !== index);
    this.colors = this.colors.filter((_, i) => i !== index);
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

  // hover and selection

  setHoveredNode(index) {
    this.hoveredNode = index;
  }

  getHoveredNode() {
    return this.hoveredNode;
  }
}