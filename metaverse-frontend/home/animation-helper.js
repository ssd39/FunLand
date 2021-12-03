var hpgButterfly = window.hpgButterfly; // a global variable for this homepage graphic
var time = +new Date() / 1000;
var canvas = document.getElementById("home_canvas")
var isMultiTouch = false;
var multiTouchChargeToggle = false;
var touchEvents = [];
var inputXY;
var requestId =null

if (hpgButterfly.checkIsSupported (canvas)) {
init();
} else {
// No WebGL support here.
}

function init () {
hpgButterfly.init();

// to restart and regenerate the butterfly
hpgButterfly.reset();

window.addEventListener('resize', onResize);
onResize();
start_anim()

// you can alter the input event as you wish to or even use some input event library.

canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('touchmove', getTouchBound(onMove));
canvas.addEventListener('mouseup', onUp);


// the following is not needed in the production
var properties = hpgButterfly.properties;
}

function getInputXY (evt) {
var rect = canvas.getBoundingClientRect();
var xy = {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
};
return {
  x: (evt.clientX - rect.left) / rect.width * 2 - 1,
  y: 1 - ((evt.clientY - rect.top) / rect.height * 2)
};
}

function onDown (evt) {
inputXY = getInputXY(evt);
onMove(evt);
}

function onMove (evt) {
var newInputXY = getInputXY(evt);
hpgButterfly.properties.mouse.set(newInputXY.x, newInputXY.y); // x, y as in {x:  -1 to 1, y: -1 to 1 }
if (!isMultiTouch) {
    if (!inputXY) inputXY = newInputXY;
    hpgButterfly.draw(inputXY.x, inputXY.y, newInputXY.x, newInputXY.y);
}
inputXY = newInputXY;
}

function onUp (evt) {
}

function onClick (evt) {

}

function getTouchBound (fn) {
return function (evt) {
    if (evt.preventDefault) evt.preventDefault();
    isMultiTouch = evt.touches.length > 1;
    if (isMultiTouch) {
        touchEvents[0] = getInputXY(evt.touches[0]);
        touchEvents[1] = getInputXY(evt.touches[1]);
    }
    fn.call(this, evt.changedTouches[0] || evt.touches[0]);
};
}

function onResize () {
// resize the web canvas to the screen size
hpgButterfly.resize(window.innerWidth, window.innerHeight);
}

function loop () {
    requestId = window.requestAnimationFrame(loop);
    render();
}

function start_anim() {
    if (!requestId) {
       requestId = window.requestAnimationFrame(loop);
    }
}

function stop_anim() {
    if (requestId) {
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
    }
}

function render () {
var newTime = +new Date() / 1000;
var deltaTime = newTime - time;

// to create that "Charging Effect".
if (isMultiTouch) {
    let from = touchEvents[multiTouchChargeToggle ? 0 : 1];
    let to = touchEvents[multiTouchChargeToggle ? 1 : 0];
    hpgButterfly.draw(from.x + (Math.random() - 0.5) * 0.1, from.y + (Math.random() - 0.5) * 0.1, to.x + (Math.random() - 0.5) * 0.1, to.y + (Math.random() - 0.5) * 0.1);
    multiTouchChargeToggle = !multiTouchChargeToggle;
}

// pass delta time in second into the api
hpgButterfly.render(deltaTime);
time = newTime;
}

