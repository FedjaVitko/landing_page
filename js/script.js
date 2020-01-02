import {
  calcAngleBetweenPoints,
  pointIntersectsCircle,
  circleIntersectsSegment
} from "./collisionDetection.js";

// shim layer for requestAnimationFrame with setTimeout fallback
// from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
var requestAnimFrame = (() => {
  return window.requestAnimationFrame    ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

var gravity = 2.7;
var dampening = 0.85;
var circleRadius = canvas.width / 10;

var pickedUpIndex = null;

var mouse = {
  x : 0,
  y : 0,
  pressed: false,
  clicked: false
};

var circles = [
  {
    x : canvas.width / 2,
    y : canvas.height / 2,
    vx: 0,
    vy: 0,
    lineWidth: 1,
    fillColor: 'black',
    strokeColor: 'red',
    radius: circleRadius
  },
  {
    x : canvas.width / 3,
    y : canvas.height / 3,
    vx: 0,
    vy: 0,
    lineWidth: 1,
    fillColor: 'red',
    strokeColor: 'black',
    radius: circleRadius
  },
];

const interactiveAreaOffsets = {
  top: 10,
  right: 30,
  bottom: 10,
  left: 30,
}

var interactiveArea = {
  p1: {
    x: interactiveAreaOffsets.left,
    y: interactiveAreaOffsets.top,
  },
  p2: {
    x: canvas.width - interactiveAreaOffsets.right,
    y: interactiveAreaOffsets.top,
  },
  p3: {
    x: canvas.width - interactiveAreaOffsets.right,
    y: canvas.height - interactiveAreaOffsets.bottom + 5,
  },
  p4: {
    x: interactiveAreaOffsets.left,
    y: canvas.height - interactiveAreaOffsets.bottom,
  },
}

const axisEnum = {
  x : 'x',
  y : 'y',
  all : 'all',
}


const makeCanvasResponsive = () => {
  const prevCanvasWidth = canvas.width;
  const prevCanvasHeight = canvas.height;

  const canvasContainer = document.getElementsByClassName('jar_canvas')[0];
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;

  const calcNewValue = (value, axis) => {
    var newValue = value;

    switch (axis) {
      case axisEnum.x :
        newValue = (value / prevCanvasWidth) * canvas.width;
        break;
      case axisEnum.y :
        newValue = (value / prevCanvasHeight) * canvas.height;
        break;
      case axisEnum.all :
        newValue = (value / (prevCanvasHeight + prevCanvasWidth)) * (canvas.height + canvas.width);
        break;
    }

    return newValue;
  }

  circleRadius = calcNewValue(circleRadius, axisEnum.all);
  circles = circles.map(({ x, y, vx, vy, lineWidth, ...rest }) => ({
    ...rest,
    x: calcNewValue(x, axisEnum.x),
    y: calcNewValue(y, axisEnum.y),
    vx: calcNewValue(vx, axisEnum.x),
    vy: calcNewValue(vy, axisEnum.y),
    lineWidth: calcNewValue(lineWidth, axisEnum.y),
    radius: circleRadius
  }));

  for (let point in interactiveArea) {
    const pointX = interactiveArea[point].x;
    const pointY = interactiveArea[point].y;

    interactiveArea[point] = {
      x: calcNewValue(pointX, axisEnum.x),
      y: calcNewValue(pointY, axisEnum.y),
    }
  }
}

function incrementSimulation(){
  circles = circles.map((circle, index) => {
    let { x, y, vx, vy } = circle;

    let collisionSurfaceLowestPoint = null;
    let intersectionPoint = null;

    if (
      mouse.pressed && (
        pickedUpIndex == null ||
        pickedUpIndex == index
      ) 
    ) {
      if (pickedUpIndex == 1) {
        console.log('the picked up index was 1');
      }
      if (pointIntersectsCircle(mouse, circle)) {
        pickedUpIndex = index;
        x = mouse.x;
        y = mouse.y;
      }
    } else {
      pickedUpIndex = null;
    }

    // Execute gravity
    vy += gravity;

    // Execute dampening (slowing down)
    vx *= dampening;
    vy *= dampening;

    // Increment the position by the velocity
    x += vx;
    y += vy;

    // Bounce off the floor
    if(y + circleRadius > canvas.height){
      y = canvas.height - circleRadius;
      vy = - Math.abs(vy);
      collisionSurfaceLowestPoint = { x: x, y: canvas.height };
      intersectionPoint = { x: x, y: y + circleRadius };
    }
    // Bounce off the ceiling
    else if(y - circleRadius < 0){
      y = circleRadius;
      vy = Math.abs(vy);
    }
    // Bounce off the right wall
    if(x + circleRadius > canvas.width){
      x = canvas.width - circleRadius;
      vx = - Math.abs(vx);
    }
    // Bounce off the left wall
    else if(x - circleRadius < 0){
      x = circleRadius;
      vx = Math.abs(vx);
    }

    if (intersectionPoint !== null && collisionSurfaceLowestPoint !== null) {
      const angle = calcAngleBetweenPoints(intersectionPoint, collisionSurfaceLowestPoint);

      const speedBoost = angle * 0.7;
      vx += speedBoost;
      vy += speedBoost;
    }

    const offset = circleIntersectsSegment(circle, { p1: interactiveArea.p3, p2: interactiveArea.p4 });

    if (offset < 5) {
      y = y - offset;
      vy *= -1;
      console.log(offset);
    }

    return { ...circle, x, y, vx, vy }
  });

}


const drawInteractiveArea = () => {
  drawShape(interactiveArea.p1, [interactiveArea.p2, interactiveArea.p3, interactiveArea.p4, interactiveArea.p1]);
}

const drawShape = (startNode, nodes, opts = {
  lineWidth: 4
}) => {
  c.lineWidth = opts.lineWidth;

  c.moveTo(startNode.x, startNode.y);
  nodes.forEach(node => c.lineTo(node.x, node.y));

  c.stroke();
}
function drawBox(){
  c.lineWidth = 0.001;
  c.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
}

function drawCircle({x, y, fillColor, strokeColor, lineWidth}){
  c.beginPath();
  c.arc(x, y, circleRadius - lineWidth/2, 0 , 2 * Math.PI, false);
  c.fillStyle = fillColor;
  c.fill();
  c.lineWidth = 4;
  c.strokeStyle = strokeColor;
  c.stroke();
  drawImage('img/jar.svg', x, y, 50, 50);
}

const drawImage = (imgPath, x, y, h, w) => {
  let imgObj = new Image();
  imgObj.src = imgPath;

  c.drawImage(imgObj, x, y, h, w);
}

const addListeners = () => {
  canvas.addEventListener('mousedown',function(e){
    const currMousePos = getMousePos(e);
    mouse.x = currMousePos.x;
    mouse.y = currMousePos.y;

    mouse.pressed = true;
  });

  canvas.addEventListener('mouseup', function(e){
    mouse.pressed = false;
  });

  canvas.addEventListener('mousemove', function(e){
    const currMousePos = getMousePos(e);
    mouse.x = currMousePos.x;
    mouse.y = currMousePos.y;
  });

  canvas.addEventListener('click', function(e){
    const currMousePos = getMousePos(e);
    mouse.x = currMousePos.x;
    mouse.y = currMousePos.y;

    mouse.clicked = true;
  });

}

const getMousePos = (e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function executeFrame(){
  requestAnimFrame(executeFrame);
  makeCanvasResponsive();
  incrementSimulation();
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawImage('img/jar.svg', 0, 0, canvas.width, canvas.height);
  drawInteractiveArea();
  circles.forEach(circle => {
    drawCircle(circle);
  });
}

// Draw the initial scene once, so something
// is displayed before animation starts.
// Draw the initial scene once, so something

document.addEventListener('DOMContentLoaded', addListeners, false);
executeFrame();


