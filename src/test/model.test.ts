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
