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

  getRectangle(index: number): Rectangle {
    return this.rectangles.get(index) || new Rectangle(0, 0, 0, 0);
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
    this.children.delete(index);
    this.connections = this.connections.filter(connection => connection.from !== index && connection.to !== index);
    this.observers.forEach(observer => observer.onNodeDestroyed(index));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setName(index: number, name: string): void {
    this.names.set(index, name);
    this.observers.forEach(observer => observer.onNodeNameChanged(index));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setRectangle(index: number, rectangle: Rectangle): void {
    this.rectangles.set(index, rectangle);
    this.observers.forEach(observer => observer.onNodeRectangleChanged(index));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  addChild(parent: number, child: number): void {
    const children = this.children.get(parent) || [];
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
    this.connections.push(new Connection(from, to));
    this.observers.forEach(observer => observer.onConnectionAdded(from, to));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  removeConnection(from: number, to: number): void {
    this.connections = this.connections.filter(connection => connection.from !== from || connection.to !== to);
    this.observers.forEach(observer => observer.onConnectionRemoved(from, to));
    this.observers.forEach(observer => observer.onModelChanged());
  }

  // Private members
  private observers: IModelObserver[] = [];
  private indexGenerator: number = 1;
  private nodes: number[] = [];
  private names: Map<number, string> = new Map<number, string>();
  private rectangles: Map<number, Rectangle> = new Map<number, Rectangle>();
  private children: Map<number, number[]> = new Map<number, number[]>();
  private connections: Connection[] = [];
}

//**************************************************************************************************
// view model
//**************************************************************************************************
interface IViewModelObserver extends IModelObserver {
  onDisplayedParentChanged(): void
  onHoveredNodeChanged(): void
  onSelectedNodesChanged(): void
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
    this.nodeBorderColor = '#4e4e52';
    this.nodeHoveredBorderColor = '#007acc';
    this.nodeSelectedBorderColor = '#007acc';
    this.nodeTextColor = '#c0c0c0';
    this.connectionColor = '#c0c0c0';
    this.connectionArrowColor = '#c0c0c0';
    this.connectionArrowLength = 12;
    this.textSize = 15;
    this.textFont = 'Consolas';
  }

  backgroundColor: string;
  smallStepGridColor: string;
  bigStepGridColor: string;
  nodeColor: string;
  nodeBorderColor: string;
  nodeHoveredBorderColor: string;
  nodeSelectedBorderColor: string;
  nodeTextColor: string;
  connectionColor: string;
  connectionArrowColor: string;
  connectionArrowLength: number;
  textSize: number;
  textFont: string;
}

class ViewModel {
  constructor(model: Model) {
    this.model = model;
  }

  // Accessors
  getModel(): Model {
    return this.model;
  }

  getViewStyle(): ViewStyle { return this.viewStyle; }

  getRectangleInViewport(index: number): Rectangle {
    // calculate rectangle position and size based on viewport position and zoom
    const rectangle = this.model.getRectangle(index);
    const viewportPosition = this.viewportPosition;
    const zoom = this.zoom;
    return new Rectangle(rectangle.x * zoom - viewportPosition.x, rectangle.y * zoom - viewportPosition.y, 
      rectangle.width * zoom, rectangle.height * zoom);
  }

  getDisplayedParent(): number {
    return this.displayedParent;
  }

  getHoveredNode(): number {
    return this.hoveredNode;
  }

  getSelectedNodes(): number[] {
    return this.selectedNodes;
  }

  getRenamedNode(): number {
    return this.renamedNode;
  }

  getGridSize(): number {
    return this.gridSize * this.zoom;
  }

  getViewPortPosition(): { x: number, y: number } {
    return this.viewportPosition;
  }

  getZoom(): number {
    return this.zoom;
  }

  getMousePositionInModel(event: MouseEvent): { x: number, y: number } {
    const viewportPosition = this.viewportPosition;
    const zoom = this.zoom;
    return { x: (event.clientX + viewportPosition.x) / zoom, y: (event.clientY + viewportPosition.y) / zoom };
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

  setRectangleInViewport(index: number, rectangle: Rectangle): void {
    // calculate rectangle position and size based on viewport position and zoom
    const viewportPosition = this.viewportPosition;
    const zoom = this.zoom;
    var modelRectangle = new Rectangle((rectangle.x + viewportPosition.x) / zoom, (rectangle.y + viewportPosition.y) / zoom, 
      rectangle.width / zoom, rectangle.height / zoom);
    // snap to grid
    const gridSize = this.gridSize;
    modelRectangle.x = Math.round(modelRectangle.x / gridSize) * gridSize;
    modelRectangle.y = Math.round(modelRectangle.y / gridSize) * gridSize;
    this.model.setRectangle(index, modelRectangle);
  }

  setDisplayedParent(index: number): void {
    this.displayedParent = index;
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

  setSelectedNodes(indexes: number[]): void {
    this.selectedNodes = indexes;
    this.observers.forEach(observer => observer.onSelectedNodesChanged());
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

  setViewportPosition(position: { x: number, y: number }): void {
    this.viewportPosition = position;
    this.observers.forEach(observer => observer.onViewportPositionChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setZoom(zoom: number): void {
    this.zoom = zoom;
    this.observers.forEach(observer => observer.onZoomChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  // Private members
  private model: Model;
  private viewStyle: ViewStyle = new ViewStyle();
  private observers: IViewModelObserver[] = [];
  private displayedParent: number = 0;
  private hoveredNode: number = -1;
  private selectedNodes: number[] = [];
  private renamedNode: number = -1;
  private viewportPosition: { x: number, y: number } = { x: 0, y: 0 };
  private gridSize: number = 10;
  private zoom: number = 1;
}

//**************************************************************************************************
// view interfaces
//**************************************************************************************************
interface IViewContext {
  getContext(): CanvasRenderingContext2D;
  drawConnectionLine(from: { x: number, y: number }, to: { x: number, y: number }): void;
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
    const displayedParent = this.viewModel.getDisplayedParent();
    const children = this.viewModel.getModel().getChildren(displayedParent);
    const rectangles = children.map(child => this.viewModel.getRectangleInViewport(child));
    const index = rectangles.findIndex(rectangle => cursorPosition.x >= rectangle.x 
        && cursorPosition.x <= rectangle.x + rectangle.width 
        && cursorPosition.y >= rectangle.y 
        && cursorPosition.y <= rectangle.y + rectangle.height);
    if (index !== -1) {
      this.viewModel.setHoveredNode(children[index]);
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
    // calculate new zoom
    zoom += event.deltaY / 1000;
    zoom = Math.max(0.1, zoom);
    zoom = Math.min(10, zoom);
    // zoom around the mouse cursor
    const mousePosition = { x: event.clientX, y: event.clientY };
    const viewportPosition = this.viewModel.getViewPortPosition();
    const oldZoom = this.viewModel.getZoom();
    const mousePositionInModel = { x: (mousePosition.x + viewportPosition.x) / oldZoom, y: (mousePosition.y + viewportPosition.y) / oldZoom };
    const mousePositionInModelAfterZoom = { x: (mousePosition.x + viewportPosition.x) / zoom, y: (mousePosition.y + viewportPosition.y) / zoom };
    const delta = { x: mousePositionInModel.x - mousePositionInModelAfterZoom.x, y: mousePositionInModel.y - mousePositionInModelAfterZoom.y };
    const viewportPositionAfterZoom = { x: viewportPosition.x + delta.x * zoom, y: viewportPosition.y + delta.y * zoom };
    this.viewModel.setViewportPosition(viewportPositionAfterZoom);
    // set zoom
    this.viewModel.setZoom(zoom);
  }
  
  // End IViewController

  // Private members
  private viewModel: ViewModel;
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
        this.viewModel.getModel().setRectangle(node, rectangle);
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
        }
      // if ctrl is not pressed and node is not among seleted then set is as selected
      } else if (!this.viewModel.getSelectedNodes().includes(hoveredNode)) {
        this.viewModel.setSelectedNodes([hoveredNode]);
      }
    } else {
      // if mouse is pressed on empty space then deselect all nodes
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
      const mousePosition = this.viewModel.getMousePositionInModel(this.lastMouseMoveEvent);
      // get node under cursor if any
      const displayedParent = this.viewModel.getDisplayedParent();
      const children = this.viewModel.getModel().getChildren(displayedParent);
      const rectangles = children.map(child => this.viewModel.getRectangleInViewport(child));
      const index = rectangles.findIndex(rectangle => mousePosition.x >= rectangle.x 
          && mousePosition.x <= rectangle.x + rectangle.width 
          && mousePosition.y >= rectangle.y 
          && mousePosition.y <= rectangle.y + rectangle.height);
      // if no rectangle is hovered generate 2x2 rect with the center at the mouse position
      const hoveredRectangle = index === -1 ? new Rectangle(mousePosition.x - 1, mousePosition.y - 1, 2, 2) : rectangles[index];
      
      selectedNodes.forEach(node => {
        if (node === children[index]) {
          return;
        }

        const nodeRectangle = this.viewModel.getRectangleInViewport(node);
        const from = viewContext.getConnectionPoint(nodeRectangle, hoveredRectangle);
        const to = viewContext.getConnectionPoint(hoveredRectangle, nodeRectangle);
        viewContext.drawConnectionLine(from, to);
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

    // create controllers
    this.controllers.push(new NodeHoverController(this.viewModel));
    this.controllers.push(new SelectionHandler(this.viewModel));
    this.controllers.push(new ViewportMoveController(this.viewModel));
    this.controllers.push(new ConnectionCreationController(this.viewModel));
    this.controllers.push(new NodeMoveController(this.viewModel));
    this.controllers.push(new ViewportZoomController(this.viewModel));
    this.controllers.push(new NodeCreationAndRenameController(this.viewModel, this.canvas));

    // register as observer of controllers
    this.controllers.forEach(controller => controller.registerObserver(this));

    // add event listeners
    // redraw on resize
    window.addEventListener('resize', () => this.draw());
    
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
    const children = this.viewModel.getModel().getChildren(displayedParent).reverse();
    children.forEach(child => {
      this.viewModel.getModel().getOutgoingConnections(child).forEach(connection => {
        this.drawConnection(connection);
      });
    });
    children.forEach(child => {
      this.drawNode(child);
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

  private drawNode(index: number): void {
    // get rectangle
    const rectangle = this.viewModel.getRectangleInViewport(index);
    // fill rect
    this.ctx.fillStyle = this.viewModel.getViewStyle().nodeColor;
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
    this.drawConnectionLine(fromConnectionPoint, toConnectionPoint);
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

  drawConnectionLine(from: { x: number, y: number }, to: { x: number, y: number }): void {
    // draw line
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.viewModel.getViewStyle().connectionColor;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    // draw arrow (filled triangle with proper orientation)
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = this.viewModel.getViewStyle().connectionArrowLength;
    this.ctx.fillStyle = this.viewModel.getViewStyle().connectionArrowColor;
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
  onHoveredNodeChanged(): void {}
  onSelectedNodesChanged(): void {}
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
model.setRectangle(engine, new Rectangle(450, 450, 100, 50));
model.addChild(root, engine);

const wheels = model.createNode();
model.setName(wheels, 'Wheels');
model.setRectangle(wheels, new Rectangle(450, 50, 100, 50));
model.addChild(root, wheels);

const body = model.createNode();
model.setName(body, 'Body');
model.setRectangle(body, new Rectangle(50, 50, 100, 50));
model.addChild(root, body);

const underbody = model.createNode();
model.setName(underbody, 'Underbody');
model.setRectangle(underbody, new Rectangle(450, 250, 100, 50));
model.addChild(root, underbody);

// add connections
model.addConnection(engine, underbody);
model.addConnection(wheels, underbody);
model.addConnection(body, underbody);


// set root as current displayed parent
viewModel.setDisplayedParent(root);

// draw
view.draw();
