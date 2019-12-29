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
var gravity = 0.1;
var dampening = 0.995;
var mousePullStrength = 0.005;
var animate = false;

var mouse = {
    x : 0,
    y : 0,
    down: false
};

var circles = [
    {
        x : canvas.width/2,
        y : canvas.height/2,
        vx: 0,
        vy: 0,
        radius: 12,
        lineWidth: 3,
        fillColor: 'black',
        strokeColor: 'red'
    },
    {
        x : canvas.width/3,
        y : canvas.height/3,
        vx: 0,
        vy: 0,
        radius: 24,
        lineWidth: 7,
        fillColor: 'red',
        strokeColor: 'black'
    }
];

function executeFrame(){
    animate = true;
    requestAnimFrame(executeFrame);
    incrementSimulation();
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawBox();
    circles.forEach(circle => {
        drawCircle(circle);
    });
    if(mouse.down)
        drawLineToMouse();
}

const drawJar = () => {
    const topLeftCorner = {
        x: canvas.width * 0.1,
        y: canvas.height * 0.7
    }
    const bottomLeftCorner = {
        x: topLeftCorner.x,
        y: canvas.height - canvas.height * 0.05
    }
    const bottomRightCorner = {
        x: canvas.width * 0.9,
        y: bottomLeftCorner.y
    }
    const topRightCorner = {
        x: bottomRightCorner.x,
        y: topLeftCorner.y
    }
    drawShape(topLeftCorner, [bottomLeftCorner, bottomRightCorner, topRightCorner]);
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
    circles = circles.map(circle => {
        let { x, y, vx, vy, radius } = circle;

        if(mouse.down){
            var dx = mouse.x - x,
                dy = mouse.y - y,
                distance = Math.sqrt(dx*dx + dy*dy),
                unitX = dx / distance,
                unitY = dy / distance,
                force = distance * mousePullStrength;
            vx += unitX * force;
            vy += unitY * force;
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
        if(y + radius > canvas.height){
            y = canvas.height - radius;
            vy = - Math.abs(vy);
        }
        // Bounce off the ceiling
        else if(y - radius < 0){
            y = radius;
            vy = Math.abs(vy);
        }
        // Bounce off the right wall
        if(x + radius > canvas.width){
            x = canvas.width - radius;
            vx = - Math.abs(vx);
        }
        // Bounce off the left wall
        else if(x - radius < 0){
            x = radius;
            vx = Math.abs(vx);
        }

        return { ...circle, x, y, vx, vy }
    });

}

function drawBox(){
    c.lineWidth = 0.001;
    c.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
}

function drawCircle({x, y, radius, fillColor, strokeColor, lineWidth}){
    c.beginPath();
    c.arc(x, y, radius - lineWidth/2, 0 , 2 * Math.PI, false);
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
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

canvas.addEventListener('mouseup', function(e){
    mouse.down = false;
});

// Draw the initial scene once, so something
// is displayed before animation starts.
executeFrame();
