/*
Sending Emails / Communication with the outside World

[Node Server] =====> [Mail Server] =====> [User]
                  (3rd party package)
[<your code>]

agenda:

characteristics:
There are many Node 3rd patry packages for Mail Server:
e.g.
1.https://mailchimp.com/
2.https://aws.amazon.com/ru/ses/
3.https://sendgrid.com/

We'll use SendGrid(bcs it has free plan for > 100mails/day )

features:

preparation:
1. go to https://sendgrid.com/
2. choose free plan, register/create account.
3. install packages
> npm install --save nodemailer nodemailer-sendgrid-transport
4. go to your account => settings => API Keys => Create API Key
5. enter key name and choose full access => create key
6. update /controllers/auth.js
const nodemailer = require('nodemailer'); // import nodemailer package
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

...
.then(result => {
    transporter.sendMail({
        to: email,
        from: 'nodejs@shop-application',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully signed up</h1>'
    })
    res.redirect('/login');
})
...

!important SendGrid is at ukr.net black list and e-mails won't reach @ukr.net
for @gmail.com works fine.

steps:
update /controllers/auth.js

logs:
update /controllers/auth.js
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

*/