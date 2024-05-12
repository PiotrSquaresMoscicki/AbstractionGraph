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
  isValidIndex(index: number): boolean {
    return this.nodes.includes(index);
  }
  
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
    // add to root children
    this.addChild(0, index);
    this.observers.forEach(observer => observer.onNodeCreated(index));
    this.observers.forEach(observer => observer.onModelChanged());
    return index;
  }

  destroyNode(index: number): void {
    if (!this.isValidIndex(index)) {
      throw new Error('Invalid index');
    }
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
    // remove child from the previous parent
    const previousParent = this.getParent(child);
    if (previousParent !== null) {
      var previousChildren = this.children.get(previousParent) as number[];
      const childIndex = previousChildren.indexOf(child);
      previousChildren.splice(childIndex, 1);
      this.children.set(previousParent, previousChildren);
    }

    // add child to the new parent
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
      // behave as if the outer connection node is on the left
      x = minX - width - 50;
      y = minY + (maxY - minY) / 2 - height / 2;
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
  static createNode(model: Model, name: string, rectangle = new Rectangle(0, 0, 100, 50), outer: number = 0, index: number = -1): number {
    const node = model.createNode(index);
    model.setName(node, name);
    model.setRectangle(node, rectangle, outer);
    model.addChild(outer, node);
    return node;
  }

  static exportToYaml(model: Model): string {
    // Sample graph exported to YAML:
    //- Car:
    //  Rect: [0, 0, 150, 50]
    //  Children:
    //    - Driveshaft: 
    //      Rect: [-200, -100, 150, 50]
    //      Connections:
    //        - Engine
    //        - Engine/Crankshaft
    //    - Engine:
    //      Rect: [0, -100, 150, 50]
    //      Children:
    //        - Pistons:
    //          Rect: [0, -100, 150, 50]
    //        - Crankshaft:
    //          Rect: [0, 0, 150, 50]
    //          Connections:
    //            - Pistons
    //    - Wheels:
    //      Rect: [-200, 0, 150, 50]
    //      Connections:
    //        - Driveshaft
    //      Children:
    //        - Wheel 1:
    //          Rect: [-200, 0, 150, 50]
    //          Connections:
    //            - ../Driveshaft
    //        - Wheel 2:
    //          Rect: [0, 0, 150, 50]
    //          Connections:
    //            - ../Driveshaft
    //    - Body:
    //      Rect: [0, 0, 150, 50]
    //      Children:
    //        - Door 1:
    //          Rect: [-200, 0, 150, 50]
    //        - Door 2:
    //          Rect: [0, 0, 150, 50]

    var yaml = '';
    const root = model.getRoot();
    //ezport all children of root (we cannot export the root as it has no name nor rect)
    model.getChildren(root).forEach(child => {
      yaml += this.exportNodeToYaml(model, child, 0);
    });
    return yaml;
  }

  static exportNodeToYaml(model: Model, index: number, indent: number): string {
    var yaml = '';
    const name = model.getName(index);
    const rectangle = model.getRectangle(index, model.getParent(index) as number);
    const children = model.getChildren(index);
    const connections = model.getOutgoingConnections(index);
    const indentString = ' '.repeat(indent);
    yaml += indentString + '- ' + name + ':\n';
    yaml += indentString + '  Rect: [' + rectangle.x + ', ' + rectangle.y + ', ' + rectangle.width + ', ' + rectangle.height + ']\n';
    if (connections.length > 0) {
      yaml += indentString + '  Connections:\n';
      connections.forEach(connection => {
        const connectionName = ModelUtils.getConnectionPath(model, connection.from, connection.to);
        yaml += indentString + '    - ' + connectionName + '\n';
      });
    }
    if (children.length > 0) {
      yaml += indentString + '  Children:\n';
      children.forEach(child => {
        yaml += this.exportNodeToYaml(model, child, indent + 4);
      });
    }
    return yaml;
  }

  static getConnectionPath(model: Model, from: number, to: number): string {
    // from Driveshaft to Crankshaft this function should return 'Engine/Crankshaft'
    // from Wheel 1 to Driveshaft this function should return '../Driveshaft'
    // from Crankshaft to Pistons this function should return 'Pistons'

    // ensure from and to are valid nodes
    if (!model.isValidIndex(from) || !model.isValidIndex(to)) {
      throw new Error('Invalid node index');
    }
    
    // get full paths to the nodes
    const fromPath = this.getNodePath(model, from);
    const toPath = this.getNodePath(model, to);
    // find the common prefix
    for (var i = 0; i < Math.min(fromPath.length, toPath.length); i++) {
      if (fromPath[i] === toPath[i]) {
      } else {
        break;
      }
    }
    // remove common prefix from both paths
    fromPath.splice(0, i);
    toPath.splice(0, i);
    // if the toPath is longer or equal to the fromPath then we can use the toPath
    if (toPath.length >= fromPath.length) {
      return toPath.join('/');
    }
    // if the toPath is shorter than the fromPath then we can use the toPath after adding as many
    // '../' as there are remaining elements in the fromPath (minus the last element)
    return '../'.repeat(fromPath.length - 1) + toPath.join('/');
  }

  static getNodePath(model: Model, index: number): string[] {
    // for Driveshaft this function should return ['Car', 'Driveshaft']
    // for Crankshaft this function should return ['Car', 'Engine', 'Crankshaft']
    // for Wheel 1 this function should return ['Car', 'Wheels', 'Wheel 1']
    // for Pistons this function should return ['Car', 'Engine', 'Pistons']
    const path: string[] = [];
    var current = index;
    while (current !== model.getRoot()) {
      const name = model.getName(current);
      path.unshift(name);
      current = model.getParent(current) as number;
    }
    return path;
  }
}