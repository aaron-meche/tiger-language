function dom(id) {
    return document.getElementById(id);
}

function cursorInfo(event, message) {
    var x = event.clientX;
    var y = event.clientY;
    dom('cursorInfo').innerHTML = message;
    dom('cursorInfo').style.opacity = '1';
    dom('cursorInfo').style.left = x + 10;
    dom('cursorInfo').style.top = y + 10;
}

function dissolveCursorInfo() {
    dom('cursorInfo').style.opacity = '0';
}