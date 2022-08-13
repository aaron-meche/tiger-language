var mobileNavMenuExpanded = false;

function mobileNavMenu() {
    if (mobileNavMenuExpanded) {
        document.getElementById('mobileNavbarDropMenu').style.display = 'none';
        document.getElementById('expandMobileNavMenu').style.display = 'block';
        document.getElementById('closeMobileNavMenu').style.display = 'none';
        mobileNavMenuExpanded = false;
    } else {
        document.getElementById('mobileNavbarDropMenu').style.display = 'block';
        document.getElementById('expandMobileNavMenu').style.display = 'none';
        document.getElementById('closeMobileNavMenu').style.display = 'block';
        mobileNavMenuExpanded = true;
    }
}

function dom(id) {
    return document.getElementById(id);
}

function cursorInfo(event, message) {
    var x = event.pageX;
    var y = event.pageY;
    dom('cursorInfo').innerHTML = message;
    dom('cursorInfo').style.opacity = '1';
    dom('cursorInfo').style.left = x + 10;
    dom('cursorInfo').style.top = y + 10;
}

function dissolveCursorInfo() {
    dom('cursorInfo').style.opacity = '0';
}