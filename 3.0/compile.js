let version = '3.0';

var loadKey;

// When the page loads
window.addEventListener('load', function () {
    // Get Page Push
    let url = new URLSearchParams(document.location.search);
    let pagePush = url.get('p');

    // Default Page Load
    if (pagePush == undefined) {
        if (sessionStorage['activePage'] == undefined) {
            sessionStorage['activePage'] = 'home';
        }
        boot(sessionStorage['activePage']);
    } 
    // If Page Push Present
    else {
        boot(pagePush);
        open_url('index.html');
    }
})

function boot(fileName) {
    let rawFile = new XMLHttpRequest();

    // Get contents of page
    rawFile.open("GET", 'pages/' + fileName + ".tgr", true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            // If page does not exist
            if (rawFile.responseText.includes('<pre>Cannot GET')) {
                alert('Error 404');
                open_page('home');
            } 
            // If page exists, build page
            else {
                buildPage(compile(rawFile.responseText));
            }
        }
    }
    rawFile.send();
}

function buildPage(code) {
    document.body.innerHTML = code;

    // Javascript Imports
    let jsImports = dom_c('JS-Import');
    if (jsImports) {
        for (let i = 0; i < jsImports.length; i++) {
            var script = document.createElement("script");
            script.src = jsImports[i].innerText;
            script.type = "text/javascript";
            document.head.appendChild(script);
        }
    }

    // Page Preloading
    let pagePreload = dom_c('page-preload-request');
    if (pagePreload) {
        for (let i = 0; i < pagePreload.length; i++) {
            preload(pagePreload[i].innerText);
        }
    }

    main();

    if (code.includes("<meta name='tiger-ui'>")) {
        initiateUI();
    }
}



// COMPILER



let compileTime = 0;

function compile(code) {
    // Will hold viewport contents
    var collection = '';
    var splitCode = code.split(/\n/);
    console.time('Compiler Time');

    // Cycles through every line of code
    for (i = 0; i < splitCode.length; i++) {
        let line = splitCode[i].split(' > ');
        let instruction = line[0];
        let value = line[1];
        let extra = line[2];


        // Reading Lines

        // Ignore blank lines
        if (line == '') {
            continue;
        } 
        // Ignore comments
        if (line[0].trim().split('')[0] == '~') {
            continue;
        } 
        // Check if normal text
        else if (line[0].trim().split('')[0] == ':') {
            collection += instruction.replace(': ','');
            continue;
        } 
        // If not, treat as normal and remove spaces
        else {
            instruction = instruction.toLowerCase().replaceAll(' ', '').replaceAll('<', '$leftPoint$').replaceAll('>', '$rightPoint$').replaceAll('/', '$slash$');
        }


        // Dictionary
        const objects = {
            // Standard HTML Items
            title: {
                format: '<title' + convertToAttribute(extra) + '>' + value + '</title>',
            },
            button: {
                format: '<button ' + convertToAttribute(extra) + '>' + value + '</button>',
            },
            img: {
                format: '<img src="' + value + '" ' + convertToAttribute(extra) + '>',
            },
            link: {
                format: ' <a href="' + value + '" ' + convertToAttribute(extra) + '>',
            },
            $slash$link: {
                format: '</a> ',
            },
            h: {
                format: '<h1 ' + convertToAttribute(extra) + '>' + value + '</h1>',
            },
            hh: {
                format: '<h2 ' + convertToAttribute(extra) + '>' + value + '</h2>',
            },
            hhh: {
                format: '<h3 ' + convertToAttribute(extra) + '>' + value + '</h3>',
            },
            p: {
                format: '<p>',
            },
            $slash$p: {
                format: '</p>',
            },
            break: {
                format: '<br>',
            },
            form: {
                format: '<form ' + convertToAttribute(value) + '>',
            },
            $slash$form: {
                format: '</form>',
            },
            input: {
                format: '<input ' + convertToAttribute(value) + '>',
            },
            video: {
                format: '<video ' + convertToAttribute(extra) + '><source src="' + value + '"></video>',
            },
            videoskin: {
                format: '<video ' + convertToAttribute(value) + '>',
            },
            $slash$videoskin: {
                format: '</video>',
            },
            source: {
                format: '<source src="' + value + '"' + ' ' + convertToAttribute(extra) + '>',
            },
            portal: {
                format: '<iframe src="' + convertToAttribute(value) + '" + ' + convertToAttribute(extra) + '></iframe>',
            },


            // Imports
            importcss: {
                format: '<link rel="stylesheet" href="' + value + '.css" ' + convertToAttribute(extra) + '>',
            },
            importjs: {
                format: '<div class="JS-Import" style="display:none">' + value + '.js</div>',
            },
            importwebicon: {
                format: '<link rel="shortcut icon" type="image/jpg" href="' + value + '" ' + convertToAttribute(extra) + '>',
            },
            importmeta: {
                format: '<meta ' + convertToAttribute(value) + '>',
            },
            importtigerui: {
                format: "<meta name='tiger-ui'>",
            },
            importmodule: {
                format: "<meta name='import-module' content='" + value + "'>",
            },


            // Page Preloading
            preload: {
                format: "<div class='page-preload-request' style='display:none'>" + value + "</div>",
            },


            // Import Apple Mobile Web App
            importapplewebapp: {
                format: '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="' + value + '">',
            },
            importapplewebappicon: {
                format: '<link rel="apple-touch-icon" href="' + value + '">',
            },
            importapplewebapptitle: {
                format: '<meta name="apple-mobile-web-app-title" content="' + value + '">',
            },


            // Elements
            div: {
                format: '<div ' + convertToAttribute(value) + '>',
            }, 
            elem: {
                format: '<div ' + convertToAttribute(value) + '>',
            },            
            elt: {
                format: '<div ' + convertToAttribute(value) + '>' + extra + '</div>',
            },
            block: {
                format: '<div style="display:block;" ' + convertToAttribute(value) + '>',
            },
            flex: {
                format: '<div style="display:flex;" ' + convertToAttribute(value) + '>',
            },
            grid: {
                format: '<div style="display:grid;" ' + convertToAttribute(value) + '>',
            },
            line: {
                format: '<div style="display:inline;" ' + convertToAttribute(value) + '>',
            },
            $leftPoint$$slash$$rightPoint$: {
                format: '</div>',
            },
        }


        // Interpreting Instructions

        // If command exists
        if (objects[instruction]) {
            collection += objects[instruction]['format'];
        } 
        // If it does not exist, throw error
        else {
            console.warn('Syntax Error: "' + line + '"');
        }
    }
    console.timeEnd('Compiler Time');
    return collection;
}

function convertToAttribute(attributes) {
    if (attributes !== undefined) {
        return attributes.replace('.','class').replace('#','id').replace('$','onclick').replace('@','name').replaceAll('[', '="').replaceAll(']', '"');
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
    sessionStorage['activePage'] = page;
    if (sessionStorage['page preload: ' + page]) {
        buildPage(sessionStorage['page preload: ' + page]);
    } else {
        boot(page);
    }
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

function generateNum(amount) {
    let library = [0,1,2,3,4,5,6,7,8,9];
    // let ranNum = Math.floor(Math.random() * library.length);
    var generatedKey = '';
    for (let i = 0; i < amount; i++) {
        generatedKey = generatedKey + Math.floor(Math.random() * 10);
    }
    say(generatedKey);
}

function generateKey(amount) {
    let library = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',0,1,2,3,4,5,6,7,8,9];
    // let ranNum = Math.floor(Math.random() * library.length);
    var generatedKey = '';
    for (let i = 0; i < amount; i++) {
        generatedKey = generatedKey + library[Math.floor(Math.random() * library.length)];
    }
    return generatedKey;
}

function preload(fileName) {
    let rawFile = new XMLHttpRequest();

    // Get contents of page
    rawFile.open("GET", 'pages/' + fileName + ".tgr", true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            // If page does not exist
            if (rawFile.responseText.includes('<pre>Cannot GET')) {
                console.error('Page Not Found! Preload failed due to 404 error: ' + fileName + '.tgr');
            } 
            // If page exists, build page
            else {
                sessionStorage['page preload: ' + fileName] = compile(rawFile.responseText);
            }
        }
    }
    rawFile.send();
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











// BEGIN TIGER UI LIBRARY











// This javascript file was designed to be as sophisticated as possible
// The Tiger UI library is inteded to be as powerful as any other UI library on the market!
// Designed to make beautiful, easier, and faster UIs

function initiateUI() {
    say('Tiger UI Version ' + version);
    initClickables();
    initPullDownTabs();
    initCursorFollowers();
    initRightClickMenus();
}

function initClickables() {
    let clickables = dom_qa('.clickable');
    if (clickables) {
        clickables.forEach(x => {
            x.addEventListener('mousedown', function() {
                x.style.opacity = '0.65';
            });
            x.addEventListener('mouseup', function() {
                x.style.opacity = '1';
            });

            x.addEventListener('touchstart', function() {
                x.style.opacity = '0.65';
            });
            x.addEventListener('touchend', function() {
                x.style.opacity = '1';
            });
        });
    }
}

function initPullDownTabs() {
    let pullTabs = dom_qa('.pull-down-tab');
    if (pullTabs) {
        pullTabs.forEach(x => {
            var offsets = x.parentNode.parentNode.getBoundingClientRect();
            var top = offsets.top;

            // Declare editable variables
            // var startPos = top;
            var dragOffset;
            var transDuration = x.parentNode.parentNode.style.transitionDuration;

            var mouseDown = false;
            var initBackground = x.parentNode.parentNode.style.background;

            x.parentNode.parentNode.style.position = 'fixed';

            // MOBILE
            x.addEventListener('touchstart', function(event) {
                dragOffset = event.pageY - x.parentNode.parentNode.offsetTop;
                x.parentNode.parentNode.style.transitionDuration = '0ms';
            });

            x.addEventListener('touchmove', function(event) {
                x.parentNode.parentNode.style.top = event.pageY - dragOffset + 'px';
            });

            x.addEventListener('touchend', function() {
                if (x.parentNode.parentNode.offsetTop > 50) {
                    // If pulled down more than 50 pixels, push down
                    x.parentNode.parentNode.style.transitionDuration = '500ms';
                    x.parentNode.parentNode.style.top = '100vh';

                    setTimeout(function () {
                        x.parentNode.parentNode.style.transitionDuration = transDuration;
                    }, 500);
                } else {
                    // Revert back to the start if not pulled down enough
                    x.parentNode.parentNode.style.transitionDuration = '200ms';
                    x.parentNode.parentNode.style.top = '0';

                    setTimeout(function () {
                        x.parentNode.parentNode.style.transitionDuration = transDuration;
                    }, 200);
                }
            });
            
            // DESKTOP
            x.addEventListener('mousedown', function(event) {
                dragOffset = event.pageY - x.parentNode.parentNode.offsetTop;
                x.parentNode.parentNode.style.transitionDuration = '0ms';
                mouseDown = true;
            });
            window.addEventListener('mousemove', function(event) {
                if (mouseDown) {
                    x.parentNode.parentNode.style.top = event.pageY - dragOffset + 'px';
                    x.parentNode.parentNode.style.background = 'none';
                }
            });
            x.addEventListener('mouseup', function() {
                mouseDown = false;
                if (x.parentNode.parentNode.offsetTop > 50) {
                    // If pulled down more than 50 pixels, push down
                    x.parentNode.parentNode.style.transitionDuration = '500ms';
                    x.parentNode.parentNode.style.top = '100vh';
                    setTimeout(function () {
                        x.parentNode.parentNode.style.transitionDuration = transDuration;
                        x.parentNode.parentNode.style.background = initBackground;
                    }, 500);
                } else {
                    // Revert back to the start if not pulled down enough
                    x.parentNode.parentNode.style.transitionDuration = '200ms';
                    x.parentNode.parentNode.style.top = '0';
                    setTimeout(function () {
                        x.parentNode.parentNode.style.transitionDuration = transDuration;
                        x.parentNode.parentNode.style.background = initBackground;
                    }, 200);
                }
            });
        });
    }
}

function initCursorFollowers() {
    let cursorFollowers = dom_qa('.cursor-follower');
    if (cursorFollowers) {
        cursorFollowers.forEach(x => {
            window.addEventListener('mousemove', function (event) {
                x.style.opacity = '1'
                x.style.position = 'fixed';
                x.style.top = (event.clientY - (x.offsetHeight * 0.5)) + 'px';
                x.style.left = (event.clientX - (x.offsetWidth * 0.5)) + 'px';
            })
            window.addEventListener('mouseout', function () {
                x.style.opacity = '0';
            })
        });
    }
}

function initRightClickMenus() {
    let rightClickMenu = dom_qa('.right-click-menu');
    if (rightClickMenu) {
        rightClickMenu.forEach(x => {
            x.addEventListener('mouseover', function() {
                x.style.display = 'block';
            })

            x.addEventListener('mouseout', function() {
                x.style.display = 'none';
            })

            window.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                x.style.display = 'block';
                x.style.position = 'absolute';
                x.style.zIndex = '100000000000';
                x.style.top = event.pageY - 5 + 'px';
                x.style.left = event.pageX - 5 + 'px';
            })

            window.addEventListener('click', function () {
                x.style.display = 'none';
            })

            window.addEventListener('scroll', function () {
                x.style.display = 'none';
            })
        });
    }
}