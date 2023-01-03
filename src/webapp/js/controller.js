class Controller {
  viewModel;
  view;
  
  constructor(viewModel, view) {
    this.viewModel = viewModel;
    this.view = view;
    this.view.draw();

    this.view.canvas.addEventListener("mousedown", this.onMouseDown);
    this.view.canvas.addEventListener("mousemove", this.onMouseMove);
    this.view.canvas.addEventListener("mouseup", this.onMouseUp);
  }

  onMouseDown = event => {
    const position = this.getMousePosition(event);
    var node = this.view.getNodeAtPosition(position);

    if (node === null) {
      node = this.viewModel.addNode(this.viewModel.getRoot());
      this.viewModel.setNodePosition(node, position);
      this.viewModel.setNodeSize(node, { width: 50, height: 50 });
    }
    
    // remove node if pressed with alt key
    if (event.altKey) {
      this.viewModel.removeNode(node);
      node = null;
    }

    // start dragging node if node is not null

    if (node !== null) {
      this.viewModel.setDraggedNode(node);
      const nodePosition = this.viewModel.getNodePosition(node);
      this.viewModel.setInitialNodePosition(nodePosition);
      this.viewModel.setInitialMousePosition(position);
    }

    this.updateCursor(position);
    this.updateHoveredNode(position);
    this.view.draw();
  }

  onMouseMove = event => {
    const position = this.getMousePosition(event);
    
    if (this.viewModel.draggedNode !== null) {
      const node = this.viewModel.draggedNode;
      const nodePosition = this.viewModel.getInitialNodePosition();
      const mousePosition = this.viewModel.getInitialMousePosition();
      var newNodePosition = {
        x: nodePosition.x + position.x - mousePosition.x,
        y: nodePosition.y + position.y - mousePosition.y
      };
      // snap to grid
      newNodePosition.x = Math.round(newNodePosition.x / 20) * 20 + 10;
      newNodePosition.y = Math.round(newNodePosition.y / 20) * 20 + 10;
      this.viewModel.setNodePosition(node, newNodePosition);
      this.view.draw();
    }
    
    this.updateCursor(position);
    this.updateHoveredNode(position);
    this.view.draw();
  }

  onMouseUp = event => {
    // if we were dragging a node, stop dragging
    if (this.viewModel.draggedNode !== null) {
      this.viewModel.setDraggedNode(null);
      this.view.draw();
    }

    // get mouse position and update the cursor
    const position = this.getMousePosition(event);
    this.updateCursor(position);
  }

  getMousePosition(event) {
    const rect = this.view.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  updateCursor(position) {
    const node = this.view.getNodeAtPosition(position);
    if (node !== null) {
      if (this.viewModel.draggedNode !== null) {
        this.view.canvas.style.cursor = "grabbing";
      } else {
        this.view.canvas.style.cursor = "pointer";
      }
    } else {
      this.view.canvas.style.cursor = "default";
    }
  }

  updateHoveredNode(position) {
    const node = this.view.getNodeAtPosition(position);
    this.viewModel.setHoveredNode(node);
  }
}