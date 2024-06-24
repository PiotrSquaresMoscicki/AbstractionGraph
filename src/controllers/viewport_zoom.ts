import { BaseController } from '../controller';
import { ViewModel } from '../view_model';

export class ViewportZoomController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onWheel(event: WheelEvent): void {
    // get zoom
    var zoom = this.viewModel.getZoom();
    const viewportSize = this.viewModel.getViewportSize();
    const viewportCenter = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
    // calculate new zoom
    zoom -= event.deltaY / 500;
    if (zoom < this.minZoom) {
      // if zoom is smaller than min zoom then change the abstraction level to the parent of the displayed parent
      const displayedParent = this.viewModel.getDisplayedParent();
      const parent = this.viewModel.getModel().getParent(displayedParent);
      if (parent !== null) {
        this.viewModel.setDisplayedParent(parent);
        // perform zoom around the center of the viewport
        // const viewportSize = this.viewModel.getViewportSize();
        // const center = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
        // this.performZoom(this.maxZoom, center);
      } else {
        this.performZoom(this.minZoom, viewportCenter);
      }
    } else if (zoom > this.maxZoom) {
      // if zoom is bigger than max zoom then change the abstraction level to the hovered node if any
      const hoveredNode = this.viewModel.getHoveredNode();
      if (hoveredNode !== -1) {
        this.viewModel.setDisplayedParent(hoveredNode);
        // perform zoom around the center of the viewport
        // const viewportSize = this.viewModel.getViewportSize();
        // const center = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
        // this.performZoom(this.minZoom, center);
      } else {
        this.performZoom(this.maxZoom, viewportCenter);
      }
    } else {
      // zoom around the mouse cursor
      const mousePosition = { x: event.clientX, y: event.clientY };
      this.performZoom(zoom, mousePosition);
    }
  }
  
  // End IViewController

  // Private functions

  performZoom(zoom: number, center: { x: number, y: number }): void {
    // zoom around the center
    const viewportPosition = this.viewModel.getViewportPosition();
    const oldZoom = this.viewModel.getZoom();
    const centerInModel = { x: (center.x + viewportPosition.x) / oldZoom, y: (center.y + viewportPosition.y) / oldZoom };
    const centerInModelAfterZoom = { x: (center.x + viewportPosition.x) / zoom, y: (center.y + viewportPosition.y) / zoom };
    const delta = { x: centerInModel.x - centerInModelAfterZoom.x, y: centerInModel.y - centerInModelAfterZoom.y };
    const viewportPositionAfterZoom = { x: viewportPosition.x + delta.x * zoom, y: viewportPosition.y + delta.y * zoom };
    this.viewModel.setViewportPosition(viewportPositionAfterZoom);
    // set zoom
    this.viewModel.setZoom(zoom);
  }

  // Private members
  private viewModel: ViewModel;
  private maxZoom: number = 2;
  private minZoom: number = 0.3;
}