// MAIN JAVASCRIPT



let version = '1.6';

var loadKey;

window.addEventListener('load', function () {
    pageOnloadTiger();
})

function pageOnloadTiger() {
    let urlParams = new URLSearchParams(document.location.search);
    let urlPageRequest = urlParams.get('p');
    let loadPage = sessionStorage['activePage']

    if (urlPageRequest == undefined) {
        if (loadPage == undefined) {
            sessionStorage['activePage'] = 'home';
            readTextFile('home');
        } else {
            readTextFile(loadPage);
        }
    } else {
        readTextFile(urlPageRequest);
        sessionStorage['activePage'] = urlPageRequest;
        open_url('index.html');
    }
    
    loadPage = sessionStorage['activePage'];
}

function readTextFile(fileName) {
    loadedFile = fileName;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", "pages/" + fileName + ".tgr", true);
    rawFile.onreadystatechange = function() {
        // console.log(rawFile.responseText);
        if (rawFile.readyState === 4) {
            if (rawFile.responseText.includes('<pre>Cannot GET')) {
                alert('That page does not exist');
            } else {
                buildPage(rawFile.responseText);
            }
        }
    }
    rawFile.send();
}

function buildPage(code) {
    let convertedCode = compile(code)
    document.body.innerHTML = convertedCode;
    // console.log(convertedCode);
    document.body.style.display = 'block';
    bodyOnLoadFunctions();
}



// COMPILER



let compileTime = 0;

function compile(code) {
    var canvas;
    var command;
    var entry;
    var entry_2;

    var content = '';
    var splitCode = code.split(/\n/);

    console.time('Compiler Time');

    for (i = 0; i < splitCode.length; i++) {
        canvas = splitCode[i].split(' : ');
        // console.log(canvas);

        command = canvas[0].replace(/:/g, '$colon$');

        // Check if just normal test
        if (command.includes('$colon$$colon$')) {
            let commend_without_starting_colon = command.replace('$colon$$colon$','').replace('$colon$',':');
            content = content + commend_without_starting_colon;
        } 
        // If not, remove spaces
        else {
            command = command.replace(/\s/g, '').replace(/</g, '$startVector$').replace(/>/g, '$endVector$').replace(/\//g, '$fSlash$').replace(/-/g, '');
        }

        entry = canvas[1];
        entry_2 = canvas[2];

        const objects = {
            // Standard HTML Items
            title: {
                format: '<title' + convertToAttribute(entry_2) + '>' + entry + '</title>',
            },
            button: {
                format: '<button ' + convertToAttribute(entry_2) + '>' + entry + '</button>',
            },
            image: {
                format: '<img src="' + entry + '" ' + convertToAttribute(entry_2) + '>',
            },
            link: {
                format: ' <a href="' + entry + '" ' + convertToAttribute(entry_2) + '>',
            },
            $fSlash$link: {
                format: '</a> ',
            },
            h: {
                format: '<h1 ' + convertToAttribute(entry_2) + '>' + entry + '</h1>',
            },
            hh: {
                format: '<h2 ' + convertToAttribute(entry_2) + '>' + entry + '</h2>',
            },
            hhh: {
                format: '<h3 ' + convertToAttribute(entry_2) + '>' + entry + '</h3>',
            },
            p: {
                format: '<p>',
            },
            $fSlash$p: {
                format: '</p>',
            },
            break: {
                format: '<br>',
            },
            form: {
                format: '<form ' + convertToAttribute(entry) + '>',
            },
            $fSlash$form: {
                format: '</form>',
            },
            input: {
                format: '<input ' + convertToAttribute(entry) + '>',
            },
            video: {
                format: '<video ' + convertToAttribute(entry_2) + '><source src"' + convertToAttribute(entry) + '"></video>',
            },
            videoskin: {
                format: '<video ' + convertToAttribute(entry) + '>',
            },
            $fSlash$videoskin: {
                format: '/<video ' + convertToAttribute(entry) + '>',
            },
            source: {
                format: '<source src"' + convertToAttribute(entry) + '" + ' + convertToAttribute(entry_2) + '>',
            },
            portal: {
                format: '<iframe src="' + convertToAttribute(entry) + '" + ' + convertToAttribute(entry_2) + '></iframe>',
            },
            // Imports
            importcss: {
                format: '<link rel="stylesheet" href="' + entry + '" ' + convertToAttribute(entry_2) + '>',
            },
            importjs: {
                format: '<script src="' + entry + '"></script>',
            },
            importwebicon: {
                format: '<link rel="icon" type="image/x-icon" href="' + entry + '" ' + convertToAttribute(entry_2) + '>',
            },
            // Import Apple Mobile Web App
            importapplewebapp: {
                format: '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="' + entry + '">',
            },
            importapplewebappicon: {
                format: '<link rel="apple-touch-icon" href="' + entry + '">',
            },
            importapplewebapptitle: {
                format: '<meta name="apple-mobile-web-app-title" content="' + entry + '">',
            },
            // Div (block item)
            block: {
                format: '<div ' + convertToAttribute(entry) + '>',
            },
            textblock: {
                format: '<div ' + convertToAttribute(entry) + '>',
            },
            navblock: {
                format: '<div ' + convertToAttribute(entry) + '>',
            },
            block: {
                format: '<div ' + convertToAttribute(entry) + '>',
            },
            $fSlash$block: {
                format: '</div>',
            },
            // Span (link item)
            item: {
                format: '<span ' + convertToAttribute(entry) + '>',
            },
            $fSlash$item: {
                format: '</span>',
            },
            // Meta Tag
            importmeta: {
                format: '<meta ' + convertToAttribute(entry) + '>'
            },
            // Scripts
            initscript: {
                format: '<script>' 
            },
            conclscript: {
                format: '</script>' 
            },
            // Declarations
            declarevar: {
                format: '<div id="' + entry + '" style="display:none">' + entry_2 + '</div>'
            },
        }

        
        // Ignore blank lines
        if (command == '') {
            void(0);
        } 
        // Ignore comments
        else if (command == '##'){
            void (0);
        } 
        // If command exists
        else if (objects[command] !== undefined) {
            let format = objects[command]['format'];
            content = content + format;
        } 
        else {
            if (!command.includes('$colon$$colon$')) {
                console.warn('Syntax Error: "' + canvas + '"');
            }
        }
    }
    console.timeEnd('Compiler Time');
    return content;
}

function convertToAttribute(attributes) {
    if (attributes !== undefined) {
        return attributes.replace(/\[/g, '="').replace(/\]/g, '"');
    } else {
        return '';
    }
}

function unspace(string) {
    let newstring = string.replace(/\s/g, '')
    return newstring;
}



// LIBRARY



function open_page(page) {
    readTextFile(page);
    sessionStorage['activePage'] = page;
}

function open_url(page) {
    window.open(page, '_self')
}

function say(text) {
    console.log(text);
}

function getVar(id) {
    return document.getElementById(id).innerText;
}

function dom(id) {
    return document.getElementById(id)
}

function testCompileSpeed(repeat) {
    for (let i = 0; i < repeat; i++) {
        pageOnloadTiger();
    }
}

window.addEventListener('keydown', function (event) {
    // console.log(event.code);
    if (event.code == 'Backquote') {
        unlockBox();
    } else {
        resetLock();
    }
})

function unlockBox() {
    document.body.innerHTML = document.body.innerHTML + `<link rel="stylesheet" href="https://tiger.baileo.us/1.6/style.css">"
    <div>
        <div class='panel-wrapper-background'></div>
        <div class='panel-wrapper' ondblclick='this.parentNode.style.display="none"'>
            <div class='panel'>
                <div class='section'>
                    <span class='label'>
                        Tiger Version:
                    </span>
                    <span class='answer'>
                        ` + version + `
                    </span>
                </div>
                <div class='section'>
                    <span class='label'>
                        Current URL:
                    </span>
                    <span class='answer'>
                        ` + window.location.href + `
                    </span>
                </div>
                <div class='section'>
                    <span class='label'>
                        Current Page:
                    </span>
                    <span class='answer'>
                        ` + sessionStorage['activePage'] + `
                    </span>
                </div>
                <div class='section'>
                    <span class='label'>
                        Data Items Stored in Browser:
                    </span>
                    <span class='answer'>
                        ` + (localStorage.length + sessionStorage.length) + `
                    </span>
                </div>
                <div class='section'>
                    <span class='label'>
                        Diagnosis:
                    </span>
                    <span class='answer'>
                        ` + 'No issues detected' + `
                    </span>
                </div>
            </div>
        </div>
    </div>
    
    
    `;
}