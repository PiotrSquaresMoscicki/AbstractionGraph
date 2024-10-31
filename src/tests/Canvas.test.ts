import { Canvas } from '../classes/Canvas';

describe('Canvas', () => {
    let canvasElement: HTMLCanvasElement;
    let canvas: Canvas;

    beforeEach(() => {
        canvasElement = document.createElement('canvas');
        canvas = new Canvas(canvasElement);
    });

    test('drawLine', () => {
        const context = canvasElement.getContext('2d')!;
        jest.spyOn(context, 'beginPath');
        jest.spyOn(context, 'moveTo');
        jest.spyOn(context, 'lineTo');
        jest.spyOn(context, 'stroke');

        canvas.drawLine(10, 10, 100, 100);

        expect(context.beginPath).toHaveBeenCalled();
        expect(context.moveTo).toHaveBeenCalledWith(10, 10);
        expect(context.lineTo).toHaveBeenCalledWith(100, 100);
        expect(context.stroke).toHaveBeenCalled();
    });

    test('drawCircle', () => {
        const context = canvasElement.getContext('2d')!;
        jest.spyOn(context, 'beginPath');
        jest.spyOn(context, 'arc');
        jest.spyOn(context, 'stroke');

        canvas.drawCircle(50, 50, 20);

        expect(context.beginPath).toHaveBeenCalled();
        expect(context.arc).toHaveBeenCalledWith(50, 50, 20, 0, Math.PI * 2);
        expect(context.stroke).toHaveBeenCalled();
    });

    test('drawRect', () => {
        const context = canvasElement.getContext('2d')!;
        jest.spyOn(context, 'strokeRect');

        canvas.drawRect(20, 20, 60, 60);

        expect(context.strokeRect).toHaveBeenCalledWith(20, 20, 60, 60);
    });

    test('fillRect', () => {
        const context = canvasElement.getContext('2d')!;
        jest.spyOn(context, 'fillRect');

        canvas.fillRect(30, 30, 40, 40);

        expect(context.fillRect).toHaveBeenCalledWith(30, 30, 40, 40);
    });

    test('getBaseCanvas', () => {
        expect(canvas.getBaseCanvas()).toBe(canvasElement);
    });
});
