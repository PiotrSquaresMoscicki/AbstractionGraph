// Node is the internal class for storing data inside the model. It has two fields: 
// parent - index of the parent node in the model array of nodes
// children - array of indices of the children nodes in the model array of nodes
class Node {
  parent = null;
  name = null;
  children = [];

  constructor(parent) {
    this.parent = parent;
    name = "";
    this.children = [];
  }
}

// Connection is the internal class for storing data inside the model. It has two fields:
// input - index of the input node in the model array of nodes
// output - index of the output node in the model array of nodes
class Connection {
  input = null;
  output = null;

  constructor(input, output) {
    this.input = input;
    this.output = output;
  }
}

// Model representing a graph of nodes and connections. Each node can have multiple input and output
// connections. Each connection as an input and an output node. Nodes are identified by instances 
// of the Index type. Nodes can have child nodes. The model is a tree of nodes that can connect with
// each other. Children can't be connected with its parents.
// Nodes that are direct children of the same parent create an abstraction layer. The user can design
// the system or the behavior from top to bottom starting with most general abstraction and by creating
// nodes which can be data or system nodes. Each system node can contain children that again when 
// connected with other systems and data  (that is children of the same parent) create a new abstraction
// layer. Index 0 is the root and can't be removed.
class Model {
  nodes = [];
  connections = [];

  constructor() {
    this.nodes = [new Node(null)];
    // rename root
    this.nodes[0].name = "root";
    this.connections = [];
  }
  
  // getters

  getRoot() {
    return 0;
  }

  getParent(index) {
    return this.nodes[index].parent;
  }

  getName(index) {
    return this.nodes[index].name;
  }

  getChildren(index) {
    return this.nodes[index].children;
  }
  
  getInputNodes(index) { 
    return this.connections
      .filter(connection => connection !== null && connection.output === index)
      .map(connection => connection.input);
  }

  getOutputNodes(index) {
    return this.connections
      .filter(connection => connection !== null && connection.input === index)
      .map(connection => connection.output);
  }
  
  getConnectionIndex(start, end) {
    return this.connections.findIndex(connection => connection.input === start && connection.output === end);
  }

  // setters

  // Adds child to the parent. If the parent is null the child is added to the root.
  // If there is any nulled node its index is reused. Returns the index of the added node.
  addNode(parent) {
    if (parent === null) {
      parent = 0;
    }
    const index = this.nodes.findIndex(node => node === null);
    if (index === -1) {
      this.nodes.push(new Node(parent));
      this.nodes[parent].children.push(this.nodes.length - 1);
      return this.nodes.length - 1;
    } else {
      this.nodes[index] = new Node(parent);
      this.nodes[parent].children.push(index);
      return index;
    }
  }

  // Sets the name of the node at the given index.
  setName(index, name) {
    this.nodes[index].name = name;
  }

  // Adds connection between the nodes at the given indices.
  // If there is any nulled connection its index is reused.
  addConnection(input, output) {
    const index = this.connections.findIndex(connection => connection === null);
    if (index === -1) {
      this.connections.push(new Connection(input, output));
    } else {
      this.connections[index] = new Connection(input, output);
    }
  }

  // Nullifies the connection between the nodes at the given indices.
  removeConnection(start, end) {
    const index = this.getConnectionIndex(start, end);
    if (index !== -1) {
      this.connections[index] = null;
    }
  }

  // Nullifies all connections connected with the node at the given index.
  removeConnections(index) {
    this.connections = this.connections.map(connection => {
      if (connection !== null && (connection.input === index || connection.output === index)) {
        return null;
      } else {
        return connection;
      }
    });
  }

  // The node in the array is only nulled and not removed from the array because the indices of the
  // nodes are used to identify the nodes. The node is nulled and if this index is ever requested 
  // the model will return null. All connections that are connected to this node are also nulled 
  // for the same reason. Index 0 is the root and can't be removed.
  removeNode(index) {
    if (index === 0) {
      return;
    }
    // remove from parent
    const parent = this.getParent(index);
    if (parent !== null) {
      this.nodes[parent].children = this.nodes[parent].children.filter(child => child !== index);
    }
    // remove children
    this.getChildren(index).forEach(child => this.removeNode(child));
    // remove connections
    this.removeConnections(index);
    // remove node
    this.nodes[index] = null;
  }

  getLayerDepth(index) {
    let depth = 0;
    let current = index;
    while (current !== 0) {
      current = this.getParent(current);
      depth++;
    }
    return depth;
  }
}