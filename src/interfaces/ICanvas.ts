export interface ICanvas {
    drawLine(x1: number, y1: number, x2: number, y2: number): void;
    drawCircle(x: number, y: number, radius: number): void;
    drawRect(x: number, y: number, width: number, height: number): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    getBaseCanvas(): HTMLCanvasElement;
}
