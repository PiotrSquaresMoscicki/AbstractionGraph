import { ICanvas } from '../interfaces/ICanvas';

export class Canvas implements ICanvas {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
    }

    drawLine(x1: number, y1: number, x2: number, y2: number): void {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    drawCircle(x: number, y: number, radius: number): void {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.stroke();
    }

    drawRect(x: number, y: number, width: number, height: number): void {
        this.context.strokeRect(x, y, width, height);
    }

    fillRect(x: number, y: number, width: number, height: number): void {
        this.context.fillRect(x, y, width, height);
    }

    getBaseCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
}
