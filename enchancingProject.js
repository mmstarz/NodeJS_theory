/* start from adding more views

steps:
1.create 'admin' and 'shop' sub folders in 'views' folder.
2.move shop.ejs to the 'shop' folder and rename it to the product-list.ejs.
3.move add-product.ejs to the 'admin' folder.
4.update files (add-product.ejs, product-list.ejs)
5.add index.ejs, product-detail.ejs, cart.ejs, checkout.ejs to the 'views/shop' folder
6.add edit-product.ejs, products.ejs to the 'views/adimn' folder
7.update navigation.ejs in 'views/includes' folder
8.split controllers from products.js to shop.js and admin.js
9.update shop.js and admin.js controllers
10.update routes shop.js and admin.js routes

// add-product.ejs
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
            <button class="btn" type="submit">Add Product</button>
        </form>
<%- include('../includes/end.ejs') %>

// product-list.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>
                <p>reserved for list of all products...</p>
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                <article class="card product-item">
                    <header class="card__header">
                        <h1 class="product__title"><%= prod.title %></h1>
                    </header>
                    <div class="card__image">
                        <img src="/images/book3.jpg" alt="A Book">
                    </div>
                    <div class="card__content">
                        <h2 class="product__price">$19.99</h2>
                        <p class="product__description">A very interesting book about so many even more interesting things!</p>
                    </div>
                    <div class="card__actions">
                        <button class="btn">Add to Cart</button>
                    </div>                    
                </article>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

***NEXT*** Updating new Controllers
1. update shop.js controller
2. update admin.js controller

// shop.js controller
const Product = require('../models/product'); // import data structure

// get Products and render Products page
exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            prods: products,
            docTitle: 'Products',
            path: '/products'
        });
    }); // call fetch method on that DS
}

// get Products and render Shop page
exports.getIndex = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/index', {
            prods: products,
            docTitle: 'Shop',
            path: '/'
        });
    }); // call fetch method on that DS
}

// get render Cart page
exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        docTitle: 'Your Cart',
        path: '/cart'
    });
}

// get render Checkout page
exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        docTitle: 'Checkout',
        path: '/checkout'
    });
}

// admin.js controller
const Product = require('../models/product'); // import data structure

// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product"
    });
}

// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title); // create new Data Structure(DS) array
    product.save(); // save new object into DS
    res.redirect('/');
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            prods: products,
            docTitle: 'Admin Products',
            path: "/admin/products"
        });
    });
}

***NEXT*** Registering Routes
1. add /products, /cart in shop.js route
2. add /admin/products in admin.js route

// shop.js route
const express = require('express'); // import express
const router = express.Router(); // create router object
const shopController = require('../controllers/shop'); // import controller
// '/' => GET reference to the controller
router.get('/', shopController.getIndex);
// '/products' => GET reference to the controller
router.get('/products', shopController.getProducts);
// '/cart' => GET reference to the controller
router.get('/cart', shopController.getCart);
// '/checkout' => GET reference to the controller
router.get('/checkout', shopController.getCheckout);
module.exports = router; // export router object

// admin.js route
const express = require('express'); // import express
const adminController = require('../controllers/admin'); // import controller
const router = express.Router(); // create router object
// /admin/add-product => GET reference to the controller
router.get('/add-product', adminController.getAddProduct);
// /admin/products => GET reference to the controller
router.get('/products', adminController.getProducts);
// /admin/add-product => POST reference to the controller
router.post('/add-product', adminController.postAddProduct);
module.exports = router; // export router object

***NEXT*** Updating Teplates ()
// views/includes/navigation.ejs
<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item">
                    <a href="/" class="<%= docTitle === 'Shop' ? 'active' : '' %>">Shop</a>
                </li>
                <li class="main-header__item">
                    <a href="/products" class="<%= docTitle === 'Products' ? 'active' : '' %>">Products</a>
                </li>
                <li class="main-header__item">
                    <a href="/cart" class="<%= docTitle === 'Cart' ? 'active' : '' %>">Cart</a>
                </li>
                <li class="main-header__item">
                    <a href="/admin/add-product" class="<%= docTitle === 'Add Product' ? 'active' : '' %>">Add Product</a>
                </li>
                <li class="main-header__item">
                    <a href="/admin/products" class="<%= docTitle === 'Admin Products' ? 'active' : '' %>">Admin Products</a>
                </li>
            </ul>
        </nav>
    </header>
    
    <main>

// views/shop/index.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>

<%- include('../includes/end.ejs') %>

// views/shop/cart.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>

<%- include('../includes/end.ejs') %>

// views/shop/product-list.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>
                <p>reserved for list of all products...</p>
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                <article class="card product-item">
                    <header class="card__header">
                        <h1 class="product__title"><%= prod.title %></h1>
                    </header>
                    <div class="card__image">
                        <img src="/images/book3.jpg" alt="A Book">
                    </div>
                    <div class="card__content">
                        <h2 class="product__price">$19.99</h2>
                        <p class="product__description">A very interesting book about so many even more interesting things!</p>
                    </div>
                    <div class="card__actions">
                        <button class="btn">Add to Cart</button>
                    </div>                    
                </article>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

// views/admin/products.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>

<%- include('../includes/end.ejs') %>

***NEXT*** Model improvement
steps:
1.update views/admin/add-product.ejs
2.update public/css/forms.css
3.update models/product.js
4.update controllers/admin.js
5.update views/shop/product-list.ejs
6.clear data/products.json
7.update views/shop/index.ejs

// update views/admin/add-product.ejs
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
            <button class="btn" type="submit">Add Product</button>
        </form>
<%- include('../includes/end.ejs') %>

// update public/css/forms.css
...
.form-control label,
.form-control input,
.form-control textarea {
    display: block;
    width: 100%;
    margin-bottom: 0.25rem;
}

.form-control input,
.form-control textarea {
    margin: 0.5rem 0;
    border: 1px solid #a1a1a1;
    border-radius: 2px;
    font: inherit;
}

.form-control input:focus,
.form-control textarea:focus {
    outline-color: #2c62a0;
}

// update models/product.js
...
module.exports = class Product {
    constructor(title, imageUrl, price, description) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
...

// update controllers/admin.js
...
// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, imageUrl, price, description); // create new Data Structure(DS) array
    product.save(); // save new object into DS
    res.redirect('/');
}
...

// update views/shop/product-list.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>
                <p>reserved for list of all products...</p>
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                <article class="card product-item">
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
                        <button class="btn">Add to Cart</button>
                    </div>                    
                </article>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

// update views/shop/index.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>
                <p>reserved for list of all products...</p>
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                <article class="card product-item">
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
                        <button class="btn">Add to Cart</button>
                    </div>                    
                </article>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>


***NEXT*** improve views/admin/products.ejs add edit/delete buttons
steps:
1. update views/admin/products.ejs
2. update views/shop/product-list.ejs
3. create views/shop/orders.ejs
4. update views/includes/navigation.ejs
5. update routes/shop.js
6. update controllers/shop.js

// update views/admin/products.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>
                <p>reserved for list of all products...</p>
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                <article class="card product-item">
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
                        <a href="/admin/edit-product" class="btn">Edit</a>
                        <form action="/admin/delete-product" method="POST">
                            <button type="submit" class="btn">Delete</button>
                        </form>                        
                    </div>                    
                </article>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

// update views/shop/product-list.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>
                <p>reserved for list of all products...</p>
            </div>
            <div class="grid">
                <% for (let prod of prods) { %>
                <article class="card product-item">
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
                        <form action="/add-to-card" method="POST">
                            <button type="submit" class="btn">Add to Cart</button>
                        </form>                        
                    </div>                    
                </article>
                <% } %>
            </div>
        <% } else { %>        
            <div class="list-header">
                <h1>No Products left</h1>
            </div>
        <% } %>
<%- include('../includes/end.ejs') %>

// create views/shop/orders.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <div class="list-header">
        <h1>Nothing here for now</h1>
    </div> 
<%- include('../includes/end.ejs') %>

// update views/includes/navigation.ejs
<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item">
                    <a href="/" class="<%= docTitle === 'Shop' ? 'active' : '' %>">Shop</a>
                </li>
                <li class="main-header__item">
                    <a href="/products" class="<%= docTitle === 'Products' ? 'active' : '' %>">Products</a>
                </li>
                <li class="main-header__item">
                    <a href="/cart" class="<%= docTitle === 'Your Cart' ? 'active' : '' %>">Cart</a>
                </li>
                <li class="main-header__item">
                    <a href="/orders" class="<%= docTitle === 'Your Orders' ? 'active' : '' %>">Orders</a>
                </li>
                <li class="main-header__item">
                    <a href="/admin/add-product" class="<%= docTitle === 'Add Product' ? 'active' : '' %>">Add Product</a>
                </li>
                <li class="main-header__item">
                    <a href="/admin/products" class="<%= docTitle === 'Admin Products' ? 'active' : '' %>">Admin Products</a>
                </li>
            </ul>
        </nav>
    </header>
    
    <main>

// update routes/shop.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const shopController = require('../controllers/shop'); // import controller
// '/' => GET reference to the controller
router.get('/', shopController.getIndex);
// '/products' => GET reference to the controller
router.get('/products', shopController.getProducts);
// '/cart' => GET reference to the controller
router.get('/cart', shopController.getCart);
// '/orders' => GET reference to the controller
router.get('/orders', shopController.getOrders);
// '/checkout' => GET reference to the controller
router.get('/checkout', shopController.getCheckout);
module.exports = router; // export router object

// update controllers/shop.js
...
// get render Orders page
exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        docTitle: 'Your Orders',
        path: '/orders'
    });
}
...

*/