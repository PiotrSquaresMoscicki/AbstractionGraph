import { Rectangle } from "./model";

export interface IViewContext {
  getContext(): CanvasRenderingContext2D;
  drawConnectionLine(from: { x: number, y: number }, to: { x: number, y: number }, connectionColor: string, connectionWidth: number): void;
  getConnectionPoint(fromRectangle: Rectangle, toRectangle: Rectangle): { x: number, y: number };
}

export interface IViewControllerObserver {
  onControllerActivated(controller: IViewController): void;
  onRedrawRequested(): void;
}

export interface IViewController {
  registerObserver(observer: IViewControllerObserver): void;
  unregisterObserver(observer: IViewControllerObserver): void;
  isActive(): boolean;
  onDraw(viewContext: IViewContext): void;
  onOtherControllerActivated(): void;
  onModelChanged(): void;
  onMouseDown(_event: MouseEvent): void;
  onMouseMove(_event: MouseEvent): void;
  onMouseUp(_event: MouseEvent): void;
  onWheel(_event: WheelEvent): void;
  onDblPress(_event: MouseEvent): void;
  onDblClick(_event: MouseEvent): void;
  onKeydown(_event: KeyboardEvent): void;
  onKeyup(_event: KeyboardEvent): void;
}

export class BaseController implements IViewController {
  // Start IViewController

  registerObserver(observer: IViewControllerObserver): void {
    this.observers.push(observer);
  }

  unregisterObserver(observer: IViewControllerObserver): void {
    this.observers = this.observers.filter(item => item !== observer);
  }

  isActive(): boolean { return this.active; }
  onDraw(_viewContext: IViewContext): void {}
  onOtherControllerActivated(): void {}
  onModelChanged(): void {}
  onMouseDown(_event: MouseEvent): void {}
  onMouseMove(_event: MouseEvent): void {}
  onMouseUp(_event: MouseEvent): void {}
  onWheel(_event: WheelEvent): void {}
  onDblPress(_event: MouseEvent): void {}
  onDblClick(_event: MouseEvent): void {}
  onKeydown(_event: KeyboardEvent): void {}
  onKeyup(_event: KeyboardEvent): void {}

  // End IViewController

  // Protected members
  protected active: boolean = false;
  protected observers: IViewControllerObserver[] = [];
}