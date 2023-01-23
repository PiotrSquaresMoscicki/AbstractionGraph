console.log("initializing main.js");

// add handler for all unhandled exceptions
// window.onerror = function (msg, url, lineNo, columnNo, error) {
//     var string = msg.toLowerCase();
//     var substring = "script error";
//     if (string.indexOf(substring) > -1){
//         alert('Script Error: See Browser Console for Detail');
//     } else {
//         var message = [
//             'Message: ' + msg,
//             'URL: ' + url,
//             'Line: ' + lineNo,
//             'Column: ' + columnNo,
//             'Error object: ' + JSON.stringify(error)
//         ].join(' - ');

//         alert(message);
//     }

//     return false;
// };

document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only

const viewModel = new ViewModel();
console.log("initialize view model");
const view = new View(document.getElementById("draw"), viewModel);
console.log("initialize controller");
const controller = new Controller(viewModel, view);

console.log("initialized main.js");