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
    circles = circles.map(({ x, y, vx, vy, lineWidth, ...rest }) => ({
        ...rest,
        x: calcNewValue(x, axisEnum.x),
        y: calcNewValue(y, axisEnum.y),
        vx: calcNewValue(vx, axisEnum.x),
        vy: calcNewValue(vy, axisEnum.y),
        lineWidth: calcNewValue(lineWidth, axisEnum.y),
    }));
}


makeCanvasResponsive();

function executeFrame(){
    requestAnimFrame(executeFrame);
    makeCanvasResponsive();
    incrementSimulation();
    c.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(circle => {
        drawCircle(circle);
    });
}

const drawShape = (startNode, nodes, opts = {
    lineWidth: 2
}) => {
    c.lineWidth = opts.lineWidth;

    c.moveTo(startNode.x, startNode.y);
    nodes.forEach(node => c.lineTo(node.x, node.y));

    c.stroke();
}

const isIntersect = (point, circle) => {
    return Math.sqrt(
        (point.x - circle.x) ** 2 +
        (point.y - circle.y) ** 2
    ) < circleRadius;
}

function incrementSimulation(){
    circles = circles.map((circle, index) => {
        let { x, y, vx, vy } = circle;

        if (mouse.clicked) {
            pickedUpIndex = null;
        }

        if (
            mouse.pressed && (
            pickedUpIndex == null ||
            pickedUpIndex == index)
        ) {
            if (isIntersect(mouse, circle)) {
                pickedUpIndex = index;
                x = mouse.x;
                y = mouse.y;
            }
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
}

const addListeners = () => {
    canvas.addEventListener('mousedown',function(e){
        currMousePos = getMousePos(e);
        mouse.x = currMousePos.x;
        mouse.y = currMousePos.y;

        mouse.pressed = true;
    });

    canvas.addEventListener('mouseup', function(e){
        //mouse.down = false;
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
