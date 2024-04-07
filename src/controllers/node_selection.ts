import { ViewModel } from '../view_model';
import { BaseController } from '../controller';

// set node as selected if mouse is pressed on it
// add node as selected if mouse is pressed on it and ctrl is pressed
// remove node from selected if already selected and mouse is pressed on it and ctrl is pressed
// set no node as selected if mouse is pressed on empty space
export class NodeSelectionController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    this.lastMouseDownPosition = { x: event.clientX, y: event.clientY };
    // if mouse is pressed on a node then select it
    const hoveredNode = this.viewModel.getHoveredNode();
    if (hoveredNode !== -1) {
      // if ctrl is pressed then add node to selection
      if (event.ctrlKey) {
        const selectedNodes = this.viewModel.getSelectedNodes();
        const nodeIndex = selectedNodes.indexOf(hoveredNode);
        if (nodeIndex === -1) {
          selectedNodes.push(hoveredNode);
          this.viewModel.setSelectedNodes(selectedNodes);
        } else {
          // if node is already selected then remove it from selection
          selectedNodes.splice(nodeIndex, 1);
          this.viewModel.setSelectedNodes(selectedNodes);
        }
      // if ctrl is not pressed and node is not among seleted then set is as selected
      } else if (!this.viewModel.getSelectedNodes().includes(hoveredNode)) {
        this.viewModel.setSelectedNodes([hoveredNode]);
      }
    } 
    // otherwise deselect unless mouse is pressed, connection is hovered and ctrl is pressed
    else if (this.viewModel.getHoveredConnection() === null || !event.ctrlKey) {
      this.viewModel.setSelectedNodes([]);
    }
  }

  onMouseUp(_event: MouseEvent): void {
    // if mouse is pressed and released without moving then select the node under the cursor
    const deltaX = _event.clientX - this.lastMouseDownPosition.x;
    const deltaY = _event.clientY - this.lastMouseDownPosition.y;
    if (deltaX === 0 && deltaY === 0) {
      // if mouse is pressed on a node then select it
      const hoveredNode = this.viewModel.getHoveredNode();
      if (hoveredNode !== -1) {
        // if ctrl is pressed then do nothing
        if (_event.ctrlKey) {
        // if ctrl is not pressed set the hovered node as selected
        } else {
          this.viewModel.setSelectedNodes([hoveredNode]);
        }
      }
    }
  }

  // Private members
  private viewModel: ViewModel;
  private lastMouseDownPosition: { x: number, y: number } = { x: 0, y: 0 };
}