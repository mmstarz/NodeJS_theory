/*
Authentication

agenda:
1.What exactly is Authentication
2.Store and Use credentials(name, email, password...)
3.Protecting routes

characteristics:
Authentication
Authentication means that not every visitor of the page can view and
intract with everything.
Authentication has to happen on the server-side and builds up on sessions.
You can protect routes by checking the (session-controlled) login status
right before request reaches access a controller action.

Security & UX
Password should be stored in a hashed form.
CSRF attacks are real issue and you should therefore include
CSRF protection in ANY application you build!
For a better user experience you can flash data/messages into the session
which you then can display in your views.

features:
// .hash() is a method provided by bcryptjs
// it takes 2 arguments a string(your password) as a first value
// and salt(number of rounds of hashing) as a second value
// the higher the second value the higher secure will be provided
// .hash() is async code so it can return a promise
return bcrypt.hash(password, 12);

// .compare() is a method provided by bcryptjs
// it takes 2 arguments and compare if theq are equal or not
// first is a tiny string
// second is a hashed string
// .compare() also can return a promise
return bcrypt.compare(password, user.password);

Route Protection
1.create /middleware/is-auth.js
module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}
2.import it to the /routes/admin.js and /routes/shop.js

CSRF(Cross-Sites Request Forgery) attacks
it can be an email with link that leads to the Fake site page
this Fake site page looks exactly like you application
there can be a login from and as soon as you enter your login pass
it can use you authenticated session to manipulate your user data
e.g. send your money to 3rd person

How to avoid CSRF attacks
Idea is to make people sessions use only the views rendered by your application.
To achieve this we'll use CSRF token.
CSRF token - allows you to generate CSRF token(a string value we can embed into our forms/pages).
token will be generated for every new request.
need to import, initialize and use csrf middleware in app.js
then it can be passed to the views through controllers at
res.render('<viewname>', {
    csrfToken: req.csrfToken()
})
then this value can be used in views forms/pages
e.g. /views/includes/navigation.ejs
<form action="/logout" method="POST">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <button type="submit">Logout</button>
</form>
!important name has to be  name="_csrf"
bcs the package we added will look for this name

Improvement for all rendering pages(with isAuthenticated and csrfToken data)
// special feature provided by express.js for every rendered view
// for adding isAuthtenticated and csrfToken data
// important to be used before routes middleware
// .locals give us an opportunity to add local data to every response
// which will be rendered
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})
Last thing have to add <input type="hidden" name="_csrf" value="<%= csrfToken %>">
to all the views forms.

User feedback
messages for user if something happend or does wrong.
import and use flash middleware in app.js
now it can be used in our controllers like req.flash('', '') before res.redirect()
first argument(string) flash key name
second argument(string) flash content of that key
now it can be accessed at redirected action via req.flash('key name')
e.g.
res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    errorMessage: req.flash('loginError')
});
now you can use that information in the view template

preparations:
password encryption
> npm install --save bcryptjs

CSRF attacks protection
> npm install --save csurf

Flash user messages
> npm install --save connect-flash

steps:
create /views/auth/signup.ejs
update /views/auth/login.ejs
update /views/includes/navigation.ejs
update /views/includes/addtocart.ejs
update /views/includes/productCard.ejs
udapte /views/includes/adminProductCard.ejs
update /views/admin/add-product.ejs
update /views/admin/edit-product.ejs
update /views/admin/products.ejs
update /views/shop/cart.ejs
update /views/shop/product-list.ejs
update /views/shop/product-details.ejs
update /public/css/forms.css
update /routes/auth.js
update /routes/admin.js
update /routes/shop.js
update /controllers/auth.js
update /controllers/admin.js
update /controllers/shop.js
update /controllers/error.js
update app.js
create /middleware/is-auth.js
update /models/user.js
update /models/product.js
update /models/order.js

logs:
create /views/auth/signup.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">       
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <form class="signup-form" action="/signup" method="POST">
            <div class="form-control">
                <label for="email">E-mail</label>
                <input id="email" type="email" name="email">
            </div>
            <div class="form-control">
                <label for="password">Password</label>
                <input id="password" type="password" name="password">
            </div>
            <div class="form-control">
                <label for="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" name="confirmPassword">
            </div>
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Signup</button>
        </form>
<%- include('../includes/end.ejs') %>

update /views/auth/login.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">       
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <form class="login-form" action="/login" method="POST">
            <div class="form-control">
                <label for="email">E-mail</label>
                <input id="email" type="email" name="email">
            </div>
            <div class="form-control">
                <label for="password">Password</label>
                <input id="password" type="password" name="password">
            </div>
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Login</button>
        </form>
<%- include('../includes/end.ejs') %>

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
                <% if (isAuthenticated) { %>
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
                <% if (!isAuthenticated) { %>
                    <li class="main-header__item">
                        <a class="<%= path === '/login' ? 'active' : '' %>" href="/login">Login</a>
                    </li>
                    <li class="main-header__item">
                        <a class="<%= path === '/signup' ? 'active' : '' %>" href="/signup">Signup</a>
                    </li>
                <% } else { %>    
                    <li class="main-header__item">
                        <form action="/logout" method="POST">
                            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
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
            <% if (isAuthenticated) { %>
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
                        <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                        <button type="submit">Logout</button>
                    </form>
                </li>
            <% } else { %>
                <li class="mobile-nav__item">
                    <a class="<%= path === '/login' ? 'active' : '' %>" href="/login">Login</a>
                </li>
                <li class="mobile-nav__item">
                    <a class="<%= path === '/signup' ? 'active' : '' %>" href="/signup">Signup</a>
                </li>
            <% } %>
        </ul>
    </nav>
    
    <main class="main">

update /views/includes/addtocart.ejs
<form action="/cart" method="POST">    
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <input type="hidden" name="productId" value="<%= prod._id %>">
    <button class="btn" type="submit">Add to Cart</button>
</form>

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
                    <%if (isAuthenticated) {%>
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
                    <h4>Email: <%= prod.userEmail %></h4>
                </div>                
                <div class="card__actions">                    
                    <button class="btn" id="showFront">back</button>
                </div>
            </div>
        </article>
    </div>
<% } %>

udapte /views/includes/adminProductCard.ejs

update /views/admin/add-product.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">
    <link rel="stylesheet" href="/css/product.css">   
</head>

<%- include('../includes/navigation.ejs') %>
        <form class="product-form" action="/admin/add-product" method="POST">
            <div class="form-control">
                <label for="title">Title</label>
                <input id="title" type="text" name="title">
            </div>
            <div class="form-control">
                <label for="imageUrl">Image URL</label>
                <input id="imageUrl" type="text" name="imageUrl">
            </div>            
            <div class="form-control">
                <label for="price">Price</label>
                <input id="price" type="number" step="0.01" name="price">
            </div>
            <div class="form-control">
                <label for="description">Description</label>                
                <textarea id="description" name="description" rows="5"></textarea>
            </div>
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Add Product</button>
        </form>
<%- include('../includes/end.ejs') %>

update /views/admin/edit-product.ejs

update /views/admin/products.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>Products</h1>                
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                    <div class="adminCardContainer inactive">
                        <article class="adminCard">
                            <div class="adminCard-front">
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
                                    <button class="btn" id="showEdit">Edit</button>
                                    <form action="/admin/delete-product" method="POST">
                                        <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                                        <input type="hidden" name="productId" value="<%= prod._id %>">
                                        <button type="submit" class="rmbtn">Delete</button>
                                    </form>                        
                                </div>                        
                            </div>
                
                            <div class="adminCard-back">
                                <form class="adminCard__product-form" action="/admin/edit-product" method="POST">
                                    <div class="adminCard__form-control">
                                        <label for="title">Title</label>
                                        <input id="title" type="text" name="title" value="<%= prod.title %>">
                                    </div>
                                    <div class="adminCard__form-control">
                                        <label for="imageUrl">Image URL</label>
                                        <input id="imageUrl" type="text" name="imageUrl" value="<%= prod.imageUrl %>">
                                    </div>            
                                    <div class="adminCard__form-control">
                                        <label for="price">Price</label>
                                        <input id="price" type="number" step="0.01" name="price" value="<%= prod.price %>">
                                    </div>
                                    <div class="adminCard__form-control">
                                        <label for="description">Description</label>                
                                        <textarea id="description" name="description" rows="5"><%= prod.description %></textarea>
                                    </div>
                                    <div class="adminCard__form-control">
                                        <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                                        <input type="hidden" name="productId" value="<%= prod._id %>">                                    
                                        <button class="btn" type="submit">Update Product</button>                                        
                                    </div>
                                </form>
                                <div class="adminCard-actions">
                                    <button class="rmbtn" id="showAdminCard">back</button>
                                </div>
                            </div>
                        </article>
                    </div>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

update /views/shop/cart.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>    
    <% if (prods.length > 0) { %>
        <table class="cart-list">
            <tbody>
                <% for (prod of prods) { %>                
                    <tr class="cart-list__item">
                        <td class="cart-list__item__ttl"><h3>Title: "<%= prod.productId.title %>"</h3></td>
                        <td class="cart-list__item__qty"><h3>Quantity: <%= prod.quantity %></h3></td>                        
                        <td class="cart-list__item__btn">
                            <form action="/cart-remove-item" method="POST">
                                <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                                <input type="hidden" name="productId" value="<%= prod.productId._id %>">
                                <button class="rmbtn" type="submit">Remove</button>
                            </form>
                        </td>                        
                <% } %>
            </tbody>
        </table>
        <div class="centered">
            <hr>
            <form action="/create-order" method="POST">
                <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                <button type="submit" class="btn">Order Now!</button>
            </form>
        </div>        
    <% } else { %>
        <div class="list-header">
            <h1>No products in your Cart</h1>
        </div>
    <% } %>
<%- include('../includes/end.ejs') %>

update /views/shop/product-list.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>Products</h1>                
            </div>
            <div class="grid">
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
                                    <a href="/products/<%= prod._id %>" class="btn">Details</a>
                                    <% if (isAuthenticated) { %>
                                        <%- include('../includes/addtocart.ejs', {prod: prod}) %>
                                    <% } %>
                                </div>                        
                            </div>
                        </article>
                    </div>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

update /views/shop/product-details.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <div class="centered">
        <h1><%= prod.title %></h1>
        <hr>
        <div class="details__image">
            <img src="<%= prod.imageUrl %>" alt="<%= prod.title %>">
        </div>
        <h2><%= prod.price %></h2>
        <p><%= prod.description %></p>
        <% if (isAuthenticated) { %>
            <%- include('../includes/addtocart.ejs') %>
        <% } %>
    </div> 
<%- include('../includes/end.ejs') %>

update /public/css/forms.css

update /routes/auth.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const authController = require('../controllers/auth'); // import controller

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router; // export router object

update /routes/admin.js
const express = require('express'); // import express
const adminController = require('../controllers/admin'); // import controller
const router = express.Router(); // create router object
const isAuth = require('../middleware/is-auth'); // import middleware route protection

// /admin/add-product => GET reference to the controller
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET reference to the controller
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST reference to the controller
router.post('/add-product', isAuth, adminController.postAddProduct);

// /admin/edit-product/:productId => POST reference to the controller
// :productId is a dynamic indicated segment
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST reference to the controller
router.post('/edit-product', isAuth, adminController.postEditProduct);

// /admin/delete-product => POST reference to the controller
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router; // export router object

update /routes/shop.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const shopController = require('../controllers/shop'); // import controller
const isAuth = require('../middleware/is-auth'); // import middleware route protection

// '/' => GET reference to the controller
router.get('/', shopController.getIndex);

// '/products' => GET reference to the controller
router.get('/products', shopController.getProducts);

// : - allows to set a placeholder for future information
// : - signals to express that it shouldn't look for a route
// :productId can be anything and we can than extraxt that information
// :productId is a dynamic segment and the order also matters
// if you will place any routes with same path after dynamic segment
// you'll never reach them

// '/products/id' => GET reference to the controller
router.get('/products/:productId', shopController.getSingleProduct);

// '/cart' => GET reference to the controller
router.get('/cart', isAuth, shopController.getCart);

// '/cart' => POST reference to the controller
router.post('/cart', isAuth, shopController.postCart);

// '/cart-remove-item' => POST reference to the controller
router.post('/cart-remove-item', isAuth, shopController.postRemoveCartItem);

// '/create-order' => POST reference to the controller
router.post('/create-order', isAuth, shopController.postOrder);

// '/orders' => GET reference to the controller
router.get('/orders', isAuth, shopController.getOrders);

module.exports = router; // export router object

update /controllers/auth.js
const bcrypt = require('bcryptjs'); // import module for password encryption
const User = require('../models/user'); // import mongoose model

// get Login action
exports.getLogin = (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        errorMessage: message
    });
}

// get Signup action
exports.getSignup = (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/signup', {
        docTitle: 'Signup',
        path: '/signup',
        errorMessage: message
    });
}

// post Login action
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                // .flash() method provided by flash middleware registered in app.js
                // it takes 2 arguments
                // first(string) message key name for registering
                // second(string) message content
                req.flash('error', 'Invalid user email or password');
                return res.redirect('/login');
            }
            // .compare() is a method provided by bcryptjs
            // it takes 2 arguments and compare if they are equal or not
            // first is a tiny string
            // second is a hashed string
            // .compare() also can return a promise
            // .campare() catches error only if something went wrong
            // .compare() result is a boolean value
            return bcrypt
                .compare(password, user.password)
                .then(result => {
                    if (result) {
                        // add new param to the session object
                        // this will add new session cookie to the request
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid user email or password');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })
        })
        .catch(err => console.log(err));
}

// post Signup action
exports.postSignup = (req, res, next) => {
    // get input values
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // input data validation module
    User.findOne({ email: email })
        .then(userDocument => {
            if (userDocument) {
                req.flash('error', 'This e-mail already taken');
                return res.redirect('/signup');
            }
            // .hash() is a method provided by bcryptjs
            // it takes 2 arguments a string(your password) as a first value
            // and salt(number of rounds of hashing) as a second value
            // the higher the second value the higher secure will be provided
            // .hash() is async code so it can return a promise
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: {
                            items: []
                        }
                    })
                    // store values into DB and redirect
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                })
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
    res.render('admin/add-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        editing: false,
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
                    email: req.user.email,
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
    });
}

update app.js
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const session = require('express-session'); // import express-session package
const MongoDBStore = require('connect-mongodb-session')(session); // import sessions store
const csrf = require('csurf'); // import csurf package
const flash = require('connect-flash'); // import flash package
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
// initialize csrf middleware(default settings should work fine)
const csrfProtection = csrf();
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
// important to use csrf protection after session bcs it uses session by default
app.use(csrfProtection);
// initialize(register) flash middleware
app.use(flash());
// assign new middleware for logged user
app.use((req, res, next) => {
    // session checkout
    if (!req.session.user) {
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

// special feature provided by express.js for every rendered view
// for adding isAuthtenticated and csrfToken data
// important to be used before routes middleware
// .locals give us an opportunity to add local data to every response
// which will be rendered
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

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
        app.listen(3000);
    })    
    .catch (err => console.log(err));

create /middleware/is-auth.js
module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}

update /models/user.js
const mongoose = require('mongoose'); // import mongoose lib

const Schema = mongoose.Schema; // define mongoose schema constructor

const userSchema = new Schema({    
    email: { type: String, required: true },
    password: {type: String, required: true},
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    }
})

// mongoose have special methods field for your own static methods
// this. will retreive to this current schema
userSchema.methods.addToCart = function (product) {
    // get index if this product exist in the cart
    const cartProductIndex = this.cart.items.findIndex(item => {
        // return an index of the item in the cart if it exist
        return item.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    // creates an object which holds upatedCartItems array
    const updatedCart = {
        items: updatedCartItems
    };
    // change cart value to updated cart
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeItemFromCart = function (productId) {
    // assign veriable for updated cart items
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);

update /models/product.js
const mongoose = require('mongoose'); // import mongoose

const Schema = mongoose.Schema; // mongoose schema constructor

// define product data schema with help of mongoose schema constructor
const productSchema = new Schema({
    title: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String, required: true},
    imageUrl: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},    
    userEmail: { type: String, ref: 'User', required: true },
});

module.exports = mongoose.model('Product', productSchema);

update /models/order.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    user: {
        email: { type: String, required: true},       
        userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    } 
});

module.exports = mongoose.model('Order', orderSchema);


*/