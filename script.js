/*
 * 2D Vector class
 */
function Vector2D(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector2D.prototype.length = function() { return Math.sqrt(Vector2D.dot(this, this)) };

Vector2D.add = function(a, b) { if (b instanceof Vector2D) return new Vector2D(a.x + b.x, a.y + b.y);
  else return new Vector2D(a.x + b, a.y + b);
};
Vector2D.subtract = function(a, b) {
  if (b instanceof Vector2D) return new Vector2D(a.x - b.x, a.y - b.y);
  else return new Vector2D(a.x - b, a.y - b);
};
Vector2D.multiply = function(a, b) {
  if (b instanceof Vector2D) return new Vector2D(a.x * b.x, a.y * b.y);
  else return new Vector2D(a.x * b, a.y * b);
};
Vector2D.divide = function(a, b) {
  if (b instanceof Vector2D) return new Vector2D(a.x / b.x, a.y / b.y);
  else return new Vector2D(a.x / b, a.y / b);
};
Vector2D.equals = function(a, b) {
  return a.x == b.x && a.y == b.y;
};
Vector2D.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};
Vector2D.unit = function(a) {
  const magnitude = Math.sqrt(a.x * a.x + a.y * a.y);

  return new Vector2D(a.x / magnitude, a.y / magnitude);
}



// shim layer for requestAnimationFrame with setTimeout fallback
// from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
var requestAnimFrame = (function(){
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
var floorOffsetX = canvas.width * 0.15;
var floorOffsetY = canvas.height * 0.15;

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
    strokeColor: 'red'
  },
  {
    x : canvas.width / 3,
    y : canvas.height / 3,
    vx: 0,
    vy: 0,
    lineWidth: 1,
    fillColor: 'red',
    strokeColor: 'black'
  }
];

var floor = {
  p1: {
    x: floorOffsetX,
    y: canvas.height - floorOffsetY,
    vy: 0
  },
  p2: {
    x: canvas.width - floorOffsetX,
    y: canvas.height - floorOffsetY,
    vy: 0
  }
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
    newValue = value;

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
  floorOffsetX = calcNewValue(floorOffsetX, axisEnum.x);
  floorOffsetY = calcNewValue(floorOffsetY, axisEnum.y);
  circles = circles.map(({ x, y, vx, vy, lineWidth, ...rest }) => ({
    ...rest,
    x: calcNewValue(x, axisEnum.x),
    y: calcNewValue(y, axisEnum.y),
    vx: calcNewValue(vx, axisEnum.x),
    vy: calcNewValue(vy, axisEnum.y),
    lineWidth: calcNewValue(lineWidth, axisEnum.y),
  }));

  for (let key in floor) {
    const { x, y, ...rest } = floor[key];
    floor[key] = {
      ...rest,
      x: calcNewValue(x, axisEnum.x),
      y: calcNewValue(y, axisEnum.y)
    }
  }
}

makeCanvasResponsive();

function executeFrame(){
  requestAnimFrame(executeFrame);
  makeCanvasResponsive();
  incrementSimulation();
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawImage('img/jar.svg', 0, 0, canvas.width, canvas.height);
  //drawFloor();
  circles.forEach(circle => {
    drawCircle(circle);
  });
}

const drawFloor = () => {
  drawShape(floor.p1, [floor.p2]);
}

const drawShape = (startNode, nodes, opts = {
  lineWidth: 4
}) => {
  c.lineWidth = opts.lineWidth;

  c.moveTo(startNode.x, startNode.y);
  nodes.forEach(node => c.lineTo(node.x, node.y));

  c.stroke();
}

const circleIntersectsSegment = (circle, segment) => {
  let closest;

  const segA = new Vector2D(segment.p1.x, segment.p1.y);
  const segB = new Vector2D(segment.p2.x, segment.p2.y);
  const circlePos = new Vector2D(circle.x, circle.y);

  const segV = Vector2D.subtract(segB, segA);
  const angleBetweenSegVAndXAxis = Math.atan2();
  const ptV = Vector2D.subtract(circlePos, segA);

  const projVLength = Vector2D.dot(ptV, Vector2D.unit(segV));
  if (Math.abs(projVLength) < 0)
    closest = segA;
  if (Math.abs(projVLength) > Math.abs(segV))
    closest = segB;

  const projV = Vector2D.multiply(Vector2D.unit(segV), Math.abs(projVLength));

  closest = Vector2D.add(segA, projV);

  const distV = Vector2D.subtract(closest, circlePos).length();

  return Math.abs(distV) < circleRadius;
}

const calcAngleBetweenPoints = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;


const pointIntersectsCircle = (point, circle) => {
  return Math.sqrt(
    (point.x - circle.x) ** 2 +
    (point.y - circle.y) ** 2
  ) < circleRadius;
}

function incrementSimulation(){
  circles = circles.map((circle, index) => {
    let { x, y, vx, vy } = circle;

    let collisionSurfaceLowestPoint = null;
    let intersectionPoint = null;

    if (false && circleIntersectsSegment(circle, floor)) {
      y -= vy;

      intersectionPoint = {
        x: x,
        y: y - circleRadius
      }
      collisionSurfaceLowestPoint = floor.p2;
    }

    if (
      mouse.pressed && (
        pickedUpIndex == null ||
        pickedUpIndex == index)
    ) {
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

    return { ...circle, x, y, vx, vy }
  });

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
    currMousePos = getMousePos(e);
    mouse.x = currMousePos.x;
    mouse.y = currMousePos.y;

    mouse.pressed = true;
  });

  canvas.addEventListener('mouseup', function(e){
    mouse.pressed = false;
  });

  canvas.addEventListener('mousemove', function(e){
    currMousePos = getMousePos(e);
    mouse.x = currMousePos.x;
    mouse.y = currMousePos.y;
  });

  canvas.addEventListener('click', function(e){
    currMousePos = getMousePos(e);
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

// Draw the initial scene once, so something
// is displayed before animation starts.
// Draw the initial scene once, so something

document.addEventListener('DOMContentLoaded', addListeners, false);
executeFrame();


