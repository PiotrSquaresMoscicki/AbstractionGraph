import { Model, ModelUtils } from '../model';
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
describe('Non existing node name should be equal to an empty string', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Non existing node name should be equal to an empty string', () => {
    expect(model.getName(123)).toEqual('');
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
describe('Get children of a non-existing node should return an empty array', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get children of a non-existing node should return an empty array', () => {
    const children = model.getChildren(123);
    expect(children.length).toEqual(0);
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
describe('Get parent of a non-existing node should return null', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get parent of a non-existing node should return null', () => {
    const parent = model.getParent(123);
    expect(parent).toBeNull();
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
describe('Get outgoing connections for a non-existing node should return an empty array', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get outgoing connections for a non-existing node should return an empty array', () => {
    const connections = model.getOutgoingConnections(123);
    expect(connections.length).toEqual(0);
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
describe('Get incoming connections for a non-existing node should return an empty array', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get incoming connections for a non-existing node should return an empty array', () => {
    const connections = model.getIncomingConnections(123);
    expect(connections.length).toEqual(0);
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
describe('Get all connections for a non-existing node should return an empty array', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    createSampleGraph(model);
  });

  test('Get all connections for a non-existing node should return an empty array', () => {
    const connections = model.getConnections(123);
    expect(connections.length).toEqual(0);
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
