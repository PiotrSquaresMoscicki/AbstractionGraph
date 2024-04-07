import { ViewModel } from '../view_model';
import { BaseController } from '../controller';
import { Rectangle } from '../model';

export class NodeMoveController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    this.startingCursorPosition = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event: MouseEvent): void {
    // if controller is not active, mouse is moving, LMB is pressed and any node is selected then set controller active
    // give user 5 px of tolerance
    if (!this.active && event.buttons === 1 && this.viewModel.getSelectedNodes().length > 0
      && (Math.abs(event.clientX - this.startingCursorPosition.x) > 5
      || Math.abs(event.clientY - this.startingCursorPosition.y) > 5)) 
    {
      this.active = true;
      this.startingCursorPosition = { x: event.clientX, y: event.clientY };
      this.startingRectangles = this.viewModel.getSelectedNodes().map(node => this.viewModel.getRectangleInViewport(node));
      this.draggedNodes = this.viewModel.getSelectedNodes().slice();
    } else if (this.active) {
      // move node
      const deltaX = event.clientX - this.startingCursorPosition.x;
      const deltaY = event.clientY - this.startingCursorPosition.y;
      this.draggedNodes.forEach((node, index) => {
        const rectangle = this.startingRectangles[index];
        const newRectangle = new Rectangle(rectangle.x + deltaX, rectangle.y + deltaY, rectangle.width, rectangle.height);
        this.viewModel.setRectangleInViewport(node, newRectangle);
      });
    }
  }

  onMouseUp(_event: MouseEvent): void {
    this.active = false;
    this.startingCursorPosition = { x: 0, y: 0 };
    this.startingRectangles = [];
    this.draggedNodes = [];
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private draggedNodes: number[] = [];
  private startingCursorPosition: { x: number, y: number } = { x: 0, y: 0 };
  private startingRectangles: Rectangle[] = [];
}
