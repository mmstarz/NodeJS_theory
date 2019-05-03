/* What is Node.js ?
Node.js is a JavaScript Runtime(something like another version of JavaScript).

Takes JS and puts it in a different(from browser) environment:
JavaScript on the server.
Basically allows to run JS not only in browser but on any machine like any other
programming language.

Node.js uses V8(JavaScript engine build up by Google that runs JS in a browser).
V8 takes JavaScript code and compiles it to machine code.
V8 itself is written in C++.

// Installation 
NodeJS adds new features to V8 (like file manipulations...)
https://nodejs.org/uk/ - to download and install NodeJS
// updating
npm -g install npm
// check version
node -v 
// enter REPL(which you can use as calculator or even write JScode)
node

//ways of code running
( use cd to go to the file destination )
1.via REPL(in terminal, command prompt)
    [R]ead  - read user input
    [E]val  - evaluate user input
    [P]rint - print output result 
    [L]oop  - wait for new input
Ctrl + C or .exit - for exit.
2.node filename.js(in terminal, command prompt)
Ctrl + C or .exit - for exit.
3.Code Runner Extension

// IDE (code writer interface)
1. Visual Studio Code
2. WebStorm
3. Atom
...

//NodeJS Features:
1.File System
    // nodeJS file system manual
    https://nodejs.org/api/fs.html
    //importing file system functionality
    const fs = require('fs');
2.JavaScript on the server
                              // Business Logic
                              / Access Database
               SERVER[NodeJS] - Authentication
                |  |          \ Input Validation
                |  |
                |  |
      (request) |  | (response(HTML,JS,CSS...))
    USER  ->  BROWSER
           (HTML,CSS,JS)
3.Utility Scripts, Build tools,...

NodeJS role in web development:
1.Run Server(Create server & Listen to incoming requests)
2.Business Logic(Handle requests, Validate input, Connect to database...)
3.Responses(Return responses(Rendered HTML, JSON, XML, Files, pages with dynamic content...))

Alternatives(replacements) to Node.js:
1.Python with frameworks like Flask, Jango...
2.PHP with Laravel framework or stande alone vanilla
3.Ruby on rails
4.ASP.NET
...
*/