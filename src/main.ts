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
//   Engine
//     Pistons
//       Piston Rings
//         Piston Ring 1
//         Piston Ring 2
//       Piston Rod
//         Piston Rod 1
//         Piston Rod 2
//     Crankshaft
//       Crankshaft 1
//       Crankshaft 2
//   Wheels
//     Wheel 1
//     Wheel 2
//   Body
//     Door 1
//     Door 2
//     Roof
//       Roof Window
//       Roof Window Frame
//       Roof Window Frame Glass
//     Trunk
//       Trunk Door
//       Trunk Door Handle
//       Trunk Door Lock
//  Frame
//    Engine Mount
//    Wheel Mount
//    Body Mount
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
import { Model, Rectangle } from './model';
import { View } from './view';

var model = new Model();
var viewModel = new ViewModel(model);
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
var view = new View(viewModel, canvas);

// create sample graph
const root = model.getRoot();

const engine = model.createNode();
model.setName(engine, 'Engine');
model.setRectangle(engine, new Rectangle(450, 450, 100, 50), root);
model.addChild(root, engine);

  const crankshaft = model.createNode();
  model.setName(crankshaft, 'Crankshaft');
  model.setRectangle(crankshaft, new Rectangle(450, 0, 100, 50), engine);
  model.addChild(engine, crankshaft);

  const pistons = model.createNode();
  model.setName(pistons, 'Pistons');
  model.setRectangle(pistons, new Rectangle(50, 50, 100, 50), engine);
  model.addChild(engine, pistons);

    const piston1 = model.createNode();
    model.setName(piston1, 'Piston 1');
    model.setRectangle(piston1, new Rectangle(50, 0, 100, 50), pistons);
    model.addChild(pistons, piston1);

      const connectingRod1 = model.createNode();
      model.setName(connectingRod1, 'Connecting rod 1');
      model.setRectangle(connectingRod1, new Rectangle(50, 50, 100, 50), piston1);
      model.addChild(piston1, connectingRod1);

    const piston2 = model.createNode();
    model.setName(piston2, 'Piston 2');
    model.setRectangle(piston2, new Rectangle(50, 100, 100, 50), pistons);
    model.addChild(pistons, piston2);
    
      const connectingRod2 = model.createNode();
      model.setName(connectingRod2, 'Connecting rod 2');
      model.setRectangle(connectingRod2, new Rectangle(50, 50, 100, 50), piston2);
      model.addChild(piston2, connectingRod2);

    const piston3 = model.createNode();
    model.setName(piston3, 'Piston 3');
    model.setRectangle(piston3, new Rectangle(50, 200, 100, 50), pistons);
    model.addChild(pistons, piston3);
          
      const connectingRod3 = model.createNode();
      model.setName(connectingRod3, 'Connecting rod 3');
      model.setRectangle(connectingRod3, new Rectangle(50, 50, 100, 50), piston3);
      model.addChild(piston3, connectingRod3);

    const piston4 = model.createNode();
    model.setName(piston4, 'Piston 4');
    model.setRectangle(piston4, new Rectangle(50, 300, 100, 50), pistons);
    model.addChild(pistons, piston4);

      const connectingRod4 = model.createNode();
      model.setName(connectingRod4, 'Connecting rod 4');
      model.setRectangle(connectingRod4, new Rectangle(50, 50, 100, 50), piston4);
      model.addChild(piston4, connectingRod4);

const wheels = model.createNode();
model.setName(wheels, 'Wheels');
model.setRectangle(wheels, new Rectangle(450, 50, 100, 50), root);
model.addChild(root, wheels);

  const frontLeftWheel = model.createNode();
  model.setName(frontLeftWheel, 'Front left wheel');
  model.setRectangle(frontLeftWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, frontLeftWheel);

  const frontRightWheel = model.createNode();
  model.setName(frontRightWheel, 'Front right wheel');
  model.setRectangle(frontRightWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, frontRightWheel);

  const backLeftWheel = model.createNode();
  model.setName(backLeftWheel, 'Back left wheel');
  model.setRectangle(backLeftWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, backLeftWheel);

  const backRightWheel = model.createNode();
  model.setName(backRightWheel, 'Back right wheel');
  model.setRectangle(backRightWheel, new Rectangle(50, 50, 100, 50), wheels);
  model.addChild(wheels, backRightWheel);

const body = model.createNode();
model.setName(body, 'Body');
model.setRectangle(body, new Rectangle(50, 50, 100, 50), root);
model.addChild(root, body);

const underbody = model.createNode();
model.setName(underbody, 'Underbody');
model.setRectangle(underbody, new Rectangle(450, 250, 100, 50), root);
model.addChild(root, underbody);

  const driveShaft = model.createNode();
  model.setName(driveShaft, 'Drive shaft');
  model.setRectangle(driveShaft, new Rectangle(50, 50, 100, 50), underbody);
  model.addChild(underbody, driveShaft);



// add connections
model.addConnection(engine, underbody);
model.addConnection(wheels, underbody);
model.addConnection(body, underbody);

model.addConnection(wheels, driveShaft);
model.addConnection(engine, driveShaft);


// set root as current displayed parent
viewModel.setDisplayedParent(root);

// draw
view.draw();
