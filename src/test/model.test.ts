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