/*
Advanced Authentication and Authorization.
Beyond Signup & Login.

agenda:
1. Resetting passwords.
2. Authorization.

characteristics:
Password resetting
Password resetting has to be implemented in a way that prevents users
from resetting random user account.
Reset token have to be random, unguessable and unique.

Authorization
Authorization is an important part of pretty much every app.
Not every authenticated user shuold to be able to do everything.
Instead, you want to lock down access by restricting the permissions of your users.

steps:
create /views/auth/reset.ejs
create /views/auth/new-password.ejs
update /views/auth/login.ejs
udapte /views/shop/index.ejs
update /controllers/auth.js
update /controllers/admin.js
udpate /controllers/shop.js
update /routes/auth.js
update /models/user.js
update /public/css/main.css

logs:
create /views/auth/reset.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">       
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <form class="login-form" action="/reset" method="POST">
            <div class="form-control">
                <label for="email">E-mail</label>
                <input id="email" type="email" name="email">
            </div>            
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Reset Password</button>
        </form>
<%- include('../includes/end.ejs') %>

create /views/auth/new-password.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">       
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <form class="login-form" action="/new-password" method="POST">            
            <div class="form-control">
                <label for="password">Password</label>
                <input id="password" type="password" name="password">
            </div>
            <input type="hidden" name="userId" value="<%= userId %>">
            <input type="hidden" name="passwordToken" value="<%= passwordToken %>">
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Update Password</button>
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
        <% if(successMessage.length) {%>
            <div class="user-message user-message__success">
                <h4><%= successMessage %></h4>
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
        <div class="centered">
            <a href="/reset">Reset Password</a>
        </div>
<%- include('../includes/end.ejs') %>

udapte /views/shop/index.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
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
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>Products</h1>
            </div>            
            <div class="grid">
                <%- include('../includes/productCard.ejs') %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

update /controllers/auth.js
const crypto = require('crypto');

const bcrypt = require('bcryptjs'); // import module for password encryption
const nodemailer = require('nodemailer'); // import nodemailer package
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user'); // import mongoose model

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

// get Login action
exports.getLogin = (req, res, next) => {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        errorMessage: errorMessage,
        successMessage: successMessage
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
                    return transporter.sendMail({
                        to: email,
                        from: 'nodejs@shop-application.com',
                        subject: 'Signup succeeded!',
                        html: '<h1>You successfully signed up at nodejs-shop-app !</h1>'
                    })
                })
                .catch(err => console.log(err));
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

// get Reset action
exports.getReset = (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/reset', {
        docTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message
    });
}

// post Reset action
exports.postReset = (req, res, next) => {
    // const message = req.flash('error'); 
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            req.flash('error', 'crypto function error');
            return res.redirect('/reset');
        }
        // buffer contents hex value so need transfrom it to ascii
        // that is why 'hex' filter should be used
        const token = buffer.toString('hex'); // if no error occurs set token
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that e-mail found');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                req.flash('success', 'check you e-mail for password reset link');
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'nodejs@shop-application.com',
                    subject: 'Password reset!',
                    html: `
                        <h1>You requested password reset!</h1>
                        <h3>If this is truth:</h3>
                        <p>Follow this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                        <h3>Otherwise:</h3>
                        <p>Don't do anything to keep your old password</p>
                    `
                })
            })
            .catch(err => console.log(err))
    })
}

exports.getUpdatePassword = (req, res, next) => {
    const token = req.params.token;
    // {$gt: Date.now()} special syntax for: 
    // check if resetTokenExpiration value is greater then now
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            // const message = req.flash('error');
            res.render('auth/new-password', {
                docTitle: 'Update Password',
                path: '/new-password',
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: message
            });
        })
        .catch(err => console.log(err))
}

exports.postUpdatedPassword = (req, res, next) => {
    const updatedPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(updatedPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            req.flash('success', 'password updated successfully');
            res.redirect('/login');
        })
        .catch(err => console.log(err))
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
            // product belogs to this user edge case
            if (product.userId.toString() !== req.user._id.toString()) {
                req.flash('error', 'wrong user access');
                return res.redirect('/');
            }
            // product here we get is a mongoose object
            // we can call .save() mongoose method on it
            // and .save() will update this object with all changes
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            // promise return
            return product.save().then(result => {
                console.log('PRODUCT UPDATED!');
                res.redirect('/admin/products'); // provide template update at once
            })
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
    Product.findOne({ _id: productId, userId: req.user._id })
        .then(result => {
            if(result) {
                return res.redirect('/admin/products');
            }

            req.flash('error', 'wrong user access');
            return res.redirect('/');
        })
        .catch(err => console.log(err));
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    const userId = req.user._id;
    // use mongoose .find() method
    // .populate() is a mongoose method that can chain .find()
    // it takes property path as an argument
    // and return not just related userId but whole entire user Object inside products    
    Product.find({ userId: userId })
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

udpate /controllers/shop.js
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
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    // mongoose .find() method return all documents for products collection
    // simply returns array of products
    Product.find()
        .then(products => { // array of objects
            res.render('shop/index', {
                prods: products,
                docTitle: 'Shop',
                path: '/',
                errorMessage: errorMessage,
                successMessage: successMessage
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

update /routes/auth.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const authController = require('../controllers/auth'); // import controller

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getUpdatePassword);

router.post('/new-password', authController.postUpdatedPassword);

module.exports = router; // export router object

update /models/user.js
const mongoose = require('mongoose'); // import mongoose lib

const Schema = mongoose.Schema; // define mongoose schema constructor

const userSchema = new Schema({    
    email: { type: String, required: true },
    password: {type: String, required: true},
    resetToken: String,
    resetTokenExpiration: Date,
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

update /public/css/main.css
.card__header h1,
.card__content h1,
.card__content h2,
.card__content p {
    margin: 0.5rem 0;
}
*/