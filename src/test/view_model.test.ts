import { 
    Model,
} from "../model";
import { 
    ViewModel,
    ViewStyle,
} from "../view_model";
import { 
  createSampleGraph,
} from '../create_sample_graph';

//************************************************************************************************
describe('getModel should return the same model as the one passed to the constructor', () => {
    it('should return the same model as the one passed to the constructor', () => {
        const model = new Model();
        const viewModel = new ViewModel(model);
        expect(viewModel.getModel()).toBe(model);
    });
});

//************************************************************************************************
describe('Set and get view style', () => {
    it('should return the same view style as the one passed to the setter', () => {
        const model = new Model();
        const viewModel = new ViewModel(model);
        const viewStyle = new ViewStyle();
        viewModel.setViewStyle(viewStyle);
        expect(viewModel.getViewStyle()).toBe(viewStyle);
    });
});

//************************************************************************************************
describe('Set and get viewport size', () => {
    it('should return the same viewport size as the one passed to the setter', () => {
        const model = new Model();
        const viewModel = new ViewModel(model);
        const viewportSize = {width: 100, height: 100};
        viewModel.setViewportSize(viewportSize);
        expect(viewModel.getViewportSize()).toEqual(viewportSize);
    });
});

//************************************************************************************************
describe('Get viewport positions', () => {
    let model: Model;
    let viewModel: ViewModel;

    beforeEach(() => {
        model = new Model();
        createSampleGraph(model);
        viewModel = new ViewModel(model);
        viewModel.setViewportSize({width: 1000, height: 1000});
    });

    test('getViewportPosition only one node is visible (car) and with no zoom', () => {
        // viewport size is 1000x1000
        // car is at (0, 0) with width 150 and height 50
        // viewport should be centered on the car
        // viewport position should be carPosition - viewportSize/2 + carSize/2
        const carPosition = {x: 0, y: 0};
        const carSize = {width: 150, height: 50};
        const viewportSize = {width: 1000, height: 1000};
        const expectedViewportPosition = {
            x: carPosition.x - viewportSize.width/2 + carSize.width/2, 
            y: carPosition.y - viewportSize.height/2 + carSize.height/2
        };

        expect(expectedViewportPosition).toEqual({x: -425, y: -475});
        expect(viewModel.getViewportPosition()).toEqual(expectedViewportPosition);
    });

    test('getViewportPosition only one node is visible (car) and with zoom', () => {
        // viewport size is 1000x1000
        // car is at (0, 0) with width 150 and height 50
        // viewport should be centered on the car
        // viewport position should be carPosition - viewportSize/2 + carSize/2
        const carPosition = {x: 0, y: 0};
        const carSize = {width: 150, height: 50};
        const viewportSize = {width: 1000, height: 1000};
        const zoom = 2;
        const carSizeAfterZoom = {width: carSize.width * zoom, height: carSize.height * zoom};
        const expectedViewportPosition = {
            x: carPosition.x - viewportSize.width/2 + carSizeAfterZoom.width/2, 
            y: carPosition.y - viewportSize.height/2 + carSizeAfterZoom.height/2
        };

        viewModel.setZoom(zoom);

        expect(expectedViewportPosition).toEqual({x: -350, y: -450});
        expect(viewModel.getViewportPosition()).toEqual(expectedViewportPosition);
    });
});


//************************************************************************************************
// describe('getRectangleInViewport tests', () => {
//     test('getRectangleInViewport with no zoom and for no explicit outer', () => {
//         const model = new Model();
//         createSampleGraph(model);

//         const viewModel = new ViewModel(model);
//         const engineNode = model.getNodeWithName('Engine');
//         const engineParentNode = model.getParent(engineNode);
//         viewModel.setDisplayedParent(engineParentNode);
//         const expectedRectangle = new Rectangle(0, -100, 150, 50);
//         expect(viewModel.getRectangleInViewport(engineNode)).toEqual(expectedRectangle);
//     });
// });
