/*
// nodeJS file system manual:
https://nodejs.org/api/fs.html

//importing file system functionality
const fs = require('fs');

// fs.writeFileSync(file, data[, options])
file    <string> | <Buffer> | <URL> | <integer> filename or file descriptor
data    <string> | <Buffer> | <TypedArray> | <DataView>
options <Object> | <string>

    encoding    <string> | <null> Default: 'utf8'
    mode        <integer> Default: 0o666
    flag        <string> See support of file system flags. Default: 'w'.

Returns undefined.

*/
console.log('Creating new txt file...');
const fs = require('fs');
const folderPath = 'D:/vadim/visual studio/prjcts/nodejs-zero-advanced/theory/';
// first argument is a path including file name
// second argument is a content(rewrites existing content if file already exist)
fs.writeFileSync(`${folderPath}hello.txt`, 'Hello from Node.js');

/* 
fs.writeFileSync() blocks below code execution before this file will be created.
for big files operations should use:
fs.writeFile() which also accepts a callback function as an argument
*/

// example:
// redirect user and store data into a file
if (url === '/message' && method === 'POST') {
    const body = []; // assign variable for request body part
    req.on('data', (chunk) => { // node js will continue until
        body.push(chunk); // it gets all chunks of data request
    });
    // req.on('end') get called once its done parsing request data
    return req.on('end', () => { // w8 for callback return before running code below
        const parsedBody = Buffer.concat(body).toString();
        const message = parsedBody.split('=')[1];
        // store data from message into file
        fs.writeFile('./message.txt', message, err => { // using callback
            // which takes errors if such occurs while file operation
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end(); // return prevents running the code below
        });
    });
}