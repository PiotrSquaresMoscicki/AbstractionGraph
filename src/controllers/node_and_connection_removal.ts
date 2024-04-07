import { ViewModel } from '../view_model';
import { BaseController } from '../controller';

export class NodeAndConnectionRemovalController extends BaseController {
  constructor(viewModel: ViewModel) {
    super();
    this.viewModel = viewModel;
  }

  // Start IViewController

  onKeyup(event: KeyboardEvent): void {
    // if delete is pressed then remove selected nodes and connections
    if (event.key === 'Delete') {
      // first we remove connections and then nodes to avoid connections being removed by the model on node removal
      const selectedConnections = this.viewModel.getSelectedConnections();
      const selectedNodes = this.viewModel.getSelectedNodes();
      selectedConnections.forEach(connection => this.viewModel.getModel().removeConnection(connection.from, connection.to));
      selectedNodes.forEach(node => this.viewModel.getModel().destroyNode(node));
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
}