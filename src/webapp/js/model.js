// Node is the internal class for storing data inside the model. It has two fields: 
// parent - index of the parent node in the model array of nodes
// children - array of indices of the children nodes in the model array of nodes
class Node {
  parent = null;
  children = [];

  constructor(parent) {
    this.parent = parent;
    this.children = [];
  }
}

// Connection is the internal class for storing data inside the model. It has two fields:
// input - index of the input node in the model array of nodes
// output - index of the output node in the model array of nodes
class Connection {
  input = null;
  output = null;
}

// Model representing a graph of nodes and connections. Each node can have multiple input and output
// connections. Each connection as an input and an output node. Nodes are identified by instances 
// of the Index type. Nodes can have child nodes. The model is a tree of nodes that can connect with
// each other. Children can't be connected with its parents.
class Model {
  nodes = [];
  connections = [];
  
  // getters

  getParent(index) {
    return this.nodes[index].parent;
  }

  getChildren(index) {
    return this.nodes[index].children;
  }
  
  getInputNodesIndices(index) {
    return this.connections.filter(connection => connection.output === index).map(connection => connection.input);
  }

  getOutputNodesIndices(index) {
    return this.connections.filter(connection => connection.input === index).map(connection => connection.output);
  }
  
  getConnectionIndex(start, end) {
    return this.connections.findIndex(connection => connection.input === start && connection.output === end);
  }

  // setters

  addNode(parent) {
    const index = this.nodes.length;
    this.nodes.push(new Node(parent));
    return index;
  }

  addConnection(input, output) {
    this.connections.push(new Connection(input, output));
  }

  removeConnection(input, output) {
    this.connections = this.connections.filter(connection => connection.input !== input && connection.output !== output);
  }

  removeConnections(index) {
    this.connections = this.connections.filter(connection => connection.input !== index && connection.output !== index);
  }

  removeNode(index) {
    this.nodes = this.nodes.filter(node => node.parent !== index && !node.children.includes(index));
    this.removeConnections(index);
  }
}