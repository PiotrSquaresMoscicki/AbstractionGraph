import { 
  RootYamlNode,
  ChildrenYamlNode,
  ConnectionsYamlNode,
  Model, 
  ModelUtils,
  NodeYamlNode, 
  Rectangle, 
  RectangleYamlNode
} from '../model';
import { createSampleGraph } from '../create_sample_graph';

//************************************************************************************************
describe('Root node equals to 0', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
  });

  test('Root node equals to 0', () => {
    const root = model.getRoot();
    expect(root).toEqual(0);
  });
});

//************************************************************************************************
describe('Car node position equals 0,0 in its outer reference frame', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Car node position equals 0,0 ', () => {
    const carNodes= model.getNodesWithName('Car');
    expect(carNodes.length).toEqual(1);
    const carNode = carNodes[0];
    expect(model.getRectangle(carNode, model.getRoot()).x).toEqual(0);
    expect(model.getRectangle(carNode, model.getRoot()).y).toEqual(0);
  });
});

//************************************************************************************************
describe('Car node size equals 150,50 in its outer reference frame', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Car node size equals 150,50 ', () => {
    const carNodes= model.getNodesWithName('Car');
    expect(carNodes.length).toEqual(1);
    const carNode = carNodes[0];
    expect(model.getRectangle(carNode, model.getRoot()).width).toEqual(150);
    expect(model.getRectangle(carNode, model.getRoot()).height).toEqual(50);
  });
});

//************************************************************************************************
describe('Driveshaft position equals -200,-100 in its outer reference frame', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Driveshaft position equals -200,-100 ', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    const outerNodes = model.getNodesWithName('Car');
    expect(driveshaftNodes.length).toEqual(1);
    expect(outerNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const outerNode = outerNodes[0];
    expect(model.getRectangle(driveshaftNode, outerNode).x).toEqual(-200);
    expect(model.getRectangle(driveshaftNode, outerNode).y).toEqual(-100);
  });
});

//************************************************************************************************
describe('Driveshaft size equals 150,50 in its outer reference frame', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Driveshaft size equals 150,50 ', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    const outerNodes = model.getNodesWithName('Car');
    expect(driveshaftNodes.length).toEqual(1);
    expect(outerNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const outerNode = outerNodes[0];
    expect(model.getRectangle(driveshaftNode, outerNode).width).toEqual(150);
    expect(model.getRectangle(driveshaftNode, outerNode).height).toEqual(50);
  });
});

//************************************************************************************************
describe('Getting driveshaft rectangle in root reference frame should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Getting driveshaft rectangle in root reference frame should throw an error', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    expect(() => model.getRectangle(driveshaftNode, 0)).toThrow();
  });
});

//************************************************************************************************
describe('Getting a driveshaft rectangle in a non-existing reference frame should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Getting a driveshaft rectangle in a non-existing reference frame should throw an error', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    expect(() => model.getRectangle(driveshaftNode, 123)).toThrow();
  });
});

//************************************************************************************************
describe('Getting a non-existing node rectangle should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Getting a non-existing node rectangle should throw an error', () => {
    expect(() => model.getRectangle(123, model.getRoot())).toThrow();
  });
});

//************************************************************************************************
describe('Getting rectangle in undefined context should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Getting rectangle in undefined context should throw an error', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const wheel1Nodes = model.getNodesWithName('Wheel 1');
    expect(wheel1Nodes.length).toEqual(1);
    expect(() => model.getRectangle(driveshaftNode, wheel1Nodes[0])).toThrow();
  });
});

//************************************************************************************************
describe('Get driveshaft name', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get driveshaft name', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    expect(model.getName(driveshaftNode)).toEqual('Driveshaft');
  });
});

//************************************************************************************************
describe('Getting invalid node name should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Getting invalid node name should throw an error', () => {
    expect(() => model.getName(123)).toThrow();
  });
});

//************************************************************************************************
describe('Get engine children', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get engine children', () => {
    const engineNodes= model.getNodesWithName('Engine');
    expect(engineNodes.length).toEqual(1);
    const engineNode = engineNodes[0];
    const children = model.getChildren(engineNode);
    expect(children.length).toEqual(2);
    // connections are not ordered
    let pistonsConnection = model.getConnections(engineNode).find(
      connection => model.getName(connection.to) === 'Pistons' && model.getName(connection.from) === 'Engine'
    );
    expect(pistonsConnection).not.toBeNull();
    let crankshaftConnection = model.getConnections(engineNode).find(
      connection => model.getName(connection.to) === 'Crankshaft' && model.getName(connection.from) === 'Engine'
    );
    expect(crankshaftConnection).not.toBeNull();
  });
});

//************************************************************************************************
describe('Get children of a non-existing node should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get children of a non-existing node should throw an error', () => {
    expect(() => model.getChildren(123)).toThrow();
  });
});

//************************************************************************************************
describe('Get engine parent', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get engine parent', () => {
    const engineNodes= model.getNodesWithName('Engine');
    expect(engineNodes.length).toEqual(1);
    const engineNode = engineNodes[0];
    const parent = model.getParent(engineNode) as number;
    expect(model.getName(parent)).toEqual('Car');
  });
});

//************************************************************************************************
describe('Get parent of a non-existing node should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get parent of a non-existing node should throw an error', () => {
    expect(() => model.getParent(123)).toThrow();
  });
});

//************************************************************************************************
describe('Get parent of root should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
  });

  test('Get parent of root should throw an error', () => {
    expect(() => model.getParent(model.getRoot())).toThrow();
  });
});

//************************************************************************************************
describe('Get outgoing connections for driveshaft node', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get outgoing connections for driveshaft node', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const connections = model.getOutgoingConnections(driveshaftNode);
    expect(connections.length).toEqual(2);
    // connections are not ordered
    let engineConnection = connections.find(
      connection => model.getName(connection.to) === 'Engine' && model.getName(connection.from) === 'Driveshaft'
    );
    expect(engineConnection).not.toBeNull();
    let crankshaftConnection = connections.find(
      connection => model.getName(connection.to) === 'Crankshaft' && model.getName(connection.from) === 'Driveshaft'
    );
    expect(crankshaftConnection).not.toBeNull();
  });
});
  
//************************************************************************************************
describe('Get outgoing connections for a non-existing node should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get outgoing connections for a non-existing node should throw an error', () => {
    expect(() => model.getOutgoingConnections(123)).toThrow();
  });
});

//************************************************************************************************
describe('Get incoming connections for driveshaft node', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get incoming connections for driveshaft node', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const connections = model.getIncomingConnections(driveshaftNode);
    expect(connections.length).toEqual(3);
    // connections are not ordered
    let wheelsConnection = connections.find(
      connection => model.getName(connection.from) === 'Wheels' && model.getName(connection.to) === 'Driveshaft'
    );
    expect(wheelsConnection).not.toBeNull();
    let wheel1Connection = connections.find(
      connection => model.getName(connection.from) === 'Wheel 1' && model.getName(connection.to) === 'Driveshaft'
    );
    expect(wheel1Connection).not.toBeNull();
    let wheel2Connection = connections.find(
      connection => model.getName(connection.from) === 'Wheel 2' && model.getName(connection.to) === 'Driveshaft'
    );
    expect(wheel2Connection).not.toBeNull();
  });
});

//************************************************************************************************
describe('Get incoming connections for a non-existing node should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get incoming connections for a non-existing node should throw an error', () => {
    expect(() => model.getIncomingConnections(123)).toThrow();
  });
});

//************************************************************************************************
describe('Get all driveshaft connections', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get all driveshaft connections', () => {
    const driveshaftNodes= model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const connections = model.getConnections(driveshaftNode);
    expect(connections.length).toEqual(5);
    // connections are not ordered
    let engineConnection = connections.find(
      connection => model.getName(connection.to) === 'Engine' && model.getName(connection.from) === 'Driveshaft'
    );
    expect(engineConnection).not.toBeNull();
    let crankshaftConnection = connections.find(
      connection => model.getName(connection.to) === 'Crankshaft' && model.getName(connection.from) === 'Driveshaft'
    );
    expect(crankshaftConnection).not.toBeNull();
    let wheelsConnection = connections.find(
      connection => model.getName(connection.to) === 'Driveshaft' && model.getName(connection.from) === 'Wheels'
    );
    expect(wheelsConnection).not.toBeNull();
    let wheel1Connection = connections.find(
      connection => model.getName(connection.to) === 'Driveshaft' && model.getName(connection.from) === 'Wheel 1'
    );
    expect(wheel1Connection).not.toBeNull();
    let wheel2Connection = connections.find(
      connection => model.getName(connection.to) === 'Driveshaft' && model.getName(connection.from) === 'Wheel 2'
    );
    expect(wheel2Connection).not.toBeNull();
  });
});

//************************************************************************************************
describe('Get all connections for a non-existing node should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get all connections for a non-existing node should throw an error', () => {
    expect(() => model.getConnections(123)).toThrow();
  });
});

//************************************************************************************************
describe('Create node with predefined index', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Create node with predefined index', () => {
    // this is meant to be used for undo/redo purposes so first we need to delete a node
    // delete driveshaft node
    const driveshaftNodes = model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    model.destroyNode(driveshaftNode);
    // now we can create a node with the same index
    const newDriveshaftNode = model.createNode(driveshaftNode);
    expect(newDriveshaftNode).toEqual(driveshaftNode);
  });
});

describe('Create node with index that already exists should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Create node with index that already exists should throw an error', () => {
    const driveshaftNodes = model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    expect(() => model.createNode(driveshaftNode)).toThrow();
  });
});

//************************************************************************************************
describe('Create node with index greater than the intex generator should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
  });

  test('Create node with index greater than the intex generator should throw an error', () => {
    expect(() => model.createNode(1)).toThrow();
  });
});

//************************************************************************************************
describe('Destroy driveshaft node', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Destroy driveshaft node', () => {
    const driveshaftNodes = model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    model.destroyNode(driveshaftNode);
    const driveshaftNodesAfter = model.getNodesWithName('Driveshaft');
    expect(driveshaftNodesAfter.length).toEqual(0);
    // Engine, Wheels, Wheel 1 and Wheel 2 should hve no connections
    const engine = model.getNodesWithName('Engine');
    expect(engine.length).toEqual(1);
    const wheels = model.getNodesWithName('Wheels');
    expect(wheels.length).toEqual(1);
    const wheel1 = model.getNodesWithName('Wheel 1');
    expect(wheel1.length).toEqual(1);
    const wheel2 = model.getNodesWithName('Wheel 2');
    expect(wheel2.length).toEqual(1);
    expect(model.getConnections(engine[0]).length).toEqual(0);
    expect(model.getConnections(wheels[0]).length).toEqual(0);
    expect(model.getConnections(wheel1[0]).length).toEqual(0);
    expect(model.getConnections(wheel2[0]).length).toEqual(0);
    // crankshaft should have only connection to the pistons
    const crankshaft = model.getNodesWithName('Crankshaft');
    expect(crankshaft.length).toEqual(1);
    const crankshaftConnections = model.getConnections(crankshaft[0]);
    expect(crankshaftConnections.length).toEqual(1);
    expect(model.getName(crankshaftConnections[0].to)).toEqual('Pistons');
  });
});

//************************************************************************************************
describe('Adding the same child for the second time should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Adding the same child for the second time should throw an error', () => {
    const engineNodes = model.getNodesWithName('Engine');
    expect(engineNodes.length).toEqual(1);
    const engineNode = engineNodes[0];
    const pistonsNodes = model.getNodesWithName('Pistons');
    expect(pistonsNodes.length).toEqual(1);
    // expect pistons parent to be an engine
    const pistonsParent = model.getParent(pistonsNodes[0]) as number;
    expect(model.getName(pistonsParent)).toEqual('Engine');
    const pistonsNode = pistonsNodes[0];
    expect(() => model.addChild(engineNode, pistonsNode)).toThrow();
  });
});

//************************************************************************************************
describe('Adding the same connection for the second time should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Adding the same connection for the second time should throw an error', () => {
    const crankshaftNodes = model.getNodesWithName('Crankshaft');
    expect(crankshaftNodes.length).toEqual(1);
    const crankshaftNode = crankshaftNodes[0];
    const pistonsNodes = model.getNodesWithName('Pistons');
    expect(pistonsNodes.length).toEqual(1);
    const pistonsNode = pistonsNodes[0];
    expect(() => model.addConnection(crankshaftNode, pistonsNode)).toThrow();
  });
});

//************************************************************************************************
describe('Remove cnnection between crankshaft and pistons', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Remove cnnection between crankshaft and pistons', () => {
    const crankshaftNodes = model.getNodesWithName('Crankshaft');
    expect(crankshaftNodes.length).toEqual(1);
    const crankshaftNode = crankshaftNodes[0];
    const pistonsNodes = model.getNodesWithName('Pistons');
    expect(pistonsNodes.length).toEqual(1);
    const pistonsNode = pistonsNodes[0];
    expect(model.getConnections(crankshaftNode).length).toEqual(2);
    expect(model.getConnections(pistonsNode).length).toEqual(1);
    model.removeConnection(crankshaftNode, pistonsNode);
    expect(model.getConnections(crankshaftNode).length).toEqual(1);
    expect(model.getConnections(pistonsNode).length).toEqual(0);
  });
});

//************************************************************************************************
describe('Relative connection path generation', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Driveshaft to Crankshaft connection path', () => {
    const driveshaftNodes = model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const crankshaftNodes = model.getNodesWithName('Crankshaft');
    expect(crankshaftNodes.length).toEqual(1);
    const crankshaftNode = crankshaftNodes[0];
    const path = ModelUtils.getConnectionPath(model, driveshaftNode, crankshaftNode);
    expect(path).toEqual('Engine/Crankshaft');
  });

  test('Crankshaft to Pistons connection path', () => {
    const crankshaftNodes = model.getNodesWithName('Crankshaft');
    expect(crankshaftNodes.length).toEqual(1);
    const crankshaftNode = crankshaftNodes[0];
    const pistonsNodes = model.getNodesWithName('Pistons');
    expect(pistonsNodes.length).toEqual(1);
    const pistonsNode = pistonsNodes[0];
    const path = ModelUtils.getConnectionPath(model, crankshaftNode, pistonsNode);
    expect(path).toEqual('Pistons');
  });

  test('Wheel 1 to Driveshaft connection path', () => {
    const wheel1Nodes = model.getNodesWithName('Wheel 1');
    expect(wheel1Nodes.length).toEqual(1);
    const wheel1Node = wheel1Nodes[0];
    const driveshaftNodes = model.getNodesWithName('Driveshaft');
    expect(driveshaftNodes.length).toEqual(1);
    const driveshaftNode = driveshaftNodes[0];
    const path = ModelUtils.getConnectionPath(model, wheel1Node, driveshaftNode);
    expect(path).toEqual('../Driveshaft');
  });
});

//************************************************************************************************
describe('Relative connection path generation with non-existing nodes should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Relative connection path generation with non-existing nodes should throw an error', () => {
    expect(() => ModelUtils.getConnectionPath(model, 123, 456)).toThrow();
  });
});

//************************************************************************************************
describe('Export pistons node to yaml', () => {
  let model: Model;
  let expectedYaml: string;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);

    expectedYaml = 
`- Pistons:
  Rect: [0, -100, 150, 50]
`;
  });

  test('Export pistons node to yaml', () => {
    const pistonsNodes = model.getNodesWithName('Pistons');
    expect(pistonsNodes.length).toEqual(1);
    const pistonsNode = pistonsNodes[0];
    const yaml = ModelUtils.exportNodeToYaml(model, pistonsNode, 0);
    expect(yaml).toEqual(expectedYaml);
  });
});

//************************************************************************************************
describe('Export engine node to yaml', () => {
  let model: Model;
  let expectedYaml: string;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);

    expectedYaml =
`- Engine:
  Rect: [0, -100, 150, 50]
  Children:
    - Pistons:
      Rect: [0, -100, 150, 50]
    - Crankshaft:
      Rect: [0, 0, 150, 50]
      Connections:
        - Pistons
`;
  });

  test('Export engine node to yaml', () => {
    const engineNodes = model.getNodesWithName('Engine');
    expect(engineNodes.length).toEqual(1);
    const engineNode = engineNodes[0];
    const yaml = ModelUtils.exportNodeToYaml(model, engineNode, 0);
    expect(yaml).toEqual(expectedYaml);
  });
});

//************************************************************************************************
describe('Export Wheel 1 node to yaml', () => {
  let model: Model;
  let expectedYaml: string;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);

    expectedYaml =
`- Wheel 1:
  Rect: [-200, 0, 150, 50]
  Connections:
    - ../Driveshaft
`;
  });

  test('Export Wheel 1 node to yaml', () => {
    const wheel1Nodes = model.getNodesWithName('Wheel 1');
    expect(wheel1Nodes.length).toEqual(1);
    const wheel1Node = wheel1Nodes[0];
    const yaml = ModelUtils.exportNodeToYaml(model, wheel1Node, 0);
    expect(yaml).toEqual(expectedYaml);
  });
});

//************************************************************************************************
describe('Export to yaml', () => {
  let model: Model;
  let expectedYaml: string;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);

    expectedYaml = 
`- Car:
  Rect: [0, 0, 150, 50]
  Children:
    - Driveshaft:
      Rect: [-200, -100, 150, 50]
      Connections:
        - Engine
        - Engine/Crankshaft
    - Engine:
      Rect: [0, -100, 150, 50]
      Children:
        - Pistons:
          Rect: [0, -100, 150, 50]
        - Crankshaft:
          Rect: [0, 0, 150, 50]
          Connections:
            - Pistons
    - Wheels:
      Rect: [-200, 0, 150, 50]
      Connections:
        - Driveshaft
      Children:
        - Wheel 1:
          Rect: [-200, 0, 150, 50]
          Connections:
            - ../Driveshaft
        - Wheel 2:
          Rect: [0, 0, 150, 50]
          Connections:
            - ../Driveshaft
    - Body:
      Rect: [0, 0, 150, 50]
      Children:
        - Door 1:
          Rect: [-200, 0, 150, 50]
        - Door 2:
          Rect: [0, 0, 150, 50]
`;
  });

  test('Export to yaml', () => {
    const yaml = ModelUtils.exportToYaml(model);
    expect(yaml).toEqual(expectedYaml);
  });
});

//************************************************************************************************
describe('Destroying invalid node should throw an error', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Destroying invalid node should throw an error', () => {
    expect(() => model.destroyNode(123)).toThrow();
  });
});

//************************************************************************************************
describe('Add child on wheel 1 to engine', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Add child on wheel 1 to engine', () => {
    const wheel1Nodes = model.getNodesWithName('Wheel 1');
    expect(wheel1Nodes.length).toEqual(1);
    const wheel1Node = wheel1Nodes[0];
    const engineNodes = model.getNodesWithName('Engine');
    expect(engineNodes.length).toEqual(1);
    const engineNode = engineNodes[0];
    const wheel1Parent = model.getParent(wheel1Node) as number;
    expect(model.getName(wheel1Parent)).toEqual('Wheels');

    model.addChild(engineNode, wheel1Node);

    // wheels should have only one child
    const wheels = model.getNodesWithName('Wheels');
    expect(wheels.length).toEqual(1);
    const wheelsChildren = model.getChildren(wheels[0]);
    expect(wheelsChildren.length).toEqual(1);
    // egine should have three children
    const engineChildren = model.getChildren(engineNode);
    expect(engineChildren.length).toEqual(3);
  });
});

//************************************************************************************************
describe('Get node from connection path', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get crankshaft node from connection path', () => {
    // get the car node
    const carNodes = model.getNodesWithName('Car');
    expect(carNodes.length).toEqual(1);
    const carNode = carNodes[0];
    // path to the crankshaft node
    const path = 'Engine/Crankshaft';
    const node = ModelUtils.getNodeFromConnectionPath(model, carNode, path);
    expect(model.getName(node)).toEqual('Crankshaft');
  });

  test('GetDriveshaft node from connection path', () => {
    // get wheels node
    const wheelsNodes = model.getNodesWithName('Wheels');
    expect(wheelsNodes.length).toEqual(1);
    const wheelsNode = wheelsNodes[0];
    // path to the driveshaft node
    const path = '../Driveshaft';
    const node = ModelUtils.getNodeFromConnectionPath(model, wheelsNode, path);
    expect(model.getName(node)).toEqual('Driveshaft');
  });

  test('Incorrect path should throw an error', () => {
    // get wheels node
    const wheelsNodes = model.getNodesWithName('Wheels');
    expect(wheelsNodes.length).toEqual(1);
    const wheelsNode = wheelsNodes[0];
    // incorrect path
    const path = 'Engine/Crankshaft';
    expect(() => ModelUtils.getNodeFromConnectionPath(model, wheelsNode, path)).toThrow();
  });
});

//************************************************************************************************
describe('Parse yaml line', () => {
  test('Parse car node', () => {
    const line = '- Car:';
    const result = ModelUtils.parseYamlLine(line);
    expect(result).toEqual({ indent: 0, name: '- Car', value: ''});
  });

  test('Parse engine node', () => {
    const line = '  - Engine:';
    const result = ModelUtils.parseYamlLine(line);
    expect(result).toEqual({ indent: 2, name: '- Engine', value: ''});
  });

  test('Parse children node', () => {
    const line = '    - Children:';
    const result = ModelUtils.parseYamlLine(line);
    expect(result).toEqual({ indent: 4, name: '- Children', value: ''});
  });

  test('Parse rect node', () => {
    const line = '- Rect: [0, -100, 150, 50]';
    const result = ModelUtils.parseYamlLine(line);
    expect(result).toEqual({ indent: 0, name: '- Rect', value: '[0, -100, 150, 50]'});
  });
});

//************************************************************************************************
describe('Parse rectangle', () => {
  test('Parse rectangle', () => {
    const rect = '[0, -100, 150, 50]';
    const result = ModelUtils.parseRectangle(rect);
    expect(result).toEqual({ x: 0, y: -100, width: 150, height: 50 });
  });
});

//************************************************************************************************
describe('Create yaml node', () => {
  test('Create node yaml node in root yaml node', () => {
    const node = ModelUtils.createYamlNode(new RootYamlNode(), '- Car', '');
    // expect node to eb of type NodeYamlNode
    const asNodeYamlNode = node as NodeYamlNode;
    expect(asNodeYamlNode.name).toEqual('Car');
  });

  test('Create node yaml node in children yaml node', () => {
    const node = ModelUtils.createYamlNode(new ChildrenYamlNode(), '- Engine', '');
    // expect node to eb of type NodeYamlNode
    const asNodeYamlNode = node as NodeYamlNode;
    expect(asNodeYamlNode.name).toEqual('Engine');
  });

  test('Create node yaml node in rect yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RectangleYamlNode(new Rectangle(0, 0, 0, 0)), '- Engine', '')).toThrow();
  });

  test('Create node yaml node in node yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new NodeYamlNode(''), '- Engine', '')).toThrow();
  });

  test('Create rect yaml node in node yaml node', () => {
    const node = ModelUtils.createYamlNode(new NodeYamlNode(''), 'Rect', '[0, -100, 150, 50]');
    // expect node to eb of type RectYamlNode
    const asRectYamlNode = node as RectangleYamlNode;
    expect(asRectYamlNode.rectangle).toEqual(new Rectangle(0, -100, 150, 50));
  });

  test('Create rect yaml node in root yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RootYamlNode(), 'Rect', '[0, -100, 150, 50]')).toThrow();
  });

  test('Create rect yaml node in children yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new ChildrenYamlNode(), 'Rect', '[0, -100, 150, 50]')).toThrow();
  });

  test('Create rect yaml node in rect yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RectangleYamlNode(new Rectangle(0, 0, 0, 0)), 'Rect', '[0, -100, 150, 50]')).toThrow();
  });

  test('Create rect yaml node in connections yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new ConnectionsYamlNode(), 'Rect', '[0, -100, 150, 50]')).toThrow();
  });

  test('Create children yaml node in node yaml node', () => {
    const node = ModelUtils.createYamlNode(new NodeYamlNode(''), 'Children', '');
    // expect node to eb of type ChildrenYamlNode
    expect(node).toBeInstanceOf(ChildrenYamlNode);
  });

  test('Create children yaml node in root yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RootYamlNode(), 'Children', '')).toThrow();
  });

  test('Create children yaml node in rect yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RectangleYamlNode(new Rectangle(0, 0, 0, 0)), 'Children', '')).toThrow();
  });

  test('Create children yaml node in children yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new ChildrenYamlNode(), 'Children', '')).toThrow();
  });

  test('Create children yaml node in connections yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new ConnectionsYamlNode(), 'Children', '')).toThrow();
  });

  test('Create connections yaml node in node yaml node', () => {
    const node = ModelUtils.createYamlNode(new NodeYamlNode(''), 'Connections', '');
    // expect node to eb of type ConnectionsYamlNode
    expect(node).toBeInstanceOf(ConnectionsYamlNode);
  });

  test('Create connections yaml node in root yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RootYamlNode(), 'Connections', '')).toThrow();
  });

  test('Create connections yaml node in rect yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new RectangleYamlNode(new Rectangle(0, 0, 0, 0)), 'Connections', '')).toThrow();
  });

  test('Create connections yaml node in children yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new ChildrenYamlNode(), 'Connections', '')).toThrow();
  });

  test('Create connections yaml node in connections yaml node should throw an error', () => {
    expect(() => ModelUtils.createYamlNode(new ConnectionsYamlNode(), 'Connections', '')).toThrow();
  });
});

//************************************************************************************************

//************************************************************************************************
describe('Import from yaml', () => {
  test('Import car node with rect', () => {
    const yaml = 
`- Car:
  Rect: [0, 0, 150, 50]`;
    const model = new Model(); 
    ModelUtils.importFromYaml(model, yaml);
    const carNodes = model.getNodesWithName('Car');
    expect(carNodes.length).toEqual(1);
    const carNode = carNodes[0];
    const rect = model.getRectangle(carNode, model.getRoot());
    expect(rect).toEqual(new Rectangle(0, 0, 150, 50));
  });

  test('Import car node with children', () => {
    const yaml =
`- Car:
  Children:
    - Engine:
    - Wheels:
    - Body:`;
    const model = new Model();
    ModelUtils.importFromYaml(model, yaml);
    const carNodes = model.getNodesWithName('Car');
    expect(carNodes.length).toEqual(1);
    const carNode = carNodes[0];
    const children = model.getChildren(carNode);
    expect(children.length).toEqual(3);
    expect(model.getName(children[0])).toEqual('Engine');
    expect(model.getName(children[1])).toEqual('Wheels');
    expect(model.getName(children[2])).toEqual('Body');
  });

  test('Import car node with children with connections', () => {
    const yaml =
`- Car:
  Children:
    - Engine:
      Connections:
        - Wheels
        - Body
    - Wheels:
      Connections:
        - Body
    - Body:`
    const model = new Model();
    ModelUtils.importFromYaml(model, yaml);
    const carNodes = model.getNodesWithName('Car');
    expect(carNodes.length).toEqual(1);
    const engineNodes = model.getNodesWithName('Engine');
    expect(engineNodes.length).toEqual(1);
    const engineNode = engineNodes[0];
    const wheelsNodes = model.getNodesWithName('Wheels');
    expect(wheelsNodes.length).toEqual(1);
    const wheelsNode = wheelsNodes[0];
    const bodyNodes = model.getNodesWithName('Body');
    expect(bodyNodes.length).toEqual(1);
    const engineConnections = model.getConnections(engineNode);
    expect(engineConnections.length).toEqual(2);
    // connections are not ordered
    let wheelsConnection = engineConnections.find(
      connection => model.getName(connection.to) === 'Wheels' && model.getName(connection.from) === 'Engine'
    );
    expect(wheelsConnection).not.toBeNull();
    let bodyConnection = engineConnections.find(
      connection => model.getName(connection.to) === 'Body' && model.getName(connection.from) === 'Engine'
    );
    expect(bodyConnection).not.toBeNull();
    const wheelsConnections = model.getConnections(wheelsNode);
    expect(wheelsConnections.length).toEqual(2);
    // connections are not ordered
    let bodyConnection2 = wheelsConnections.find(
      connection => model.getName(connection.to) === 'Body' && model.getName(connection.from) === 'Wheels'
    );
    expect(bodyConnection2).not.toBeNull();
    let engineConnection = wheelsConnections.find(
      connection => model.getName(connection.to) === 'Wheels' && model.getName(connection.from) === 'Engine'
    );
    expect(engineConnection).not.toBeNull();
  });

  test('Import sample graph, eport it and compare the yaml', () => {
    const model = new Model();
    const originalYaml =
`- Car:
  Rect: [0, 0, 150, 50]
  Children:
    - Driveshaft:
      Rect: [-200, -100, 150, 50]
      Connections:
        - Engine
        - Engine/Crankshaft
    - Engine:
      Rect: [0, -100, 150, 50]
      Children:
        - Pistons:
          Rect: [0, -100, 150, 50]
        - Crankshaft:
          Rect: [0, 0, 150, 50]
          Connections:
            - Pistons
    - Wheels:
      Rect: [-200, 0, 150, 50]
      Connections:
        - Driveshaft
      Children:
        - Wheel 1:
          Rect: [-200, 0, 150, 50]
          Connections:
            - ../Driveshaft
        - Wheel 2:
          Rect: [0, 0, 150, 50]
          Connections:
            - ../Driveshaft
    - Body:
      Rect: [0, 0, 150, 50]
      Children:
        - Door 1:
          Rect: [-200, 0, 150, 50]
        - Door 2:
          Rect: [0, 0, 150, 50]
`;

    ModelUtils.importFromYaml(model, originalYaml);
    const exportedYaml = ModelUtils.exportToYaml(model);
    expect(exportedYaml).toEqual(originalYaml);
  });
});