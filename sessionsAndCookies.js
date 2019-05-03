/*
Sessions And Cookies

agenda:
1.What are Sessions?
2.What are Cookies?
3.Using Sessions and Cookies.

cookies:
                                (cookies are stored on a client side)
                    [user]
                        |
                    [Frontend (View)] -> [Cookies]
                        |                    ^
                request | include cookie     | 
                        |                    | set via response header
                    [Node APP] -------------->

sessions:
        (client need to tell the server to which session he belongs)
        (here cookie will store the ID of the User/Client's session)
                    [user]
                        |
                    [Frontend (View)] -> [Cookie]
                        |                   |
                request |                   | Associated with User/Client via Cookie
                        |                   |
                    [Node APP] --------> [Session]
                        |                   | Session storage
                    [Database] --------------

main characteristics:
cookies - client side middleware data.
sessions - server side middleware data.

preparations:
to use sessions 3rd party package 'express-session' is needed.
> npm install --save express-session
initialize express-session middleware in app.js

install and register that as a store for the sessions.
> npm install --save connect-mongodb-session

const session = require('express-session'); // import express-session package
const MongoDBStore = require('connect-mongodb-session')(session); // import sessions store

// mongoDB entrie point: 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop?retryWrites=true'
const MONGODB_URI = 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop';
// initialize store
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// register session middleware
app.use(session({
    secret: 'hasToBeAVeryLongString',
    resave: false,
    saveUninitialized: false,
    store: store
}));
!cookie set up through express-session is optional can use default
session middleware add an additional object to every request so you can
call it like req.session.isLoggedIn = true;

to prevent memmory overflow with sessions have to use:
https://github.com/expressjs/session
Compatible Session Stores:
...
connect-mongodb-session
...

important:
.trin() - removes whitespaces
// console.log(req.get('Cookie').split(';')[1]) - for multiple cookies
// console.log(req.get('Cookie').split(';')[1].trin().split('=')[1]) - for multiple cookies get only last value
// console.log(req.get('Cookie').split('=')[1]) - for one cookie get value

// 'Set-Cookie' - reserved name for cookie
// other key values can be set separately with semicolon
// res.setHeader('Set-Cookie', 'loggedIn=true; Expires= ; Max-Age=10; Domain= ; Secure; HttpOnly');
Max-Age - seconds(or ms) how long that cookie will live for
Expires - sets Date for cookie lifetime (uses special browser Date format)
Domain -
Secure -cookie will servive if page is served with https(no value set up for this key)
HttpOnly - can't access cookie from clients JS (protects from cross side scripting attacks)

summary:
Cookies
Great for storing data on the client browser.
Do not store sensetive data here! it can be viewed + manipulated.
Cookies can be configured to expire when the browser is closed(=> "Session Cookie") or
when a certain age/expiry date is reached("Permanent Cookie").
Works well together with sessions.

Sessions
Stored on the server.NOT on the client.
Great for storing sensetive data that should servive across requests.
You can store anything in sessions.
Often used to store user data/ authtentication status.
Identified via cookie(don't mistake this with the term "Session Cookie").
You can use different storages for saving you sessions on the server.


steps:
update /views/includes/navigation.ejs
update /views/includes/productCard.ejs
update /public/css/main.css (.main-header__nav {...})
update /public/css/forms.css (.login-form {...})
create /routes/auth.js
update app.js
create /controllers/auth.js
update /controllers/admin.js
update /controllers/shop.js
update /controllers/error.js
create /views/auth/login.ejs

logs:
update /views/includes/navigation.ejs
<body>
    <div class="backdrop"></div>
    <header class="main-header">
        <button id="side-menu-toggle">Menu</button>
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item">
                    <a class="<%= path === '/' ? 'active' : '' %>" href="/">Shop</a>
                </li>
                <li class="main-header__item">
                    <a class="<%= path === '/products' ? 'active' : '' %>" href="/products">Products</a>
                </li>
                <% if (isAuthtenticated) { %>
                    <li class="main-header__item">
                        <a class="<%= path === '/cart' ? 'active' : '' %>" href="/cart">Cart</a>
                    </li>
                    <li class="main-header__item">
                        <a class="<%= path === '/orders' ? 'active' : '' %>" href="/orders">Orders</a>
                    </li>                
                    <li class="main-header__item">
                        <a class="<%= path === '/admin/add-product' ? 'active' : '' %>" href="/admin/add-product">Add Product
                        </a>
                    </li>
                    <li class="main-header__item">
                        <a class="<%= path === '/admin/products' ? 'active' : '' %>" href="/admin/products">Admin Products
                        </a>
                    </li>
                <% } %>
            </ul>
            
            <ul class="main-header__item-list">
                <% if (!isAuthtenticated) { %>
                    <li class="main-header__item">
                        <a class="<%= path === '/login' ? 'active' : '' %>" href="/login">Login</a>
                    </li>
                <% } else { %>    
                    <li class="main-header__item">
                        <form action="/logout" method="POST">
                            <button type="submit">Logout</button>
                        </form>
                    </li>
                <% } %>
            </ul>            
        </nav>
    </header>

    <nav class="mobile-nav">
        <ul class="mobile-nav__item-list">
            <li class="mobile-nav__item">
                <a class="<%= path === '/' ? 'active' : '' %>" href="/">Shop</a>
            </li>
            <li class="mobile-nav__item">
                <a class="<%= path === '/products' ? 'active' : '' %>" href="/products">Products</a>
            </li>
            <% if (isAuthtenticated) { %>
                <li class="mobile-nav__item">
                    <a class="<%= path === '/cart' ? 'active' : '' %>" href="/cart">Cart</a>
                </li>
                <li class="mobile-nav__item">
                    <a class="<%= path === '/orders' ? 'active' : '' %>" href="/orders">Orders</a>
                </li>
                
                <li class="mobile-nav__item">
                    <a class="<%= path === '/admin/add-product' ? 'active' : '' %>" href="/admin/add-product">Add Product
                    </a>
                </li>
                <li class="mobile-nav__item">
                    <a class="<%= path === '/admin/products' ? 'active' : '' %>" href="/admin/products">Admin Products
                    </a>
                </li>
                <li class="mobile-nav__item">
                    <form action="/logout" method="POST">
                        <button type="submit">Logout</button>
                    </form>
                </li>
            <% } else { %>
                <li class="mobile-nav__item">
                    <a href="/login">Login</a>
                </li>
            <% } %>
        </ul>
    </nav>
    
    <main class="main">

update /views/includes/productCard.ejs
<% for (let prod of prods) { %>
    <div class="cardContainer inactive">
        <article class="card">
            <div class="card-front">
                <header class="card__header">
                    <h1 class="product__title"><%= prod.title %></h1>
                </header>
                <div class="card__image">
                    <img src="<%= prod.imageUrl %>" alt="<%= prod.title %>">
                </div>
                <div class="card__content">
                    <h2 class="product__price">$<%= prod.price %></h2>
                    <p class="product__description"><%= prod.description %></p>
                </div>
                <div class="card__actions">
                    <button class="btn" id="showBack">info</button>
                    <%if (isAuthtenticated) {%>
                        <%- include('../includes/addtocart.ejs', {prod: prod}) %>
                    <% } %>
                </div>                        
            </div>

            <div class="card-back">
                <div class="card__content">
                    <h2>Product info </h2>
                    <h3>Title: <%= prod.title %></h3>
                    <p>Description: <%= prod.description %></p>
                </div>
                <div class="card__content">
                    <h2>Owner info</h2>
                    <h3>Name: <%= prod.userName %></h3>
                    <h4>Email: <%= prod.userEmail %></h4>
                </div>                
                <div class="card__actions">                    
                    <button class="btn" id="showFront">back</button>
                </div>
            </div>
        </article>
    </div>
<% } %>

update /public/css/main.css (.main-header__nav {...}, .mobile-nav {...})
.main-header__nav {
    height: 100%;
    width: 100%;
    display: none;
    align-items: center;
    justify-content: space-between;
}

.main-header__item-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
}

.main-header__item {    
    padding: 0;
    margin: 0 1rem;
}

.main-header__item button {
    outline: none;
    font-family: 'Noto Serif TC', serif;
    border: none;
    font-size: 1rem;
    background-color: #2c62a0;
    text-decoration: none;
    font-weight: 700;
    color: #f3ebeb;
}

.main-header__item button:hover {
    color: #43d126;
    cursor: pointer;    
}

.mobile-nav {
    width: 18rem;
    height: 100vh;
    max-width: 90%;
    position: fixed;
    font-weight: 700;
    left: 0;
    top: 0;
    background: white;    
    z-index: 10;
    padding: 1rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease-out;
}

.mobile-nav.open {
    transform: translateX(0);
}
  
.mobile-nav__item-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
}
  
.mobile-nav__item {
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 0.5rem;
    padding: 0;
}

.mobile-nav__item button {
    font-family: 'Noto Serif TC', serif;
    outline: none;
    border: none;
    background-color: white;
    font-size: 1.5rem;    
    text-decoration: none;
    font-weight: 700;
    color: #1c1e2e;
    text-decoration: none;    
    text-shadow: 2px 2px 4px #303030;
}

update /public/css/forms.css (.login-form {...})
.login-form {
    width: 20rem;
    max-width: 90%;
    margin: auto;
    display: block;
}

create /routes/auth.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const authController = require('../controllers/auth'); // import controller

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router; // export router object

update app.js
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const session = require('express-session'); // import express-session package
const MongoDBStore = require('connect-mongodb-session')(session); // import sessions store
const bodyParser = require('body-parser'); // imports parser
const mongoose = require('mongoose'); // import mongoose

const app = express(); // initial new object to store and manage express behind the scenes
const errorController = require('./controllers/error'); // import controller
const User = require('./models/user'); // import User model
// mongoDB entrie point: 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop?retryWrites=true'
const MONGODB_URI = 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop';
// initialize store
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// set global configuration app.set(name, value);
app.set('view engine', 'ejs'); // TE set
app.set('views', './views'); // views(HTML) folder set

// import routes Data
const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// register a middleware for req.body parser (parse - розбір)
// parsing data (розбір інформаційних данних)
app.use(bodyParser.urlencoded({ extended: false })); // it will return .next() in the end

// register another middleware to grant access
// read access to the 'public' folder and forward any search file requests to it
app.use(express.static(path.join(__dirname, 'public')));

// register session middleware
app.use(
    session({
        secret: 'hasToBeAVeryLongString',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
// assign new middleware for logged user
app.use((req, res, next) => {
    // session checkout
    if(!req.session.user) {
        return next();
    }
    
    User.findById(req.session.user._id)
        .then(user => {
            // user here we get is a mongoose model object with all provided methods
            req.user = user;
            next(); // continue NodeJS event loop
        })
        .catch(err => console.log(err))
});

// routes order matters!!!
// only routes that start with '/admin' will use adminRoutes object logic
app.use('/admin', adminRoutes);
app.use(shopRoutes); // allow express app consider shopRoutes object and use it logic
app.use(authRoutes); // allow express app consider authRoutes object and use it logic

// 404 error handle
app.use(errorController.get404);

mongoose
    .connect(
        MONGODB_URI,
        { useNewUrlParser: true }
    )
    .then(result => {
        // .findOne() mongoose method that returns first user found
        User.findOne().then(user => {
            if (!user) {
                // assign user
                const user = new User({
                    name: 'mmstar',
                    email: 'test@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save(); // save user document into the collection
            }

            app.listen(3000);
        })
    })
    .catch(err => console.log(err));

create /controllers/auth.js
const User = require('../models/user'); // import mongoose model

// get Login action
exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie').split(';')[1].trin().split('=')[1]) - for multiple cookies
    // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    // console.log(req.get('Cookie'));
    // console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        isAuthtenticated: false
    });
}

// post Login action
exports.postLogin = (req, res, next) => {
    // 'Set-Cookie' - reserved name for cookie
    // other key values can be set separately with semicolon
    // res.setHeader('Set-Cookie', 'loggedIn=true; Expires= ; Max-Age=10');
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    User.findById('5c263543cfe19f180499219c')
        .then(user => {
            // add new param to the session object
            // this will add new session cookie to the request
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
}

// post Login action
exports.postLogout = (req, res, next) => {
    // .destroy() method provided by session package
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}

update /controllers/admin.js
const Product = require('../models/product'); // import mongoose model

// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        editing: false,
        isAuthtenticated: req.session.isLoggedIn
    });
}

// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // keys defined in schema: variables got from request
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user,
        userName: req.user.name,
        userEmail: req.user.email
    });
    // now .save() method is provided by mongoose
    product
        .save()
        .then(() => {
            res.redirect('/admin/products');
        }).catch(err => {
            console.log(err);
        })
}

// get Edit Product Page
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                docTitle: `${product.title} (editing)`,
                path: "/admin/add-product",
                editing: editMode,
                prod: product,
                isAuthtenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log(err);
        })
}

// post Edited Product
exports.postEditProduct = (req, res, next) => {
    // fetch information for the product
    // create a new product with that information
    // than need to call save()
    const updatedId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedImageUrl = req.body.imageUrl;

    Product.findById(updatedId)
        .then(product => {
            // product here we get is a mongoose object
            // we can call .save() mongoose method on it
            // and .save() will update this object with all changes
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            // promise return
            return product.save()
        })
        .then(result => {
            console.log('PRODUCT UPDATED!');
            res.redirect('/admin/products'); // provide template update at once
        })
        .catch(err => console.log(err)); // will catch errors for both promises    
}

// post Delete product
exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    // console.log(productId);
    // findOneAndUpdate(), findOneAndReplace(), findOneAndDelete()
    // mongoose method .findOneAndDelete() will do exect action
    // removes document from the collection by its ID
    Product.findOneAndDelete({ _id: productId })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    // use mongoose .find() method
    // .populate() is a mongoose method that can chain .find()
    // it takes property path as an argument
    // and return not just related userId but whole entire user Object inside products    
    Product.find()
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            // get products only for current user
            res.render('admin/products', {
                prods: products,
                docTitle: 'Admin Products',
                path: "/admin/products",
                isAuthtenticated: req.session.isLoggedIn
            })
        })
        .catch(err => console.log(err));
}

update /controllers/shop.js
const Product = require('../models/product'); // import mongoose model
const Order = require('../models/order'); // import mongoose model
const User = require('../models/user'); // import mongoose model

// get Products action
exports.getProducts = (req, res, next) => {
    // mongoose .find() method don't return a cursor
    // to get a cursor use .find().cursor().eachAsync()
    // or .find().cursor().next()
    // mongoose .find() method return all documents for products collection
    const currUser = req.user;

    Product.find()
        .then(products => { // array of objects
            res.render('shop/product-list', {
                prods: products,
                user: currUser,
                docTitle: 'Products',
                path: '/products',
                isAuthtenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}

// get Single Product action
exports.getSingleProduct = (req, res, next) => {
    // assign variable for a dynamic segment part of a request path
    const productId = req.params.productId;
    // mongoose .findById() method auto convert string into mongodb.ObjectId()    
    Product.findById(productId)
        .then(product => { // return an object
            res.render('shop/product-details', {
                prod: product,
                docTitle: `${product.title} (details)`,
                path: `/products/:${productId}`,
                isAuthtenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}

// get Index action
exports.getIndex = (req, res, next) => {
    // mongoose .find() method return all documents for products collection
    // simply returns array of products    

    Product.find()
        .then(products => { // array of objects
            res.render('shop/index', {
                prods: products,
                docTitle: 'Shop',
                path: '/',
                isAuthtenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}

// get Cart action
exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            // console.log(products);
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                prods: products,
                isAuthtenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}

// post Cart action
exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            console.log('PRODUCT ADDED TO CART');
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

// post remove cart item action
exports.postRemoveCartItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user.removeItemFromCart(productId)
        .then(result => {
            console.log('ITEM REMOVED FROM THE CART')
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

// post Order action
exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return { product: { ...item.productId._doc }, quantity: item.quantity }
            })
            // create and init new order object
            const order = new Order({
                products: products,
                user: {
                    name: req.user.name,
                    userId: req.user
                }
            });
            return order.save(); // save order to the DB
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            console.log('NEW ORDER ADDED');
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}

// get Orders action
exports.getOrders = (req, res, next) => {
    // return orders array for current user
    Order.find({ 'user.userId': req.session.user._id })
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                isAuthtenticated: req.session.isLoggedIn
            })
        })
        .catch(err => console.log(err));
}

update /controllers/error.js
// get 404 Page
exports.get404 = (req, res, next) => {    
    res.status(404).render('404', {
        status: res.statusCode,
        docTitle: "Page not found",
        path: "",
        isAuthtenticated: req.session.isLoggedIn
    });
}

create /views/auth/login.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">       
</head>

<%- include('../includes/navigation.ejs') %>
        <form class="login-form" action="/login" method="POST">
            <div class="form-control">
                <label for="email">E-mail</label>
                <input id="email" type="email" name="email">
            </div>
            <div class="form-control">
                <label for="password">Password</label>
                <input id="password" type="password" name="password">
            </div>
            <button class="btn" type="submit">Login</button>
        </form>
<%- include('../includes/end.ejs') %>

*/