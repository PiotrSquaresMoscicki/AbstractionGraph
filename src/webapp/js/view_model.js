const shapes = {
  oval: "oval",
  rectangle: "rectangle",
};

const colors = {
  red: "red",
  green: "green",
  blue: "blue",
  yellow: "yellow",
  black: "black",
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

  // Currently displayed layer. This is the index of the node which children we'll display
  displayedLayer = 0;

  // drag and drop
  draggedNode = null;
  initialNodePosition = null;
  initialMousePosition = null;

  // creating connection
  createdConnectionStartNode = null;
  createdConnectionEndPosition = null;

  // hover and selection
  hoveredNode = null;

  // grid
  gridSize = 20;

  // context menu
  contextMenuPosition = null;
  contextMenuSize = null;
  contextMenuItemSize = null;

  constructor() {
    super();
    // add position, size, shape and color for the root node
    this.positions = [{ x: 0, y: 0 }];
    this.sizes = [{ width: 0, height: 0 }];
    this.shapes = [shapes.circle];
    this.colors = [colors.red];
    // set menu sizes
    this.contextMenuSize = { width: 100, height: 100 };
    this.contextMenuItemSize = { width: 100, height: 20 };
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
    // select random shape and color
    this.shapes[index] = Object.values(shapes)[
      Math.floor(Math.random() * Object.values(shapes).length)
    ];
    this.colors[index] = Object.values(colors)[
      Math.floor(Math.random() * Object.values(colors).length)
    ];
    return index;
  }

  removeNode(index) {
    this.removeConnections(index);
    super.removeNode(index);
    // nullify the properties of the removed node
    this.positions[index] = null;
    this.sizes[index] = null;
    this.shapes[index] = null;
    this.colors[index] = null;
  }

  // displayed layer

  setDisplayedLayer(index) {
    this.displayedLayer = index;
  }

  getDisplayedLayer() {
    return this.displayedLayer;
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

  // creating connection

  setCreatedConnectionStartNode(index) {
    this.createdConnectionStartNode = index;
  }

  getCreatedConnectionStartNode() {
    return this.createdConnectionStartNode;
  }

  setCreatedConnectionEndPosition(position) {
    this.createdConnectionEndPosition = position;
  }

  getCreatedConnectionEndPosition() {
    return this.createdConnectionEndPosition;
  }

  // hover and selection

  setHoveredNode(index) {
    this.hoveredNode = index;
  }

  getHoveredNode() {
    return this.hoveredNode;
  }

  //context menu

  isContextMenuOpen() {
    return this.contextMenuPosition !== null;
  }

  setContextMenuPosition(position) {
    this.contextMenuPosition = position;
  }

  getContextMenuPosition() {
    return this.contextMenuPosition;
  }

  setContextMenuSize(size) {
    this.contextMenuSize = size;
  }

  getContextMenuSize() {
    return this.contextMenuSize;
  }

  setContextMenuItemSize(size) {
    this.contextMenuItemSize = size;
  }

  getContextMenuItemSize() {
    return this.contextMenuItemSize;
  }
}