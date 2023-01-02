var canvas = document.getElementById("draw");

var ctx = canvas.getContext("2d");
resize();

// resize canvas when window is resized
window.addEventListener("resize", resize);

function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

// draw a line
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();

// draw a circle
ctx.beginPath();
ctx.arc(95, 50, 40, 0, 2 * Math.PI);
ctx.stroke();

// draw a rectangle
ctx.beginPath();
ctx.rect(20, 20, 150, 100);
ctx.stroke();

