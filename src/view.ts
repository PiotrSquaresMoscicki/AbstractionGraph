import { ViewModel, IViewModelObserver } from './view_model';
import { Connection, Rectangle } from './model';
import { IViewContext, IViewController, IViewControllerObserver } from './controller';
import { NodeHoverController } from './controllers/node_hover';
import { NodeSelectionController } from './controllers/node_selection';
import { ViewportMoveController } from './controllers/viewport_move';
import { ConnectionCreationController } from './controllers/connection_creation';
import { NodeMoveController } from './controllers/node_move';
import { ViewportZoomController } from './controllers/viewport_zoom';
import { NodeCreationAndRenameController } from './controllers/node_creation_and_rename';
import { NodeAndConnectionRemovalController } from './controllers/node_and_connection_removal';
import { ConnectionHoverController } from './controllers/connection_hover';
import { ConnectionSelectionController } from './controllers/connection_selection';

export class View implements IViewModelObserver, IViewContext, IViewControllerObserver {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    this.viewModel = viewModel;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // register as observer
    this.viewModel.registerObserver(this as IViewModelObserver);
    this.viewModel.setViewportSize({ width: window.innerWidth, height: window.innerHeight });

    // create controllers
    this.controllers.push(new NodeHoverController(this.viewModel));
    this.controllers.push(new NodeSelectionController(this.viewModel));
    this.controllers.push(new ViewportMoveController(this.viewModel));
    this.controllers.push(new ConnectionCreationController(this.viewModel));
    this.controllers.push(new NodeMoveController(this.viewModel));
    this.controllers.push(new ViewportZoomController(this.viewModel));
    this.controllers.push(new NodeCreationAndRenameController(this.viewModel, this.canvas));
    this.controllers.push(new NodeAndConnectionRemovalController(this.viewModel));
    this.controllers.push(new ConnectionHoverController(this.viewModel, this));
    this.controllers.push(new ConnectionSelectionController(this.viewModel));

    // register as observer of controllers
    this.controllers.forEach(controller => controller.registerObserver(this));

    // add event listeners
    // redraw on resize
    window.addEventListener('resize', () => this.viewModel.setViewportSize({ width: window.innerWidth, height: window.innerHeight }));
    
    // mouse events
    canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
    canvas.addEventListener('mousemove', (event) => this.onEvent(controller => controller.onMouseMove(event)));
    canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
    canvas.addEventListener('wheel', (event) => this.onEvent(controller => controller.onWheel(event)));

    // keyboard events
    window.addEventListener('keydown', (event) => this.onEvent(controller => controller.onKeydown(event)));
    window.addEventListener('keyup', (event) => this.onEvent(controller => controller.onKeyup(event)));
    
    // disable native context menu
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  draw(): void {
    // set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // draw background
    this.ctx.fillStyle = this.viewModel.getViewStyle().backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // draw grid
    this.drawGrid();

    // get displayed parent
    const displayedParent = this.viewModel.getDisplayedParent();
    // get children
    // for each child draw its node and outgoing connections
    // draw nodes in rvers order so that the first node is drawn on top of the last node
    const visibleNodes = this.viewModel.getVisibleNodes();
    const children = this.viewModel.getModel().getChildren(displayedParent).reverse();
    // outer connection nodes are visibleNodes that are not children
    const outerConnectionNodes = visibleNodes.filter(node => !children.includes(node));
    const visibleConnections = this.viewModel.getVisibleConnections();

    // draw connections
    visibleConnections.forEach(connection => {
      this.drawConnection(connection);
    });
    // draw inner nodes
    children.forEach(child => {
      this.drawNode(child, this.viewModel.getViewStyle().nodeColor);
    });
    // draw outer nodes
    outerConnectionNodes.forEach(node => {
      this.drawNode(node, this.viewModel.getViewStyle().outerNodeColor);
    });

    // for each controller draw its stuff
    this.controllers.forEach(controller => controller.onDraw(this));
  }

  // Private methods
  private drawGrid(): void {
    // get view port position
    const viewportPosition = this.viewModel.getViewportPosition();
    // get grid size
    const gridSize = this.viewModel.getGridSize();
    // get canvas size
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    // get starting position of grid
    const startingPosition = { x: -viewportPosition.x % gridSize, y: -viewportPosition.y % gridSize };
    // draw small step grid
    this.ctx.strokeStyle = this.viewModel.getViewStyle().smallStepGridColor;
    this.ctx.lineWidth = 1;
    for (var x = startingPosition.x; x < canvasWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    for (var y = startingPosition.y; y < canvasHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvasWidth, y);
      this.ctx.stroke();
    }
    // draw big step grid
    this.ctx.strokeStyle = this.viewModel.getViewStyle().bigStepGridColor;
    this.ctx.lineWidth = 2;
    const bigStepStartingPosition = { x: -viewportPosition.x % (gridSize * 5), y: -viewportPosition.y % (gridSize * 5) };
    for (var x = bigStepStartingPosition.x; x < canvasWidth; x += gridSize * 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    for (var y = bigStepStartingPosition.y; y < canvasHeight; y += gridSize * 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvasWidth, y);
      this.ctx.stroke();
    }
  }

  private drawNode(index: number, nodeColor: string): void {
    // get rectangle
    const rectangle = this.viewModel.getRectangleInViewport(index);
    // fill rect
    this.ctx.fillStyle = nodeColor;
    this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    // draw rectangle frame (use different color if node is selected)
    if (this.viewModel.getSelectedNodes().includes(index)) {
      this.ctx.strokeStyle = this.viewModel.getViewStyle().nodeSelectedBorderColor;
    }
    else {
      this.ctx.strokeStyle = this.viewModel.getViewStyle().nodeBorderColor;
    }
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    // draw hover rectangle with one pixel bigger in every direction
    if (this.viewModel.getHoveredNode() === index) {
      this.ctx.strokeStyle = this.viewModel.getViewStyle().nodeHoveredBorderColor;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(rectangle.x - 1, rectangle.y - 1, rectangle.width + 2, rectangle.height + 2);
    }

    // skip drawing name of node is renamed
    if (index !== this.viewModel.getRenamedNode()) {
      // get name
      const name = this.viewModel.getModel().getName(index);
      // draw name
      const textSize = this.viewModel.getViewStyle().textSize * this.viewModel.getZoom();
      this.ctx.fillStyle = this.viewModel.getViewStyle().nodeTextColor;
      this.ctx.font = `${textSize}px ${this.viewModel.getViewStyle().textFont}`;
      const textPosx = rectangle.x + rectangle.width / 2 - this.ctx.measureText(name).width / 2;
      const textPosy = rectangle.y + rectangle.height / 2 + textSize / 3.5;
      this.ctx.fillText(name, textPosx, textPosy);
    }
  }

  private drawConnection(connection: Connection): void {
    // get connection color
    var connectionColor = this.viewModel.getViewStyle().connectionColor;
    if (this.viewModel.getHoveredConnection() === connection) {
      connectionColor = this.viewModel.getViewStyle().connectionHoveredColor;
    } else
    if (this.viewModel.getSelectedConnections().includes(connection)) {
      connectionColor = this.viewModel.getViewStyle().connectionSelectedColor;
    } 

    // get connection width
    var connectionWidth = 1;
    if (this.viewModel.getHoveredConnection() === connection) {
      connectionWidth = 3;
    } else
    if (this.viewModel.getSelectedConnections().includes(connection)) {
      connectionWidth = 2;
    }

    // get from rectangle
    var fromRectangle = this.viewModel.getRectangleInViewport(connection.from);
    // get to rectangle
    var toRectangle = this.viewModel.getRectangleInViewport(connection.to);
    // don't draw if rectangles are overlapping
    if (fromRectangle.x + fromRectangle.width >= toRectangle.x && fromRectangle.y + fromRectangle.height >= toRectangle.y
        && fromRectangle.x <= toRectangle.x + toRectangle.width && fromRectangle.y <= toRectangle.y + toRectangle.height) {
      return;
    }
    // connection should start and end on the edges of rectangles
    // get from edge
    const fromConnectionPoint = this.getConnectionPoint(fromRectangle, toRectangle);
    // get to edge
    const toConnectionPoint = this.getConnectionPoint(toRectangle, fromRectangle);
    // draw connection
    this.drawConnectionLine(fromConnectionPoint, toConnectionPoint, connectionColor, connectionWidth);
  }

  private getIntersection(line1: { startx: number, starty: number, endx: number, endy: number }, 
      line2: { startx: number, starty: number, endx: number, endy: number }): { x: number, y: number } | null {
    const denominator = (line2.endy - line2.starty) * (line1.endx - line1.startx) - (line2.endx - line2.startx) * (line1.endy - line1.starty);
    if (denominator === 0) {
      return null;
    }
    var a = line1.starty - line2.starty;
    var b = line1.startx - line2.startx;
    const numerator1 = (line2.endx - line2.startx) * a - (line2.endy - line2.starty) * b;
    const numerator2 = (line1.endx - line1.startx) * a - (line1.endy - line1.starty) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;
    // if sections are not intersecting then return null
    if (a < 0 || a > 1 || b < 0 || b > 1) {
      return null;
    }
    // calculate intersection point
    const x = line1.startx + a * (line1.endx - line1.startx);
    const y = line1.starty + a * (line1.endy - line1.starty);
    return { x: x, y: y };
  }

  private onMouseDown(event: MouseEvent): void {
    this.onEvent(controller => controller.onMouseDown(event));
    // call onDblPress on all controllers if mouse is pressed twice in a short time
    if (Date.now() - this.lastPressTime < this.doublePressThreshold) {
      this.onEvent(controller => controller.onDblPress(event));
    }
    this.lastPressTime = Date.now();
  }

  private onMouseUp(event: MouseEvent): void {
    this.onEvent(controller => controller.onMouseUp(event));
    // call onDblClick on all controllers if mouse is released twice in a short time
    if (Date.now() - this.lastClickTime < this.doubleClickThreshold) {
      this.onEvent(controller => controller.onDblClick(event));
    }
    this.lastClickTime = Date.now();
  }

  // Generic function for controlling active controller. Takes lambda as a parameter and calls it 
  // on controllers until one of them becomes active. Then it stops calling the lambda and sets the
  // active controller.
  // This function is used by event handlers.
  private onEvent(lambda: (controller: IViewController) => void): void {
    // if there is an active controller then pass the event to it
    if (this.activeController !== null) {
      lambda(this.activeController);
      // we also check for null because inside this lambda we may trigger modelCHanged event which 
      // can do the job for us
      if (this.activeController !== null && !this.activeController.isActive()) {
        this.activeController = null;
      }
      return;
    }
    // if there is no active controller then pass the event to all controllers until one of them 
    // becomes active - then we stop passing the event to other controllers
    for (let controller of this.controllers) {
      lambda(controller);
      if (controller.isActive()) {
        this.activeController = controller;
        // notify other controllers that one of them became active
        this.controllers.forEach(otherController => {
          if (otherController !== controller) {
            otherController.onOtherControllerActivated();
          }
        });
        break;
      }
    }
  }

  // IViewControllerObserver
  onControllerActivated(controller: IViewController): void {
    // if controller is active then cancel activation of other controllers
    if (controller.isActive()) {
      this.activeController = controller;
      this.controllers.forEach(otherController => {
        if (otherController !== controller) {
          otherController.onOtherControllerActivated();
        }
      });
    }
  }

  onRedrawRequested(): void {
    this.draw();
  }
  // end IViewControllerObserver

  // IViewContext
  getContext(): CanvasRenderingContext2D { return this.ctx; }

  drawConnectionLine(from: { x: number, y: number }, to: { x: number, y: number }, connectionColor: string, connectionWidth: number): void {
    // draw line
    this.ctx.lineWidth = connectionWidth;
    this.ctx.strokeStyle = connectionColor;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    // draw arrow (filled triangle with proper orientation)
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = this.viewModel.getViewStyle().connectionArrowLength;
    this.ctx.fillStyle = connectionColor;
    this.ctx.beginPath();
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(to.x - arrowLength * Math.cos(angle - Math.PI / 6), to.y - arrowLength * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(to.x - arrowLength * Math.cos(angle + Math.PI / 6), to.y - arrowLength * Math.sin(angle + Math.PI / 6));
    this.ctx.lineTo(to.x, to.y);
    this.ctx.fill();
  }

  getConnectionPoint(fromRectangle: Rectangle, toRectangle: Rectangle): { x: number, y: number } {
    // get center of from rectangle
    const fromCenter = { x: fromRectangle.x + fromRectangle.width / 2, y: fromRectangle.y + fromRectangle.height / 2 };
    // get center of to rectangle
    const toCenter = { x: toRectangle.x + toRectangle.width / 2, y: toRectangle.y + toRectangle.height / 2 };
    // get intersection point of line from fromCenter to toCenter and fromRectangle
    const connectionLine = { startx: fromCenter.x, starty: fromCenter.y, endx: toCenter.x, endy: toCenter.y };
    const fromRectangleTop = { startx: fromRectangle.x, starty: fromRectangle.y, endx: fromRectangle.x + fromRectangle.width, endy: fromRectangle.y };
    const fromRectangleBottom = { startx: fromRectangle.x, starty: fromRectangle.y + fromRectangle.height, endx: fromRectangle.x + fromRectangle.width, endy: fromRectangle.y + fromRectangle.height };
    const fromRectangleLeft = { startx: fromRectangle.x, starty: fromRectangle.y, endx: fromRectangle.x, endy: fromRectangle.y + fromRectangle.height };
    const fromRectangleRight = { startx: fromRectangle.x + fromRectangle.width, starty: fromRectangle.y, endx: fromRectangle.x + fromRectangle.width, endy: fromRectangle.y + fromRectangle.height };

    const intersectionTop = this.getIntersection(connectionLine, fromRectangleTop);
    const intersectionBottom = this.getIntersection(connectionLine, fromRectangleBottom);
    const intersectionLeft = this.getIntersection(connectionLine, fromRectangleLeft);
    const intersectionRight = this.getIntersection(connectionLine, fromRectangleRight);

    // find intersection that is closest to toCenter
    const intersections = [intersectionTop, intersectionBottom, intersectionLeft, intersectionRight];
    const distances = intersections.map(intersection => intersection === null 
      ? Infinity 
      : Math.sqrt(Math.pow(toCenter.x - intersection.x, 2) + Math.pow(toCenter.y - intersection.y, 2)));
    const minDistance = Math.min(...distances);
    const index = distances.indexOf(minDistance);
    const intersection = intersections[index] as { x: number, y: number };
    // if intersection is null then move from rectangle one pixel to the right and try again
    if (intersection === null) {
      fromRectangle.x += 1;
      return this.getConnectionPoint(fromRectangle, toRectangle);
    }
    else
    {
      return intersection;
    }
  }

  // end IViewContext

  // IViewModelObserver
  onModelChanged(): void {
    this.onEvent(controller => controller.onModelChanged());
    this.draw();
  }

  onNodeCreated(_index: number): void {}
  onNodeDestroyed(_index: number): void {}
  onNodeNameChanged(_index: number): void {}
  onNodeRectangleChanged(_index: number): void {}
  onNodeChildAdded(_parent: number, _child: number): void {}
  onNodeChildRemoved(_parent: number, _child: number): void {}
  onConnectionAdded(_from: number, _to: number): void {}
  onConnectionRemoved(_from: number, _to: number): void {}
  onViewStyleChanged(): void {}
  onDisplayedParentChanged(): void {}
  onViewportSizeChanged(): void {}
  onHoveredNodeChanged(): void {}
  onHoveredConnectionChanged(): void {}
  onSelectedNodesChanged(): void {}
  onSelectedConnectionsChanged(): void {}
  onRenamedNodeChanged(): void {}
  onGridSizeChanged(): void {}
  onViewportPositionChanged(): void {}
  onZoomChanged(): void {}
  // end IViewModelObserver

  // Private members
  private viewModel: ViewModel;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // if there is an active controller it will receive all events
  // if there is no active controller then all events will be passed to all controllers until one 
  // of them becomes active
  private controllers: IViewController[] = [];
  private activeController: IViewController | null = null;

  private doublePressThreshold: number = 500;
  private doubleClickThreshold: number = 500;
  private lastPressTime: number = 0;
  private lastClickTime: number = 0;
}
