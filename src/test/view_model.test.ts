import { 
    Model,
} from "../model";
import { 
    ViewModel,
    ViewStyle,
} from "../view_model";
// import { 
//   createSampleGraph,
// } from '../create_sample_graph';

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
// describe('getRectangleInViewport tests', () => {
//     test('getRectangleInViewport with no zoom and for no explicit outer', () => {
//         const model = new Model();
//         createSampleGraph(model);

//         const viewModel = new ViewModel(model);
//         viewModel.setViewportSize({width: 1000, height: 1000});
        
//         const modelRectangle = moel.getRectangle
//     }