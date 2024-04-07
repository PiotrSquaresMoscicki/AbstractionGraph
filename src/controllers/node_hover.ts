import { ViewModel } from '../view_model';
import { BaseController } from '../controller';

export class NodeHoverController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onModelChanged(): void {
    // get cursor position
    const cursorPosition = { x: this.lastEvent.clientX, y: this.lastEvent.clientY };
    // if mouse is moving then update hovered node
    this.updateHoveredNode(cursorPosition);
  }

  onMouseMove(event: MouseEvent): void {
    // save event
    this.lastEvent = event;
    // if mouse is moving then update hovered node
    this.updateHoveredNode({ x: event.clientX, y: event.clientY });
  }

  private updateHoveredNode(cursorPosition: { x: number, y: number }): void {
    // if mouse is hovered over a node then set it as hovered node
    const visibleNodes = this.viewModel.getVisibleNodes();
    const rectangles = visibleNodes.map(child => this.viewModel.getRectangleInViewport(child));
    const index = rectangles.findIndex(rectangle => cursorPosition.x >= rectangle.x 
        && cursorPosition.x <= rectangle.x + rectangle.width 
        && cursorPosition.y >= rectangle.y 
        && cursorPosition.y <= rectangle.y + rectangle.height);
    if (index !== -1) {
      this.viewModel.setHoveredNode(visibleNodes[index]);
    } else {
      this.viewModel.setHoveredNode(-1);
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private lastEvent: MouseEvent = new MouseEvent('mousemove');
}