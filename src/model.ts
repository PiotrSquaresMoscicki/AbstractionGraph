export class Rectangle {
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

export class Connection { 
  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
  }

  from: number;
  to: number;
}

export interface IModelObserver {
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

export class Model {
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

  getNodesWithName(name: string): number[] {
    return this.nodes.filter(node => this.getName(node) === name);
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

export class ModelUtils {
  static createNode(model: Model, name: string, rectangle: Rectangle, outer: number): number {
    const node = model.createNode();
    model.setName(node, name);
    model.setRectangle(node, rectangle, outer);
    model.addChild(outer, node);
    return node;
  }
}