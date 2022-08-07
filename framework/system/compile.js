function compile(code) {
    var canvas;
    var command;
    var entry;
    var entry_2;

    var content = '';
    // Here is where you choose what symbol/character/object splits each line of code (default: [\n])
    var splitCode = code.split(/\n/);
    for (i = 0; i < splitCode.length; i++) {
        // Here is where you choose what splits lines of code into different pieces (default: [:: ])
        canvas = splitCode[i].split(':: ');
        // console.log(canvas);

        command = canvas[0].replace(/\s/g, '').replace(/</g, '$startVector$').replace(/>/g, '$endVector$').replace(/\//g, '$fSlash$').replace(/-/g, '');
        entry = canvas[1];
        entry_2 = canvas[2];

        const objects = {
            title: {
                format: '<title' + convertToAttribute(entry_2) + '>' + entry + '</title>',
            },
            // Standard HTML Items
            $fSlash$: {
                format: entry,
            },
            button: {
                format: '<button ' + convertToAttribute(entry_2) + '>' + entry + '</button>',
            },
            image: {
                format: '<img src="' + entry + '" ' + convertToAttribute(entry_2) + '>',
            },
            link: {
                format: '<a href="' + entry + '" ' + convertToAttribute(entry_2) + '>',
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
            $startVector$b: {
                format: '<div ' + convertToAttribute(entry) + '>',
            },
            b$endVector$: {
                format: '</div>',
            },
            // Span (link item)
            $startVector$l: {
                format: '<span ' + convertToAttribute(entry) + '>',
            },
            l$endVector$: {
                format: '</span>',
            },
            // Meta Tag
            meta: {
                format: '<meta ' + convertToAttribute(entry) + '>'
            },
            // Scripts
            initscript: {
                format: '<script>' 
            },
            // Declarations
            declarevar: {
                format: '<div id="' + entry + '" style="display:none">' + entry_2 + '</div>'
            },
        }

        if (command == '') {
            void(0);
        } else if (command == '##'){
            void (0);
        } else if (objects[command] !== undefined) {
            let format = objects[command]['format'];
            content = content + format;
        } else {
            console.log('Syntax Error: "' + canvas + '"');
        }
    }
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