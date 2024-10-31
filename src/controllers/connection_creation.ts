import { ViewModel } from '../view_model';
import { BaseController, IViewContext } from '../controller';
import { Rectangle } from '../model';

// when cursor is moved after double click we start creating a connection from the selected node 
// to the cursor
export class ConnectionCreationController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onAnotherControllerActivated(): void {
    // if controller is active then finish connection
    if (this.active) {
      this.finishConnection();
    }
    this.readyForActivation = false;
  }

  onDraw(viewContext: IViewContext): void {
    if (this.active) {
      // draw connection lines from all selected nodes to the mouse cursor
      const selectedNodes = this.viewModel.getSelectedNodes();
      const mousePosition = { x: this.lastMouseMoveEvent.clientX, y: this.lastMouseMoveEvent.clientY };
      // get node under cursor if any
      const visibleNodes = this.viewModel.getVisibleNodes();
      const rectangles = visibleNodes.map(child => this.viewModel.getRectangleInViewport(child));
      const index = rectangles.findIndex(rectangle => mousePosition.x >= rectangle.x 
          && mousePosition.x <= rectangle.x + rectangle.width 
          && mousePosition.y >= rectangle.y 
          && mousePosition.y <= rectangle.y + rectangle.height);
      // if no rectangle is hovered generate 2x2 rect with the center at the mouse position
      const hoveredRectangle = index === -1 ? new Rectangle(mousePosition.x - 1, mousePosition.y - 1, 2, 2) : rectangles[index];
      
      selectedNodes.forEach(node => {
        if (node === visibleNodes[index]) {
          return;
        }

        const nodeRectangle = this.viewModel.getRectangleInViewport(node);
        const from = viewContext.getConnectionPoint(nodeRectangle, hoveredRectangle);
        const to = viewContext.getConnectionPoint(hoveredRectangle, nodeRectangle);
        viewContext.drawConnectionLine(from, to, this.viewModel.getViewStyle().connectionColor, 1);
      });
    }
  }
  
  onDblPress(_event: MouseEvent): void {
    // if controller is not active and any node is selected then set controller active
    if (!this.active && this.viewModel.getSelectedNodes().length > 0) {
      this.readyForActivation = true;
    }
  }

  onMouseMove(_event: MouseEvent): void {
    if (this.readyForActivation) {
      this.active = true;
    }

    if (this.active) {
      // save event
      this.lastMouseMoveEvent = _event;
      // request redraw
      this.observers.forEach(observer => observer.onRedrawRequested());
    }
  }

  onMouseUp(_event: MouseEvent): void {
    if (this.active) {
      // if mouse is released after double click then finish connection
      this.finishConnection();
    }
    this.readyForActivation = false;
  }

  // End IViewController

  // Private functions

  private finishConnection(): void {
    // get hovered node (but not from model as hover controller is not active when this controller
    // is active)
    const visibleNodes = this.viewModel.getVisibleNodes();
    const rectangles = visibleNodes.map(child => this.viewModel.getRectangleInViewport(child));
    const index = rectangles.findIndex(rectangle => this.lastMouseMoveEvent.clientX >= rectangle.x 
        && this.lastMouseMoveEvent.clientX <= rectangle.x + rectangle.width 
        && this.lastMouseMoveEvent.clientY >= rectangle.y 
        && this.lastMouseMoveEvent.clientY <= rectangle.y + rectangle.height);
    const hoveredNode = index === -1 ? -1 : visibleNodes[index];
    // if hovered node is not -1 then create connection
    if (hoveredNode !== -1) {
      // get selected nodes
      const selectedNodes = this.viewModel.getSelectedNodes();
      // for each selected node create connection
      selectedNodes.forEach(node => {
        // don't allow for creating connections between two outer nodes
        const nodeParent = this.viewModel.getModel().getParent(node);
        const hoveredNodeParent = this.viewModel.getModel().getParent(hoveredNode);
        const displayedParentParent = this.viewModel.getModel().getParent(this.viewModel.getDisplayedParent());
        if (nodeParent !== displayedParentParent || hoveredNodeParent !== displayedParentParent) {
          this.viewModel.getModel().addConnection(node, hoveredNode);
        }
      });
    }
    // set controller inactive
    this.active = false;
    this.readyForActivation = false;
  }

  // Private members
  private viewModel: ViewModel;
  private readyForActivation: boolean = false;
  private lastMouseMoveEvent: MouseEvent = new MouseEvent('mousemove');
}