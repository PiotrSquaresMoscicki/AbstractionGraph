import { ViewModel } from '../view_model';
import { BaseController } from '../controller';

export class ViewportMoveController extends BaseController {
constructor(viewModel: ViewModel) {
  super();
  this.viewModel = viewModel;
}

// Start IViewController

onMouseDown(event: MouseEvent): void {
  // if controller is not active, mouse is moving and RMB is pressed then set controller active
  if (!this.active && event.buttons === 2) {
  this.active = true;
  this.startingCursorPosition = { x: event.clientX, y: event.clientY };
  this.startingViewportPosition = this.viewModel.getViewPortPosition();
  }
}

onMouseMove(event: MouseEvent): void {
  if (this.active) {
  // move viewport
  const deltaX = event.clientX - this.startingCursorPosition.x;
  const deltaY = event.clientY - this.startingCursorPosition.y;
  const position = { x: this.startingViewportPosition.x - deltaX, y: this.startingViewportPosition.y - deltaY };
  this.viewModel.setViewportPosition(position);
  }
}

onMouseUp(_event: MouseEvent): void {
  this.active = false;
  this.startingCursorPosition = { x: 0, y: 0 };
  this.startingViewportPosition = { x: 0, y: 0 };
}

// End IViewController

// Private members
private viewModel: ViewModel;
private startingCursorPosition: { x: number, y: number } = { x: 0, y: 0 };
private startingViewportPosition: { x: number, y: number } = { x: 0, y: 0 };
}