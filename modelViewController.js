/* Model View Controller (MVC)

MVC is all about separation of concerns(Разделение ответственностей).

In computer science, separation of concerns (SoC) is a design principle
for separating a computer program into distinct sections,
such that each section addresses a separate concern.
A concern is a set of information that affects the code of a computer program.


                                                [routes]  define which controller
                                                    |     should execute
                                                    |
[models]                [views]                 [controllers]
represent data          templates               connecting your Models and Views
in your code.           layouts                 middleware that comtains
works with data         partials                the in-between logic.
(e.g. save, fetch...)   (what the user sees)    split across middleware functions

***Refactoring APP to MVC***
steps:
1.create new folder 'controllers' in the root
2.create products.js and error.js in that folder(this will be products controller).

remove middleware from admin.js and shop.js to products.js controller
and replace it with references to that productsController.

remove middleware from app.js to error.js controller
and replace it with references to that errorController.

// products.js
const products = []; // assign array for sharing Data
// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        activeAddProduct: true,
        productCSS: true,
        formsCSS: true,
    });
}
// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    products.push({ title: req.body.title });
    res.redirect('/');
}
// get Products and render Shop page
exports.getProducts = (req, res, next) => {        
    res.render('shop', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
    });
}

// error.js
exports.get404page = (req, res, next) => {    
    res.status(404).render('404', {
        status: res.statusCode,
        docTitle: "Page not found",
    });
}

// admin.js
const express = require('express'); // import express
const productsController = require('../controllers/products'); // import controller
const router = express.Router(); // create router object
// /admin/add-product => GET reference to the controller
router.get('/add-product', productsController.getAddProduct);
// /admin/add-product => POST reference to the controller
router.post('/add-product', productsController.postAddProduct);
module.exports = router; // export router object

// shop.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const productsController = require('../controllers/products'); // import controller
// '/' => GET reference to the controller
router.get('/', productsController.getProducts);
module.exports = router; // export router object

// app.js
...
const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop');
...
app.use('/admin', adminRoutes);
...
// 404 error handle
app.use(errorController.get404page);
...

***NEXT*** Time to create Models(bcs for now we just used products array for data)
steps:
1. create 'models' folder in the root.
2. create new file 'product.js' in that folder.

// product.js
const products = [];
module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    // store product in the products data structure
    save() {
        products.push(this); // add new object to the array
    }

    // fetch(отримувати) products (e.g. traverse)
    // static allows to call method on the class itself
    static fetchAll () {
        return products;
    }
}

// than we connect that data structure to our products.js controller
// controllers/products.js
const Product = require('../models/product'); // import data structure

// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        activeAddProduct: true,
        productCSS: true,
        formsCSS: true,
    });
}

// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title); // create new Data Structure(DS) array
    product.save(); // save new object into DS
    res.redirect('/');
}

// get Products and render Shop page
exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll(); // call fetch method on that DS
    res.render('shop', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
    });
}

***NEXT*** Storing DS into the file.
steps:
1. create 'data' folder in the root.
2. refactor models/product.js
// product.js
const fs = require('fs');
const path = require('path');
const folderPath = require('../utils/path');

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    // store product in the products DS and store it into file 
    save() {
        // this folder, next folder, file name        
        const filePath = path.join(
            path.dirname(process.mainModule.filename),
            'data',
            'products.json'
        );
        fs.readFile(filePath, (err, fileContent) => {
            let products = [];
            if (!err) { // if file exist and there is a content
                products = JSON.parse(fileContent); // converts JSON => JS
            }
            products.push(this); // add new product to the products
            // rewrite file with updated data(stringify() - converts JS => JSON)
            fs.writeFileSync(filePath, JSON.stringify(products), err => {
                console.log(err); // if any errors occur
            });
        });
        // fs.createReadStream() - for big files reading with chunks
    }

    // fetch(отримувати) products (e.g. traverse)
    // static allows to call method on the class itself
    static fetchAll(cb) {
        const filePath = path.join(
            path.dirname(process.mainModule.filename),
            'data',
            'products.json'
        );

        fs.readFile(filePath, (err, fileContent) => {            
            if (err) {
                cb([]);
            }
            cb(JSON.parse(fileContent));
        });
    }
}

// refactor products.js contoller
...
// get Products and render Shop page
exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop', {
            prods: products,
            docTitle: 'Shop',
            path: '/',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
        });
    }); // call fetch method on that DS
}

***NEXT*** Improve file storage code
steps:
1. // refactor product.js model

const fs = require('fs');
const path = require('path');
const folderPath = require('../utils/path');
// define path to the file global
const filePath = path.join(folderPath, 'data', 'products.json');
// helper function
const getProductsFromfile = (cb) => {
    fs.readFile(filePath, (err, fileContent) => {
        if (err) { // if there is no file or it is empty
            cb([]); // return empty array
        } else { // otherwise
            cb(JSON.parse(fileContent)); // return content
        }
    });
}

module.exports = class Product {
    constructor(name) {
        this.title = name;
    }

    // store product in the products DS and store it into file 
    save() {
        getProductsFromfile(products => {
            products.push(this); // add new product to the products
            // fs.createReadStream() - for big files reading with chunks
            // rewrite file with updated data(stringify() - converts JS => JSON)
            fs.writeFileSync(filePath, JSON.stringify(products), err => {
                console.log(err); // if any errors occur
            });
        });
    }

    // fetch(отримувати) products (e.g. traverse)
    // static allows to call method on the class itself
    static fetchAll(cb) {
        getProductsFromfile(cb);
    }
}

*/