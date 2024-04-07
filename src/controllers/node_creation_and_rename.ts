import { ViewModel } from '../view_model';
import { BaseController } from '../controller';
import { Rectangle } from '../model';

export class NodeCreationAndRenameController extends BaseController {
  constructor(viewModel: ViewModel, canvas: HTMLCanvasElement) {
    super();
    this.viewModel = viewModel;
    this.canvas = canvas;
  }

  // Start IViewController

  onOtherControllerActivated(): void {
    // if controller is editing then cancel rename
    if (this.editing) {
      this.finishRename();
    }
    this.readyForActivation = false;
  }

  onMouseUp(event: MouseEvent): void {
    // if controller is editing and mouse up is performed outside of the renamed node then finish rename
    if (this.editing) {
      const rectangle = this.viewModel.getRectangleInViewport(this.renamedNode);
      if (event.clientX < rectangle.x || event.clientX > rectangle.x + rectangle.width 
          || event.clientY < rectangle.y || event.clientY > rectangle.y + rectangle.height) {
        // if new name is empty then cancel rename
        if (this.input?.value === '') {
          this.cancelRename();
        } else {
          this.finishRename();
        }
      }
    } else if (this.readyForActivation) {
      // if double click is performed on a node then set controller editing
      const displayedParent = this.viewModel.getDisplayedParent();
      const children = this.viewModel.getModel().getChildren(displayedParent);
      const rectangles = children.map(child => this.viewModel.getRectangleInViewport(child));
      const index = rectangles.findIndex(rectangle => event.clientX >= rectangle.x 
          && event.clientX <= rectangle.x + rectangle.width 
          && event.clientY >= rectangle.y 
          && event.clientY <= rectangle.y + rectangle.height);
      if (index === -1) {
        // create new node with size 100x50 and its center at the mouse position and start rename
        const mousePosition = this.viewModel.getMousePositionInModel(event);
        var rectangle = new Rectangle(mousePosition.x - 50, mousePosition.y - 25, 100, 50);
        // snap to grid
        const gridSize = this.viewModel.getGridSize() / this.viewModel.getZoom();
        rectangle.x = Math.round(rectangle.x / gridSize) * gridSize;
        rectangle.y = Math.round(rectangle.y / gridSize) * gridSize;
        const node = this.viewModel.getModel().createNode();
        this.viewModel.setRectangle(node, rectangle);
        const displayedParent = this.viewModel.getDisplayedParent();
        this.viewModel.getModel().addChild(displayedParent, node);
        this.newNode = true;
        this.startRename(node);
      }
      else {
        this.startRename(children[index]);
      }
    }
  }

  onDblPress(_event: MouseEvent): void {
    this.readyForActivation = true;
  }

  onKeyup(event: KeyboardEvent): void {
    // if enter is pressed then finish rename
    if (this.editing && event.key === 'Enter') {
      // if new name is empty then cancel rename
      if (this.input?.value === '') {
        this.cancelRename();
      } else {
        this.finishRename();
      }
    }
    // if escape is pressed then cancel rename
    if (this.editing && event.key === 'Escape') {
      this.cancelRename();
    }
  }

  private startRename(node: number): void {
    this.editing = true;
    this.renamedNode = node;
    this.viewModel.setRenamedNode(this.renamedNode);
    const rectangle = this.viewModel.getRectangleInViewport(this.renamedNode);
    // spawn input element
    this.input = document.createElement('input');
    this.input.id = 'rename-input';
    this.input.setAttribute('autocomplete', 'off');
    this.input.type = 'text';
    this.input.style.position = 'absolute';
    this.input.style.left = `${rectangle.x}px`;
    this.input.style.top = `${rectangle.y}px`;
    this.input.style.width = `${rectangle.width}px`;
    this.input.style.height = `${rectangle.height}px`;
    this.input.style.backgroundColor = 'transparent';
    this.input.style.border = 'none';
    this.input.style.outline = 'none';
    this.input.style.color = this.viewModel.getViewStyle().nodeTextColor;
    const textSize = this.viewModel.getViewStyle().textSize * this.viewModel.getZoom();
    this.input.style.fontSize = `${textSize}px`;
    this.input.style.fontFamily = this.viewModel.getViewStyle().textFont;
    this.input.style.textAlign = 'center';
    this.input.style.padding = '0';
    this.input.style.margin = '0';

    this.input.value = this.viewModel.getModel().getName(this.renamedNode);
    document.body.appendChild(this.input);
    this.input.focus();
    this.input.select();
    // select all text
    this.input.setSelectionRange(0, this.input.value.length);

    // add event listeners
    this.input.addEventListener('keydown', (event) => this.onKeydown(event));
    this.input.addEventListener('keyup', (event) => this.onKeyup(event));

    // forward mouse move event to the canvas if there are no buttons pressed
    this.input.addEventListener('mousemove', (event) => {
      if (event.buttons === 0) {
        this.canvas.dispatchEvent(new MouseEvent('mousemove', event));
      }
    });
  }

  private finishRename(): void {
    // set new name in the model and then cancel rename
    this.viewModel.getModel().setName(this.renamedNode, this.input?.value || '');
    // set newNode to false so cancelRename doesn't destroy the node
    this.newNode = false;
    // redraw
    this.observers.forEach(observer => observer.onRedrawRequested());
    this.cancelRename();
  }

  private cancelRename(): void {
    // if new ndoe is set then destroy it
    if (this.newNode) {
      this.viewModel.getModel().destroyNode(this.renamedNode);
    }
    this.editing = false;
    this.readyForActivation = false;
    this.renamedNode = -1;
    this.newNode = false;
    this.viewModel.setRenamedNode(-1);
    // remove input element
    if (this.input !== null) {
      document.body.removeChild(this.input);
      this.input = null;
    }
  }

  // End IViewController

  // Private members
  private viewModel: ViewModel;
  private editing: boolean = false;
  private readyForActivation: boolean = false;
  private canvas: HTMLCanvasElement;
  private newNode: boolean = false;
  private renamedNode: number = -1;
  private input: HTMLInputElement | null = null;
}