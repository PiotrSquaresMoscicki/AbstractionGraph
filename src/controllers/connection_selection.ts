import { ViewModel } from '../view_model';
import { BaseController } from '../controller';

export class ConnectionSelectionController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onMouseDown(event: MouseEvent): void {
    // if mouse is pressed on a connection then select it
    const hoveredConnection = this.viewModel.getHoveredConnection();
    if (hoveredConnection !== null) {
      // if ctrl is pressed then add connection to selection
      if (event.ctrlKey) {
        const selectedConnections = this.viewModel.getSelectedConnections();
        const connectionIndex = selectedConnections.indexOf(hoveredConnection);
        if (connectionIndex === -1) {
          selectedConnections.push(hoveredConnection);
          this.viewModel.setSelectedConnections(selectedConnections);
        } else {
          // if connection si already selected then deselect it
          selectedConnections.splice(connectionIndex, 1);
          this.viewModel.setSelectedConnections(selectedConnections);
        }
      // if ctrl is not pressed and connection is not among seleted then set is as selected
      } else if (!this.viewModel.getSelectedConnections().includes(hoveredConnection)) {
        this.viewModel.setSelectedConnections([hoveredConnection]);
      }
    }
    // otherwise deselect unless mouse is pressed, node is hovered and ctrl is pressed
    else if (this.viewModel.getHoveredNode() === -1 || !event.ctrlKey) {
      this.viewModel.setSelectedConnections([]);
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
}
