class Controller {
  viewModel;
  view;

  hasInput = false;
  
  constructor(viewModel, view) {
    this.viewModel = viewModel;
    this.view = view;
    this.view.draw();

    this.view.canvas.addEventListener("mousedown", this.onMouseDown);
    this.view.canvas.addEventListener("mousemove", this.onMouseMove);
    this.view.canvas.addEventListener("mouseup", this.onMouseUp);
    // bind scroll event
    this.view.canvas.addEventListener("wheel", this.onScroll);
  }

  onMouseDown = event => {
    const position = this.getMousePosition(event);
    var node = this.view.getNodeAtPosition(position);

    if (node === null) {
      //node = this.viewModel.addNode(this.viewModel.getDisplayedLayer());
      //this.viewModel.setNodePosition(node, position);
      //this.viewModel.setNodeSize(node, { width: 150, height: 50 });
      // add input box if there is no input box on the canvas
      if (!this.hasInput) {
        this.addInputBox(position);
        this.hasInput = true;
      }
    }
    
    if (event.altKey) {
      // remove node if pressed with alt key
      this.viewModel.removeNode(node);
      node = null;
    } else if (event.shiftKey) {
      // start making connection if pressed with shift key
      this.viewModel.setCreatedConnectionStartNode(node);
      this.viewModel.setCreatedConnectionEndPosition(position);
    } else if (node !== null) {
      // start dragging node if node is not null
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
    } else if (this.viewModel.connectionStartNode !== null) {
      this.viewModel.setCreatedConnectionEndPosition(position);
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
    } else if (this.viewModel.getCreatedConnectionStartNode() !== null) {
      // if we were making a connection, stop making the connection
      const startNode = this.viewModel.getCreatedConnectionStartNode();
      const endNode = this.view.getNodeAtPosition(this.viewModel.getCreatedConnectionEndPosition());
      if (endNode !== null) {
        this.viewModel.addConnection(startNode, endNode);
      }
      this.viewModel.setCreatedConnectionStartNode(null);
      this.view.draw();
    }

    // get mouse position and update the cursor
    const position = this.getMousePosition(event);
    this.updateCursor(position);
  }

  onScroll = event => {
    // get hovered node
    const node = this.viewModel.hoveredNode;
    // if node is not null and the user is zooming in set the currently displayed layer to the 
    // hovered node
    if (node !== null && event.deltaY < 0) {
      this.viewModel.setDisplayedLayer(node);
      this.view.draw();
    }
    // if the user is zooming out and the currently displayed layer is not the root, set the
    // currently displayed layer to the parent of the currently displayed layer
    if (event.deltaY > 0 && this.viewModel.displayedLayer !== this.viewModel.getRoot()) {
      this.viewModel.setDisplayedLayer(this.viewModel.getParent(this.viewModel.displayedLayer));
      this.view.draw();
    }
  }

  getMousePosition(event) {
    event.preventDefault();
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

  // Function to dynamically ad an input box on the canvas
  addInputBox(position) {
    console.log("add input box");

    var input = document.createElement('input');

    input.type = 'text';
    input.style.position = 'fixed';
    input.style.left = (position.x - 4) + 'px';
    input.style.top = (position.y - 4) + 'px';

    // draw rectangle around input box
    this.view.context.beginPath();

    this.view.context.rect(position.x - 4, position.y - 4, 100, 20);

    this.view.context.stroke();

    input.onkeydown = handleEnter;

    document.body.appendChild(input);

    input.focus();

    hasInput = true;
  }

  // Function to handle the enter key
  handleEnter(event) {
    if (event.keyCode === 13) {
      // Enter key pressed
      drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));
      hasInput = false;
      document.body.removeChild(event.target);
    }
  }

  // Function to draw text on the canvas
  drawText(text, x, y) {
    this.view.context.font = '14px Arial';
    this.view.context.fillText(text, x, y);

    this.view.draw();
  }
}