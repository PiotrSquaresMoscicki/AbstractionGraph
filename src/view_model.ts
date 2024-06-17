import { Model, IModelObserver, Connection, Rectangle } from './model'

export interface IViewModelObserver extends IModelObserver {
  onViewStyleChanged(): void
  onDisplayedParentChanged(): void
  onViewportSizeChanged(): void
  onHoveredNodeChanged(): void
  onHoveredConnectionChanged(): void
  onSelectedNodesChanged(): void
  onSelectedConnectionsChanged(): void
  onRenamedNodeChanged(): void
  onGridSizeChanged(): void
  onViewportPositionChanged(): void
  onZoomChanged(): void
}

export class ViewStyle {
  constructor() {
    // dark theme using vs code dark theme colors
    this.backgroundColor = '#1e1e1e';
    this.smallStepGridColor = '#26262d';
    this.bigStepGridColor = '#26262d';
    this.nodeColor = '#252526';
    this.outerNodeColor = '#473954';
    this.nodeBorderColor = '#4e4e52';
    this.nodeHoveredBorderColor = '#007acc';
    this.nodeSelectedBorderColor = '#007acc';
    this.nodeTextColor = '#c0c0c0';
    this.connectionColor = '#c0c0c0';
    this.connectionHoveredColor = '#007acc';
    this.connectionSelectedColor = '#007acc';
    this.connectionArrowLength = 12;
    this.textSize = 15;
    this.textFont = 'Consolas';
  }

  backgroundColor: string;
  smallStepGridColor: string;
  bigStepGridColor: string;
  nodeColor: string;
  outerNodeColor: string;
  nodeBorderColor: string;
  nodeHoveredBorderColor: string;
  nodeSelectedBorderColor: string;
  nodeTextColor: string;
  connectionColor: string;
  connectionHoveredColor: string;
  connectionSelectedColor: string;
  connectionArrowLength: number;
  textSize: number;
  textFont: string;
}

export class ViewModel implements IModelObserver {
  constructor(model: Model) {
    this.model = model;
  }

  // Accessors
  getModel(): Model {
    return this.model;
  }

  getViewStyle(): ViewStyle { return this.viewStyle; }

  getViewportSize(): { width: number, height: number } {
    return this.viewportSize;
  }

  getRectangleInViewport(index: number, outer: number = this.displayedParent): Rectangle {
    // calculate rectangle position and size based on viewport position and zoom
    const rectangle = this.model.getRectangle(index, outer);
    const viewportPosition = this.getViewPortPosition(outer);
    const zoom = this.getZoom(outer);
    return new Rectangle(rectangle.x * zoom - viewportPosition.x, rectangle.y * zoom - viewportPosition.y, 
      rectangle.width * zoom, rectangle.height * zoom);
  }

  getDisplayedParent(): number {
    return this.displayedParent;
  }

  getHoveredNode(): number {
    return this.hoveredNode;
  }

  getHoveredConnection(): Connection | null {
    return this.hoveredConnection;
  }

  getSelectedNodes(): number[] {
    return this.selectedNodes;
  }

  getSelectedConnections(): Connection[] {
    return this.selectedConnections;
  }

  getRenamedNode(): number {
    return this.renamedNode;
  }

  getGridSize(outer: number = this.displayedParent): number {
    return this.gridSize * (this.zooms.get(outer) || 1);
  }

  getViewPortPosition(outer: number = this.displayedParent): { x: number, y: number } {
    // if viewport position is not set create a bounding box around all nodes in the displayed parent
    // then center the viewport on the bounding box
    if (!this.viewportPositions.has(outer)) {
      const displayedParent = this.getDisplayedParent();
      const children = this.getModel().getChildren(displayedParent);
      
      // return 0,0 if there are no children
      if (children.length === 0) {
        return { x: 0, y: 0 };
      }

      const rectangles = children.map(child => this.model.getRectangle(child, outer));
      const minX = Math.min(...rectangles.map(rectangle => rectangle.x));
      const minY = Math.min(...rectangles.map(rectangle => rectangle.y));
      const maxX = Math.max(...rectangles.map(rectangle => rectangle.x + rectangle.width));
      const maxY = Math.max(...rectangles.map(rectangle => rectangle.y + rectangle.height));
      const boundingBoxWidth = (maxX - minX) * this.getZoom();
      const boundingBoxHeight = (maxY - minY) * this.getZoom();
      const boundingBoxCenter = { x: minX + boundingBoxWidth / 2, y: minY + boundingBoxHeight / 2 };
      const viewportWidth = this.getViewportSize().width;
      const viewportHeight = this.getViewportSize().height;
      const viewportCenter = { x: viewportWidth / 2, y: viewportHeight / 2 };
      const viewportPosition = { x: boundingBoxCenter.x - viewportCenter.x, y: boundingBoxCenter.y - viewportCenter.y };

      // set viewport position
      this.viewportPositions.set(outer, viewportPosition);

      return viewportPosition;
    } else {
      const viewportPosition = this.viewportPositions.get(outer);
      if (viewportPosition === undefined) {
        throw new Error('Viewport position is undefined');
      }
      return viewportPosition;
    }
  }

  getZoom(outer: number = this.displayedParent): number {
    return this.zooms.get(outer) || 1;
  }

  getMousePositionInModel(event: MouseEvent, outer: number = this.displayedParent): { x: number, y: number } {
    const viewportPosition = this.getViewPortPosition(outer);
    const zoom = this.getZoom(outer);
    return { x: (event.clientX + viewportPosition.x) / zoom, y: (event.clientY + viewportPosition.y) / zoom };
  }

  // Utility functions

  getVisibleNodes(): number[] {
    // returns children and all outer connection nodes (nodes that have the same parent as 'outer'
    // and have connections to or from 'outer')
    const displayedParent = this.getDisplayedParent();
    const children = this.getModel().getChildren(displayedParent);
    const visibleNodes = children.slice();
    const connections = this.getModel().getConnections(displayedParent);
    // add only nodes that have the same parent as displayedParent
    connections.forEach(connection => {
      if (connection.from === displayedParent 
        && this.getModel().getParent(connection.to) === this.getModel().getParent(displayedParent)
      ) {
        visibleNodes.push(connection.to);
      } else if (connection.to === displayedParent
        && this.getModel().getParent(connection.from) === this.getModel().getParent(displayedParent)
      ) {
        visibleNodes.push(connection.from);
      }
    });
    return visibleNodes;
  }

  getVisibleConnections(): Connection[] {
    // returns connections that are between visible nodes
    const visibleNodes = this.getVisibleNodes();
    // for each visible node get its outgoing connections
    const visibleConnections = visibleNodes.map(node => this.getModel().getOutgoingConnections(node));
    // remove connections if both from and to are outer nodes (their parent is the same as displayedParent parent)
    const withoutConnectionsBetweenOuterNodes = visibleConnections.map(connections => connections.filter(connection => {
      const fromParent = this.getModel().getParent(connection.from);
      const toParent = this.getModel().getParent(connection.to);
      const displayedParentParent = this.getModel().getParent(this.getDisplayedParent());
      return fromParent !== displayedParentParent || toParent !== displayedParentParent;
    }));
    // remove connections to or from displayedParent and connections between 
    return withoutConnectionsBetweenOuterNodes.flat().filter(connection => visibleNodes.includes(connection.from) && visibleNodes.includes(connection.to));
  }

  getRectangle(index: number): Rectangle {
    return this.model.getRectangle(index, this.displayedParent);
  }

  setRectangle(index: number, rectangle: Rectangle): void {
    this.model.setRectangle(index, rectangle, this.displayedParent);
  }

  // Mutators
  registerObserver(observer: IViewModelObserver): void {
    this.observers.push(observer);
    this.model.registerObserver(observer);
  }

  unregisterObserver(observer: IViewModelObserver): void {
    this.observers = this.observers.filter(item => item !== observer);
    this.model.unregisterObserver(observer);
  }

  setViewStyle(viewStyle: ViewStyle): void {
    this.viewStyle = viewStyle;
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setViewportSize(size: { width: number, height: number }): void {
    this.viewportSize = size;
    this.observers.forEach(observer => observer.onViewportSizeChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setRectangleInViewport(index: number, rectangle: Rectangle, outer: number = this.displayedParent): void {
    // calculate rectangle position and size based on viewport position and zoom
    const viewportPosition = this.getViewPortPosition(outer);
    const zoom = this.getZoom(outer);
    var modelRectangle = new Rectangle((rectangle.x + viewportPosition.x) / zoom, (rectangle.y + viewportPosition.y) / zoom, 
      rectangle.width / zoom, rectangle.height / zoom);
    // snap to grid
    const gridSize = this.gridSize;
    modelRectangle.x = Math.round(modelRectangle.x / gridSize) * gridSize;
    modelRectangle.y = Math.round(modelRectangle.y / gridSize) * gridSize;
    this.model.setRectangle(index, modelRectangle, outer);
  }

  setDisplayedParent(index: number): void {
    this.displayedParent = index;
    // remove cached viewport position and zoom
    this.viewportPositions.delete(index);
    this.zooms.delete(index);

    this.observers.forEach(observer => observer.onDisplayedParentChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setHoveredNode(index: number): void {
    if (this.hoveredNode !== index) {
      this.hoveredNode = index;
      this.observers.forEach(observer => observer.onHoveredNodeChanged());
      this.observers.forEach(observer => observer.onModelChanged());
    }
  }

  setHoveredConnection(connection: Connection | null): void {
    if (this.hoveredConnection !== connection) {
      this.hoveredConnection = connection;
      this.observers.forEach(observer => observer.onHoveredConnectionChanged());
      this.observers.forEach(observer => observer.onModelChanged());
    }
  }

  setSelectedNodes(indexes: number[]): void {
    this.selectedNodes = indexes;
    this.observers.forEach(observer => observer.onSelectedNodesChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setSelectedConnections(connections: Connection[]): void {
    this.selectedConnections = connections;
    this.observers.forEach(observer => observer.onSelectedConnectionsChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setRenamedNode(index: number): void {
    this.renamedNode = index;
    this.observers.forEach(observer => observer.onRenamedNodeChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setGridSize(size: number): void {
    this.gridSize = size;
    this.observers.forEach(observer => observer.onGridSizeChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setViewportPosition(position: { x: number, y: number }, outer: number = this.displayedParent): void {
    this.viewportPositions.set(outer, position);
    this.observers.forEach(observer => observer.onViewportPositionChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  setZoom(zoom: number, outer: number = this.displayedParent): void {
    this.zooms.set(outer, zoom);
    this.observers.forEach(observer => observer.onZoomChanged());
    this.observers.forEach(observer => observer.onModelChanged());
  }

  // Start IModelObserver

  onModelChanged(): void {}
  onNodeCreated(_index: number): void {}

  onNodeDestroyed(_index: number): void {
    // if destroyed node is displayed parent then set displayed parent to root
    if (this.displayedParent === _index) {
      this.setDisplayedParent(this.model.getRoot());
    }
    // if destroyed node is selected then deselect it
    if (this.selectedNodes.includes(_index)) {
      this.setSelectedNodes(this.selectedNodes.filter(node => node !== _index));
    }
    // if destroyed node is hovered then deselect it
    if (this.hoveredNode === _index) {
      this.setHoveredNode(-1);
    }
    // if destroyed node is renamed then deselect it
    if (this.renamedNode === _index) {
      this.setRenamedNode(-1);
    }
  }
  
  onNodeNameChanged(_index: number): void {}
  onNodeRectangleChanged(_index: number): void {}
  onNodeChildAdded(_parent: number, _child: number): void {}
  onNodeChildRemoved(_parent: number, _child: number): void {}
  onConnectionAdded(_from: number, _to: number): void {}
  onConnectionRemoved(_from: number, _to: number): void {
    // if removed connection is selected then deselect it
    const index = this.selectedConnections.findIndex(connection => connection.from === _from && connection.to === _to);
    if (index !== -1) {
      this.selectedConnections.splice(index, 1);
      this.observers.forEach(observer => observer.onSelectedConnectionsChanged());
    }
    // if removed connection is hovered then deselect it
    if (this.hoveredConnection?.from === _from && this.hoveredConnection?.to === _to) {
      this.setHoveredConnection(null);
    }
  }

  // End IModelObserver

  // Private members
  private model: Model;
  private viewStyle: ViewStyle = new ViewStyle();
  private observers: IViewModelObserver[] = [];
  private viewportSize: { width: number, height: number } = { width: 0, height: 0 };
  private displayedParent: number = 0;

  private hoveredNode: number = -1;
  private hoveredConnection: Connection | null = null;
  private selectedNodes: number[] = [];
  private selectedConnections: Connection[] = [];

  private renamedNode: number = -1;
  private gridSize: number = 10;

  private viewportPositions = new Map<number, { x: number, y: number }>();
  private zooms = new Map<number, number>();
}