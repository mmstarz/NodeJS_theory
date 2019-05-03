/*
1. create 'views' folder for HTML pages.

// shop.html
html => html:5 => TAB (get HTML start scelet)
set title
add navigation header 
add main content 

// add-product.html
html => html:5 => TAB (get HTML start scelet)
set title
add navigation header
add main content

// connect HTML files with routes
// shop.js
const express = require('express'); // import express
const path = require('path'); // NodeJS special module
const router = express.Router(); // create router object
// middleware (if we don't call .next() it won't go to the next middleware)
router.get('/', (req, res, next) => {
    // .join() returns a path
    // path.join() auto detects OS and build correct path
    // Linux uses /folder/file
    // Windows uses \folder\file    
    // constructing this path by .concat() different segments

    // FIRST segment is a global variable __dirname (means current folder)
    // which holds an absolute path on Operating System to this folder
    // SECOND segment tells go up one level (use '..' for more clearness instead of '../')
    // THIRD segment is a folder name whre needed file situated
    // FOURTH segment is a file name    
    res.sendFile(path.join(__dirname, '..', 'views', 'shop.html')); // send response
});
module.exports = router; // export router object

// admin.js
const path = require('path');
const express = require('express');
const router = express.Router();
// middleware (if we don't call .next() it won't go to the next middleware)
// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    // <form action="/product" method="POST"></form>
    // needs an action(path/url) where the request should be send
    // and a method of request (method="POST")
    // action="/admin/add-product" where this post will lead to(url)
    res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html')); // to send a response
});
// even thou both routes have same path '/admin/add-product' 
// they will do different staff because they called with diff methods (get and post)
// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    console.log(req.body); // returns undefined if no parser registered
    res.redirect('/');
});
module.exports = router;

// app.js
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const bodyParser = require('body-parser'); // imports parser
const app = express(); // initial new object to store and manage express behind the scenes
// import routes
const adminRoutes = require('./routes/admin.js'); // .js not restricted
const shopRoutes = require('./routes/shop');
// middleware (if we don't call .next() it won't go to the next middleware)
// register a middleware for req.body parse
app.use(bodyParser.urlencoded({ extended: false })); // it will return .next() in the end
// routes order matters!!!
// only routes that start with '/admin' will use adminRoutes object logic
app.use('/admin', adminRoutes); 
app.use(shopRoutes); // allow express app consider adminRoutes object and use it logic
// 404 error handle
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});
// do both const server = http.createServer(app); and server.listen(3000);
app.listen(3000);


// using utility path.dirname():
1.create folder utils
2.create path.js file

// path.js
const path = require('path');
// process.mainModule.filename(basically is a path to the root file)
// process is a global module(NodeJS process)
// app running root(file/module). in this case app.js
// filename of this root(file/module)
// dirname() returns the directory name of a path
module.exports = path.dirname(process.mainModule.filename);

// use this path.js utility in the project:
// admin.js
const rootDir = require('../utils/path'); // import utility function
...
// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {    
    res.sendFile(path.join(rootDir, 'views', 'add-product.html')); // to send a response
});

// shop.js
const rootDir = require('../utils/path'); // import utility function
...
router.get('/', (req, res, next) => {    
    res.sendFile(path.join(rootDir, 'views', 'shop.html')); // send response
});


// HTML & CSS
1. create 'public' folder
2. create 'css' folder in that 'public' folder.
3. create main.css file in 'css' folder.
4. open project root file(in this case app.js):
// and add read access to the public folder
// app.js
app.use(express.static(path.join(__dirname, 'public')));
now express will take any request that trying to find a file
and forward it to the public folder

// connect CSS file to HTML file in NodeJS with help of Express
open html file and add link to the head:
<head>
    ...    
    <link rel="stylesheet" href="/css/main.css">
</head>
link href will start from static folder automatically by express
so just enter the path to the css file in that folder.
*/