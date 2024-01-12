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
// Node - edge of the graph that can be connected to other nodes but also contains an inner graph
// Inner Graph - a graph that is contained within a node. Node containing a graph represents an 
//    abstraction of the inner graph. Nodes from the inner graph can be connected to nodes outside
//    of the inner graph (siblings of the node containing the inner graph)
// Abstraction - a node that contains an inner graph that is not empty

// The app uses model, view, view model (MVVM) architecture.

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

interface IViewModelObserver extends IModelObserver {
  onDisplayedParentChanged(): void
  onHoveredNodeChanged(): void
  onGridSizeChanged(): void
  onViewportPositionChanged(): void
}

class ViewModel {
  constructor(model: Model) {
    this.model = model;
  }

  // Accessors
  getModel(): Model {
    return this.model;
  }

  getDisplayedParent(): number {
    return this.displayedParent;
  }

  getHoveredNode(): number {
    return this.hoveredNode;
  }

  getGridSize(): number {
    return this.gridSize;
  }

  getViewPortPosition(): { x: number, y: number } {
    return this.viewportPosition;
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

  setDisplayedParent(index: number): void {
    this.displayedParent = index;
    this.observers.forEach(observer => observer.onDisplayedParentChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setHoveredNode(index: number): void {
    this.hoveredNode = index;
    this.observers.forEach(observer => observer.onHoveredNodeChanged());
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

  // Private members
  private model: Model;
  private observers: IViewModelObserver[] = [];
  private displayedParent: number = 0;
  private hoveredNode: number = -1;
  private viewportPosition: { x: number, y: number } = { x: 0, y: 0 };
  private gridSize: number = 10;
}

class IViewController {
  isActive(): boolean { return false; }
  onOtherControllerActivated(): void {}
  onMouseDown(_event: MouseEvent): void {}
  onMouseMove(_event: MouseEvent): void {}
  onMouseUp(_event: MouseEvent): void {}
}

class NodeHoverController implements IViewController {
  constructor(viewModel: ViewModel) {
    this.viewModel = viewModel;
  }

  // IViewController
  isActive(): boolean { return false; }

  onOtherControllerActivated(): void {}

  onMouseDown(_event: MouseEvent): void {}

  onMouseMove(event: MouseEvent): void {
    // if mouse is hovered over a node then set it as hovered node
    const displayedParent = this.viewModel.getDisplayedParent();
    const children = this.viewModel.getModel().getChildren(displayedParent);
    const rectangles = children.map(child => this.viewModel.getModel().getRectangle(child));
    const index = rectangles.findIndex(rectangle => event.clientX >= rectangle.x 
        && event.clientX <= rectangle.x + rectangle.width 
        && event.clientY >= rectangle.y 
        && event.clientY <= rectangle.y + rectangle.height);
    if (index !== -1) {
      this.viewModel.setHoveredNode(children[index]);
    } else {
      this.viewModel.setHoveredNode(-1);
    }
  }

  onMouseUp(_event: MouseEvent): void {}

  // Private members
  private viewModel: ViewModel;
}

class NodeMoveController implements IViewController {
  constructor(viewModel: ViewModel) {
    this.viewModel = viewModel;
  }

  // IViewController
  isActive(): boolean { return this.active; }

  onOtherControllerActivated(): void {}

  onMouseDown(_event: MouseEvent): void {}

  onMouseMove(event: MouseEvent): void {
    // if controller is not active, mouse is moving and LMB is pressed then set controller active
    if (!this.active && event.buttons === 1) {
      // if mouse is hovered over a node then move it and set controller active
      const displayedParent = this.viewModel.getDisplayedParent();
      const children = this.viewModel.getModel().getChildren(displayedParent);
      const rectangles = children.map(child => this.viewModel.getModel().getRectangle(child));
      const index = rectangles.findIndex(rectangle => event.clientX >= rectangle.x 
          && event.clientX <= rectangle.x + rectangle.width 
          && event.clientY >= rectangle.y 
          && event.clientY <= rectangle.y + rectangle.height);
      if (index !== -1) {
        this.active = true;
        this.draggedNode = children[index];
        this.startingCursorPosition = { x: event.clientX, y: event.clientY };
        this.startingRectangle = this.viewModel.getModel().getRectangle(this.draggedNode);
      }
    }
    
    if (this.active) {
      // move node
      const deltaX = event.clientX - this.startingCursorPosition.x;
      const deltaY = event.clientY - this.startingCursorPosition.y;
      var rectangle = new Rectangle(this.startingRectangle.x + deltaX, this.startingRectangle.y + deltaY, 
        this.startingRectangle.width, this.startingRectangle.height);
      // snap to grid
      const gridSize = this.viewModel.getGridSize();
      rectangle.x = Math.round(rectangle.x / gridSize) * gridSize;
      rectangle.y = Math.round(rectangle.y / gridSize) * gridSize;
      this.viewModel.getModel().setRectangle(this.draggedNode, rectangle);
    }
  }

  onMouseUp(_event: MouseEvent): void {
    this.active = false;
    this.draggedNode = -1;
    this.startingCursorPosition = { x: 0, y: 0 };
    this.startingRectangle = new Rectangle(0, 0, 0, 0);
  }


  // Private members
  private viewModel: ViewModel;
  private active: boolean = false;
  private draggedNode: number = -1;
  private startingCursorPosition: { x: number, y: number } = { x: 0, y: 0 };
  private startingRectangle: Rectangle = new Rectangle(0, 0, 0, 0);
}

class ViewportMoveController implements IViewController {
  constructor(viewModel: ViewModel) {
    this.viewModel = viewModel;
  }

  // IViewController
  isActive(): boolean { return this.active; }

  onOtherControllerActivated(): void {}

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

  // Private members
  private viewModel: ViewModel;
  private active: boolean = false;
  private startingCursorPosition: { x: number, y: number } = { x: 0, y: 0 };
  private startingViewportPosition: { x: number, y: number } = { x: 0, y: 0 };
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
  nodeTextColor: string;
  connectionColor: string;
  connectionArrowColor: string;
  connectionArrowLength: number;
  textSize: number;
  textFont: string;
}

class View implements IViewModelObserver {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    this.viewModel = viewModel;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // register as observer
    this.viewModel.registerObserver(this as IViewModelObserver);

    // create controllers
    this.controllers.push(new ViewportMoveController(this.viewModel));
    this.controllers.push(new NodeMoveController(this.viewModel));
    this.controllers.push(new NodeHoverController(this.viewModel));

    // add event listeners
    // redraw on resize
    window.addEventListener('resize', () => this.draw());
    
    // mouse events
    canvas.addEventListener('mousedown', (event) => this.onEvent(controller => controller.onMouseDown(event)));
    canvas.addEventListener('mousemove', (event) => this.onEvent(controller => controller.onMouseMove(event)));
    canvas.addEventListener('mouseup', (event) => this.onEvent(controller => controller.onMouseUp(event)));
    
    // disable native context menu
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    // style
    this.style = new ViewStyle();
  }

  draw(): void {
    // set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // draw background
    this.ctx.fillStyle = this.style.backgroundColor;
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
    this.ctx.strokeStyle = this.style.smallStepGridColor;
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
    this.ctx.strokeStyle = this.style.bigStepGridColor;
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
    var rectangle = this.viewModel.getModel().getRectangle(index);
    // get view port position
    const viewportPosition = this.viewModel.getViewPortPosition();
    // translate rectangle
    rectangle = new Rectangle(rectangle.x - viewportPosition.x, rectangle.y - viewportPosition.y, rectangle.width, rectangle.height);
    // fill rect
    this.ctx.fillStyle = this.style.nodeColor;
    this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    // draw rectangle frame (red frame for hovered node)
    if (index === this.viewModel.getHoveredNode()) {
      this.ctx.strokeStyle = this.style.nodeHoveredBorderColor;
    } else {
      this.ctx.strokeStyle =  this.style.nodeBorderColor;
    }
    
    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    // get name
    const name = this.viewModel.getModel().getName(index);
    // draw name
    const textSize = this.style.textSize;
    this.ctx.fillStyle = this.style.nodeTextColor;
    this.ctx.font = `${textSize}px ${this.style.textFont}`;
    const textPosx = rectangle.x + rectangle.width / 2 - this.ctx.measureText(name).width / 2;
    const textPosy = rectangle.y + rectangle.height / 2 + 5;
    this.ctx.fillText(name, textPosx, textPosy);
  }

  private drawConnection(connection: Connection): void {
    // get view port position
    const viewportPosition = this.viewModel.getViewPortPosition();
    // get from rectangle
    var fromRectangle = this.viewModel.getModel().getRectangle(connection.from);
    // translate from rectangle
    fromRectangle = new Rectangle(fromRectangle.x - viewportPosition.x, fromRectangle.y - viewportPosition.y, fromRectangle.width, fromRectangle.height);
    // get to rectangle
    var toRectangle = this.viewModel.getModel().getRectangle(connection.to);
    // translate to rectangle
    toRectangle = new Rectangle(toRectangle.x - viewportPosition.x, toRectangle.y - viewportPosition.y, toRectangle.width, toRectangle.height);
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
    // draw line
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.style.connectionColor;
    this.ctx.beginPath();
    this.ctx.moveTo(fromConnectionPoint.x, fromConnectionPoint.y);
    this.ctx.lineTo(toConnectionPoint.x, toConnectionPoint.y);
    this.ctx.stroke();
    // draw arrow (filled triangle with proper orientation)
    const angle = Math.atan2(toConnectionPoint.y - fromConnectionPoint.y, toConnectionPoint.x - fromConnectionPoint.x);
    const arrowLength = this.style.connectionArrowLength;
    this.ctx.fillStyle = this.style.connectionArrowColor;
    this.ctx.beginPath();
    this.ctx.moveTo(toConnectionPoint.x, toConnectionPoint.y);
    this.ctx.lineTo(toConnectionPoint.x - arrowLength * Math.cos(angle - Math.PI / 6), toConnectionPoint.y - arrowLength * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(toConnectionPoint.x - arrowLength * Math.cos(angle + Math.PI / 6), toConnectionPoint.y - arrowLength * Math.sin(angle + Math.PI / 6));
    this.ctx.lineTo(toConnectionPoint.x, toConnectionPoint.y);
    this.ctx.fill();
  }

  private getConnectionPoint(fromRectangle: Rectangle, toRectangle: Rectangle): { x: number, y: number } {
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
    return intersection;
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

  // Generic function for controlling active controller. Takes lambda as a parameter and calls it 
  // on controllers until one of them becomes active. Then it stops calling the lambda and sets the
  // active controller.
  // This function is used by event handlers.
  private onEvent(lambda: (controller: IViewController) => void): void {
    // if there is an active controller then pass the event to it
    if (this.activeController !== null) {
      lambda(this.activeController);
      if (!this.activeController.isActive()) {
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

  // IViewModelObserver
  onModelChanged(): void {
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
  onGridSizeChanged(): void {}
  onViewportPositionChanged(): void {}
  // end IViewModelObserver

  // Private members
  private viewModel: ViewModel;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private style: ViewStyle;

  // if there is an active controller it will receive all events
  // if there is no active controller then all events will be passed to all controllers until one 
  // of them becomes active
  private controllers: IViewController[] = [];
  private activeController: IViewController | null = null;
}

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
