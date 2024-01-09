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

class IModelObserver {
  onModelChanged(): void {}

  onNodeCreated(_index: number): void {}
  onNodeDestroyed(_index: number): void {}
  onNodeNameChanged(_index: number): void {}
  onNodeRectangleChanged(_index: number): void {}
  onNodeChildAdded(_parent: number, _child: number): void {}
  onNodeChildRemoved(_parent: number, _child: number): void {}
  onConnectionAdded(_from: number, _to: number): void {}
  onConnectionRemoved(_from: number, _to: number): void {}
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
    return this.children.get(index) || [];
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

  // Mutators
  setDisplayedParent(index: number): void {
    this.displayedParent = index;
  }

  // Private members
  private model: Model;
  private displayedParent: number = 0;
}

class IViewController {
  isActive(): boolean { return false; }
  onMouseDown(_event: MouseEvent): void {}
  onMouseMove(_event: MouseEvent): void {}
  onMouseUp(_event: MouseEvent): void {}
}

class NodeMoveController {
  constructor(viewModel: ViewModel) {
    this.viewModel = viewModel;
  }

  // IViewController
  isActive(): boolean { return this.active; }

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
      const rectangle = new Rectangle(this.startingRectangle.x + deltaX, this.startingRectangle.y + deltaY, 
        this.startingRectangle.width, this.startingRectangle.height);
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

class View implements IModelObserver {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    this.viewModel = viewModel;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // register as observer
    this.viewModel.getModel().registerObserver(this as IModelObserver);

    // create controllers
    this.controllers.push(new NodeMoveController(this.viewModel));

    // add event listeners
    canvas.addEventListener('mousedown', (event) => this.onEvent(controller => controller.onMouseDown(event)));
    canvas.addEventListener('mousemove', (event) => this.onEvent(controller => controller.onMouseMove(event)));
    canvas.addEventListener('mouseup', (event) => this.onEvent(controller => controller.onMouseUp(event)));
  }

  draw(): void {
    // fill with white
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // get displayed parent
    const displayedParent = this.viewModel.getDisplayedParent();
    // get children
    const children = this.viewModel.getModel().getChildren(displayedParent);
    // for each child draw its node and outgoing connections
    children.forEach(child => {
      this.drawNode(child);
      this.viewModel.getModel().getOutgoingConnections(child).forEach(connection => this.drawConnection(connection));
    });
  }

  // Private methods
  drawNode(index: number): void {
    // get rectangle
    const rectangle = this.viewModel.getModel().getRectangle(index);
    // draw rectangle frame
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    // get name
    const name = this.viewModel.getModel().getName(index);
    // draw name
    const textSize = 15;
    this.ctx.fillStyle = 'black';
    this.ctx.font = textSize + 'px Arial';
    const textPosx = rectangle.x + rectangle.width / 2 - this.ctx.measureText(name).width / 2;
    const textPosy = rectangle.y + rectangle.height / 2 + 5;
    this.ctx.fillText(name, textPosx, textPosy);
  }

  drawConnection(connection: Connection): void {
    // get from rectangle
    const fromRectangle = this.viewModel.getModel().getRectangle(connection.from);
    // get to rectangle
    const toRectangle = this.viewModel.getModel().getRectangle(connection.to);
    // connection should start and end on the edges of rectangles
    // get from edge
    const fromConnectionPoint = this.getConnectionPoint(fromRectangle, toRectangle);
    // get to edge
    const toConnectionPoint = this.getConnectionPoint(toRectangle, fromRectangle);
    // draw black line
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.beginPath();
    this.ctx.moveTo(fromConnectionPoint.x, fromConnectionPoint.y);
    this.ctx.lineTo(toConnectionPoint.x, toConnectionPoint.y);
    this.ctx.stroke();
    // draw arrow (filled triangle with proper orientation)
    const angle = Math.atan2(toConnectionPoint.y - fromConnectionPoint.y, toConnectionPoint.x - fromConnectionPoint.x);
    const arrowLength = 12;
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.moveTo(toConnectionPoint.x, toConnectionPoint.y);
    this.ctx.lineTo(toConnectionPoint.x - arrowLength * Math.cos(angle - Math.PI / 6), toConnectionPoint.y - arrowLength * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(toConnectionPoint.x - arrowLength * Math.cos(angle + Math.PI / 6), toConnectionPoint.y - arrowLength * Math.sin(angle + Math.PI / 6));
    this.ctx.lineTo(toConnectionPoint.x, toConnectionPoint.y);
    this.ctx.fill();
  }

  getConnectionPoint(fromRectangle: Rectangle, toRectangle: Rectangle): { x: number, y: number } {
    // If vertical distance is greater than horizontal distance then connection should start or end
    // on the top or bottom edge. Return the middle point of the edge.
    if (Math.abs(fromRectangle.y - toRectangle.y) > Math.abs(fromRectangle.x - toRectangle.x)) {
      if (fromRectangle.y < toRectangle.y) {
        return { x: fromRectangle.x + fromRectangle.width / 2, y: fromRectangle.y + fromRectangle.height };
      } else {
        return { x: fromRectangle.x + fromRectangle.width / 2, y: fromRectangle.y };
      }
    }
    else
    {
      if (fromRectangle.x < toRectangle.x) {
        return { x: fromRectangle.x + fromRectangle.width, y: fromRectangle.y + fromRectangle.height / 2 };
      } else {
        return { x: fromRectangle.x, y: fromRectangle.y + fromRectangle.height / 2 };
      }
    }
  }

  // Generic function for controlling active controller. Takes lambda as a parameter and calls it 
  // on controllers until one of them becomes active. Then it stops calling the lambda and sets the
  // active controller.
  // This function is used by event handlers.
  onEvent(lambda: (controller: IViewController) => void): void {
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
        break;
      }
    }
  }

  // IModelObserver
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
  // end IModelObserver

  // Private members
  private viewModel: ViewModel;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // if there is an active controller it will receive all events
  // if there is no active controller then all events will be passed to all controllers until one 
  // of them becomes active
  private controllers: IViewController[] = [];
  private activeController: IViewController | null = null;
}

var model = new Model();
var viewModel = new ViewModel(model);
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
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
