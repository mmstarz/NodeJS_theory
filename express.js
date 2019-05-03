/* ExpressJS - framework for heavy lifting Server Logic

alternatives:
1. Vanilla Node.js
2. Adonis.js(Laravel inspired framework for Node.js)
3. Koa
4. Sails.js
...

ExpressJS is all about middleware.

  [request]
      |
[middleware] - (req, res, next) => {...}
      |
    next() - is a function that allows the incoming request to travel to the next middleware
      |
[middleware] - (req, res, next) => {...}
      |
  res.send()
      |
  [response]


in Express middleware can be created with a .use() method
app.use((req, res, next) => {
    //...
    next();
    // if there are no next() than have to send a response,
    // otherwise response will be unreachable.
});

// Node.js Server Basics with Express:
// const http = require('http'); // no need if app.listen(3000); shorthand is used
const express = require('express');

const app = express();
app.use((req, res, next) => { // this function will be executed for every incoming request
    console.log('middleware1');
    next(); // allows request to reach next middleware from top to bottom    
});

app.use((req, res, next) => { 
    console.log('middleware2');
    // if there are no next() than have to send a response,
    // otherwise response will be unreachable.
    // still can use vanilla Node.js functions like:
    // res.setHeader();
    // res.write();
    // but express has special method .send()
    res.send('<h1>Hello from Express</h1>'); // allows to send a response
});


// const server = http.createServer((req, res) => {...});
// app constant is a valid argument for http.createServer(app);
const server = http.createServer(app);
server.listen(3000);

or 
// do both const server = http.createServer(app); and server.listen(3000); by:
app.listen(3000); // now can also remove const http = require('http');
*/