// Abstraction graph is an app that allows users to create graphs consisting of nodes and edges 
// with ability to manually cluster nodes into groups that represent abstractions. This way the 
// graph can become more readable and easier to understand.

// Example:
// We can tty and represent tht dependencies between parts of the car (engine, wheels, body) as a
// graph. The car itself is a node that contains a graph of its parts. The parts are nodes that
// contain a graph of their components. The components are nodes that contain a graph of their 
// smaller components and so on. The smallest components are nodes that do not contain any graphs.
// So the graph would look like this:
// Car
//  Driveshaft
//  Engine
//    Pistons
//    Crankshaft
//  Wheels
//    Wheel 1
//    Wheel 2
//  Body
//    Door 1
//    Door 2
// Using a tree structure we can only represent "contains" relationships. Using a graph we can
// represent "contains" and "is connected to" relationships. This way we can represent dependencies
// between parts of the car. For example the engine is connected to the frame using engine mounts.
// The wheels are connected to the frame using wheel mounts. The body is connected to the frame
// using body mounts. The engine is connected to the wheels using the crankshaft.

// Definitions:
// Graph - a set of nodes and connections between them
// Connection - connection between two nodes
// Node - vertex of the graph that can be connected to other vertices but also can contain an inner
//    graph
// Inner Graph - a graph that is contained within a node. Node containing a graph represents an 
//    abstraction of the inner graph. Nodes from the inner graph can be connected to nodes outside
//    of the inner graph creating outer connections (connections to siblings of the node containing
//    the inner graph)
// Abstraction - a node that contains an inner graph that is not empty

// The app uses model, view, view model (MVVM) architecture.
// Controllers are extensions to the View representing states of the view.

import { ViewModel } from './view_model';
import { Model, ModelUtils, Rectangle } from './model';
import { View } from './view';

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
function createSampleGraph(model: Model) {
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

var model = new Model();
var viewModel = new ViewModel(model);
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
var view = new View(viewModel, canvas);

// create sample graph
const root = model.getRoot();


createSampleGraph(model);

// set root as current displayed parent
viewModel.setDisplayedParent(root);

// draw
view.draw();
