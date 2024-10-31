import { ICanvas } from '../interfaces/ICanvas';
import { Canvas } from '../classes/Canvas';

class SomeView {
    private canvas: ICanvas;

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = new Canvas(canvasElement);
    }

    draw() {
        this.canvas.drawLine(10, 10, 100, 100);
        this.canvas.drawCircle(50, 50, 20);
        this.canvas.drawRect(20, 20, 60, 60);
        this.canvas.fillRect(30, 30, 40, 40);
    }
}
