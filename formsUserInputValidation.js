/*
Forms User Input & Validation

agenda:
1. Why validation is important?
2. How to validate?

characteristics:
                            [user] <--------|
                                |           |
                            [<form>]        |  (if validation failed)
                                |           |
[controller/middleware] --- [validation] ---|
                                |
                            [<Your node code>(model)]
                                |
                            [database/file]

important:
Validation on client side(via JS):
JS that runs in a browser: user ca see that code, change that code, disable JS.
This is not a protection that can secure your app from wrong data send to a server.
This is good only for user experience.
Validation fails => error message => keep old inputs.

Validation on server-side():
This code can't be seen or changed by the user.
User can't disable using that code.
Must have for filtering input values.
This ensures that app work only with valid data(DB stores correct data).

Most databases have a build-in validation support.
Use build-in validation is optional.
It use more resourses and if you have a good server validation code
(written exactly at your app needs) then build-in validation is not required.
Bcs you would already filter incoming data at you server side.

How to validate:
                                 |--> [User input(form input)]
    if validation fails          |              |
(error message, keep old inputs) |--- [validate on client side(via JS)] (optional)
                                 |              |
                                 |    [validate on server-side] (required)
    if validation fails          |              |
(and not rerender the page)      |--- [Server(node app)]
                                                |
                                      [database/file] --- [build-in validation] (optional)

features:
For validation on server side we'll need our Routes and Controllers.
Typically validation is used for POST routes.

preparation:
to add validation we'll use 3rd party package:
express-validator
official page:
https://github.com/express-validator/express-validator
docs
https://express-validator.github.io/docs/

> npm install --save express-validator

fisrt step:
update /routes/auth.js
import express validator sub package, expressValidator basically is an object.
We can use next gen JS destructuring feature to extract check() function.
const { check } = require('express-validator/check');
check() is a fucntion that will return a middleware in the end
Now we can add this function to the post routes like this:
// add check as middleware for validation
// and pass a field name(template>form>input field>name) or array of field names
// that we want to check
// .custom() waits for true or false, or a promise return

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid e-mail')
            .custom((value, { req }) => {
                if (value === 'test@test.com') {
                    throw new Error('this e-mail is forbidden');
                }
                return true;
            }),
        body(
            'password',
            'Please enter a valid password with only numbers and text (from 5 to 12 characters length)'
        )
            .isLength({ min: 4, max: 12 })
            .isAlphanumeric(),
        body('confirmPassword')
            .custom((value, { req }) => {
                if(value === req.body.password) {
                    return true;
                }
                throw new Error(`Passwords doesn't match`);
            })
    ],
    authController.postSignup
);

!important instead of using only {check} we can use another functions
to check a certain part of the request object.
difference is that .check() will look for the passed field name everywhere
body, param ... - means req.body, req.param ...
e.g
const {
    check,
    body,
    param,
    query,
    cookie,
    header } = require('express-validator/check');

// second argument in the body(), param() ... methods will be a dufalut error message to display
body('password',
    'Please enter a valid password with only numbers and text (from 5 to 12 characters length)'
)

// also there is no need to add extra validation for confirmPassword
// bcs we already check everything for password field and as they have to be equal 
// extra check not necessary

second step:
update /controllers/auth.js
// import method from express-validator
// validationResult give us bunch of results stored by that check() method in router
const { validationResult } = require('express-validator/check');
update action like this:
// post Signup action
exports.postSignup = (req, res, next) => {
    // get input values
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    // isEmpty() another method that checks errors object and return true or false
    if(!errors.isEmpty()) { // if there were any errors
        // return all errors into array and log
        console.log(errors.array());
        // set status 422(common status code for validation fail)
        return res.status(422).render('auth/signup', {
            docTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg
        });
    }
    ...
}

!important to prevent default browser form validation need to add
special param(novalidate) to the signup.ejs from
<form class="signup-form" action="/signup" method="POST" novalidate>

Sanitizing
.normalizeEmail() chain method that checks email field 
transfer to lower case 
removes whitespaces

.trim() another chain method that
removes whitespaces at the beginning and at the end

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid e-mail address')
            .normalizeEmail(),
        body('password', 'Please enter a valid password')
            .isLength({min: 4, max: 12})
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin);


summary:
adding server-side validation to the forms is a two steps process:
1. add validation of inputs as a middleware to the routes files (post actions)
2. and then for this action we collect errors at the controllers file (post action),
   rerender that form page with new status and
   extra params (errors messages, original input user entered, valid/invalid fields)


steps:
update /routes/auth.js
update /routes/admin.js
update /controllers/auth.js
update /controllers/admin.js
udpate /views/auth/signup.ejs
update /views/auth/login.ejs
update /views/admin/add-product.ejs
update /public/css/forms.css

logs:
update /routes/auth.js
const express = require('express'); // import express
// import express validator sub package
// expressValidator basically is an object
// we can use next gen JS destructuring feature to extract check() function
// check() is a fucntion that will return a middleware in the end
// now we can add it to the post routes
const { check, body } = require('express-validator/check');
const router = express.Router(); // create router object
const authController = require('../controllers/auth'); // import controller
const User = require('../models/user'); // import user model

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid e-mail address')
            .normalizeEmail(),
        body('password', 'Please enter a valid password')
            .isLength({min: 4, max: 12})
            .isAlphanumeric()
    ],
    authController.postLogin);
// add check() as middleware for validation
// and pass a field name(template>form>input field>name) or array of field names
// that we want to check
// .custom() waits for true or false, or a promise return
// Promise.reject() - creates new error message

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid e-mail')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(userDocument => {
                        if (userDocument) {
                            return Promise.reject('This e-mail already taken');
                        }
                    })
            })
            .normalizeEmail(),
        body(
            'password',
            'Please enter a valid password with only numbers and text (from 5 to 12 characters length)'
        )
            .isLength({ min: 4, max: 12 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value === req.body.password) {
                    return true;
                }
                throw new Error(`Passwords doesn't match`);
            })
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getUpdatePassword);

router.post('/new-password', authController.postUpdatedPassword);

module.exports = router; // export router object

update /routes/admin.js
const express = require('express'); // import express
const adminController = require('../controllers/admin'); // import controller
const router = express.Router(); // create router object
const isAuth = require('../middleware/is-auth'); // import middleware route protection
const { body } = require('express-validator/check'); // import validation check module

// /admin/add-product => GET reference to the controller
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET reference to the controller
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST reference to the controller
// for real URLs imageUrl check should look like this
// body('imageUrl')
//     .isURL()

router.post(
    '/add-product',
    [
        body('title' , 'Please enter a product title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imageUrl', 'Image URL is invalid')
            .isString()
            .isLength({ min: 5 }),
        body('price', 'Please set up a price')
            .isFloat(),
        body('description', 'Product description is invalid')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postAddProduct);

// /admin/edit-product/:productId => POST reference to the controller
// :productId is a dynamic indicated segment
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST reference to the controller
router.post(
    '/edit-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imageUrl')
            .isString(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postEditProduct);

// /admin/delete-product => POST reference to the controller
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router; // export router object

update /controllers/auth.js
const crypto = require('crypto');

const bcrypt = require('bcryptjs'); // import module for password encryption
const nodemailer = require('nodemailer'); // import nodemailer package
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user'); // import mongoose model
// import method from express-validator
// validationResult give us bunch of results stored by that check() method in router
const { validationResult } = require('express-validator/check');

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
        successMessage: successMessage,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: [],
        validationSuccess: {
            email: '',
            password: '',
        }
    });
}

// get Signup action
exports.getSignup = (req, res, next) => {
    const message = req.flash('error');
    res.render('auth/signup', {
        docTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: [],
        validationSuccess: {
            email: '',
            password: '',
            confirmPassword: '',
        }
    });
}

// post Login action
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const successMessage = req.flash('success');
    // form inputs validation module
    const errors = validationResult(req);
    const successEmail = errors.array().find(field => field.param === 'email') ? '' : 'email';
    const successPassword = errors.array().find(field => field.param === 'password') ? '' : 'password';
    // console.log(errors.array());
    // isEmpty() another method that checks errors object and return true or false
    if (!errors.isEmpty()) { // if there were any errors
        // return all errors into array and log
        // console.log(errors.array());
        // set status 422(common status code for validation fail)
        return res.status(422).render('auth/login', {
            docTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            successMessage: successMessage,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array(),
            validationSuccess: {
                email: successEmail,
                password: successPassword
            }
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    docTitle: 'Login',
                    path: '/login',
                    errorMessage: 'No account with this e-mail was found!',
                    successMessage: successMessage,
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: [{ param: 'email' }],
                    validationSuccess: {
                        email: '',
                        password: ''
                    }
                });
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
                    return res.status(422).render('auth/login', {
                        docTitle: 'Login',
                        path: '/login',
                        errorMessage: 'Please enter correct password',
                        successMessage: successMessage,
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: [{ param: 'password' }],
                        validationSuccess: {
                            email: 'email',
                            password: ''
                        }
                    });
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

    // form inputs validation module
    const errors = validationResult(req);
    const successEmail = errors.array().find(field => field.param === 'email') ? '' : 'email';
    const successPassword = errors.array().find(field => field.param === 'password') ? '' : 'password';
    const successConfirmPassword = errors.array().find(field => field.param === 'confirmPassword') ? '' : 'confirmPassword';
    // isEmpty() another method that checks errors object and return true or false
    if (!errors.isEmpty()) { // if there were any errors
        // return all errors into array and log
        // console.log(errors.array());
        // set status 422(common status code for validation fail)
        return res.status(422).render('auth/signup', {
            docTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array(),
            validationSuccess: {
                email: successEmail,
                password: successPassword,
                confirmPassword: successConfirmPassword,
            }
        });
    }
    // data validation module
    // .hash() is a method provided by bcryptjs
    // it takes 2 arguments a string(your password) as a first value
    // and salt(number of rounds of hashing) as a second value
    // the higher the second value the higher secure will be provided
    // .hash() is async code so it can return a promise
    bcrypt
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
            req.flash('success', 'Register successfully')
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'nodejs@shop-application.com',
                subject: 'Signup succeeded!',
                html: '<h1>You successfully signed up at nodejs-shop-app !</h1>'
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
const { validationResult } = require('express-validator/check');
const Product = require('../models/product'); // import mongoose model

// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: [],
        validationErrors: [],
        validationSuccess: {
            title: '',
            imageUrl: '',
            price: '',
            description: ''
        }
    });
}

// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // validation inputs module
    const errors = validationResult(req); // assign req errors
    // console.log(errors.array());
    const successTitle = errors.array().find(el => el.param === 'title') ? '' : 'title';
    const successImageUrl = errors.array().find(el => el.param === 'imageUrl') ? '' : 'imageUrl';
    const successPrice = errors.array().find(el => el.param === 'price') ? '' : 'price';
    const successDescription = errors.array().find(el => el.param === 'description') ? '' : 'description';
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            docTitle: 'Add Product',
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            oldInput: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            validationSuccess: {
                title: successTitle,
                imageUrl: successImageUrl,
                price: successPrice,
                description: successDescription
            }
        });
    }

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
            req.flash('success', 'Product added successfully!');
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
    // const errors = validationResult(req);    
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

    // if edit-product is a separate template with validation
    // const errors = validationResult(req);
    // console.log(errors.array());
    // const successTitle = errors.array().find(el => el.param === 'title') ? '' : 'title';
    // const successImageUrl = errors.array().find(el => el.param === 'imageUrl') ? '' : 'imageUrl';
    // const successPrice = errors.array().find(el => el.param === 'price') ? '' : 'price';
    // const successDescription = errors.array().find(el => el.param === 'description') ? '' : 'description';
    // if(!errors.isEmpty()) {
    //     return res.status(422).render('admin/edit-product', {
    //         docTitle: 'Add Product',
    //         path: "/admin/add-product",
    //         editing: false,
    //         hasError: true,
    //         product: {
    //             title: updatedTitle,
    //             imageUrl: updatedImageUrl,
    //             price: updatedPrice,
    //             description: updatedDescription,
    //             _id: updatedId
    //         },
    //         errorMessage: errors.array()[0].msg,
    //         validationErrors: errors.array(),
    //         validationSuccess: {
    //             title: successTitle,
    //             imageUrl: successImageUrl,
    //             price: successPrice,
    //             description: successDescription
    //         }
    //     })
    // }

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
                // console.log('PRODUCT UPDATED!');
                req.flash('success', 'Product Updated!');
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
    Product.findOneAndDelete({ _id: productId, userId: req.user._id })
        .then(result => {
            if (result) {
                req.flash('error', 'Product Deleted!')
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
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
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
                errorMessage: errorMessage,
                successMessage: successMessage
            })
        })
        .catch(err => console.log(err));
}

udpate /views/auth/signup.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">       
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <form class="signup-form" action="/signup" method="POST" novalidate>
            <div class="form-control">
                <label for="email">E-mail</label>
                <input
                    class="<%= validationSuccess.email === 'email' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'email') ? 'invalid' : '' %>"
                    id="email"
                    type="email"
                    name="email"
                    value="<%= oldInput.email %>">
            </div>
            <div class="form-control">
                <label for="password">Password</label>
                <input
                    class="<%= validationSuccess.password === 'password' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'password') ? 'invalid' : '' %>"
                    id="password"
                    type="password"
                    name="password"
                    value="<%= oldInput.password %>">
            </div>
            <div class="form-control">
                <label for="confirmPassword">Confirm Password</label>
                <input
                    class="<%= validationSuccess.confirmPassword === 'confirmPassword' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'confirmPassword') ? 'invalid' : '' %>"
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value="<%= oldInput.confirmPassword %>">
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
        <% if(successMessage.length) {%>
            <div class="user-message user-message__success">
                <h4><%= successMessage %></h4>
            </div>
        <% } %>
        <form class="login-form" action="/login" method="POST">
            <div class="form-control">
                <label for="email">E-mail</label>
                <input
                    class="<%= validationSuccess.email === 'email' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'email') ? 'invalid' : '' %>"
                    id="email"
                    type="email"
                    name="email"
                    value="<%= oldInput.email %>">
            </div>
            <div class="form-control">
                <label for="password">Password</label>
                <input
                    class="<%= validationSuccess.email === 'password' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'password') ? 'invalid' : '' %>"
                    id="password"
                    type="password"
                    name="password"
                    value="<%= oldInput.password %>">
            </div>
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Login</button>
        </form>
        <div class="centered">
            <a href="/reset">Reset Password</a>
        </div>
<%- include('../includes/end.ejs') %>

update /views/admin/add-product.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">
    <link rel="stylesheet" href="/css/product.css">   
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <form class="product-form" action="/admin/add-product" method="POST">
            <div class="form-control">
                <label for="title">Title</label>
                <input
                    class="<%= validationSuccess.title === 'title' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'title') ? 'invalid' : '' %>"
                    id="title"
                    type="text"
                    name="title"
                    value="<% if (hasError) {%><%= oldInput.title %><% } %>">
            </div>
            <div class="form-control">
                <label for="imageUrl">Image URL</label>
                <input
                    class="<%= validationSuccess.imageUrl === 'imageUrl' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'imageUrl') ? 'invalid' : '' %>"
                    id="imageUrl"
                    type="text"
                    name="imageUrl"
                    value="<% if (hasError) {%><%= oldInput.imageUrl %><% } %>">
            </div>            
            <div class="form-control">
                <label for="price">Price</label>
                <input
                    class="<%= validationSuccess.price === 'price' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'price') ? 'invalid' : '' %>"
                    id="price"
                    type="number"
                    step="0.01"
                    name="price"
                    value="<% if (hasError) {%><%= oldInput.price %><% } %>">
            </div>
            <div class="form-control">
                <label for="description">Description</label>                
                <textarea
                    class="<%= validationSuccess.description === 'description' ? 'valid' : '' %>
                    <%= validationErrors.find(e => e.param === 'description') ? 'invalid' : '' %>"
                    id="description"
                    name="description"
                    rows="5"><% if (hasError) {%><%= oldInput.description %><% } %></textarea>
            </div>
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
            <button class="btn" type="submit">Add Product</button>
        </form>
<%- include('../includes/end.ejs') %>

update /views/admin/products.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if(errorMessage.length) {%>
            <div class="user-message user-message__error">
                <h4><%= errorMessage %></h4>
            </div>
        <% } %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>Products</h1>                
                <% if(successMessage.length) {%>
                    <div class="user-message user-message__success">
                        <h4><%= successMessage %></h4>
                    </div>
                <% } %>                
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
                                        <input
                                            id="title"
                                            type="text"
                                            name="title"
                                            value="<%= prod.title %>">
                                    </div>
                                    <div class="adminCard__form-control">
                                        <label for="imageUrl">Image URL</label>
                                        <input
                                            id="imageUrl"
                                            type="text"
                                            name="imageUrl"
                                            value="<%= prod.imageUrl %>">
                                    </div>            
                                    <div class="adminCard__form-control">
                                        <label for="price">Price</label>
                                        <input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            name="price"
                                            value="<%= prod.price %>">
                                    </div>
                                    <div class="adminCard__form-control">
                                        <label for="description">Description</label>                
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="5"><%= prod.description %></textarea>
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

update /public/css/forms.css
...
.form-control input,
.form-control textarea {
    margin: 0.5rem 0;
    border: 1px solid #a1a1a1;
    border-radius: 2px;    
    font: small-caption;
    font-size: 1.2rem;
}

.form-control input:focus,
.form-control textarea:focus {
    outline-color: #2c62a0;
}


.form-control .invalid {
    border: 2px solid red;
}


.form-control .valid {
    border: 2px solid green;
}

*/