/*
Handling Errors

agenda:
1. Different types of errors.
2. Handling errors.

characteristics:
Errors are not necessarily the end of your app!

Types:
[Technical/network]         ['expected']                [bugs/logical]

e.g. DB server down       e.g. Files can't be read      e.g. User object used when
                          DB operation fails            it doesn't exist.

Show error page             inform user,                Fix during development
(to inform user             give a retry
that problems are
on our side)

Working with errors:
synchronous code: executes in place line by line top to bottom left to right
and doesn't wait for anything.
(e.g. when we don't interact with files or don't send a request)


              [ Error is thrown ]                          [ No error is thrown ]
                      |                                               |
for Synchronous Code: |  for Async Code:                       Validate values
try-catch (operator)  |  .then()-.catch()                     (e.g. if operator)
                      |                                               |
-------------------------------------------             --------------------------------
Directly handle error or  Use Express error             Throw error   or  Directly
                          handling function                               handle "error"
            |                    |                           |               |

[Error Page(e.g 500 page)]      [Intended page / response with]          [Redirect]
                                      error information

features:
Async - everything that happens inside promises/callbacks

for sync throw errors errors middleware is used as it is
app.use((error, req, res, next) => {    
    res.status(500).render('500', {
        status: res.statusCode,
        docTitle: "System error",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
})

for async throw errors have to use .next() first
.catch( err => {
    next(new Error(err))
})

Errors & Http Status Codes

2xx(success)            [200] - operation succeeded
                        [201] - success, resourse created

3xx(redirect)           [301] - moved permanently

4xx(client-side error)  [401] - not authenticated
                        [403] - not authorized
                        [404] - not found
                        [422] - invalid input

5xx(server-side error)  [500] - server-side error

steps:
create/delete error-playground.js
update /public/css/main.css
update app.js
update /controllers/admin.js
create /views/500.ejs
update /controllers/error.js
update /controllers/auth.js
update /controllers/shop.js
update /views/shop/cart.ejs
update /views/shop/orders.ejs


logs:
create/delete error-playground.js
// synchronous code errors handling exaple
const sum = (a, b) => {
    if (a && b) {
        return a + b;
    }
    throw new Error('invalid arguments');
}
// give an opportunity to catch error and continue code execution
try {
    console.log(sum(1));
} catch (error) {
    console.log('Error Occurred!');
    // console.log(error);
}
// without catching errors scenario
// if any error happen the code will crash
console.log('code continues after error');

update /public/css/main.css
.list-header h1,
.list-header h2,
.list-header h3,
.list-header h4,
.list-header p {
    text-align: center;
}

.list-header h4.invalid {
    border: 2px solid red;
    padding: 1rem;
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
    // const message = error.errmsg.split(': ')[0];
    // const message = error.errmsg;
    // res.status(error.httpStatusCode).render(...)    
    // res.redirect('/500');
    res.status(500).render('500', {
        status: res.statusCode,
        docTitle: "System error",
        path: "/500",
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

update /controllers/admin.js
// const mongoose = require('mongoose'); // temp import
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
        // _id: mongoose.Types.ObjectId('5c3873f829ceb504d489a657'),
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
            // pro way
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            // let express know that error occurs
            // it will skip all other middlewares
            // and will move right to the error handling middleware
            return next(error);

            // general solution
            // res.redirect('/500');

            // alternative solution
            // return res.status(500).render('admin/add-product', {
            //     docTitle: 'Add Product',
            //     path: "/admin/add-product",
            //     editing: false,
            //     hasError: true,
            //     oldInput: {
            //         title: title,
            //         imageUrl: imageUrl,
            //         price: price,
            //         description: description
            //     },
            //     errorMessage: 'Database operation failed, please try again.',
            //     validationErrors: [],
            //     validationSuccess: {
            //         title: '',
            //         imageUrl: '',
            //         price: '',
            //         description: ''
            //     }
            // });
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
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
}

create /views/500.ejs
<%- include('includes/head.ejs') %>
</head>

<%- include('includes/navigation.ejs') %>
        <div class="list-header">
            <h1>Something went wrong</h1>
            <h2>error code: 500</h2>
            <h3>Internal error occurred:</h3>            
            <p>We're working on fixing this, sorry for the inconvenience!</p>
        </div>
<%- include('includes/end.ejs') %>

update /controllers/error.js
// get 404 Page
exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        status: res.statusCode,
        docTitle: "Page not found",
        path: "/404",
        isAuthenticated: req.session.isLoggedIn
    });
}

// get 500 Page
exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        status: res.statusCode,
        docTitle: "System error",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
}

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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
            .catch(err => {
                // go to error handling middleware
                const error = new Error(err);
                error.httpStatusCode = 500;
                // error.errmsg = err.errmsg;
                return next(error);
            });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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
            // console.log('NEW ORDER ADDED');
            req.flash('success', 'New Order added successfully');
            res.redirect('/orders');
        })
        .catch(err => {
            // go to error handling middleware
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
}

// get Orders action
exports.getOrders = (req, res, next) => {
    const successMessage = req.flash('success');
    // return orders array for current user
    Order.find({ 'user.userId': req.session.user._id })
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(error);
        });
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

update /views/shop/orders.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
    <link rel="stylesheet" href="/css/forms.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <% if (!orders.length) { %>
        <div class="list-header">
            <h1>Nothing here for now</h1>
        </div>
    <%} else {%>
        <% if(successMessage.length) {%>
            <div class="user-message user-message__success">
                <h4><%= successMessage %></h4>
            </div>
        <% } %>
        <ul class="order-list">
        <% orders.forEach(order => { %>            
            <li class="order-list__item">
                <h1 class="order-list__id">Order# <%= order._id %></h1>                
                <ul class="order-list-entire-list">
                    <% order.products.forEach(el => { %>
                        <li class="order-list-entire-list__item">
                            <h3>Title: <%= el.product.title %></h3>
                            <h3>Quantity: <%= el.quantity %></h3>
                        </li>
                    <% }); %>
                </ul>
            </li>
        <% }); %>
        </ul>
    <% } %>
<%- include('../includes/end.ejs') %>

*/