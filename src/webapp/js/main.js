const viewModel = new ViewModel();
const view = new View(document.getElementById("draw"), viewModel);
const controller = new Controller(viewModel, view);