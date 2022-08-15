Welcome to the Tiger Programming Language, lets get started with the basics, the syntax.
New lines are VERY important in Tiger because they separate different functions from other functions (indentation is irrelevant)

---

For example, if you want to create a container with some text in it, write it like this:

block
	:: Text
/block

/// ^^ CORRECT ^^ ///



DO NOT write it like this, this will cause an error and not be functional

block ::Text /block

*** ^^ WRONG ^^ ***



---



Some important keywords include:


title
    format =        title : [insert page title]
    use =           Changes the title of the page in the browser

import
    format =        import [module] : [more info (if necessary)]
    use =           Import different functions, style sheets, meta tags, and more into your Tiger File
    examples =      import css : [link to css file] : [additional attributes]
                    import apple-web-app : [black/black-transparent]
                    import apple-web-app-icon : [link to image]

h / hh / hhh
    format =        [h/hh/hhh] : [text]
    use =           Add different headings (h = heading 1, biggest ... hh = heading 2, seconds biggest ...)

block
/block
    format =        block : [additional attributes]
                        [content]
                    /block
    use =           Container
    example =       block : class[testing]
                        :: Hello, this is text within a container
                    /block

link
/link
    format =        link : [url] : [additional attributes]
                        [hyperlink content]
                    /link
    use =           Add a hyperlink
    example =       link : https://apple.com : class[apple-link]
                        :: Click here to visit the Apple webiste
                    /link

meta
    format =        meta : [meta tag content]
    use =           Add meta tags

button
/button
    format =        button : [additional attributes]
                        :: [button content]
                    /button
    use =           Adds a button
    example =       button : onclick[sayHello()]
                        :: Click to say Hello
                    /button