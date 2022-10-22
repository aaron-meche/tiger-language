let version = '3.0';

var loadKey;

// When the page loads
window.addEventListener('load', function () {
    // Get Page Push
    let url = new URLSearchParams(document.location.search);
    let pagePush = url.get('p');

    // If Page Push Present
    if (pagePush) {
        boot(pagePush);
        open_url('index.html');
    } 

    // Default Page Load
    else {
        if (sessionStorage['activePage']) {
            boot(sessionStorage['activePage']);
        } else {
            sessionStorage['activePage'] = 'home';
        }
    }
})

function boot(fileName) {
    let content = fetchContents('pages/' + fileName + '.tgr');
    if (content.includes('<pre>Cannot GET')) {
        console.warn('404 Error: Page not found');
        open_page('home');
    } 
    // If page exists, build page
    else {
        document.body.innerHTML = compile(content);

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
    }
}

function boot(fileName) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener('readystatechange', function( ){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            buildPage(compile(xmlhttp.responseText));
        }
    })
    xmlhttp.open("GET", 'pages/' + fileName + '.tgr', false);
    xmlhttp.send();
}

function buildPage(content) {
    if (content.includes('<pre>Cannot GET')) {
        console.warn('404 Error: Page not found');
        open_page('home');
    } 
    // If page exists, build page
    else {
        document.body.innerHTML = content;

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
    }
}



// COMPILER

function compile(code) {
    // Will hold viewport contents
    var collection = '';
    var splitCode = code.split('\n');
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
        else if (line[0].trim().split('')[0] == '~') {
            continue;
        } 
        // Check if normal text
        else if (line[0].trim().split('')[0] == ':') {
            collection += instruction.replace(': ','');
            continue;
        } 
        // If not, treat as normal and remove spaces
        else {
            instruction = instruction.toLowerCase()
            instruction = instruction.replaceAll(' ', '')
            instruction = instruction.replaceAll('<', '$leftPoint$')
            instruction = instruction.replaceAll('>', '$rightPoint$')
            instruction = instruction.replaceAll('/', '$slash$');
            instruction = instruction.replaceAll(' ', '');
            instruction = instruction.replaceAll('-', '');
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

            screen: {
                format: '<div tgrType="screen" style="height:100vh; width:100vw; position:absolute; top:0; left:0; visibility:hidden;"' + convertToAttribute(value) + '>',
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
        // Base
        attributes = attributes.replace('.','class')
        attributes = attributes.replace('#','id')
        attributes = attributes.replace('$','onclick')
        attributes = attributes.replace('@','name')
        // Used for data transfers
        attributes = attributes.replace('*local','localDataFetch="true" location')
        attributes = attributes.replace('*session','sessionDataFetch="true" location')
        attributes = attributes.replace('*db','dbDataFetch="true" location')
        // Required for Compile
        attributes = attributes.replaceAll('[','="')
        attributes = attributes.replaceAll(']','"')
        return attributes;
    } else {
        return '';
    }
}

function unspace(string) {
    string = string.replaceAll(' ', '');
    return string;
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

function clog(text) {
    console.log(text);
}

function dom(id) {
    return document.getElementById(id);
}

function dom_c(className) {
    return document.getElementsByClassName(className);
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
    let content = fetchContents('pages/' + fileName + '.tgr');
    if (content.includes('<pre>Cannot GET')) {
        console.warn('Page Not Found! Preload failed due to 404 error: ' + fileName + '.tgr');
    } 
    // If page exists, build page
    else {
        sessionStorage['page preload: ' + fileName] = compile(content);
    }
}



// INSTANT PAGE NAVIGATOR

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



// TIGER DATABASE

function readDB(link, path, key){
    let location = `${link}/${path}$read$${key}`;
    return fetchContents(location);
}

function writeDB(link, path, permissions, value){
    let key = permissions + '---' + value; 
    let location = `${link}/${path}$write$${key}`;
    return fetchContents(location);
}

function matchDB(link, path, key){
    let location = `${link}/${path}$match$${key}`;
    let response = fetchContents(location);
    
    if (response == 'Yes') {
        return true;
    } else {
        return false;
    }
}

function fetchContents(url) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.addEventListener('readystatechange', function( ){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            return xmlhttp.responseText;
        }
    })

    xmlhttp.open("GET", url, false);
    xmlhttp.send();

    return xmlhttp.response;
}