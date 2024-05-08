import { Model } from '../model';
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