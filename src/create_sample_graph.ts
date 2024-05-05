import { Model, ModelUtils } from './model';

// sample graph will repreent a simple car where the abstractions go as follows:
// Car
//   Driveshaft
//   Engine
//     Pistons
//     Crankshaft
//   Wheels
//     Wheel 1
//     Wheel 2
//   Body
//     Door 1
//     Door 2
//     
// Connections represent physical dependencies between parts of the car:
// - Crankshaft -> Pistons
// - Driveshaft -> Cranckshaft
// - Wheel 1 -> Driveshaft
// - Wheel 2 -> Driveshaft

export function createSampleGraph(model: Model) {
  const root = model.getRoot();

  const car = ModelUtils.createNode(model, 'Car', { x: 0, y: 0, width: 150, height: 50 }, root);
  const driveshaft = ModelUtils.createNode(model, 'Driveshaft', { x: -200, y: -100, width: 150, height: 50 }, car);
  const engine = ModelUtils.createNode(model, 'Engine', { x: 0, y: -100, width: 150, height: 50 }, car);
  const pistons = ModelUtils.createNode(model, 'Pistons', { x: 0, y: -100, width: 150, height: 50 }, engine);
  const crankshaft = ModelUtils.createNode(model, 'Crankshaft', { x: 0, y: 0, width: 150, height: 50 }, engine);
  const wheels = ModelUtils.createNode(model, 'Wheels', { x: -200, y: 0, width: 150, height: 50 }, car);
  const wheel1 = ModelUtils.createNode(model, 'Wheel 1', { x: -200, y: 0, width: 150, height: 50 }, wheels);
  const wheel2 = ModelUtils.createNode(model, 'Wheel 2', { x: 0, y: 0, width: 150, height: 50 }, wheels);
  const body = ModelUtils.createNode(model, 'Body', { x: 0, y: 0, width: 150, height: 50 }, car);
  ModelUtils.createNode(model, 'Door 1', { x: -200, y: 0, width: 150, height: 50 }, body);
  ModelUtils.createNode(model, 'Door 2', { x: 0, y: 0, width: 150, height: 50 }, body);

  model.addConnection(crankshaft, pistons);
  model.addConnection(driveshaft, engine);
  model.addConnection(driveshaft, crankshaft);
  model.addConnection(wheels, driveshaft);
  model.addConnection(wheel1, driveshaft);
  model.addConnection(wheel2, driveshaft);
}
