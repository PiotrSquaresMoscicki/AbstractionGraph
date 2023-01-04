document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only

const viewModel = new ViewModel();
const view = new View(document.getElementById("draw"), viewModel);
const controller = new Controller(viewModel, view);