import { ViewModel } from '../view_model';
import { BaseController, IViewContext } from '../controller';
import { Connection } from '../model';

// if mouse is closer than 5 to the connection line then set it as hovered
export class ConnectionHoverController extends BaseController {
  constructor(viewModel: ViewModel, context: IViewContext) {
    super();
    this.viewModel = viewModel;
    this.context = context;
  }

  // Start IViewController

  onMouseMove(event: MouseEvent): void {
    // skip if any node is hovered
    if (this.viewModel.getHoveredNode() !== -1) {
      this.viewModel.setHoveredConnection(null);
      return;
    }
    
    const connections = this.viewModel.getVisibleConnections();
    // get mouse position
    const mousePosition = { x: event.clientX, y: event.clientY };
    // get connection under cursor if any
    const index = connections.findIndex(connection => this.isPointOnConnection(mousePosition, connection));
    if (index !== -1) {
      this.viewModel.setHoveredConnection(connections[index]);
    } else {
      this.viewModel.setHoveredConnection(null);
    }
  }

  // End IViewController

  // Private functions

  private isPointOnConnection(point: { x: number, y: number }, connection: Connection): boolean {
    // get connection points
    const fromRectangle = this.viewModel.getRectangleInViewport(connection.from);
    const toRectangle = this.viewModel.getRectangleInViewport(connection.to);
    const from = this.context.getConnectionPoint(fromRectangle, toRectangle);
    const to = this.context.getConnectionPoint(toRectangle, fromRectangle);
    // get distance from point to line
    const distance = this.getDistanceFromPointToLine(point, from, to);
    return distance < 8;
  }
  
  private getDistanceFromPointToLine(point: { x: number, y: number }, lineFrom: { x: number, y: number }, lineTo: { x: number, y: number }): number {
    // calculate the bounding box from lineFrom and lineTo
    // then increase it's size by 4 in each direction
    // then check if point is inside the bounding box
    // if it is then calculate distance from point to line
    // if it is not then return the distance to the closest lineFrom or lineTo
    const boundingBox = {
      x: Math.min(lineFrom.x, lineTo.x) - 4,
      y: Math.min(lineFrom.y, lineTo.y) - 4,
      width: Math.abs(lineFrom.x - lineTo.x) + 8,
      height: Math.abs(lineFrom.y - lineTo.y) + 8
    };

    if (point.x >= boundingBox.x && point.x <= boundingBox.x + boundingBox.width
      && point.y >= boundingBox.y && point.y <= boundingBox.y + boundingBox.height) {
      return this.getDistanceFromPointToLineInternal(point, lineFrom, lineTo);
    } else {
      const distanceFromLineFrom = Math.sqrt(Math.pow(point.x - lineFrom.x, 2) + Math.pow(point.y - lineFrom.y, 2));
      const distanceFromLineTo = Math.sqrt(Math.pow(point.x - lineTo.x, 2) + Math.pow(point.y - lineTo.y, 2));
      return Math.min(distanceFromLineFrom, distanceFromLineTo);
    }
  }

  private getDistanceFromPointToLineInternal(point: { x: number, y: number }, lineFrom: { x: number, y: number }, lineTo: { x: number, y: number }): number {
    // calculate distance from point to line
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    const numerator = Math.abs((lineTo.y - lineFrom.y) * point.x - (lineTo.x - lineFrom.x) * point.y + lineTo.x * lineFrom.y - lineTo.y * lineFrom.x);
    const denominator = Math.sqrt(Math.pow(lineTo.y - lineFrom.y, 2) + Math.pow(lineTo.x - lineFrom.x, 2));
    return numerator / denominator;
  }

  // Private members
  private viewModel: ViewModel;
  private context: IViewContext;
}
