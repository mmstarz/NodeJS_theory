/*
Adding Payments

agenda:
How payments work

characteristics:
Payment Process:
[Collect Payment Method]    |   complex task typically outsourced
[Verify Payment Method]     |
[Charge Payment Method]     |
[Manage Payments]           |
[Process Order in APP]      

Stipe(outsourced payment tasks package):
Client(CC data) -> Stripe(token) -> Server(payment data) -> Stripe(payment service)

[client(Browser)] --------> (collect credit card data)
                                        |
    (token) <-------------- [Stripe Servers(3rd party)]
                                        |
[server(Node App)] -------> (create payment data)

features:
Stripe official: https://stripe.com/
step1
Register(create account)
step2
Verify email
step3
login into account
!important - at https://dashboard.stripe.com/account/apikeys 
at this: "Viewing test API keys. Toggle to view live keys."  section
we can switch to "Access live data" and for real application we should use this.
step4
at - https://dashboard.stripe.com/test/payments
choose "Learn more ->"
step5
at - https://stripe.com/docs/quickstart find:
...
To get started, add the following code to your payment page,
making sure that the form submits to your own server-side code:

<form action="your-server-side-code" method="POST">
  <script
    src="https://checkout.stripe.com/checkout.js" class="stripe-button"
    data-key="pk_test_xaTIuQ3FvjNLtBmR3tKRr3d4"
    data-amount="999"
    data-name="mmstar"
    data-description="Example charge"
    data-image="https://stripe.com/img/documentation/checkout/marketplace.png"
    data-locale="auto">
  </script>
</form>

step6
add this code to /views/shop/checkout.ejs with your params like this:
...
<div>
    <form action="/create-order" method="POST">
        <script
            src="https://checkout.stripe.com/checkout.js" class="stripe-button"
            data-key="pk_test_xaTIuQ3FvjNLtBmR3tKRr3d4"
            data-amount="<%= totalSum * 100 %>"
            data-name="Your Order"
            data-description="Ordered Items"
            data-image="https://stripe.com/img/documentation/checkout/marketplace.png"
            data-locale="auto"
            data-currency="usd">
        </script>
    </form>
</div>
...
this form will generate token through stripe servers,
automatically send a request to the app backend,
where you will try to handle it.

step7
> npm install --save stripe
step8
copy stripe request initializization from https://stripe.com/docs/quickstart (step2)
to your controller action <form action="/create-order" method="POST">
update /controllers/shop.js
// post Order action
exports.postOrder = (req, res, next) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    // const stripe = require("stripe")("sk_test_NAuL84MEMaYfuAtFALF4njTg"); // moved to top

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express
    let totalSum = 0; // assign total sum variable
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            // calculate total sum
            user.cart.items.forEach(item => {
                totalSum += item.productId.price * item.quantity;
            });

            const products = user.cart.items.map(item => {
                return {
                    product: { ...item.productId._doc
                    },
                    quantity: item.quantity
                }
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
        .then(result => {
            // initialize stripe object
            // totalsum * 100 bcs of stripe amount format
            // send request to the stripe servers and make them charge
            const charge = stripe.charges.create({
                amount: totalSum * 100,
                currency: 'usd',
                description: 'Demo Order',
                source: token,
                metadata: {
                    order_id: result._id
                }
            });
            return req.user.clearCart();
        })
        .then(() => {
            // console.log('NEW ORDER ADDED');
            req.flash('success', 'New Order added successfully');
            res.redirect('/orders');
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

step9
update app.js
// '/create-order' provided by stripe servers already has it's own protection
you will need to extract this route from /routes/shop.js to the app.js
and situate it upon your csrfProtection also init csrfToken after this route
...
// app main file
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const session = require('express-session'); // import express-session package
const MongoDBStore = require('connect-mongodb-session')(session); // import sessions store
const csrf = require('csurf'); // import csurf package
const flash = require('connect-flash'); // import flash package
const bodyParser = require('body-parser'); // imports parser
const mongoose = require('mongoose'); // import mongoose
const multer = require('multer'); // import multer

const app = express(); // initial new object to store and manage express behind the scenes
const errorController = require('./controllers/error'); // import controller
const shopController = require('./controllers/shop'); // import controller
const isAuth = require('./middleware/is-auth'); // import middleware route protection
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
// init filestorage configuration
// .diskStorage() multer method that takes 2 params destination & filename
// new Date().toISOString() - is used  here for unique name definition
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const uniqueKey = new Date().toISOString().split('.');
        // new Date().toISOString().replace(/:/g, '-')
        // cb(null, uniqueKey + '-' + file.originalname);
        cb(null, `${uniqueKey[1]}_${file.originalname}`);
    }
})
// init filefilter config
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
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
// register multer middleware
// .single() multer method if we expect one file. it takes input field name as argument.
// .array() for array of files
// multer({dest: 'images'}) - sets destination folder for file upload
// multer({ storage: fileStorage }) - storage configuration
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// register another middleware to grant access
// read access to the 'public' folder and forward any search file requests to it
app.use(express.static(path.join(__dirname, 'public')));
// add middleware for uploaded images serving
// if we have a request that goes for '/images', then serve files from 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));
// register session middleware
app.use(
    session({
        secret: 'hasToBeAVeryLongString',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// initialize(register) flash middleware
app.use(flash());

// special feature provided by express.js for every rendered view
// for adding isAuthtenticated and csrfToken data
// important to be used before routes middleware
// .locals give us an opportunity to add local data to every response
// which will be rendered
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;    
    next();
});

// assign new middleware for logged user
app.use((req, res, next) => {
    // throw new Error('Sycnc dummy error test')
    // session checkout
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            // throw new Error('Asycnc dummy error test')
            if (!user) { // if no user found
                return next();
            }
            // user here we get is a mongoose model object with all provided methods
            req.user = user;
            next(); // continue NodeJS event loop
        })
        .catch(err => {
            // pro way
            next(new Error(err));

            // alternative way
            // next();

            // bad choise
            // console.log(err);
        })
});

// routes order matters!!!
// '/create-order' provided by stripe servers already has it's own protection
// that's why it situated upon csrf
app.post('/create-order', isAuth, shopController.postOrder);
// important to use csrf protection after session bcs it uses session by default
app.use(csrfProtection);
// special feature provided by express.js for every rendered view
// for adding isAuthtenticated and csrfToken data
// important to be used before routes middleware
// .locals give us an opportunity to add local data to every response
// which will be rendered
app.use((req, res, next) => {    
    res.locals.csrfToken = req.csrfToken();
    next();
});
// only routes that start with '/admin' will use adminRoutes object logic
app.use('/admin', adminRoutes);
app.use(shopRoutes); // allow express app consider shopRoutes object and use it logic
app.use(authRoutes); // allow express app consider authRoutes object and use it logic

// 500 error handle
app.use('/500', errorController.get500);
// 404 error handle
app.use(errorController.get404);
// special express error handling middleware
// if you have more then one error handling middlewares
// they will be executed in order from top to bottom as normal middlewares
app.use((error, req, res, next) => {
    console.log(error);
    const message = error.toString();
    // const message = error.errmsg.split(': ')[0];
    // const message = error.errmsg;
    // res.status(error.httpStatusCode).render(...)    
    // res.redirect('/500');
    // console.log(message);
    res.status(500).render('500', {
        status: res.statusCode,
        docTitle: "System error",
        path: "/500",
        errorMessage: message,
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose
    .connect(
        MONGODB_URI,
        { useNewUrlParser: true }
    )
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));

steps:
create /views/shop/checkout.ejs
update /public/css/product.css
update /views/shop/cart.ejs
update /routes/shop.js
update /controllers/shop.js
update app.js

logs:
create /views/shop/checkout.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
    </head>

    <%- include('../includes/navigation.ejs') %>
    <% if (errorMessage.length) { %>
        <div class="user-message user-message__error">
            <h4><%= errorMessage %></h4>
        </div>
    <% } %>
    <% if (successMessage.length)  {%>
        <div class="user-message user-message__success">
            <h4><%= successMessage %></h4>
        </div>
    <% } %>
    <% if (prods.length > 0) { %>
    <div class="checkout">                
        <% for (prod of prods) { %>
            <ul class="checkout-list">
                <li class="checkout-list__title">
                    <h3>Title: "<%= prod.productId.title %>"</h3>
                </li>
                <li class="checkout-list__qty">
                    <h3>Quantity: <%= prod.quantity %></h3>
                </li>
            </ul>
        <% } %>            
        <div class="checkout-sum">
            <h2>Total: $ <%= totalSum %></h2>
        </div>
        <div>
            <form action="/create-order" method="POST">
                <script
                    src="https://checkout.stripe.com/checkout.js" class="stripe-button"
                    data-key="pk_test_xaTIuQ3FvjNLtBmR3tKRr3d4"
                    data-amount="<%= totalSum * 100 %>"
                    data-name="Your Order"
                    data-description="Ordered Items"
                    data-image="https://stripe.com/img/documentation/checkout/marketplace.png"
                    data-locale="auto"
                    data-currency="usd">
                </script>
            </form>
        </div>
    </div>   
    <% } %>
    <%- include('../includes/end.ejs') %>

update /public/css/product.css
.checkout {    
    display: flex;
    flex-direction: column;
    flex-flow: column;
    justify-content: center;
    align-items: center;
}

.checkout-list {
    width: 40rem;
    list-style: none;    
    display: flex;
    justify-content: space-between;
    flex-direction: row;    
    padding: 1rem;    
    border: 1px solid #afafaf;
    box-shadow: 1px 1px 2px 2px #85969c;
}

.checkout-sum {
    width: 20rem;
    text-align: center;
}

.checkout-list__title,
.checkout-list__qty {    
    margin: 0 0.5rem;
}
...
@media (max-width: 640px) {
    .order-list-entire-list__item {
        flex-direction: column;
    }

    .checkout-list {
        flex-direction: column;
        width: 95%;
    }
}

update /views/shop/cart.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
    <link rel="stylesheet" href="/css/forms.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <% if(successMessage.length) {%>
            <div class="user-message user-message__success">
                <h4><%= successMessage %></h4>
            </div>
        <% } %>
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
            <!--
            <form action="/create-order" method="POST">
                <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                <button type="submit" class="btn">Order Now!</button>
            </form>
            -->            
            <a class="btn" href="/checkout">Order Now!</a>
        </div>        
    <% } else { %>
        <div class="list-header">
            <h1>No products in your Cart</h1>
        </div>
    <% } %>
<%- include('../includes/end.ejs') %>

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

// '/checkout' GET action
router.get('/checkout', isAuth, shopController.getCheckout);

// '/create-order' => POST reference to the controller
// router.post('/create-order', isAuth, shopController.postOrder); // moved to app.js

// '/orders' => GET reference to the controller
router.get('/orders', isAuth, shopController.getOrders);

// '/orders/:orderId' => GET reference to the controller
router.get('/orders/:orderId', isAuth, shopController.getInvoice);
module.exports = router; // export router object

update /controllers/shop.js
const fs = require('fs'); // import node file system
const path = require('path'); // import node path module

const Product = require('../models/product'); // import mongoose model
const Order = require('../models/order'); // import mongoose model
const PDFDocument = require('pdfkit'); // import pdfkit module
const stripe = require("stripe")("sk_test_NAuL84MEMaYfuAtFALF4njTg");

// assign global variable for parination items
const ITEMS_PER_PAGE = 2;

// get Products action
exports.getProducts = (req, res, next) => {
    // mongoose .find() method don't return a cursor
    // to get a cursor use .find().cursor().eachAsync()
    // or .find().cursor().next()
    // mongoose .find() method return all documents for products collection
    const currUser = req.user;
    // + converts from string to number
    const page = +req.query.page || 1; // if req.query.page undefined use 1
    let totalItems; // total number of products
    // dynamic pagination
    // .countDocuments() simply return a number of the documents in collection
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts; // store that information about number of products
            // mongoose .find() method return all documents for products collection
            // simply returns array of products
            return Product
                .find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => { // array of objects
            res.render('shop/product-list', {
                prods: products,
                user: currUser,
                docTitle: 'Products',
                path: '/products',
                pagination: totalItems > ITEMS_PER_PAGE,
                currPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
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
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// get Index action
exports.getIndex = (req, res, next) => {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    // + converts from string to number
    const page = +req.query.page || 1; // if req.query.page undefined use 1
    let totalItems; // total number of products
    // dynamic pagination
    // .countDocuments() simply return a number of the documents in collection
    Product.find().countDocuments().then(numProducts => {
            totalItems = numProducts; // store that information about number of products
            // mongoose .find() method return all documents for products collection
            // simply returns array of products
            return Product
                .find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => { // array of objects
            res.render('shop/index', {
                prods: products,
                docTitle: 'Shop',
                path: '/',
                errorMessage: errorMessage,
                successMessage: successMessage,
                pagination: totalItems > ITEMS_PER_PAGE,
                currPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            return next(new Error(err));
        });
}

// get Cart action
exports.getCart = (req, res, next) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
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
                successMessage: successMessage,
                errorMessage: errorMessage

            });
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// post Cart action
exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            // console.log('PRODUCT ADDED TO CART');
            req.flash('success', 'Product was added to the cart')
            res.redirect('/cart');
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// post remove cart item action
exports.postRemoveCartItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user.removeItemFromCart(productId)
        .then(result => {
            // console.log('ITEM REMOVED FROM THE CART')
            req.flash('error', 'Item was removed from the cart');
            res.redirect('/cart');
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// get Checkout action
exports.getCheckout = (req, res, next) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            // console.log(products); // [{}, {}...]
            // calculate total price
            let totalprice = 0;
            products.forEach(p => {
                totalprice += p.quantity * p.productId.price;
            });
            // console.log(products);
            res.render('shop/checkout', {
                docTitle: 'Checkout',
                path: '/checkout',
                successMessage: successMessage,
                errorMessage: errorMessage,
                prods: products,
                totalSum: totalprice
            });
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// post Order action
exports.postOrder = (req, res, next) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    // const stripe = require("stripe")("sk_test_NAuL84MEMaYfuAtFALF4njTg"); // moved to top

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express
    let totalSum = 0; // assign total sum variable
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            // calculate total sum
            user.cart.items.forEach(item => {
                totalSum += item.productId.price * item.quantity;
            });

            const products = user.cart.items.map(item => {
                return {
                    product: { ...item.productId._doc
                    },
                    quantity: item.quantity
                }
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
        .then(result => {
            // initialize stripe object
            // totalsum * 100 bcs of stripe amount format
            // send request to the stripe servers and make them charge
            const charge = stripe.charges.create({
                amount: totalSum * 100,
                currency: 'usd',
                description: 'Demo Order',
                source: token,
                metadata: {
                    order_id: result._id.toString()
                }
            });
            return req.user.clearCart();
        })
        .then(() => {
            // console.log('NEW ORDER ADDED');
            req.flash('success', 'New Order added successfully');
            res.redirect('/orders');
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// get Orders action
exports.getOrders = (req, res, next) => {
    const successMessage = req.flash('success');
    // return orders array for current user
    Order.find({
            'user.userId': req.session.user._id
        })
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                successMessage: successMessage
            })
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

// get Invoice action
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found'));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized action'));
            }

            const invoiceFileName = 'invoice-' + orderId + '.pdf';
            const invoiceFilePath = path.join('data', 'invoices', invoiceFileName);
            // bonus way pdf generator
            // pdfDocument is a readable stream
            const pdfDocument = new PDFDocument(); // assign new pdfDoc
            // set headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceFileName + '"'
            );
            // transform into writable stream
            pdfDocument.pipe(fs.createWriteStream(invoiceFilePath));
            // send to the client browser via response
            pdfDocument.pipe(res);
            // write data line in to pdf file
            pdfDocument.fontSize(26).text('Invoice', {
                underline: true,
            });
            pdfDocument.text('----------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                Math.floor(totalPrice, -2);
                pdfDocument.fontSize(14).text(
                    prod.product.title +
                    ':    ' +
                    prod.quantity +
                    ' x ' +
                    '$' +
                    prod.product.price
                );
            });
            pdfDocument.fontSize(26).text('----------------------');
            pdfDocument.fontSize(16).text('Total Price:              $' + totalPrice.toFixed(2));
            // stop write stream
            pdfDocument.end();
            // one way for tiny files
            // fs.readFile(invoiceFilePath, (err, data) => {
            //     if (err) {
            //         return next(err); // launch error handling function
            //     }
            //     // one way (download file)
            //     // res.download(invoiceFilePath); // works fine
            //     // second way (open in browser)
            //     res.setHeader('Content-Type', 'application/pdf'); // set content type
            //     // 'inline' - opens in browser
            //     // 'attachment; filename="'+ invoiceFileName +'"' - opens download file context menu
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceFileName + '"'); // how to serve this data
            //     res.send(data)
            // })

            // second way for big files
            // create readable stream
            // const file = fs.createReadStream(invoiceFilePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader(
            //     'Content-Disposition',
            //     'inline; filename="' + invoiceFileName + '"'
            // );
            // sends read stream chunks to the response stream
            // response is a writable stream btw.
            // so then buffer will send all chunks to the client browser
            // and browser will concat them together into a full file
            // file.pipe(res);
        })
        .catch(err => {
            return next(new Error(err));
        })
}

update app.js
// app main file
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const session = require('express-session'); // import express-session package
const MongoDBStore = require('connect-mongodb-session')(session); // import sessions store
const csrf = require('csurf'); // import csurf package
const flash = require('connect-flash'); // import flash package
const bodyParser = require('body-parser'); // imports parser
const mongoose = require('mongoose'); // import mongoose
const multer = require('multer'); // import multer

const app = express(); // initial new object to store and manage express behind the scenes
const errorController = require('./controllers/error'); // import controller
const shopController = require('./controllers/shop'); // import controller
const isAuth = require('./middleware/is-auth'); // import middleware route protection
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
// init filestorage configuration
// .diskStorage() multer method that takes 2 params destination & filename
// new Date().toISOString() - is used  here for unique name definition
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const uniqueKey = new Date().toISOString().split('.');
        // new Date().toISOString().replace(/:/g, '-')
        // cb(null, uniqueKey + '-' + file.originalname);
        cb(null, `${uniqueKey[1]}_${file.originalname}`);
    }
})
// init filefilter config
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
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
// register multer middleware
// .single() multer method if we expect one file. it takes input field name as argument.
// .array() for array of files
// multer({dest: 'images'}) - sets destination folder for file upload
// multer({ storage: fileStorage }) - storage configuration
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// register another middleware to grant access
// read access to the 'public' folder and forward any search file requests to it
app.use(express.static(path.join(__dirname, 'public')));
// add middleware for uploaded images serving
// if we have a request that goes for '/images', then serve files from 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));
// register session middleware
app.use(
    session({
        secret: 'hasToBeAVeryLongString',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// initialize(register) flash middleware
app.use(flash());

// special feature provided by express.js for every rendered view
// for adding isAuthtenticated and csrfToken data
// important to be used before routes middleware
// .locals give us an opportunity to add local data to every response
// which will be rendered
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;    
    next();
});

// assign new middleware for logged user
app.use((req, res, next) => {
    // throw new Error('Sycnc dummy error test')
    // session checkout
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            // throw new Error('Asycnc dummy error test')
            if (!user) { // if no user found
                return next();
            }
            // user here we get is a mongoose model object with all provided methods
            req.user = user;
            next(); // continue NodeJS event loop
        })
        .catch(err => {
            // pro way
            next(new Error(err));

            // alternative way
            // next();

            // bad choise
            // console.log(err);
        })
});

// routes order matters!!!
// '/create-order' provided by stripe servers already has it's own protection
// that's why it situated upon csrf
app.post('/create-order', isAuth, shopController.postOrder);
// important to use csrf protection after session bcs it uses session by default
app.use(csrfProtection);
// special feature provided by express.js for every rendered view
// for adding isAuthtenticated and csrfToken data
// important to be used before routes middleware
// .locals give us an opportunity to add local data to every response
// which will be rendered
app.use((req, res, next) => {    
    res.locals.csrfToken = req.csrfToken();
    next();
});
// only routes that start with '/admin' will use adminRoutes object logic
app.use('/admin', adminRoutes);
app.use(shopRoutes); // allow express app consider shopRoutes object and use it logic
app.use(authRoutes); // allow express app consider authRoutes object and use it logic

// 500 error handle
app.use('/500', errorController.get500);
// 404 error handle
app.use(errorController.get404);
// special express error handling middleware
// if you have more then one error handling middlewares
// they will be executed in order from top to bottom as normal middlewares
app.use((error, req, res, next) => {
    console.log(error);
    const message = error.toString();
    // const message = error.errmsg.split(': ')[0];
    // const message = error.errmsg;
    // res.status(error.httpStatusCode).render(...)    
    // res.redirect('/500');
    // console.log(message);
    res.status(500).render('500', {
        status: res.statusCode,
        docTitle: "System error",
        path: "/500",
        errorMessage: message,
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose
    .connect(
        MONGODB_URI,
        { useNewUrlParser: true }
    )
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));

*/