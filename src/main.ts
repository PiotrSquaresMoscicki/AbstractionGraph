// Abstraction graph is an app that allows users to create graphs consisting of nodes and edges 
// with ability to manually cluster nodes into groups that represent abstractions. This way the 
// graph can become more readable and easier to understand.

// Example:
// We can tty and represent tht dependencies between parts of the car (engine, wheels, body) as a
// graph. The car itself is a node that contains a graph of its parts. The parts are nodes that
// contain a graph of their components. The components are nodes that contain a graph of their 
// smaller components and so on. The smallest components are nodes that do not contain any graphs.
// So the graph would look like this:
// Car
//   Engine
//     Pistons
//       Piston Rings
//         Piston Ring 1
//         Piston Ring 2
//       Piston Rod
//         Piston Rod 1
//         Piston Rod 2
//     Crankshaft
//       Crankshaft 1
//       Crankshaft 2
//   Wheels
//     Wheel 1
//     Wheel 2
//   Body
//     Door 1
//     Door 2
//     Roof
//       Roof Window
//       Roof Window Frame
//       Roof Window Frame Glass
//     Trunk
//       Trunk Door
//       Trunk Door Handle
//       Trunk Door Lock
//  Frame
//    Engine Mount
//    Wheel Mount
//    Body Mount
// Using a tree structure we can only represent "contains" relationships. Using a graph we can
// represent "contains" and "is connected to" relationships. This way we can represent dependencies
// between parts of the car. For example the engine is connected to the frame using engine mounts.
// The wheels are connected to the frame using wheel mounts. The body is connected to the frame
// using body mounts. The engine is connected to the wheels using the crankshaft.

// Definitions:
// Graph - a set of nodes and connections between them
// Connection - connection between two nodes
// Node - vertex of the graph that can be connected to other vertices but also can contain an inner
//    graph
// Inner Graph - a graph that is contained within a node. Node containing a graph represents an 
//    abstraction of the inner graph. Nodes from the inner graph can be connected to nodes outside
//    of the inner graph creating outer connections (connections to siblings of the node containing
//    the inner graph)
// Abstraction - a node that contains an inner graph that is not empty

// The app uses model, view, view model (MVVM) architecture.
// Controllers are extensions to the View representing states of the view.

export {}

//**************************************************************************************************
// model
//**************************************************************************************************
class Rectangle {
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y; 
    this.width = width;
    this.height = height;
  }

  x: number;
  y: number;
  width: number;
  height: number;
}

class Connection { 
  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
  }

  from: number;
  to: number;
}

interface IModelObserver {
  onModelChanged(): void

  onNodeCreated(_index: number): void
  onNodeDestroyed(_index: number): void
  onNodeNameChanged(_index: number): void
  onNodeRectangleChanged(_index: number): void
  onNodeChildAdded(_parent: number, _child: number): void
  onNodeChildRemoved(_parent: number, _child: number): void
  onConnectionAdded(_from: number, _to: number): void
  onConnectionRemoved(_from: number, _to: number): void
}

class Model {
  // Accessors
  getRoot(): number {
    return 0;
  }

  getName(index: number): string {
    return this.names.get(index) || '';
  }

  getRectangle(index: number, outer: number): Rectangle {
    // get rectangle from the outer
    const rectangles = this.rectangles.get(outer);
    if (rectangles === undefined) {
      throw new Error('Rectangles are undefined. index: ' + index + ', outer: ' + outer 
        + 'indexName: ' + this.getName(index) + ', outerName: ' + this.getName(outer));
    }
    const rectangle = rectangles.get(index);
    if (rectangle === undefined) {
      throw new Error('Rectangle is undefined. index: ' + index + ', outer: ' + outer
        + 'indexName: ' + this.getName(index) + ', outerName: ' + this.getName(outer));
    }
    return rectangle;
  }

  getChildren(index: number): number[] {
    // return copy of children array
    return this.children.get(index)?.slice() || [];
  }

  getOutgoingConnections(index: number): Connection[] {
    return this.connections.filter(connection => connection.from === index);
  }

  getIncomingConnections(index: number): Connection[] {
    return this.connections.filter(connection => connection.to === index);
  }

  // Utility functions

  getParent(index: number): number | null {
    // get parent of the node
    for (const [key, value] of this.children.entries()) {
      if (value.includes(index)) {
        return key;
      }
    }
    return null;
  }

  getConnections(index: number): Connection[] {
    return this.connections.filter(connection => connection.from === index || connection.to === index);
  }

  // Mutators
  registerObserver(observer: IModelObserver): void {
    this.observers.push(observer);
  }

  unregisterObserver(observer: IModelObserver): void {
    this.observers = this.observers.filter(item => item !== observer);
  }

  createNode(index: number = -1): number {
    if (this.nodes.indexOf(index) !== -1 || index >= this.indexGenerator) {
      throw new Error('Index is already used or is greater than the index generator');
    }
    if (index === -1) {
      index = this.indexGenerator++;
    }
    this.nodes.push(index);
    this.observers.forEach(observer => observer.onNodeCreated(index));
    this.observers.forEach(observer => observer.onModelChanged());
    return index;
  }

  destroyNode(index: number): void {
    this.nodes = this.nodes.filter(node => node !== index);
    this.names.delete(index);
    this.rectangles.delete(index);
    // delete all occurances of this index rectangles on other outers
    this.rectangles.forEach(rectangles => rectangles.delete(index));
    this.children.delete(index);
    this.children.forEach(children => {
      const childIndex = children.indexOf(index);
      if (childIndex !== -1) {
        children.splice(childIndex, 1);
      }
    });
    this.connections = this.connections.filter(connection => connection.from !== index && connection.to !== index);
    this.observers.forEach(observer => observer.onNodeDestroyed(index));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setName(index: number, name: string): void {
    this.names.set(index, name);
    this.observers.forEach(observer => observer.onNodeNameChanged(index));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setRectangle(index: number, rectangle: Rectangle, outer: number): void {
    // get or create rectangle map for the outer
    var rectangles = this.rectangles.get(outer);
    if (rectangles === undefined) {
      rectangles = new Map<number, Rectangle>();
      this.rectangles.set(outer, rectangles);
    }
    // set rectangle
    rectangles.set(index, rectangle);
    this.observers.forEach(observer => observer.onNodeRectangleChanged(index));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  addChild(parent: number, child: number): void {
    const children = this.children.get(parent) || [];
    // make sure we don't add the same child for the same parent twice
    if (children.includes(child)) {
      return;
    }
    children.push(child);
    this.children.set(parent, children);
    this.observers.forEach(observer => observer.onNodeChildAdded(parent, child));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  removeChild(parent: number, child: number): void {
    const children = this.children.get(parent) || [];
    const index = children.indexOf(child);
    if (index !== -1) {
      children.splice(index, 1);
    }
    this.children.set(parent, children);
    this.observers.forEach(observer => observer.onNodeChildRemoved(parent, child));
  }

  addConnection(from: number, to: number): void {
    // prevent duplicate connections
    if (this.connections.some(connection => connection.from === from && connection.to === to)) {
      return;
    }

    // if connection is made between two nodes that are in the same inner graph (have the same 
    // parent (outer)) then add new rectangles to inner graphs of both these nodes
    const fromParent = this.getParent(from);
    const toParent = this.getParent(to);
    if (fromParent !== null && fromParent === toParent) {
      this.generateRectanglesForOuterConnections(from, to);
    }

    this.connections.push(new Connection(from, to));
    this.observers.forEach(observer => observer.onConnectionAdded(from, to));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  removeConnection(from: number, to: number): void {
    this.connections = this.connections.filter(connection => connection.from !== from || connection.to !== to);
    this.observers.forEach(observer => observer.onConnectionRemoved(from, to));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  // Private functions

  private generateRectanglesForOuterConnections(from: number, to: number): void {
    this.generateRectangleForOuterConnection(from, to);
    this.generateRectangleForOuterConnection(to, from);
  }

  private generateRectangleForOuterConnection(outerConnectionNode: number, outer: number): void {
    const outerOuter = this.getParent(outer) as number;
    // check the relative position of the outer connection node to the outer (left, right, top, bottom)
    const outerConnectionNodeRectangle = this.getRectangle(outerConnectionNode, outerOuter);
    const outerRectangle = this.getRectangle(outer, outerOuter);
    const outerConnectionNodeCenter = { x: outerConnectionNodeRectangle.x + outerConnectionNodeRectangle.width / 2, 
      y: outerConnectionNodeRectangle.y + outerConnectionNodeRectangle.height / 2 };
    const outerRectangleCenter = { x: outerRectangle.x + outerRectangle.width / 2,
      y: outerRectangle.y + outerRectangle.height / 2 };
    const deltaX = outerConnectionNodeCenter.x - outerRectangleCenter.x;
    const deltaY = outerConnectionNodeCenter.y - outerRectangleCenter.y;
    const outerConnectionNodeIsLeft = deltaX <= 0 && Math.abs(deltaX) >= Math.abs(deltaY);
    const outerConnectionNodeIsRight = deltaX >= 0 && Math.abs(deltaX) >= Math.abs(deltaY);
    const outerConnectionNodeIsTop = deltaY <= 0 && Math.abs(deltaY) >= Math.abs(deltaX);
    const outerConnectionNodeIsBottom = deltaY >= 0 && Math.abs(deltaY) >= Math.abs(deltaX);
    // calculate bounding box of all inner nodes in the outer
    const children = this.getChildren(outer);
    const rectangles = children.map(child => this.getRectangle(child, outer));
    const minX = Math.min(...rectangles.map(rectangle => rectangle.x));
    const minY = Math.min(...rectangles.map(rectangle => rectangle.y));
    const maxX = Math.max(...rectangles.map(rectangle => rectangle.x + rectangle.width));
    const maxY = Math.max(...rectangles.map(rectangle => rectangle.y + rectangle.height));
    // create a rectangle with height 50 and width 100 that is positioned in the same relation to 
    // the inner bounding box as the outer connection node is to the outer
    const width = 100;
    const height = 50;
    var x: number;
    var y: number;
    if (outerConnectionNodeIsLeft) {
      x = minX - width - 50;
      y = minY + (maxY - minY) / 2 - height / 2;
    } else if (outerConnectionNodeIsRight) {
      x = maxX + 50;
      y = minY + (maxY - minY) / 2 - height / 2;
    } else if (outerConnectionNodeIsTop) {
      x = minX + (maxX - minX) / 2 - width / 2;
      y = minY - height - 50;
    } else if (outerConnectionNodeIsBottom) {
      x = minX + (maxX - minX) / 2 - width / 2;
      y = maxY + 50;
    } else {
      throw new Error('Outer connection node is not left, right, top or bottom');
    }

    // set rectangle
    const rectangle = new Rectangle(x, y, width, height);
    this.setRectangle(outerConnectionNode, rectangle, outer);    
  }
    

  // Private members
  private observers: IModelObserver[] = [];
  private indexGenerator: number = 1;
  private nodes: number[] = [];
  private names: Map<number, string> = new Map<number, string>();
  // since we can view the same node from different abstraction levels we need to be able to store
  // multiple rectangles for the same node depending on the abstraction level
  private rectangles: Map<number, Map<number, Rectangle>> = new Map<number, Map<number, Rectangle>>();
  private children: Map<number, number[]> = new Map<number, number[]>();
  private connections: Connection[] = [];
}

//**************************************************************************************************
// view model
//**************************************************************************************************
interface IViewModelObserver extends IModelObserver {
  onDisplayedParentChanged(): void
  onViewportSizeChanged(): void
  onHoveredNodeChanged(): void
  onHoveredConnectionChanged(): void
  onSelectedNodesChanged(): void
  onSelectedConnectionsChanged(): void
  onRenamedNodeChanged(): void
  onGridSizeChanged(): void
  onViewportPositionChanged(): void
  onZoomChanged(): void
}

class ViewStyle {
  constructor() {
    // dark theme using vs code dark theme colors
    this.backgroundColor = '#1e1e1e';
    this.smallStepGridColor = '#26262d';
    this.bigStepGridColor = '#26262d';
    this.nodeColor = '#252526';
    this.outerNodeColor = '#473954';
    this.nodeBorderColor = '#4e4e52';
    this.nodeHoveredBorderColor = '#007acc';
    this.nodeSelectedBorderColor = '#007acc';
    this.nodeTextColor = '#c0c0c0';
    this.connectionColor = '#c0c0c0';
    this.connectionHoveredColor = '#007acc';
    this.connectionSelectedColor = '#007acc';
    this.connectionArrowLength = 12;
    this.textSize = 15;
    this.textFont = 'Consolas';
  }

  backgroundColor: string;
  smallStepGridColor: string;
  bigStepGridColor: string;
  nodeColor: string;
  outerNodeColor: string;
  nodeBorderColor: string;
  nodeHoveredBorderColor: string;
  nodeSelectedBorderColor: string;
  nodeTextColor: string;
  connectionColor: string;
  connectionHoveredColor: string;
  connectionSelectedColor: string;
  connectionArrowLength: number;
  textSize: number;
  textFont: string;
}

class ViewModel implements IModelObserver {
  constructor(model: Model) {
    this.model = model;
  }

  // Accessors
  getModel(): Model {
    return this.model;
  }

  getViewStyle(): ViewStyle { return this.viewStyle; }

  getViewportSize(): { width: number, height: number } {
    return this.viewportSize;
  }

  getRectangleInViewport(index: number, outer: number = this.displayedParent): Rectangle {
    // calculate rectangle position and size based on viewport position and zoom
    const rectangle = this.model.getRectangle(index, outer);
    const viewportPosition = this.getViewPortPosition(outer);
    const zoom = this.getZoom(outer);
    return new Rectangle(rectangle.x * zoom - viewportPosition.x, rectangle.y * zoom - viewportPosition.y, 
      rectangle.width * zoom, rectangle.height * zoom);
  }

  getDisplayedParent(): number {
    return this.displayedParent;
  }

  getHoveredNode(): number {
    return this.hoveredNode;
  }

  getHoveredConnection(): Connection | null {
    return this.hoveredConnection;
  }

  getSelectedNodes(): number[] {
    return this.selectedNodes;
  }

  getSelectedConnections(): Connection[] {
    return this.selectedConnections;
  }

  getRenamedNode(): number {
    return this.renamedNode;
  }

  getGridSize(outer: number = this.displayedParent): number {
    return this.gridSize * (this.zooms.get(outer) || 1);
  }

  getViewPortPosition(outer: number = this.displayedParent): { x: number, y: number } {
    // if viewport position is not set create a bounding box around all nodes in the displayed parent
    // then center the viewport on the bounding box
    if (!this.viewportPositions.has(outer)) {
      const displayedParent = this.getDisplayedParent();
      const children = this.getModel().getChildren(displayedParent);
      
      // return 0,0 if there are no children
      if (children.length === 0) {
        return { x: 0, y: 0 };
      }

      const rectangles = children.map(child => this.model.getRectangle(child, outer));
      const minX = Math.min(...rectangles.map(rectangle => rectangle.x));
      const minY = Math.min(...rectangles.map(rectangle => rectangle.y));
      const maxX = Math.max(...rectangles.map(rectangle => rectangle.x + rectangle.width));
      const maxY = Math.max(...rectangles.map(rectangle => rectangle.y + rectangle.height));
      const boundingBoxWidth = (maxX - minX) * this.getZoom();
      const boundingBoxHeight = (maxY - minY) * this.getZoom();
      const boundingBoxCenter = { x: minX + boundingBoxWidth / 2, y: minY + boundingBoxHeight / 2 };
      const viewportWidth = this.getViewportSize().width;
      const viewportHeight = this.getViewportSize().height;
      const viewportCenter = { x: viewportWidth / 2, y: viewportHeight / 2 };
      const viewportPosition = { x: boundingBoxCenter.x - viewportCenter.x, y: boundingBoxCenter.y - viewportCenter.y };
      return viewportPosition;
    } else {
      const viewportPosition = this.viewportPositions.get(outer);
      if (viewportPosition === undefined) {
        throw new Error('Viewport position is undefined');
      }
      return viewportPosition;
    }
  }

  getZoom(outer: number = this.displayedParent): number {
    return this.zooms.get(outer) || 1;
  }

  getMousePositionInModel(event: MouseEvent, outer: number = this.displayedParent): { x: number, y: number } {
    const viewportPosition = this.getViewPortPosition(outer);
    const zoom = this.getZoom(outer);
    return { x: (event.clientX + viewportPosition.x) / zoom, y: (event.clientY + viewportPosition.y) / zoom };
  }

  // Utility functions

  getVisibleNodes(): number[] {
    // returns children and all outer connection nodes (nodes that have the same parent as 'outer'
    // and have connections to or from 'outer')
    const displayedParent = this.getDisplayedParent();
    const children = this.getModel().getChildren(displayedParent);
    const visibleNodes = children.slice();
    const connections = this.getModel().getConnections(displayedParent);
    connections.forEach(connection => {
      if (connection.from === displayedParent) {
        visibleNodes.push(connection.to);
      } else {
        visibleNodes.push(connection.from);
      }
    });
    return visibleNodes;
  }

  getVisibleConnections(): Connection[] {
    // returns connections that are between visible nodes
    const visibleNodes = this.getVisibleNodes();
    // for each visible node get its outgoing connections
    const visibleConnections = visibleNodes.map(node => this.getModel().getOutgoingConnections(node));
    // remove connections to or from displayedParent
    return visibleConnections.flat().filter(connection => visibleNodes.includes(connection.from) && visibleNodes.includes(connection.to));
  }

  getRectangle(index: number): Rectangle {
    return this.model.getRectangle(index, this.displayedParent);
  }

  setRectangle(index: number, rectangle: Rectangle): void {
    this.model.setRectangle(index, rectangle, this.displayedParent);
  }

  // Mutators
  registerObserver(observer: IViewModelObserver): void {
    this.observers.push(observer);
    this.model.registerObserver(observer);
  }

  unregisterObserver(observer: IViewModelObserver): void {
    this.observers = this.observers.filter(item => item !== observer);
    this.model.unregisterObserver(observer);
  }

  setViewportSize(size: { width: number, height: number }): void {
    this.viewportSize = size;
    this.observers.forEach(observer => observer.onViewportSizeChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setRectangleInViewport(index: number, rectangle: Rectangle, outer: number = this.displayedParent): void {
    // calculate rectangle position and size based on viewport position and zoom
    const viewportPosition = this.getViewPortPosition(outer);
    const zoom = this.getZoom(outer);
    var modelRectangle = new Rectangle((rectangle.x + viewportPosition.x) / zoom, (rectangle.y + viewportPosition.y) / zoom, 
      rectangle.width / zoom, rectangle.height / zoom);
    // snap to grid
    const gridSize = this.gridSize;
    modelRectangle.x = Math.round(modelRectangle.x / gridSize) * gridSize;
    modelRectangle.y = Math.round(modelRectangle.y / gridSize) * gridSize;
    this.model.setRectangle(index, modelRectangle, outer);
  }

  setDisplayedParent(index: number): void {
    this.displayedParent = index;
    // remove cached viewport position and zoom
    this.viewportPositions.delete(index);
    this.zooms.delete(index);

    this.observers.forEach(observer => observer.onDisplayedParentChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setHoveredNode(index: number): void {
    if (this.hoveredNode !== index) {
      this.hoveredNode = index;
      this.observers.forEach(observer => observer.onHoveredNodeChanged());
      this.observers.forEach(observer => observer.onModelChanged());
    }
  }

  setHoveredConnection(connection: Connection | null): void {
    if (this.hoveredConnection !== connection) {
      this.hoveredConnection = connection;
      this.observers.forEach(observer => observer.onHoveredConnectionChanged());
      this.observers.forEach(observer => observer.onModelChanged());
    }
  }

  setSelectedNodes(indexes: number[]): void {
    this.selectedNodes = indexes;
    this.observers.forEach(observer => observer.onSelectedNodesChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setSelectedConnections(connections: Connection[]): void {
    this.selectedConnections = connections;
    this.observers.forEach(observer => observer.onSelectedConnectionsChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setRenamedNode(index: number): void {
    this.renamedNode = index;
    this.observers.forEach(observer => observer.onRenamedNodeChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setGridSize(size: number): void {
    this.gridSize = size;
    this.observers.forEach(observer => observer.onGridSizeChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setViewportPosition(position: { x: number, y: number }, outer: number = this.displayedParent): void {
    this.viewportPositions.set(outer, position);
    this.observers.forEach(observer => observer.onViewportPositionChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setZoom(zoom: number, outer: number = this.displayedParent): void {
    this.zooms.set(outer, zoom);
    this.observers.forEach(observer => observer.onZoomChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  // Start IModelObserver

  onModelChanged(): void {}
  onNodeCreated(_index: number): void {}

  onNodeDestroyed(_index: number): void {
    // if destroyed node is displayed parent then set displayed parent to root
    if (this.displayedParent === _index) {
      this.setDisplayedParent(this.model.getRoot());
    }
    // if destroyed node is selected then deselect it
    if (this.selectedNodes.includes(_index)) {
      this.setSelectedNodes(this.selectedNodes.filter(node => node !== _index));
    }
    // if destroyed node is hovered then deselect it
    if (this.hoveredNode === _index) {
      this.setHoveredNode(-1);
    }
    // if destroyed node is renamed then deselect it
    if (this.renamedNode === _index) {
      this.setRenamedNode(-1);
    }
  }
  
  onNodeNameChanged(_index: number): void {}
  onNodeRectangleChanged(_index: number): void {}
  onNodeChildAdded(_parent: number, _child: number): void {}
  onNodeChildRemoved(_parent: number, _child: number): void {}
  onConnectionAdded(_from: number, _to: number): void {}
  onConnectionRemoved(_from: number, _to: number): void {
    // if removed connection is selected then deselect it
    const index = this.selectedConnections.findIndex(connection => connection.from === _from && connection.to === _to);
    if (index !== -1) {
      this.selectedConnections.splice(index, 1);
      this.observers.forEach(observer => observer.onSelectedConnectionsChanged());
    }
    // if removed connection is hovered then deselect it
    if (this.hoveredConnection?.from === _from && this.hoveredConnection?.to === _to) {
      this.setHoveredConnection(null);
    }
  }

  // End IModelObserver

  // Private members
  private model: Model;
  private viewStyle: ViewStyle = new ViewStyle();
  private observers: IViewModelObserver[] = [];
  private viewportSize: { width: number, height: number } = { width: 0, height: 0 };
  private displayedParent: number = 0;

  private hoveredNode: number = -1;
  private hoveredConnection: Connection | null = null;
  private selectedNodes: number[] = [];
  private selectedConnections: Connection[] = [];

  private renamedNode: number = -1;
  private gridSize: number = 10;

  private viewportPositions = new Map<number, { x: number, y: number }>();
  private zooms = new Map<number, number>();
}

//**************************************************************************************************
// view interfaces
//**************************************************************************************************
interface IViewContext {
  getContext(): CanvasRenderingContext2D;
  drawConnectionLine(from: { x: number, y: number }, to: { x: number, y: number }, connectionColor: string, connectionWidth: number): void;
  getConnectionPoint(fromRectangle: Rectangle, toRectangle: Rectangle): { x: number, y: number };
}

interface IViewControllerObserver {
  onControllerActivated(controller: IViewController): void;
  onRedrawRequested(): void;
}

interface IViewController {
  registerObserver(observer: IViewControllerObserver): void;
  unregisterObserver(observer: IViewControllerObserver): void;
  isActive(): boolean;
  onDraw(viewContext: IViewContext): void;
  onOtherControllerActivated(): void;
  onModelChanged(): void;
  onMouseDown(_event: MouseEvent): void;
  onMouseMove(_event: MouseEvent): void;
  onMouseUp(_event: MouseEvent): void;
  onWheel(_event: WheelEvent): void;
  onDblPress(_event: MouseEvent): void;
  onDblClick(_event: MouseEvent): void;
  onKeydown(_event: KeyboardEvent): void;
  onKeyup(_event: KeyboardEvent): void;
}

//**************************************************************************************************
// controllers
//**************************************************************************************************
class BaseController implements IViewController {
  // Start IViewController

  registerObserver(observer: IViewControllerObserver): void {
    this.observers.push(observer);
  }

  unregisterObserver(observer: IViewControllerObserver): void {
    this.observers = this.observers.filter(item => item !== observer);
  }

  isActive(): boolean { return this.active; }
  onDraw(_viewContext: IViewContext): void {}
  onOtherControllerActivated(): void {}
  onModelChanged(): void {}
  onMouseDown(_event: MouseEvent): void {}
  onMouseMove(_event: MouseEvent): void {}
  onMouseUp(_event: MouseEvent): void {}
  onWheel(_event: WheelEvent): void {}
  onDblPress(_event: MouseEvent): void {}
  onDblClick(_event: MouseEvent): void {}
  onKeydown(_event: KeyboardEvent): void {}
  onKeyup(_event: KeyboardEvent): void {}

  // End IViewController

  // Protected members
  protected active: boolean = false;
  protected observers: IViewControllerObserver[] = [];
}

class NodeHoverController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onModelChanged(): void {
    // get cursor position
    const cursorPosition = { x: this.lastEvent.clientX, y: this.lastEvent.clientY };
    // if mouse is moving then update hovered node
    this.updateHoveredNode(cursorPosition);
  }

  onMouseMove(event: MouseEvent): void {
    // save event
    this.lastEvent = event;
    // if mouse is moving then update hovered node
    this.updateHoveredNode({ x: event.clientX, y: event.clientY });
  }

  private updateHoveredNode(cursorPosition: { x: number, y: number }): void {
    // if mouse is hovered over a node then set it as hovered node
    const visibleNodes = this.viewModel.getVisibleNodes();
    const rectangles = visibleNodes.map(child => this.viewModel.getRectangleInViewport(child));
    const index = rectangles.findIndex(rectangle => cursorPosition.x >= rectangle.x 
        && cursorPosition.x <= rectangle.x + rectangle.width 
        && cursorPosition.y >= rectangle.y 
        && cursorPosition.y <= rectangle.y + rectangle.height);
    if (index !== -1) {
      this.viewModel.setHoveredNode(visibleNodes[index]);
    } else {
      this.viewModel.setHoveredNode(-1);
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private lastEvent: MouseEvent = new MouseEvent('mousemove');
}

class NodeMoveController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    this.startingCursorPosition = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event: MouseEvent): void {
    // if controller is not active, mouse is moving, LMB is pressed and any node is selected then set controller active
    // give user 5 px of tolerance
    if (!this.active && event.buttons === 1 && this.viewModel.getSelectedNodes().length > 0
      && (Math.abs(event.clientX - this.startingCursorPosition.x) > 5
      || Math.abs(event.clientY - this.startingCursorPosition.y) > 5)) 
    {
      this.active = true;
      this.startingCursorPosition = { x: event.clientX, y: event.clientY };
      this.startingRectangles = this.viewModel.getSelectedNodes().map(node => this.viewModel.getRectangleInViewport(node));
      this.draggedNodes = this.viewModel.getSelectedNodes().slice();
    } else if (this.active) {
      // move node
      const deltaX = event.clientX - this.startingCursorPosition.x;
      const deltaY = event.clientY - this.startingCursorPosition.y;
      this.draggedNodes.forEach((node, index) => {
        const rectangle = this.startingRectangles[index];
        const newRectangle = new Rectangle(rectangle.x + deltaX, rectangle.y + deltaY, rectangle.width, rectangle.height);
        this.viewModel.setRectangleInViewport(node, newRectangle);
      });
    }
  }

  onMouseUp(_event: MouseEvent): void {
    this.active = false;
    this.startingCursorPosition = { x: 0, y: 0 };
    this.startingRectangles = [];
    this.draggedNodes = [];
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private draggedNodes: number[] = [];
  private startingCursorPosition: { x: number, y: number } = { x: 0, y: 0 };
  private startingRectangles: Rectangle[] = [];
}

class ViewportMoveController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    // if controller is not active, mouse is moving and RMB is pressed then set controller active
    if (!this.active && event.buttons === 2) {
      this.active = true;
      this.startingCursorPosition = { x: event.clientX, y: event.clientY };
      this.startingViewportPosition = this.viewModel.getViewPortPosition();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.active) {
      // move viewport
      const deltaX = event.clientX - this.startingCursorPosition.x;
      const deltaY = event.clientY - this.startingCursorPosition.y;
      const position = { x: this.startingViewportPosition.x - deltaX, y: this.startingViewportPosition.y - deltaY };
      this.viewModel.setViewportPosition(position);
    }
  }

  onMouseUp(_event: MouseEvent): void {
    this.active = false;
    this.startingCursorPosition = { x: 0, y: 0 };
    this.startingViewportPosition = { x: 0, y: 0 };
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private startingCursorPosition: { x: number, y: number } = { x: 0, y: 0 };
  private startingViewportPosition: { x: number, y: number } = { x: 0, y: 0 };
}

class ViewportZoomController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onWheel(event: WheelEvent): void {
    // get zoom
    var zoom = this.viewModel.getZoom();
    const viewportSize = this.viewModel.getViewportSize();
    const viewportCenter = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
    // calculate new zoom
    zoom -= event.deltaY / 500;
    if (zoom < this.minZoom) {
      // if zoom is smaller than min zoom then change the abstraction level to the parent of the displayed parent
      const displayedParent = this.viewModel.getDisplayedParent();
      const parent = this.viewModel.getModel().getParent(displayedParent);
      if (parent !== null) {
        this.viewModel.setDisplayedParent(parent);
        // perform zoom around the center of the viewport
        // const viewportSize = this.viewModel.getViewportSize();
        // const center = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
        // this.performZoom(this.maxZoom, center);
      } else {
        this.performZoom(this.minZoom, viewportCenter);
      }
    } else if (zoom > this.maxZoom) {
      // if zoom is bigger than max zoom then change the abstraction level to the hovered node if any
      const hoveredNode = this.viewModel.getHoveredNode();
      if (hoveredNode !== -1) {
        this.viewModel.setDisplayedParent(hoveredNode);
        // perform zoom around the center of the viewport
        // const viewportSize = this.viewModel.getViewportSize();
        // const center = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
        // this.performZoom(this.minZoom, center);
      } else {
        this.performZoom(this.maxZoom, viewportCenter);
      }
    } else {
      // zoom around the mouse cursor
      const mousePosition = { x: event.clientX, y: event.clientY };
      this.performZoom(zoom, mousePosition);
    }
  }
  
  // End IViewController

  // Private functions

  performZoom(zoom: number, center: { x: number, y: number }): void {
    // zoom around the center
    const viewportPosition = this.viewModel.getViewPortPosition();
    const oldZoom = this.viewModel.getZoom();
    const centerInModel = { x: (center.x + viewportPosition.x) / oldZoom, y: (center.y + viewportPosition.y) / oldZoom };
    const centerInModelAfterZoom = { x: (center.x + viewportPosition.x) / zoom, y: (center.y + viewportPosition.y) / zoom };
    const delta = { x: centerInModel.x - centerInModelAfterZoom.x, y: centerInModel.y - centerInModelAfterZoom.y };
    const viewportPositionAfterZoom = { x: viewportPosition.x + delta.x * zoom, y: viewportPosition.y + delta.y * zoom };
    this.viewModel.setViewportPosition(viewportPositionAfterZoom);
    // set zoom
    this.viewModel.setZoom(zoom);
  }

  // Private members
  private viewModel: ViewModel;
  private maxZoom: number = 2;
  private minZoom: number = 0.3;
}

class NodeCreationAndRenameController extends BaseController {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    super();
    this.viewModel = viewModel;
    this.canvas = canvas;
  }

  // Start IViewController

  onOtherControllerActivated(): void {
    // if controller is editing then cancel rename
    if (this.editing) {
      this.finishRename();
    }
    this.readyForActivation = false;
  }

  onMouseUp(event: MouseEvent): void {
    // if controller is editing and mouse up is performed outside of the renamed node then finish rename
    if (this.editing) {
      const rectangle = this.viewModel.getRectangleInViewport(this.renamedNode);
      if (event.clientX < rectangle.x || event.clientX > rectangle.x + rectangle.width 
          || event.clientY < rectangle.y || event.clientY > rectangle.y + rectangle.height) {
        // if new name is empty then cancel rename
        if (this.input?.value === '') {
          this.cancelRename();
        } else {
          this.finishRename();
        }
      }
    } else if (this.readyForActivation) {
      // if double click is performed on a node then set controller editing
      const displayedParent = this.viewModel.getDisplayedParent();
      const children = this.viewModel.getModel().getChildren(displayedParent);
      const rectangles = children.map(child => this.viewModel.getRectangleInViewport(child));
      const index = rectangles.findIndex(rectangle => event.clientX >= rectangle.x 
          && event.clientX <= rectangle.x + rectangle.width 
          && event.clientY >= rectangle.y 
          && event.clientY <= rectangle.y + rectangle.height);
      if (index === -1) {
        // create new node with size 100x50 and its center at the mouse position and start rename
        const mousePosition = this.viewModel.getMousePositionInModel(event);
        var rectangle = new Rectangle(mousePosition.x - 50, mousePosition.y - 25, 100, 50);
        // snap to grid
        const gridSize = this.viewModel.getGridSize() / this.viewModel.getZoom();
        rectangle.x = Math.round(rectangle.x / gridSize) * gridSize;
        rectangle.y = Math.round(rectangle.y / gridSize) * gridSize;
        const node = this.viewModel.getModel().createNode();
        this.viewModel.setRectangle(node, rectangle);
        const displayedParent = this.viewModel.getDisplayedParent();
        this.viewModel.getModel().addChild(displayedParent, node);
        this.newNode = true;
        this.startRename(node);
      }
      else {
        this.startRename(children[index]);
      }
    }
  }

  onDblPress(_event: MouseEvent): void {
    this.readyForActivation = true;
  }

  onKeyup(event: KeyboardEvent): void {
    // if enter is pressed then finish rename
    if (this.editing && event.key === 'Enter') {
      // if new name is empty then cancel rename
      if (this.input?.value === '') {
        this.cancelRename();
      } else {
        this.finishRename();
      }
    }
    // if escape is pressed then cancel rename
    if (this.editing && event.key === 'Escape') {
      this.cancelRename();
    }
  }

  private startRename(node: number): void {
    this.editing = true;
    this.renamedNode = node;
    this.viewModel.setRenamedNode(this.renamedNode);
    const rectangle = this.viewModel.getRectangleInViewport(this.renamedNode);
    // spawn input element
    this.input = document.createElement('input');
    this.input.id = 'rename-input';
    this.input.setAttribute('autocomplete', 'off');
    this.input.type = 'text';
    this.input.style.position = 'absolute';
    this.input.style.left = `${rectangle.x}px`;
    this.input.style.top = `${rectangle.y}px`;
    this.input.style.width = `${rectangle.width}px`;
    this.input.style.height = `${rectangle.height}px`;
    this.input.style.backgroundColor = 'transparent';
    this.input.style.border = 'none';
    this.input.style.outline = 'none';
    this.input.style.color = this.viewModel.getViewStyle().nodeTextColor;
    const textSize = this.viewModel.getViewStyle().textSize * this.viewModel.getZoom();
    this.input.style.fontSize = `${textSize}px`;
    this.input.style.fontFamily = this.viewModel.getViewStyle().textFont;
    this.input.style.textAlign = 'center';
    this.input.style.padding = '0';
    this.input.style.margin = '0';

    this.input.value = this.viewModel.getModel().getName(this.renamedNode);
    document.body.appendChild(this.input);
    this.input.focus();
    this.input.select();
    // select all text
    this.input.setSelectionRange(0, this.input.value.length);

    // add event listeners
    this.input.addEventListener('keydown', (event) => this.onKeydown(event));
    this.input.addEventListener('keyup', (event) => this.onKeyup(event));

    // forward mouse move event to the canvas if there are no buttons pressed
    this.input.addEventListener('mousemove', (event) => {
      if (event.buttons === 0) {
        this.canvas.dispatchEvent(new MouseEvent('mousemove', event));
      }
    });
  }

  private finishRename(): void {
    // set new name in the model and then cancel rename
    this.viewModel.getModel().setName(this.renamedNode, this.input?.value || '');
    // set newNode to false so cancelRename doesn't destroy the node
    this.newNode = false;
    // redraw
    this.observers.forEach(observer => observer.onRedrawRequested());
    this.cancelRename();
  }

  private cancelRename(): void {
    // if new ndoe is set then destroy it
    if (this.newNode) {
      this.viewModel.getModel().destroyNode(this.renamedNode);
    }
    this.editing = false;
    this.readyForActivation = false;
    this.renamedNode = -1;
    this.newNode = false;
    this.viewModel.setRenamedNode(-1);
    // remove input element
    if (this.input !== null) {
      document.body.removeChild(this.input);
      this.input = null;
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private editing: boolean = false;
  private readyForActivation: boolean = false;
  private canvas: HTMLCanvasElement;
  private newNode: boolean = false;
  private renamedNode: number = -1;
  private input: HTMLInputElement | null = null;
}

// set node as selected if mouse is pressed on it
// add node as selected if mouse is pressed on it and ctrl is pressed
// remove node from selected if already selected and mouse is pressed on it and ctrl is pressed
// set no node as selected if mouse is pressed on empty space
class SelectionHandler extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    this.lastMouseDownPosition = { x: event.clientX, y: event.clientY };
    // if mouse is pressed on a node then select it
    const hoveredNode = this.viewModel.getHoveredNode();
    if (hoveredNode !== -1) {
      // if ctrl is pressed then add node to selection
      if (event.ctrlKey) {
        const selectedNodes = this.viewModel.getSelectedNodes();
        const nodeIndex = selectedNodes.indexOf(hoveredNode);
        if (nodeIndex === -1) {
          selectedNodes.push(hoveredNode);
          this.viewModel.setSelectedNodes(selectedNodes);
        } else {
          // if node is already selected then remove it from selection
          selectedNodes.splice(nodeIndex, 1);
          this.viewModel.setSelectedNodes(selectedNodes);
        }
      // if ctrl is not pressed and node is not among seleted then set is as selected
      } else if (!this.viewModel.getSelectedNodes().includes(hoveredNode)) {
        this.viewModel.setSelectedNodes([hoveredNode]);
      }
    } 
    // otherwise deselect unless mouse is pressed, connection is hovered and ctrl is pressed
    else if (this.viewModel.getHoveredConnection() === null || !event.ctrlKey) {
      this.viewModel.setSelectedNodes([]);
    }
  }

  onMouseUp(_event: MouseEvent): void {
    // if mouse is pressed and released without moving then select the node under the cursor
    const deltaX = _event.clientX - this.lastMouseDownPosition.x;
    const deltaY = _event.clientY - this.lastMouseDownPosition.y;
    if (deltaX === 0 && deltaY === 0) {
      // if mouse is pressed on a node then select it
      const hoveredNode = this.viewModel.getHoveredNode();
      if (hoveredNode !== -1) {
        // if ctrl is pressed then do nothing
        if (_event.ctrlKey) {
        // if ctrl is not pressed set the hovered node as selected
        } else {
          this.viewModel.setSelectedNodes([hoveredNode]);
        }
      }
    }
  }

  // Private members
  private viewModel: ViewModel;
  private lastMouseDownPosition: { x: number, y: number } = { x: 0, y: 0 };
}

// when cursor is moved after double click we start creating a connection from the selected node 
// to the cursor
class ConnectionCreationController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onAnotherControllerActivated(): void {
    // if controller is active then finish connection
    if (this.active) {
      this.finishConnection();
    }
    this.readyForActivation = false;
  }

  onDraw(viewContext: IViewContext): void {
    if (this.active) {
      // draw connection lines from all selected nodes to the mouse cursor
      const selectedNodes = this.viewModel.getSelectedNodes();
      const mousePosition = { x: this.lastMouseMoveEvent.clientX, y: this.lastMouseMoveEvent.clientY };
      // get node under cursor if any
      const visibleNodes = this.viewModel.getVisibleNodes();
      const rectangles = visibleNodes.map(child => this.viewModel.getRectangleInViewport(child));
      const index = rectangles.findIndex(rectangle => mousePosition.x >= rectangle.x 
          && mousePosition.x <= rectangle.x + rectangle.width 
          && mousePosition.y >= rectangle.y 
          && mousePosition.y <= rectangle.y + rectangle.height);
      // if no rectangle is hovered generate 2x2 rect with the center at the mouse position
      const hoveredRectangle = index === -1 ? new Rectangle(mousePosition.x - 1, mousePosition.y - 1, 2, 2) : rectangles[index];
      
      selectedNodes.forEach(node => {
        if (node === visibleNodes[index]) {
          return;
        }

        const nodeRectangle = this.viewModel.getRectangleInViewport(node);
        const from = viewContext.getConnectionPoint(nodeRectangle, hoveredRectangle);
        const to = viewContext.getConnectionPoint(hoveredRectangle, nodeRectangle);
        viewContext.drawConnectionLine(from, to, this.viewModel.getViewStyle().connectionColor, 1);
      });
    }
  }
  
  onDblPress(_event: MouseEvent): void {
    // if controller is not active and any node is selected then set controller active
    if (!this.active && this.viewModel.getSelectedNodes().length > 0) {
      this.readyForActivation = true;
    }
  }

  onMouseMove(_event: MouseEvent): void {
    if (this.readyForActivation) {
      this.active = true;
    }

    if (this.active) {
      // save event
      this.lastMouseMoveEvent = _event;
      // request redraw
      this.observers.forEach(observer => observer.onRedrawRequested());
    }
  }

  onMouseUp(_event: MouseEvent): void {
    if (this.active) {
      // if mouse is released after double click then finish connection
      this.finishConnection();
    }
    this.readyForActivation = false;
  }

  // End IViewController

  // Private functions

  private finishConnection(): void {
    // get hovered node (but not from model as hover controller is not active when this controller
    // is active)
    const displayedParent = this.viewModel.getDisplayedParent();
    const children = this.viewModel.getModel().getChildren(displayedParent);
    const rectangles = children.map(child => this.viewModel.getRectangleInViewport(child));
    const index = rectangles.findIndex(rectangle => this.lastMouseMoveEvent.clientX >= rectangle.x 
        && this.lastMouseMoveEvent.clientX <= rectangle.x + rectangle.width 
        && this.lastMouseMoveEvent.clientY >= rectangle.y 
        && this.lastMouseMoveEvent.clientY <= rectangle.y + rectangle.height);
    const hoveredNode = index === -1 ? -1 : children[index];
    // if hovered node is not -1 then create connection
    if (hoveredNode !== -1) {
      // get selected nodes
      const selectedNodes = this.viewModel.getSelectedNodes();
      // for each selected node create connection
      selectedNodes.forEach(node => {
        this.viewModel.getModel().addConnection(node, hoveredNode);
      });
    }
    // set controller inactive
    this.active = false;
    this.readyForActivation = false;
  }

  // Private members
  private viewModel: ViewModel;
  private readyForActivation: boolean = false;
  private lastMouseMoveEvent: MouseEvent = new MouseEvent('mousemove');
}

class NodeAndConnectionRemovalController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onKeyup(event: KeyboardEvent): void {
    // if delete is pressed then remove selected nodes and connections
    if (event.key === 'Delete') {
      // first we remove connections and then nodes to avoid connections being removed by the model on node removal
      const selectedConnections = this.viewModel.getSelectedConnections();
      const selectedNodes = this.viewModel.getSelectedNodes();
      selectedConnections.forEach(connection => this.viewModel.getModel().removeConnection(connection.from, connection.to));
      selectedNodes.forEach(node => this.viewModel.getModel().destroyNode(node));
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
}

// if mouse is closer than 5 to the connection line then set it as hovered
class ConnectionHoverController extends BaseController {
  constructor(viewModel: ViewModel, context: IViewContext) {
    super();
    this.viewModel = viewModel;
    this.context = context;
  }

  // Start IViewController

  onMouseMove(event: MouseEvent): void {
    // skip if any node is hovered
    if (this.viewModel.getHoveredNode() !== -1) {
      this.viewModel.setHoveredConnection(null);
      return;
    }
    
    const connections = this.viewModel.getVisibleConnections();
    // get mouse position
    const mousePosition = { x: event.clientX, y: event.clientY };
    // get connection under cursor if any
    const index = connections.findIndex(connection => this.isPointOnConnection(mousePosition, connection));
    if (index !== -1) {
      this.viewModel.setHoveredConnection(connections[index]);
    } else {
      this.viewModel.setHoveredConnection(null);
    }
  }

  // End IViewController

  // Private functions

  private isPointOnConnection(point: { x: number, y: number }, connection: Connection): boolean {
    // get connection points
    const fromRectangle = this.viewModel.getRectangleInViewport(connection.from);
    const toRectangle = this.viewModel.getRectangleInViewport(connection.to);
    const from = this.context.getConnectionPoint(fromRectangle, toRectangle);
    const to = this.context.getConnectionPoint(toRectangle, fromRectangle);
    // get distance from point to line
    const distance = this.getDistanceFromPointToLine(point, from, to);
    return distance < 8;
  }
  
  private getDistanceFromPointToLine(point: { x: number, y: number }, lineFrom: { x: number, y: number }, lineTo: { x: number, y: number }): number {
    // calculate the bounding box from lineFrom and lineTo
    // then increase it's size by 4 in each direction
    // then check if point is inside the bounding box
    // if it is then calculate distance from point to line
    // if it is not then return the distance to the closest lineFrom or lineTo
    const boundingBox = {
      x: Math.min(lineFrom.x, lineTo.x) - 4,
      y: Math.min(lineFrom.y, lineTo.y) - 4,
      width: Math.abs(lineFrom.x - lineTo.x) + 8,
      height: Math.abs(lineFrom.y - lineTo.y) + 8
    };

    if (point.x >= boundingBox.x && point.x <= boundingBox.x + boundingBox.width
      && point.y >= boundingBox.y && point.y <= boundingBox.y + boundingBox.height) {
      return this.getDistanceFromPointToLineInternal(point, lineFrom, lineTo);
    } else {
      const distanceFromLineFrom = Math.sqrt(Math.pow(point.x - lineFrom.x, 2) + Math.pow(point.y - lineFrom.y, 2));
      const distanceFromLineTo = Math.sqrt(Math.pow(point.x - lineTo.x, 2) + Math.pow(point.y - lineTo.y, 2));
      return Math.min(distanceFromLineFrom, distanceFromLineTo);
    }
  }

  private getDistanceFromPointToLineInternal(point: { x: number, y: number }, lineFrom: { x: number, y: number }, lineTo: { x: number, y: number }): number {
    // calculate distance from point to line
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    const numerator = Math.abs((lineTo.y - lineFrom.y) * point.x - (lineTo.x - lineFrom.x) * point.y + lineTo.x * lineFrom.y - lineTo.y * lineFrom.x);
    const denominator = Math.sqrt(Math.pow(lineTo.y - lineFrom.y, 2) + Math.pow(lineTo.x - lineFrom.x, 2));
    return numerator / denominator;
  }

  // Private members
  private viewModel: ViewModel;
  private context: IViewContext;
}

class ConnectionSelectionController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    // if mouse is pressed on a connection then select it
    const hoveredConnection = this.viewModel.getHoveredConnection();
    if (hoveredConnection !== null) {
      // if ctrl is pressed then add connection to selection
      if (event.ctrlKey) {
        const selectedConnections = this.viewModel.getSelectedConnections();
        const connectionIndex = selectedConnections.indexOf(hoveredConnection);
        if (connectionIndex === -1) {
          selectedConnections.push(hoveredConnection);
          this.viewModel.setSelectedConnections(selectedConnections);
        } else {
          // if connection si already selected then deselect it
          selectedConnections.splice(connectionIndex, 1);
          this.viewModel.setSelectedConnections(selectedConnections);
        }
      // if ctrl is not pressed and connection is not among seleted then set is as selected
      } else if (!this.viewModel.getSelectedConnections().includes(hoveredConnection)) {
        this.viewModel.setSelectedConnections([hoveredConnection]);
      }
    }
    // otherwise deselect unless mouse is pressed, node is hovered and ctrl is pressed
    else if (this.viewModel.getHoveredNode() === -1 || !event.ctrlKey) {
      this.viewModel.setSelectedConnections([]);
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
}

//**************************************************************************************************
// view
//**************************************************************************************************
class View implements IViewModelObserver, IViewContext, IViewControllerObserver {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    this.viewModel = viewModel;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // register as observer
    this.viewModel.registerObserver(this as IViewModelObserver);
    this.viewModel.setViewportSize({ width: window.innerWidth, height: window.innerHeight });

    // create controllers
    this.controllers.push(new NodeHoverController(this.viewModel));
    this.controllers.push(new SelectionHandler(this.viewModel));
    this.controllers.push(new ViewportMoveController(this.viewModel));
    this.controllers.push(new ConnectionCreationController(this.viewModel));
    this.controllers.push(new NodeMoveController(this.viewModel));
    this.controllers.push(new ViewportZoomController(this.viewModel));
    this.controllers.push(new NodeCreationAndRenameController(this.viewModel, this.canvas));
    this.controllers.push(new NodeAndConnectionRemovalController(this.viewModel));
    this.controllers.push(new ConnectionHoverController(this.viewModel, this));
    this.controllers.push(new ConnectionSelectionController(this.viewModel));

    // register as observer of controllers
    this.controllers.forEach(controller => controller.registerObserver(this));

    // add event listeners
    // redraw on resize
    window.addEventListener('resize', () => this.viewModel.setViewportSize({ width: window.innerWidth, height: window.innerHeight }));
    
    // mouse events
    canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
    canvas.addEventListener('mousemove', (event) => this.onEvent(controller => controller.onMouseMove(event)));
    canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
    canvas.addEventListener('wheel', (event) => this.onEvent(controller => controller.onWheel(event)));

    // keyboard events
    window.addEventListener('keydown', (event) => this.onEvent(controller => controller.onKeydown(event)));
    window.addEventListener('keyup', (event) => this.onEvent(controller => controller.onKeyup(event)));
    
    // disable native context menu
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  draw(): void {
    // set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // draw background
    this.ctx.fillStyle = this.viewModel.getViewStyle().backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // draw grid
    this.drawGrid();

    // get displayed parent
    const displayedParent = this.viewModel.getDisplayedParent();
    // get children
    // for each child draw its node and outgoing connections
    // draw nodes in rvers order so that the first node is drawn on top of the last node
    const visibleNodes = this.viewModel.getVisibleNodes();
    const children = this.viewModel.getModel().getChildren(displayedParent).reverse();
    // outer connection nodes are visibleNodes that are not children
    const outerConnectionNodes = visibleNodes.filter(node => !children.includes(node));
    const visibleConnections = this.viewModel.getVisibleConnections();

    // draw connections
    visibleConnections.forEach(connection => {
      this.drawConnection(connection);
    });
    // draw inner nodes
    children.forEach(child => {
      this.drawNode(child, this.viewModel.getViewStyle().nodeColor);
    });
    // draw outer nodes
    outerConnectionNodes.forEach(node => {
      this.drawNode(node, this.viewModel.getViewStyle().outerNodeColor);
    });

    // for each controller draw its stuff
    this.controllers.forEach(controller => controller.onDraw(this));
  }

  // Private methods
  private drawGrid(): void {
    // get view port position
    const viewportPosition = this.viewModel.getViewPortPosition();
    // get grid size
    const gridSize = this.viewModel.getGridSize();
    // get canvas size
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    // get starting position of grid
    const startingPosition = { x: -viewportPosition.x % gridSize, y: -viewportPosition.y % gridSize };
    // draw small step grid
    this.ctx.strokeStyle = this.viewModel.getViewStyle().smallStepGridColor;
    this.ctx.lineWidth = 1;
    for (var x = startingPosition.x; x < canvasWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    for (var y = startingPosition.y; y < canvasHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvasWidth, y);
      this.ctx.stroke();
    }
    // draw big step grid
    this.ctx.strokeStyle = this.viewModel.getViewStyle().bigStepGridColor;
    this.ctx.lineWidth = 2;
    const bigStepStartingPosition = { x: -viewportPosition.x % (gridSize * 5), y: -viewportPosition.y % (gridSize * 5) };
    for (var x = bigStepStartingPosition.x; x < canvasWidth; x += gridSize * 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    for (var y = bigStepStartingPosition.y; y < canvasHeight; y += gridSize * 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvasWidth, y);
      this.ctx.stroke();
    }
  }

  private drawNode(index: number, nodeColor: string): void {
    // get rectangle
    const rectangle = this.viewModel.getRectangleInViewport(index);
    // fill rect
    this.ctx.fillStyle = nodeColor;
    this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    // draw rectangle frame (use different color if node is selected)
    if (this.viewModel.getSelectedNodes().includes(index)) {
      this.ctx.strokeStyle = this.viewModel.getViewStyle().nodeSelectedBorderColor;
    }
    else {
      this.ctx.strokeStyle = this.viewModel.getViewStyle().nodeBorderColor;
    }
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    // draw hover rectangle with one pixel bigger in every direction
    if (this.viewModel.getHoveredNode() === index) {
      this.ctx.strokeStyle = this.viewModel.getViewStyle().nodeHoveredBorderColor;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(rectangle.x - 1, rectangle.y - 1, rectangle.width + 2, rectangle.height + 2);
    }

    // skip drawing name of node is renamed
    if (index !== this.viewModel.getRenamedNode()) {
      // get name
      const name = this.viewModel.getModel().getName(index);
      // draw name
      const textSize = this.viewModel.getViewStyle().textSize * this.viewModel.getZoom();
      this.ctx.fillStyle = this.viewModel.getViewStyle().nodeTextColor;
      this.ctx.font = `${textSize}px ${this.viewModel.getViewStyle().textFont}`;
      const textPosx = rectangle.x + rectangle.width / 2 - this.ctx.measureText(name).width / 2;
      const textPosy = rectangle.y + rectangle.height / 2 + textSize / 3.5;
      this.ctx.fillText(name, textPosx, textPosy);
    }
  }

  private drawConnection(connection: Connection): void {
    // get connection color
    var connectionColor = this.viewModel.getViewStyle().connectionColor;
    if (this.viewModel.getHoveredConnection() === connection) {
      connectionColor = this.viewModel.getViewStyle().connectionHoveredColor;
    } else
    if (this.viewModel.getSelectedConnections().includes(connection)) {
      connectionColor = this.viewModel.getViewStyle().connectionSelectedColor;
    } 

    // get connection width
    var connectionWidth = 1;
    if (this.viewModel.getHoveredConnection() === connection) {
      connectionWidth = 3;
    } else
    if (this.viewModel.getSelectedConnections().includes(connection)) {
      connectionWidth = 2;
    }

    // get from rectangle
    var fromRectangle = this.viewModel.getRectangleInViewport(connection.from);
    // get to rectangle
    var toRectangle = this.viewModel.getRectangleInViewport(connection.to);
    // don't draw if rectangles are overlapping
    if (fromRectangle.x + fromRectangle.width >= toRectangle.x && fromRectangle.y + fromRectangle.height >= toRectangle.y
        && fromRectangle.x <= toRectangle.x + toRectangle.width && fromRectangle.y <= toRectangle.y + toRectangle.height) {
      return;
    }
    // connection should start and end on the edges of rectangles
    // get from edge
    const fromConnectionPoint = this.getConnectionPoint(fromRectangle, toRectangle);
    // get to edge
    const toConnectionPoint = this.getConnectionPoint(toRectangle, fromRectangle);
    // draw connection
    this.drawConnectionLine(fromConnectionPoint, toConnectionPoint, connectionColor, connectionWidth);
  }

  private getIntersection(line1: { startx: number, starty: number, endx: number, endy: number }, 
      line2: { startx: number, starty: number, endx: number, endy: number }): { x: number, y: number } | null {
    const denominator = (line2.endy - line2.starty) * (line1.endx - line1.startx) - (line2.endx - line2.startx) * (line1.endy - line1.starty);
    if (denominator === 0) {
      return null;
    }
    var a = line1.starty - line2.starty;
    var b = line1.startx - line2.startx;
    const numerator1 = (line2.endx - line2.startx) * a - (line2.endy - line2.starty) * b;
    const numerator2 = (line1.endx - line1.startx) * a - (line1.endy - line1.starty) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;
    // if sections are not intersecting then return null
    if (a < 0 || a > 1 || b < 0 || b > 1) {
      return null;
    }
    // calculate intersection point
    const x = line1.startx + a * (line1.endx - line1.startx);
    const y = line1.starty + a * (line1.endy - line1.starty);
    return { x: x, y: y };
  }

  private onMouseDown(event: MouseEvent): void {
    this.onEvent(controller => controller.onMouseDown(event));
    // call onDblPress on all controllers if mouse is pressed twice in a short time
    if (Date.now() - this.lastPressTime < this.doublePressThreshold) {
      this.onEvent(controller => controller.onDblPress(event));
    }
    this.lastPressTime = Date.now();
  }

  private onMouseUp(event: MouseEvent): void {
    this.onEvent(controller => controller.onMouseUp(event));
    // call onDblClick on all controllers if mouse is released twice in a short time
    if (Date.now() - this.lastClickTime < this.doubleClickThreshold) {
      this.onEvent(controller => controller.onDblClick(event));
    }
    this.lastClickTime = Date.now();
  }

  // Generic function for controlling active controller. Takes lambda as a parameter and calls it 
  // on controllers until one of them becomes active. Then it stops calling the lambda and sets the
  // active controller.
  // This function is used by event handlers.
  private onEvent(lambda: (controller: IViewController) => void): void {
    // if there is an active controller then pass the event to it
    if (this.activeController !== null) {
      lambda(this.activeController);
      // we also check for null because inside this lambda we may trigger modelCHanged event which 
      // can do the job for us
      if (this.activeController !== null && !this.activeController.isActive()) {
        this.activeController = null;
      }
      return;
    }
    // if there is no active controller then pass the event to all controllers until one of them 
    // becomes active - then we stop passing the event to other controllers
    for (let controller of this.controllers) {
      lambda(controller);
      if (controller.isActive()) {
        this.activeController = controller;
        // notify other controllers that one of them became active
        this.controllers.forEach(otherController => {
          if (otherController !== controller) {
            otherController.onOtherControllerActivated();
          }
        });
        break;
      }
    }
  }

  // IViewControllerObserver
  onControllerActivated(controller: IViewController): void {
    // if controller is active then cancel activation of other controllers
    if (controller.isActive()) {
      this.activeController = controller;
      this.controllers.forEach(otherController => {
        if (otherController !== controller) {
          otherController.onOtherControllerActivated();
        }
      });
    }
  }

  onRedrawRequested(): void {
    this.draw();
  }
  // end IViewControllerObserver

  // IViewContext
  getContext(): CanvasRenderingContext2D { return this.ctx; }

  drawConnectionLine(from: { x: number, y: number }, to: { x: number, y: number }, connectionColor: string, connectionWidth: number): void {
    // draw line
    this.ctx.lineWidth = connectionWidth;
    this.ctx.strokeStyle = connectionColor;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    // draw arrow (filled triangle with proper orientation)
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = this.viewModel.getViewStyle().connectionArrowLength;
    this.ctx.fillStyle = connectionColor;
    this.ctx.beginPath();
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(to.x - arrowLength * Math.cos(angle - Math.PI / 6), to.y - arrowLength * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(to.x - arrowLength * Math.cos(angle + Math.PI / 6), to.y - arrowLength * Math.sin(angle + Math.PI / 6));
    this.ctx.lineTo(to.x, to.y);
    this.ctx.fill();
  }

  getConnectionPoint(fromRectangle: Rectangle, toRectangle: Rectangle): { x: number, y: number } {
    // get center of from rectangle
    const fromCenter = { x: fromRectangle.x + fromRectangle.width / 2, y: fromRectangle.y + fromRectangle.height / 2 };
    // get center of to rectangle
    const toCenter = { x: toRectangle.x + toRectangle.width / 2, y: toRectangle.y + toRectangle.height / 2 };
    // get intersection point of line from fromCenter to toCenter and fromRectangle
    const connectionLine = { startx: fromCenter.x, starty: fromCenter.y, endx: toCenter.x, endy: toCenter.y };
    const fromRectangleTop = { startx: fromRectangle.x, starty: fromRectangle.y, endx: fromRectangle.x + fromRectangle.width, endy: fromRectangle.y };
    const fromRectangleBottom = { startx: fromRectangle.x, starty: fromRectangle.y + fromRectangle.height, endx: fromRectangle.x + fromRectangle.width, endy: fromRectangle.y + fromRectangle.height };
    const fromRectangleLeft = { startx: fromRectangle.x, starty: fromRectangle.y, endx: fromRectangle.x, endy: fromRectangle.y + fromRectangle.height };
    const fromRectangleRight = { startx: fromRectangle.x + fromRectangle.width, starty: fromRectangle.y, endx: fromRectangle.x + fromRectangle.width, endy: fromRectangle.y + fromRectangle.height };

    const intersectionTop = this.getIntersection(connectionLine, fromRectangleTop);
    const intersectionBottom = this.getIntersection(connectionLine, fromRectangleBottom);
    const intersectionLeft = this.getIntersection(connectionLine, fromRectangleLeft);
    const intersectionRight = this.getIntersection(connectionLine, fromRectangleRight);

    // find intersection that is closest to toCenter
    const intersections = [intersectionTop, intersectionBottom, intersectionLeft, intersectionRight];
    const distances = intersections.map(intersection => intersection === null 
      ? Infinity 
      : Math.sqrt(Math.pow(toCenter.x - intersection.x, 2) + Math.pow(toCenter.y - intersection.y, 2)));
    const minDistance = Math.min(...distances);
    const index = distances.indexOf(minDistance);
    const intersection = intersections[index] as { x: number, y: number };
    // if intersection is null then move from rectangle one pixel to the right and try again
    if (intersection === null) {
      fromRectangle.x += 1;
      return this.getConnectionPoint(fromRectangle, toRectangle);
    }
    else
    {
      return intersection;
    }
  }

  // end IViewContext

  // IViewModelObserver
  onModelChanged(): void {
    this.onEvent(controller => controller.onModelChanged());
    this.draw();
  }

  onNodeCreated(_index: number): void {}
  onNodeDestroyed(_index: number): void {}
  onNodeNameChanged(_index: number): void {}
  onNodeRectangleChanged(_index: number): void {}
  onNodeChildAdded(_parent: number, _child: number): void {}
  onNodeChildRemoved(_parent: number, _child: number): void {}
  onConnectionAdded(_from: number, _to: number): void {}
  onConnectionRemoved(_from: number, _to: number): void {}
  onDisplayedParentChanged(): void {}
  onViewportSizeChanged(): void {}
  onHoveredNodeChanged(): void {}
  onHoveredConnectionChanged(): void {}
  onSelectedNodesChanged(): void {}
  onSelectedConnectionsChanged(): void {}
  onRenamedNodeChanged(): void {}
  onGridSizeChanged(): void {}
  onViewportPositionChanged(): void {}
  onZoomChanged(): void {}
  // end IViewModelObserver

  // Private members
  private viewModel: ViewModel;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // if there is an active controller it will receive all events
  // if there is no active controller then all events will be passed to all controllers until one 
  // of them becomes active
  private controllers: IViewController[] = [];
  private activeController: IViewController | null = null;

  private doublePressThreshold: number = 500;
  private doubleClickThreshold: number = 500;
  private lastPressTime: number = 0;
  private lastClickTime: number = 0;
}

//**************************************************************************************************
// main
//**************************************************************************************************
var model = new Model();
var viewModel = new ViewModel(model);
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
var view = new View(viewModel, canvas);

// create sample graph
const root = model.getRoot();

const engine = model.createNode();
model.setName(engine, 'Engine');
model.setRectangle(engine, new Rectangle(450, 450, 100, 50), root);
model.addChild(root, engine);

  const crankshaft = model.createNode();
  model.setName(crankshaft, 'Crankshaft');
  model.setRectangle(crankshaft, new Rectangle(450, 0, 100, 50), engine);
  model.addChild(engine, crankshaft);

  const pistons = model.createNode();
  model.setName(pistons, 'Pistons');
  model.setRectangle(pistons, new Rectangle(50, 50, 100, 50), engine);
  model.addChild(engine, pistons);

    const piston1 = model.createNode();
    model.setName(piston1, 'Piston 1');
    model.setRectangle(piston1, new Rectangle(50, 0, 100, 50), pistons);
    model.addChild(pistons, piston1);

      const connectingRod1 = model.createNode();
      model.setName(connectingRod1, 'Connecting rod 1');
      model.setRectangle(connectingRod1, new Rectangle(50, 50, 100, 50), piston1);
      model.addChild(piston1, connectingRod1);

    const piston2 = model.createNode();
    model.setName(piston2, 'Piston 2');
    model.setRectangle(piston2, new Rectangle(50, 100, 100, 50), pistons);
    model.addChild(pistons, piston2);
    
      const connectingRod2 = model.createNode();
      model.setName(connectingRod2, 'Connecting rod 2');
      model.setRectangle(connectingRod2, new Rectangle(50, 50, 100, 50), piston2);
      model.addChild(piston2, connectingRod2);

    const piston3 = model.createNode();
    model.setName(piston3, 'Piston 3');
    model.setRectangle(piston3, new Rectangle(50, 200, 100, 50), pistons);
    model.addChild(pistons, piston3);
          
      const connectingRod3 = model.createNode();
      model.setName(connectingRod3, 'Connecting rod 3');
      model.setRectangle(connectingRod3, new Rectangle(50, 50, 100, 50), piston3);
      model.addChild(piston3, connectingRod3);

    const piston4 = model.createNode();
    model.setName(piston4, 'Piston 4');
    model.setRectangle(piston4, new Rectangle(50, 300, 100, 50), pistons);
    model.addChild(pistons, piston4);

      const connectingRod4 = model.createNode();
      model.setName(connectingRod4, 'Connecting rod 4');
      model.setRectangle(connectingRod4, new Rectangle(50, 50, 100, 50), piston4);
      model.addChild(piston4, connectingRod4);

const wheels = model.createNode();
model.setName(wheels, 'Wheels');
model.setRectangle(wheels, new Rectangle(450, 50, 100, 50), root);
model.addChild(root, wheels);

  const frontLeftWheel = model.createNode();
  model.setName(frontLeftWheel, 'Front left wheel');
  model.setRectangle(frontLeftWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, frontLeftWheel);

  const frontRightWheel = model.createNode();
  model.setName(frontRightWheel, 'Front right wheel');
  model.setRectangle(frontRightWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, frontRightWheel);

  const backLeftWheel = model.createNode();
  model.setName(backLeftWheel, 'Back left wheel');
  model.setRectangle(backLeftWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, backLeftWheel);

  const backRightWheel = model.createNode();
  model.setName(backRightWheel, 'Back right wheel');
  model.setRectangle(backRightWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, backRightWheel);

const body = model.createNode();
model.setName(body, 'Body');
model.setRectangle(body, new Rectangle(50, 50, 100, 50), root);
model.addChild(root, body);

const underbody = model.createNode();
model.setName(underbody, 'Underbody');
model.setRectangle(underbody, new Rectangle(450, 250, 100, 50), root);
model.addChild(root, underbody);

  const driveShaft = model.createNode();
  model.setName(driveShaft, 'Drive shaft');
  model.setRectangle(driveShaft, new Rectangle(50, 50, 100, 50), underbody);
  model.addChild(underbody, driveShaft);



// add connections
model.addConnection(engine, underbody);
model.addConnection(wheels, underbody);
model.addConnection(body, underbody);


// set root as current displayed parent
viewModel.setDisplayedParent(root);

// draw
view.draw();
