/*
Handling files correctly

agenda:
1. Uploading files
2. Downloading files

characteristics:
File uploading need two steps at least:
1. add file picker to the view
2. accept that file with a proper middleware

files are not stored into database, bcs it not efficient(due to their size).
files are stored in a file system.
and we store only their path(or path and names) in the database.

features:
step0
!important view form need to be refactored like this:
<form class="product-form" action="/admin/add-product" method="POST" enctype="multipart/form-data">

enctype="multipart/form-data" - simply tells that not only text,
but binary data also will be passed through that form.

multer - will watch for this kind of form request and handle file data parsing.
multer- is a middleware that works with incoming requests.
step1
/ init filestorage configuration
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

step2
// register multer middleware
// .single() multer method if we expect one file. it takes input field name as argument.
// .array() for array of files
// multer({dest: 'images'}) - sets destination folder for file upload
// multer({ storage: fileStorage }) - storage configuration
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

step3
clean all products from DB

step4
// add middleware for uploaded images serving
// if we have a request that goes for '/images', then serve files from 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

step5
!note!
for single file uploading:
req.file
for multiple files:
req.files

update controller to handle fetching uploaded file and storing it to the DB
// exports.postAddProduct = (req, res, next) => {
//     ...
//     const image = req.file; // fetch uploaded file object config
//     ...
//     if (!image) { // if no file was uploaded edge case
//         return res.status(422).render(...)
//     }
//     ...
//     // important if you are on Windows replace system path defaluts to POSIX
//     // for correct file path save&display
//     const imageUrl = image.path.replace(/\\/g, "/"); // get image file path
//     ...
//     // keys defined in schema: variables got from request
//     const product = new Product({
//         title: title,
//         price: price,
//         description: description,
//         imageUrl: imageUrl,
//         userId: req.user,
//         userEmail: req.user.email
//     });
//     // now .save() method is provided by mongoose
//     product.save().then(...).catch(...);
// }

step6
(somehow this change is needed only for non-root routes,
for index.ejs and product-list.ejs this: src="<%= prod.imageUrl %>" works fine)
change image path at templates from current append to absolute like this:
<img src="/<%= prod.imageUrl %>" alt="<%= prod.title %>">

Multiple files upload example:
step-1: Assigning the destination folder where the files should be saved.
step-2:filename:creating a unique filename using Date.
Step-3:any() is used for uploading multiple file at a time.
Step-4:through router input the files.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './client/uploads/')
    },
      filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]) //Appending extension
    }
});

const Upload = multer({storage: storage}).any();

router.post('/', function (req, res) {
    Upload(req, res, function (err, filedata) {
        if (err) {
            res.json({error_code: 1, err_desc: err});

        } else {
            functionName(req.files, function (result) {
                            res.json(result);
            })
        }
       })
});

File download(open):
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
            pdfDocument.text('--------------------------');
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
            pdfDocument.fontSize(26).text('--------------------------');
            pdfDocument.fontSize(16).text('Total Price: $' + totalPrice.toFixed(2));
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

PDF Document generator:
step1
> npm install --save pdfkit
step2
import and init pdfkit in the /controllers/shop.js
const PDFDocument = require('pdfkit');
...
exports.getInvoice = (req, res, next) => {
    ...
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
            pdfDocument.text('--------------------------');
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
            pdfDocument.fontSize(26).text('--------------------------');
            pdfDocument.fontSize(16).text('Total Price: $' + totalPrice.toFixed(2));
            // stop write stream
            pdfDocument.end();const invoiceFileName = 'invoice-' + orderId + '.pdf';
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
            pdfDocument.text('--------------------------');
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
            pdfDocument.fontSize(26).text('--------------------------');
            pdfDocument.fontSize(16).text('Total Price: $' + totalPrice.toFixed(2));
            // stop write stream
            pdfDocument.end();
    ...
        })
        .catch(err => {
            return next(new Error(err));
        })
}


file deletion:
link - https://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback
step1
add hidden input to the form with old image path
<input type="hidden" name="oldImageUrl" value="<%= prod.imageUrl %>">
step2
update controller for deleting logic
...
const oldImageUrl = req.body.oldImageUrl;
...
// old image deleting logic
fs.unlink(oldImageUrl, (err) => {
    if (err) throw err;
    console.log(`successfully deleted ${oldImageUrl}`);
});

!important
To insert tab space between two words/sentences use
&emsp; and  &ensp;
example:
<text>one$emsp;two</test>

steps:
update /views/add-product.ejs
update /views/admin/products.ejs
update /views/includes/productCard.ejs
update /views/shop/product-list.ejs
update /views/shop/product-details.ejs
update /controllers/admin.js
update /routes/admin.js
update app.js

create /data/invoices/invoice.pdf
update /views/shop/orders.ejs
update /controllers/shop.js
update /routes/shop.js
create /utils/file.js
update /public/css/product.css

logs:
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
            price: '',
            description: ''
        }
    });
}

// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    // const imgurl = req.file.path.replace(/\\/g, "/");
    const price = req.body.price;
    const description = req.body.description;
    // console.log(image);
    // validation inputs module
    const errors = validationResult(req); // assign req errors
    // console.log(errors.array());
    const successTitle = errors.array().find(el => el.param === 'title') ? '' : 'title';
    const successPrice = errors.array().find(el => el.param === 'price') ? '' : 'price';
    const successDescription = errors.array().find(el => el.param === 'description') ? '' : 'description';
    if (!image) {
        return res.status(422).render('admin/add-product', {
            docTitle: 'Add Product',
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            oldInput: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file has wrong extension',
            validationErrors: [],
            validationSuccess: {
                title: successTitle,
                price: successPrice,
                description: successDescription
            }
        });
    }

    // console.log(image);
    // important if you are on Windows replace system path defaluts to POSIX
    // for correct file path save&display
    const imageUrl = image.path.replace(/\\/g, "/");
    // console.log(imageUrl);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            docTitle: 'Add Product',
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            oldInput: {
                title: title,
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
    // const updatedImageUrl = req.body.imageUrl;
    const image = req.file;

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
            if (image) {
                // important if you are on Windows replace system path defaluts to POSIX
                // for correct file path save&display
                product.imageUrl = image.path.replace(/\\/g, "/");
            }

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
        body('title', 'Please enter a product title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
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

update app.js
// main file
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

create /data/invoices/invoice.pdf

update /views/shop/orders.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
    <link rel="stylesheet" href="/css/forms.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <% if (!orders.length) { %>
        <div class="list-header">
            <h1>No orders here for now</h1>
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
                <div>
                    <h3 class="order-list__id">Order#<%= order._id.toString().substring(18) %></h3>
                    <a href="/orders/<%= order._id %>">Invoice</a>
                </div>                
                <ul class="order-list-entire-list">
                    <% order.products.forEach(el => { %>
                        <li class="order-list-entire-list__item">
                            <h4>Title: <%= el.product.title %></h4>                            
                            <h4>Quantity: <%= el.quantity %></h4>
                        </li>
                    <% }); %>
                </ul>
            </li>
        <% }); %>
        </ul>
    <% } %>
<%- include('../includes/end.ejs') %>

update /controllers/shop.js
const fs = require('fs'); // import node file system
const path = require('path'); // import node path module

const Product = require('../models/product'); // import mongoose model
const Order = require('../models/order'); // import mongoose model
const PDFDocument = require('pdfkit'); // import pdfkit module

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
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
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

// '/orders/:orderId' => GET reference to the controller
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router; // export router object

create /utils/file.js
const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, err => {
        if(err) {
            return next(new Error('File operation failed'));
        }
    })
}

exports.deleteFile = deleteFile;


update /public/css/product.css

*/