/* Scheme of NodeJS Server working behind the scenes.

    [node app.js] -----------> [Start Script]
                                     |
                                     |
                [Parse Code, Register variables & functions]
                                     |
                                     |
                                     |
                                     |
     The node application ---- [event loop] ----> [Keeps on running as long
                                     |             as there are event listeners
                                     |             registered]
                                     |
                               [process.exit]
                            (hard exit event loop)

*/

/* important to understand
Every time when we pass funtion as an argument NodeJS woun't exec it immediately
instead it will register this callback in some iternal list of events and listeners
and continue doing code below.
To avoid code blocking problems need to add return before event listener.
return req.on('end', () => {...});
*/

// Server build up functiolnality with help of core modules.

// NodeJS Core modules examples:
// 1.HTTP  -> Launch a server, send requests to this server
//            or even other servers,  and get responses.
// 2.HTTPS -> Launch a SSL(encoding) server.
// 3.fs
// 4.os
// 5.path

/* NodeJS importing file exaples */
// look for a global module
// const http = require('http'); // no symbols before name
// const fs = require('fs');

// look file by path
// const yourFile = require('/path/file.extension');

// look file in same folder
// const anotherfile = require('./file.extension'); 

// look file one folder up
// const anotherfile = require('../file.extension');
/* extension is not necessary for JavaScript files */

// files imports
// const routes = require('./routes.js'); // importing from routes.js
// console.log(routes.someText);

/*****ONE WAY OF CREATING SERVER*****/
// requestListener() is a function that will execute for every incoming request.
// requestListener takes 2 arguments: 'request', 'response' 
// function rqListener(req, res) {
// 
// }
/* createServer() takes a requestListener() function reference as an argument.
   Simply tells createServer() to look for that function
   every time there is an incoming request.
   .createServer() method returns a Server */
// const server = http.createServer(rqListener); 

/*****SECOND WAY OF CREATING SERVER*****/
// use anonymous function as an argument
// const server = http.createServer(function(req, res) { 
// 
// });

/*****THIRD WAY OF CREATING SERVER*****/
// use ECMAScript2015 arrow function
const http = require('http'); // assign variable for 'http' global module
const fs = require('fs');
// const routes = require('./routes.js'); // importing from routes.js
// as long as we importing a function(req, res => {...})
// const server = http.createServer(routes.handler); // even more lean(thin худий) way

const server = http.createServer((req, res) => {
    // show some Data from the request
    // console.log(req.url, req.method, req.headers); // returns / GET {...headers}
    const url = req.url;
    const method = req.method;
    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Enter Message</title></head>');
        res.write('<body>');
        // GET request is automatically send when you click a link or enter a url
        // POST request have to be set up manually 
        // POST will send a request to /sendMessage (action)
        // It will also look into the form, detect any data in the inputs(selects) elements,
        // take and pass all data from the input field by its name.
        // and send this request to the server.
        res.write('<form action="/message" method="POST">'); // sets url to '/message'
        res.write('<input name="message" type="text">')
        res.write('<button type="submit">Submit</button>')
        res.write('</form>')
        res.write('</body>');
        res.write('</html>');
        return res.end(); // return from the function execuiton
        // return prevents running the code below
    }

    // redirect user and store data into a file
    if (url === '/message' && method === 'POST') {
        const body = []; // assign variable for request body part
        req.on('data', (chunk) => { // node js will continue until
            console.log(chunk);
            body.push(chunk); // it gets all chunks of data request
        });
        // req.on('end') get called once its done parsing request data
        return req.on('end', () => { // w8 for callback return before running code below
            const parsedBody = Buffer.concat(body).toString();
            console.log(parsedBody); // message=123456789
            // split parsedBody by '=' symbol on two strings. (['message', '123456789'])
            // and store the one(index of [1]) into a variable
            const message = parsedBody.split('=')[1];
            // store data from message into file
            fs.writeFileSync('./message.txt', message);
            // first argument is for Status Code (can use also res.statusCode = 302)
            // second is an object of head information        
            // res.writeHead(302, {});
            res.statusCode = 302;
            // set response location to '/'(simply redirects)
            res.setHeader('Location', '/');
            return res.end(); // return prevents running the code below
        });
    }
    // send response with updated header
    // tells server that response content will be of html type
    res.setHeader('Content-Type', 'text/html'); // setHeader('key', 'value');
    // allows to write that content of the resonse
    res.write('<html>');
    res.write('<head><title>NodeJS Test Page</title></head>');
    res.write('<body><h1>My first NodeJS page</h1></body>');
    res.write('</html>');
    // tells server that response is ready 
    res.end(); // !!! you CAN'T use res.write() again after setting res.end()
    // process.exit(); // hard exit(stops) server run process
});

/* .listen() is a special method. It doesn't exit script immediately.
    Instead NodeJS will keep it running to listen server
    for all incoming requests.
    .listen() takes a bunch of arguments:
    port: server port.
    */
server.listen(3000);