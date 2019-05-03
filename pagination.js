/*
Pagination
Fetching data chunks from DB.
Split data across multiple pages

agenda:

characteristics:
Ggeneral idea of pagination(hardcoded links)
step1
// add pagination section with pagination links to the template
<section class="pagination">
    <div class="pagination-container">
        <div class="pagination__link"><a href="?page=1">1</a></div>                    
    </div>
    <div class="pagination-container">
        <div class="pagination__link"><a href="?page=2">2</a></div>
    </div>
</section>

step2
// assign global param for pagination items in the controller
const ITEMS_PER_PAGE = 2;
// fetch query link at the controller action
const page = req.query.page;
// add special mongoose filters for amount of data receiving for the curr page
https://mongoosejs.com/docs/api.html#Query
// .countDocuments() simply return a number of the documents in collection
// first filter function .skip() - Specifies the number of documents to skip
// second filter function .limmit() - Specifies the maximum number of documents the query will return.
// get Index action
exports.getIndex = (req, res, next) => {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    const page = req.query.page;
    // mongoose .find() method return all documents for products collection
    // simply returns array of products
    Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
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

Dynamic pagination links
additional data that need to be pass to the page:
0. pagination: totalItems > ITEMS_PER_PAGE
1. currPage: page,
2. hasNextPage: ITEMS_PER_PAGE * page < totalItems,
3. hasPrevPage: page > 1,
4. nextPage: page + 1,
5. prevPage: page - 1,
6. lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)

step1 (/controllers/shop.js)
// assign global variable for pagination items
const ITEMS_PER_PAGE = 2;
...
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
            return next(new Error(err));
        });
}

features:

steps:
create /views/includes/pagination.ejs 
update /views/shop/index.ejs
update /views/shop/product-list.ejs
update /views/admin/products.ejs
update /controllers/shop.js
update /controllers/admin.js
update /public/css/main.css

logs:
create /views/includes/pagination.ejs
<% if (pagination) {%>
    <section class="pagination">
        <% if (currPage !== 1 && prevPage !== 1) { %>
        <div class="pagination-container">
            <div class="pagination__link">
                <a href="?page=1">1</a>
            </div>
        </div>
        <div class="dots">
            <span>...</span>        
        </div>
        <% } %>
        <% if (hasPrevPage) { %>
        <div class="pagination-container">
            <div class="pagination__link">
                <a href="?page=<%= prevPage %>"><%= prevPage %></a>
            </div>
        </div>
        <% } %>
        <div class="pagination-container">
            <div class="pagination__link active">
                <a href="?page=<%= currPage %>"><%= currPage %></a>
            </div>
        </div>
        <% if (hasNextPage) { %>
        <div class="pagination-container">
            <div class="pagination__link">
                <a href="?page=<%= nextPage %>"><%= nextPage %></a>
            </div>
        </div>
        <% } %>
        <% if (lastPage !== currPage && nextPage !== lastPage) { %>
        <div class="dots">
            <span>...</span>        
        </div>
        <div class="pagination-container">
            <div class="pagination__link">
                <a href="?page=<%= lastPage %>"><%= lastPage %></a>
            </div>
        </div>
        <% } %>
    </section>
<% } %>

update /views/shop/index.ejs
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
                                    <img src="/<%= prod.imageUrl %>" alt="<%= prod.title %>">
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
                                    <img src="/<%= prod.imageUrl %>" alt="<%= prod.title %>">
                                </div>
                                <div class="card__content">
                                    <h2 class="product__price">$<%= prod.price %></h2>
                                    <p class="product__description"><%= prod.description %></p>
                                </div>
                                <div class="card__actions">
                                    <button class="btn" id="showEdit">Edit</button>
                                    <form action="/admin/delete-product" method="POST">
                                        <input type="hidden" name="oldImageUrl" value="<%= prod.imageUrl %>">
                                        <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                                        <input type="hidden" name="productId" value="<%= prod._id %>">
                                        <button type="submit" class="rmbtn">Delete</button>
                                    </form>                        
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
                        </article>
                    </div>
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
<%- include('../includes/end.ejs') %>

update /controllers/shop.js
const fs = require('fs'); // import node file system
const path = require('path'); // import node path module

const Product = require('../models/product'); // import mongoose model
const Order = require('../models/order'); // import mongoose model
const PDFDocument = require('pdfkit'); // import pdfkit module

// assign global variable for parination items
const ITEMS_PER_PAGE = 1;

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

// post Delete product
exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    const oldImageUrl = req.body.oldImageUrl;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'));
            }
            // delete old image file
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
                return res.redirect('/admin/products');
            }

            req.flash('error', 'wrong user access');
            return res.redirect('/');
        })
        .catch(err => {
            // go to error handling middleware
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // error.errmsg = err.errmsg;
            return next(new Error(err));
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

update /public/css/main.css
...
.pagination {
    margin: 0.5rem 0;
    display: flex;
    justify-content: center;
}

.pagination-container {
    position: relative;
    min-width: 3rem;
    min-height: 3rem;
    perspective: 400px;
    display: flex;
    align-content: flex-end;
    justify-content: center;
    margin: 0 0.1rem;
}

.pagination__link {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-items: center;
    justify-content: center;
    transform-style: preserve-3d;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    transform: translateZ(-100px);
    perspective: 400px;
    border: 1px solid #303030;
    border-radius: 2rem;
    box-shadow: 2px 2px 4px 1px #2c62a0;
}

.pagination__link a {    
    font-size: 1rem;
    font-weight: 700;
    text-decoration: none;
    padding: 1rem;
    color: black;
}

.pagination__link a:hover,
.pagination__link a:focus {    
    color: white;
    font-size: 1.2rem;
}

.pagination__link:hover,
.pagination__link:focus,
.pagination__link.active {
    background: #2c62a0;
    color: #303030;
    transform: translateZ(0px);
}

.pagination__link.active a {
    font-size: 1.2rem;
}

.dots {    
    display: flex;
    align-items: center;
    margin: 0.1rem;
}

.dots span {
    font-size: 1rem;
}
...

*/