var loadKey;

window.addEventListener('load', function () {
    // var urlParams = new URLSearchParams(document.location.search);
    // loadPage = urlParams.get('p');
    loadPage = sessionStorage['activePage'];
    if (loadPage == undefined) {
        sessionStorage['activePage'] = 'home';
        readTextFile('home');
    } else {
        readTextFile(loadPage);
    }
})

function readTextFile(fileName) {
    loadedFile = fileName;
    var rawFile = new XMLHttpRequest();
    // Here you can change the path to your .by files
    rawFile.open("GET", "pages/" + fileName + ".by", true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            buildPage(rawFile.responseText);
        }
    }
    rawFile.send();
}

function buildPage(code) {
    document.getElementById('body').innerHTML = compile(code);
    document.getElementById('backbone').innerHTML = '';

    document.getElementById('bodyDOM').style.display = 'block';
    bodyOnLoadFunctions();
}