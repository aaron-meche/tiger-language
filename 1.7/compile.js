// MAIN JAVASCRIPT



let version = '1.7';

var loadKey;

window.addEventListener('load', function () {
    let urlParams = new URLSearchParams(document.location.search);
    let urlPageRequest = urlParams.get('p');

    if (urlPageRequest == undefined) {
        if (sessionStorage['activePage'] == undefined) {
            sessionStorage['activePage'] = 'home';
            readTextFile('home');
        } else {
            readTextFile(sessionStorage['activePage']);
        }
    } else {
        readTextFile(urlPageRequest);
        open_url('index.html');
    }
})

function readTextFile(fileName) {
    loadedFile = fileName;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", "pages/" + fileName + ".tgr", true);
    rawFile.onreadystatechange = function() {
        // console.log(rawFile.responseText);
        if (rawFile.readyState === 4) {
            if (rawFile.responseText.includes('<pre>Cannot GET')) {
                alert('404 Error: Invalid Page');
                open_page(sessionStorage['activePage']);
            } else {
                sessionStorage['activePage'] = fileName;
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
    if (convertedCode.includes("<meta name='tiger-ui'>")) {
        initiateUI();
    }
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
            let commend_without_starting_colon = command.replace('$colon$$colon$ ','').replace('$colon$',':');
            content = content + commend_without_starting_colon;
        } 
        // If not, remove spaces
        else {
            command = command.toLowerCase().replace(/\s/g, '').replace(/</g, '$startVector$').replace(/>/g, '$endVector$').replace(/\//g, '$fSlash$').replace(/-/g, '');
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
                format: '<video ' + convertToAttribute(entry_2) + '><source src="' + entry + '"></video>',
            },
            videoskin: {
                format: '<video ' + convertToAttribute(entry) + '>',
            },
            $fSlash$videoskin: {
                format: '</video>',
            },
            source: {
                format: '<source src="' + entry + '"' + ' ' + convertToAttribute(entry_2) + '>',
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
                format: '<link rel="shortcut icon" type="image/jpg" href="' + entry + '" ' + convertToAttribute(entry_2) + '>',
            },
            importtigerui: {
                format: `<meta name='tiger-ui'>`,
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
    return document.getElementById(id);
}

function dom_s(id) {
    return document.getElementById(id).style;
}

function dom_html(id) {
    return document.getElementById(id).innerHTML;
}

function dom_c(className) {
    return document.getElementsByClassName(className);
}

function dom_ci(className, index) {
    return document.getElementsByClassName(className)[index];
}

function dom_qa(reference) {
    return document.querySelectorAll(reference);
}

function testCompileSpeed(repeat) {
    for (let i = 0; i < repeat; i++) {
        pageOnloadTiger();
    }
}



window.addEventListener('keydown', function (event) {
    // console.log(event.code);
    // if (event.code == 'Backquote') unlockBox();
    if (event.code == 'Backslash') open_page(prompt("Enter Destination Page"));
})

// Mobile alternative ^^^
window.addEventListener('touchstart', (e) => {
    if (e.touches.length == 4) {
        open_page(prompt("Enter Destination Page"));
    }
})



function getFileContent(fileName) {
    loadedFile = fileName;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", fileName, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            return rawFile.responseText;
        }
    }
    rawFile.send();
}

function ifPageExists(fileName) {
    loadedFile = fileName;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", 'pages/' + fileName + '.tgr', true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.responseText.includes('<pre>Cannot GET')) {
                return false;
            } else {
                return true;
            }
        }
    }
    rawFile.send();
}











// BEGIN TIGER UI LIBRARY











// This javascript file was designed to be as sophisticated as possible
// The Tiger UI library is inteded to be as powerful as any other UI library on the market!
// Designed to make beautiful, easier, and faster UIs

function initiateUI() {
    say('Tiger UI Version ' + version);

    // Run clickable.buttons.tgrUI
    let clickables = dom_qa('.clickable');
    if (clickables) {
        clickables.forEach(x => {
            x.addEventListener('mousedown', () => {
                x.style.opacity = '0.65';
            });
            x.addEventListener('mouseup', () => {
                x.style.opacity = '1';
            });

            x.addEventListener('touchstart', () => {
                x.style.opacity = '0.65';
            });
            x.addEventListener('touchend', () => {
                x.style.opacity = '1';
            });
        });
    }

        // Run pull.down.tabs.tgrUI
        let pullTabs = dom_qa('.pull-down-tab');
        if (pullTabs) {
            pullTabs.forEach(x => {
                var startPos;
                var dragOffset;
                x.addEventListener('touchstart', (event) => {
                    dragOffset = event.pageY - x.parentNode.offsetTop;
                    startPos = x.parentNode.offsetTop;
                });
                x.addEventListener('touchmove', (event) => {
                    x.parentNode.style.top = event.pageY - dragOffset;
                });
                x.addEventListener('touchend', () => {
                    if (x.parentNode.offsetTop > startPos + 50) {
                        // If pulled down more than 50 pixels, push down
                        let transDuration = x.parentNode.style.transitionDuration;
                        x.parentNode.style.transitionDuration = '500ms';
                        x.parentNode.style.top = '100vh';
                        setTimeout(function () {
                            x.parentNode.style.transitionDuration = transDuration;
                        }, 500);
                    } else {
                        // Revert back to the start if not pulled down enough
                        let transDuration = x.parentNode.style.transitionDuration;
                        x.parentNode.style.transitionDuration = '200ms';
                        x.parentNode.style.top = startPos;
                        setTimeout(function () {
                            x.parentNode.style.transitionDuration = transDuration;
                        }, 200);
                    }
                });
            });
        }
}