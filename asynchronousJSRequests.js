/*
Asynchronous JS Requests
Behind-The-Scenes work

agenda:
1. What are asynchronous JS requests
2. Why we use them
3. How we use them

characteristics:
Asynchronous JS requests
        [client(Browser) ]

 req      |            |       res
(JSON)    |            |      (JSON)

        [server(Node App)]

Operates with data behind the scenes wothout reloading the page:
step1
Client -> req(JSON) -> Server
step2
Server -> res(JSON) -> Client

features:
update /views/admin/products.ejs

step1
// document ending transformation:
    </main>
    <script src="/js/main.js"></script>
    <script src="/js/admin.js"></script>
    </body>    
</html>

step2
// transform Deletion <form></form>:
<form action="/admin/delete-product" method="POST"></form>
    <input type="hidden" name="oldImageUrl" value="<%= prod.imageUrl %>">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <input type="hidden" name="productId" value="<%= prod._id %>">
    <button type="submit" class="rmbtn">Delete</button>
</form>
// to this:
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
<input type="hidden" name="productId" value="<%= prod._id %>">
<button type="button" class="rmbtn" onclick="deleteProduct(this)">Delete</button>

step3
// btn simply will be this DOM
// this DOM element where the function was executed
const deleteProduct = (dom) => {
    // console.log(dom);
    const prodId = dom.parentNode.querySelector('[name=productId]').value;
    const csrf = dom.parentNode.querySelector('[name=_csrf]').value;
}

step4
// update /routes/admin.js
router.delete('/products/:productId', isAuth, adminController.DeleteProduct);

step5
//update /controllers/admin.js
// Delete product
exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId; // productId fetched from url param
    // const oldImageUrl = req.body.oldImageUrl;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'));
            }
            // delete old image file
            const oldImageUrl = product.imageUrl; // .replace(/\\/g, "/")
            fileHelper.deleteFile(oldImageUrl);
            console.log(`successfully deleted ${oldImageUrl}`);
            // console.log(productId);
            // findOneAndUpdate(), findOneAndReplace(), findOneAndDelete()
            // mongoose method .findOneAndDelete() will do exect action
            // removes document from the collection by its ID
            return Product.findOneAndDelete({ _id: productId, userId: req.user._id })
        })
        .then(result => {
            if (result) {
                req.flash('error', 'Product Deleted!')
                return res.status(200).json({ message: 'Success!' });
            }

            req.flash('error', 'wrong user access');
            return res.redirect('/');
        })
        .catch(err => {
            res.status(500).json({message: 'Deleting product failed!'});
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            // return next(new Error(err));
        });
}

step6
// manipulate DOM 
// btn simply will be this DOM
// this DOM element where the function was executed
const deleteProduct = (dom) => {
    // console.log(dom);
    const prodId = dom.parentNode.querySelector('[name=productId]').value;
    const csrf = dom.parentNode.querySelector('[name=_csrf]').value;
    const productCard = dom.closest('article');
    // send request to the route via .fetch()
    // .fetch() - supported by the browser for sending http requests
    // .fetch() - used for get/send data
    // arguments:
    // FIRST route, will be added to the current route
    // if we not specify another route http://url1/url2/...
    // SECOND is an object where we can configure this request
    fetch('/admin/products/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        // console.log(result);
        return result.json();
    })
    .then(data => {
        console.log(data); // simply response body
        // don't work in IE
        // productCard.remove();
        // works in all browsers
        productCard.parentNode.removeChild(productCard);
    })
    .catch(err => {
        console.log(err)
    })
}
// !important to know 'delete' request don't have a body

steps:
create /js/admin.js
update /views/admin/products.ejs
update /routes/admin.js
update /controllers/admin.js

logs:
create /js/admin.js
// btn simply will be this DOM
// this DOM element where the function was executed
const deleteProduct = (dom) => {
    // console.log(dom);
    const prodId = dom.parentNode.querySelector('[name=productId]').value;
    const csrf = dom.parentNode.querySelector('[name=_csrf]').value;
    const productCard = dom.closest('article');
    // send request to the route via .fetch()
    // .fetch() - supported by the browser for sending http requests
    // .fetch() - used for get/send data
    // arguments:
    // FIRST route, will be added to the current route
    // if we not specify another route http://url1/url2/...
    // SECOND is an object where we can configure this request
    fetch('/admin/products/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        // console.log(result);
        return result.json();
    })
    .then(data => {
        console.log(data); // simply response body
        // don't work in IE
        // productCard.remove();
        // works in all browsers
        productCard.parentNode.removeChild(productCard);
    })
    .catch(err => {
        console.log(err)
    })
}

// !important to know 'delete' request don't have a body

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
                    <article class="adminCardContainer inactive">
                        <div class="adminCard">
                            <div class="adminCard-front">
                                <header class="card__header">
                                    <h1 class="product__title"><%= prod.title %></h1>
                                </header>
                                <div class="card__image">
                                    <img src="/<%= prod.imageUrl %>" alt="<%= prod.title %>">
                                </div>
                                <div class="card__content">
                                    <h2 class="product__price">$<%= prod.price %></h2>
                                    <p class="product__description"><%= prod.description %></p>
                                </div>
                                <div class="card__actions">
                                    <button class="btn" id="showEdit">Edit</button>                                    
                                    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                                    <input type="hidden" name="productId" value="<%= prod._id %>">
                                    <button type="button" class="rmbtn" onclick="deleteProduct(this)">Delete</button>                                    
                                </div>                        
                            </div>
                
                            <div class="adminCard-back">
                                <form class="adminCard__product-form" action="/admin/edit-product" method="POST" enctype="multipart/form-data">
                                    <div class="adminCard__form-control">
                                        <label for="title">Title</label>
                                        <input
                                            id="title"
                                            type="text"
                                            name="title"
                                            value="<%= prod.title %>">
                                    </div>
                                    <div class="adminCard__form-control">
                                        <label for="image">Image</label>
                                        <input                                        
                                            id="image"
                                            type="file"
                                            name="image">
                                        <input type="hidden" name="oldImageUrl" value="<%= prod.imageUrl %>">
                                    </div>

                                    <!-- <div class="adminCard__form-control">
                                        <label for="imageUrl">Image URL</label>
                                        <input
                                            id="imageUrl"
                                            type="text"
                                            name="imageUrl"
                                            value="<%= prod.imageUrl %>">
                                    </div> -->            
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
                        </div>
                    </article>
                <% } %>
            </div>
            <%- include('../includes/pagination.ejs', {
                pagination: pagination,
                currPage: currPage,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: nextPage,
                prevPage: prevPage,
                lastPage: lastPage
            }) %>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
    </main>
    <script src="/js/main.js"></script>
    <script src="/js/admin.js"></script>
    </body>
    
</html>

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
// router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.delete('/products/product/:productId', isAuth, adminController.deleteProduct);
module.exports = router; // export router object

update /controllers/admin.js
// const mongoose = require('mongoose'); // temp import
// const fs = require('fs');
const { validationResult } = require('express-validator/check');
const Product = require('../models/product'); // import mongoose model
const fileHelper = require('../utils/file'); // import file operation helper

// assign global variable for parination items
const ITEMS_PER_PAGE = 2;

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
    const image = req.file; // fetch uploaded file object config
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
    if (!image) { // no file uploaded edge case
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
    const imageUrl = image.path.replace(/\\/g, "/"); // get image file path
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
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            // let express know that error occurs
            // it will skip all other middlewares
            // and will move right to the error handling middleware
            return next(new Error(err));

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
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
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
    const oldImageUrl = req.body.oldImageUrl;
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
                // delete old image file
                fileHelper.deleteFile(oldImageUrl);
                console.log(`successfully deleted ${oldImageUrl}`);
                // important if you are on Windows replace system path defaluts to POSIX
                // for correct file path save&display                
                product.imageUrl = image.path.replace(/\\/g, "/");

            }

            // promise return
            return product
                .save()
                .then(result => {
                    // console.log('PRODUCT UPDATED!');
                    req.flash('success', 'Product Updated!');
                    res.redirect('/admin/products'); // provide template update at once
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

// Delete product
exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId; // productId fetched from url param
    // const oldImageUrl = req.body.oldImageUrl;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'));
            }
            // delete old image file
            const oldImageUrl = product.imageUrl; // .replace(/\\/g, "/")
            fileHelper.deleteFile(oldImageUrl);
            console.log(`successfully deleted ${oldImageUrl}`);
            // console.log(productId);
            // findOneAndUpdate(), findOneAndReplace(), findOneAndDelete()
            // mongoose method .findOneAndDelete() will do exect action
            // removes document from the collection by its ID
            return Product.findOneAndDelete({ _id: productId, userId: req.user._id })
        })
        .then(result => {
            if (result) {
                req.flash('error', 'Product Deleted!')
                return res.status(200).json({ message: 'Success!' });
            }

            req.flash('error', 'wrong user access');
            return res.redirect('/');
        })
        .catch(err => {
            res.status(500).json({message: 'Deleting product failed!'});
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            // return next(new Error(err));
        });
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    const userId = req.user._id;
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    // + converts from string to number
    const page = +req.query.page || 1; // if req.query.page undefined use 1
    let totalItems; // total number of products
    // dynamic pagination
    // use mongoose .find() method
    // .populate() is a mongoose method that can chain .find()
    // it takes property path as an argument
    // and return not just related userId but whole entire user Object inside products
    // .countDocuments() simply return a number of the documents in collection
    Product
        .find({ userId: userId })
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
            res.render('admin/products', {
                prods: products,
                docTitle: 'My Products',
                path: '/admin/products',
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
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
        });
}

*/