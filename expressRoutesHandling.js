/* Routes handling is Express framework.

app.use([path,] callback [, callback...]);
Mounts the specified middleware function or functions at the specified path:
the middleware function is executed when the base of the requested path matches path.

[path] (default: '/')
path for which the middleware function is invoked; can be any of:
1. A string representing a path.
2. A path pattern.
3. A regular expression pattern to match paths.
4. An array of combinations of any of the above.

callback (default: none)
Callback functions; can be:
1. A middleware function.
2. A series of middleware functions (separated by commas).
3. An array of middleware functions.
4. A combination of all of the above.

// app.use() works for both POST and GET requests 
// app.get() works only for incoming GET requests
// app.post() works for incoming POST requests
// express also have .delete() .patch() .put() request methods

// Node.js Server Basics with Express:
const express = require('express');
const bodyParser = require('body-parser'); // imports parser
const app = express();

// import routes
const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop');

//middleware (if we don't call .next() it won't go to the next middleware)
// register a middleware for req.body parse
app.use(bodyParser.urlencoded({extended: false})); // it will return .next() in the end

// routes order matters!!!
app.use(adminRoutes); // allow express app consider adminRoutes object and use it logic
app.use(shopRoutes);

// do both const server = http.createServer(app); and server.listen(3000);
app.listen(3000); 

// Express router
1. create 'routes folder.
2. create files(admin.js , shop.js) that that will handle routes logic

// router can hanlde all these:
1. router.use();
2. router.get();
3. router.post();
...

// routes filtering
// only routes that start with '/admin' will use adminRoutes object logic
app.use('/admin', adminRoutes); 


// Express route file basics(admin.js):
const express = require('express'); // import express
const router = express.Router(); // create router object

// middleware (if we don't call .next() it won't go to the next middleware)
// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    // <form action="/product" method="POST"></form>
    // needs an action(path/url) where the request should be send
    // and a method of request (method="POST")
    // action="/admin/add-product" where this post will lead to(url)
    res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">Add product</button></form>'); // allows to send a response
});
// even thou both routes have same path '/admin/add-product' 
// they will do different staff because they called with diff methods (get and post)
// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    console.log(req.body); // returns undefined if no parser registered
    res.redirect('/');
});
module.exports = router; // export router object


// Express route file basics(shop.js):
const express = require('express'); // import express
const router = express.Router(); // create router object

router.get('/', (req, res, next) => { // same as app.use('/', (req, res next) => {...});  
    res.send('<h1>Hello from Express</h1>'); // allows to send a response
});

module.exports = router; // export router object
*/