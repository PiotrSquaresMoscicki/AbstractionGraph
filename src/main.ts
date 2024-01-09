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
  createNode(index: number = -1): number {
    if (this.nodes.indexOf(index) !== -1 || index >= this.indexGenerator) {
      throw new Error('Index is already used or is greater than the index generator');
    }
    if (index === -1) {
      index = this.indexGenerator++;
    }
    this.nodes.push(index);
    return index;
  }

  destroyNode(index: number): void {
    this.nodes = this.nodes.filter(node => node !== index);
    this.names.delete(index);
    this.rectangles.delete(index);
    this.children.delete(index);
    this.connections = this.connections.filter(connection => connection.from !== index && connection.to !== index);
  }

  setName(index: number, name: string): void {
    this.names.set(index, name);
  }

  setRectangle(index: number, rectangle: Rectangle): void {
    this.rectangles.set(index, rectangle);
  }

  addChild(parent: number, child: number): void {
    const children = this.children.get(parent) || [];
    children.push(child);
    this.children.set(parent, children);
  }

  removeChild(parent: number, child: number): void {
    const children = this.children.get(parent) || [];
    const index = children.indexOf(child);
    if (index !== -1) {
      children.splice(index, 1);
    }
  }

  addConnection(from: number, to: number): void {
    this.connections.push(new Connection(from, to));
  }

  removeConnection(from: number, to: number): void {
    this.connections = this.connections.filter(connection => connection.from !== from || connection.to !== to);
  }

  // Private members
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

class View {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    this.viewModel = viewModel;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // log size
    console.log('canvas width: ' + canvas.width);
    console.log('canvas height: ' + canvas.height);
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

  // Private members
  private viewModel: ViewModel;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
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
