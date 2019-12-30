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

var mouse = {
    x : 0,
    y : 0,
    down: false
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

function incrementSimulation(){
    circles = circles.map((circle, index) => {
        let { x, y, vx, vy } = circle;

        if (mouse.down) {
            console.log('circle ' + index + ' -----------------------');
            //console.log(mouse.x > x - circleRadius);
            console.log(mouse.x < x + circleRadius);
            console.log(mouse.x, x + circleRadius);
            //console.log(mouse.y > y - circleRadius);
            //console.log(mouse.y < y + circleRadius);
            if (
                mouse.x > x - circleRadius &&
                mouse.x < x + circleRadius &&
                mouse.y > y - circleRadius &&
                mouse.y < y + circleRadius
            ) {
                console.log(`circle ${index} clicked`);
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

canvas.addEventListener('mousedown',function(e){
    mouse.down = true;
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

canvas.addEventListener('mousemove', function(e){
    console.log('sdfs');
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    console.log('X ' + mouse.x);
});

canvas.addEventListener('mouseup', function(e){
    //mouse.down = false;
});

// Draw the initial scene once, so something
// is displayed before animation starts.
// Draw the initial scene once, so something
executeFrame();
