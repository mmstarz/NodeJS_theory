/*
NoSQL Databases / MongoDB
(there is a separate detailed course about mongoDB)

agenda:
1. What is MongoDB
2. Using MongoDB Driver in Node.js App

characteristics:
1. Store and work with a lots of data.
[Database] -        [                   Shop                 ]
                        |                |                |
[collections] -     [users]         [products]        [orders]
                        |                |                |
                    {name:max}       {title: fr}       {id: 1}
[documents] -   {name:ray, age: 28}  {title: dn}       {id: 2}
                    {name:jey}       {title: gb}       {id: 3}


2. Schmaless. (no strict schema required)
3. MongoDB uses JSON(BSON - binaryJSON) to store data in collections.

associations(duplications) in NoSQL:
one way:
embedded(вбудованний) - nested data.
[orders] have embedded data from [users] and [products] collections

[orders]
[{ id: 'first' , user: {id: 2, email: 'tay@g.com' }, product: {id: 2, price: 8.99} }]
[{ id: 'fifth' , user: {id: 1, email: 'max@g.com' }, product: {id: 1, price: 9.99} }]
[{ id: 'third' , user: {id: 3, email: 'jey@g.com' }, product: {id: 3, price: 7.99} }]

[users]                                             [products]
[{ id: 1, name: 'max', email: 'max@g.com' }]        [{ id: 1, title: fr, price: 9.99 }]
[{ id: 2, name: 'ray', email: 'ray@g.com' }]        [{ id: 2, title: dn, price: 8.99 }]
[{ id: 3, name: 'jey', email: 'jey@g.com' }]        [{ id: 3, title: gb, price: 7.99 }]

second way:
references
[customers] don't need to have embedded data from [books] for every user.
Instead it can store only references to the [books] collection

customers {
    userName: 'Max',
    favBooks: ['id1', 'id2']
}

books {        
    _id: 'id1',
    title: 'The Lord of the rings 1'
}

Preparations:
1.go to https://www.mongodb.com/
2.click get MongoDB.
3.Server
4.choose your OS download and install mongoDB.

or use cloud solution

1.go to https://www.mongodb.com/
2.click get MongoDB.
3.Cloud.
4.MongoDB Atlas Global Cloud Database.
5.SignUP.
6.Login, Select Project.
7.Build a Cluster(choose Region, Cluster tier, Additional Settings, Cluster Name -> 'Create cluster')
8.go to Security -> Add new User(set username, password, select ReadAndWrite any DB)
9.IP Whitelist -> Add IP adress (set up 'current ip adress', comment)
10.return to Overview
11.Install mongoDB Driver
12.Cluster0 -> Connect -> Connect Your Application
13.Short SRV Connection String (for drivers compatible with mongoDB 3.6+)
14.copy the SRV address(for the /utils/database.js)
15.go to https://www.mongodb.com/download-center/compass
16.choose OS, download and install MongoDB (community edition stable) Compass
17.Cluster0 -> Connect -> Connect with mongoDB Compass
18.(2) Copy the URI Connection String -> 'I'm Using Compass 1.12 or later...'
19.COPY URI
20.open MongoDB (community edition stable) Compass
21.new Connection -> use these params


MongoDB commands/methods can be found here:
https://docs.mongodb.com/

important:
mongodb stores in _id: ObjectId(...)
to convert const productId = req.params.productId;
into ObjectID need:
1. const mongodb = require('mongodb'); 
2. new mongodb.ObjectID(id)

connect MongoDB to the Aplication:
1.  update /utils/database.js
2.  update /models/product.js
3.  update /models/user.js
4.  delete /models/cart.js
5.  delete /models/cart-item.js
6.  update app.js
7.  update /routes/admin.js
8.  update /routes/shop.js
9.  update /controllers/admin.js
10. update /controllers/shop.js
11. update /views/shop/product-list.ejs
12. update /views/shop/cart.ejs
13. update /views/shop/orders.ejs
14. update /views/includes/addtocart.ejs
15. update /views/admin/products.ejs
16. update /views/admin/edit-product.ejs
17. update /public/css/product.css

***update /utils/database.js
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

// _ means this will be used internally(внутрішньо) in this file
let _db;

// connect takes URL you get from cloud.mongodb.com
// connect to Cluster0 -> SRV address
// eplace PASSWORD with the password for the mmstar user
// .connect() method returns a promise
const mongoConnect = (callback) => { // callback is a function that executes once connection success
    MongoClient.connect(
            'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop?retryWrites=true',
            {useNewUrlParser: true}
        )
        .then(client => {
            console.log('DB CONNECTED');
            // client.db() - auto connect to the @cluster0-annvu.mongodb.net/<Database name>
            // can also access it like this client.db('shop');
            // 'shop' database will be created on a fly when we first connected to it
            _db = client.db(); // access to the shop database
            callback(); // client object that gives access to the DB
        })
        .catch(err => {
            console.log('DB CONNECTION FAILED', err);
            throw err;
        }) 
}

const getDbAccess= () => {
    if(_db) { // if aceess granted
        return _db; // return acess to the database
    }
    throw 'NO DATABASE FOUND';
}

exports.mongoConnect = mongoConnect;
exports.getDbAccess = getDbAccess;

***update /models/product.js
const mongodb = require('mongodb');
const getDbAccess = require('../utils/database').getDbAccess;

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
    }

    // store to the DB method
    save() {
        // db - access root level of the database
        const db = getDbAccess();
        let dbOperation;
        // cellection - next level of the database
        // db.collection('') select collection to work with
        // if collection not exist it will be auto created
        // .insertOne({}) - for single document insertion
        // takes JS object and convert into a JSON
        // .insertMany([]) - for multiple documents insertion
        // .updateOne() - for updating single document
        // .updateOne() takes two arguments:
        // 1.filter of what document needs update
        // 2.object describing how to update document
        // .updateMany() - for updating multiple documents at once

        if (this._id) {
            // update product
            dbOperation = db.collection('products')
                .updateOne(
                    { _id: this._id },
                    { $set: this }
                    // {$set: {
                    //     title: this.title,
                    //     price: this.price,
                    //     description: this.description,
                    //     imageUrl: this.imageUrl
                    // }}
                );
        } else {
            // add new product
            dbOperation = db.collection('products').insertOne(this);
        }
        return dbOperation
            .then(result => {
                console.log('PRODUCT SAVED SUCCESSFULLY');
            })
            .catch(err => console.log(err));

    }

    static fetchAll() {
        // db - access root level of the database
        const db = getDbAccess();
        // special mongoDB method .find()
        // by default fetch all docs from collection and return a cursor
        // can use for example: db.collection('products').find().toArray()
        // to transform all data into JS Array(later we'll use pagination for big amount of data)
        // find could be configured by passing in an object .find({title: 'First book'})
        return db.collection('products').find().toArray()
            .then(products => {
                console.log('PRODUCTS FOUND');
                return products;
            })
            .catch(err => console.log(err))
    }

    static findById(id) {
        // db - access root level of the database
        const db = getDbAccess();
        // .find() returns a cursor and we should call .next()
        // this operation will give us the last element that .find() found
        // new mongodb.ObjectId(id) - convert id we get in, to a mongodb ObjectId format
        return db.collection('products')
            .find({ _id: new mongodb.ObjectId(id) })
            .next()
            .then(product => {
                console.log('PRODUCT FOUND');
                return product;
            })
            .catch(err => console.log(err))
    }

    static deleteById(id) {
        // db - access root level of the database
        const db = getDbAccess();
        // .deleteOne() - mongodb method for deleting document from collection
        // .deleteMany() - mongodb method for deleting documents from collection
        // .deleteOne() - delete the first element it finds that fulfill criteria
        return db.collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(id) })
            .then(() => {
                console.log('PORDUCT DELETED SUCCESSFULLY');
                // return product;
            })
            .catch(err => console.log(err))
    }
}

module.exports = Product;

***update /models/user.js
const mongodb = require('mongodb');
const getDbAccess = require('../utils/database').getDbAccess;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(username, email, cart, password, id) {
        this.name = username;
        this.email = email;
        this.cart = cart; // { items: [...] }
        this.password = password;
        this._id = id;
    }

    save() {
        // db - access root level of the database
        const db = getDbAccess();
        // return insertion promise
        return db.collection('users').insertOne(this);
    }

    getCart() {
        // db - access root level of the database
        const db = getDbAccess();
        // assign variable for array of cart items IDs
        const cartProductsIds = this.cart.items.map(item => {
            return item.productId;
        });
        // return cursor to all elements where _id is $in array of cartProductsIds
        return db.collection('products')
            .find({
                _id: { $in: cartProductsIds }
            })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(item => {
                            return item.productId.toString() === product._id.toString()
                        }).quantity
                    }
                })
            })
            .catch(err => console.log(err))
    }

    addToCart(product) {
        // db - access root level of the database
        const db = getDbAccess();
        // if this product exist in the cart
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
                productId: new ObjectId(product._id),
                quantity: newQuantity
            })
        }
        // creates an object which holds upatedCartItems array
        const updatedCart = {
            items: updatedCartItems
        };
        // .updateOne() - mongoDB method for updating document
        // first argument - the document that will be updated
        // second argument - what to update
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: updatedCart } }
        )
    }

    removeItemFromCart(productId) {
        // db - access root level of the database
        const db = getDbAccess();
        // assign veriable for updated cart items
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString()
        });
        // return update promise
        return db.collection('users').updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: updatedCartItems } } }
        )
    }

    addOrder() {
        // db - access root level of the database
        const db = getDbAccess();
        // fetchData of cart products
        return this.getCart()
            .then(products => {
                // assign order structure
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        name: this.name
                    }
                }
                // return promise of adding order
                return db.collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = { items: [] }; // clear cart object array in user object 
                // and then clear cart object in 'users' collection in the databse
                // for this current user
                return db.collection('users').updateOne(
                    { _id: new ObjectId(this._id) },
                    { $set: { cart: { items: [] } } }
                )
            })
    }

    getOrders() {
        // db - access root level of the database
        const db = getDbAccess();
        // in mongodb filter criteria you can also check for nested properties
        // the only thing you need to write them inside quotation marks
        // return array of orders for this user._id
        return db
            .collection('orders')
            .find({
                'user._id': new ObjectId(this._id)
            })
            .toArray()
    }

    static findById(id) {
        // db - access root level of the database
        const db = getDbAccess();
        // can also use .findOne() if you sure you can find only one element
        // .findOne() will immediately return one element(without cursor)
        // new ObjectId(id) - convert id we get in, to a mongodb ObjectId format        
        return db.collection('users')
            .findOne({ _id: new ObjectId(id) })
            .then(user => {
                console.log('USER FOUND');
                return user;
            })
            .catch(err => console.log(err))
    }
}

module.exports = User;

***delete /models/cart.js
***delete /models/cart-item.js

***update app.js
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const bodyParser = require('body-parser'); // imports parser

const app = express(); // initial new object to store and manage express behind the scenes
const errorController = require('./controllers/error'); // import controller
const mongoConnect = require('./utils/database').mongoConnect;
const User = require('./models/user');

// set global configuration app.set(name, value);
app.set('view engine', 'ejs'); // TE set
app.set('views', './views'); // views(HTML) folder set

// import routes Data
const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop');

// register a middleware for req.body parser (parse - розбір)
// parsing data (розбір інформаційних данних)
app.use(bodyParser.urlencoded({ extended: false })); // it will return .next() in the end

// register another middleware to grant access
// read access to the 'public' folder and forward any search file requests to it
app.use(express.static(path.join(__dirname, 'public')));

// assign new middleware for logged user
app.use((req, res, next) => {
    User.findById('5c23a4902247ca155859eb09')
        .then(user => {            
            req.user = new User(
                user.name,
                user.email,
                user.cart,
                user.password,
                user._id
            );
            next(); // continue NodeJS event loop
        })
        .catch(err => console.log(err))
});

// routes order matters!!!
// only routes that start with '/admin' will use adminRoutes object logic
app.use('/admin', adminRoutes);
app.use(shopRoutes); // allow express app consider shopRoutes object and use it logic

// 404 error handle
app.use(errorController.get404);

mongoConnect(() => { // access to the client object    
    app.listen(3000);
})

***update /routes/admin.js
const express = require('express'); // import express
const adminController = require('../controllers/admin'); // import controller
const router = express.Router(); // create router object

// /admin/add-product => GET reference to the controller
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET reference to the controller
router.get('/products', adminController.getProducts);

// /admin/add-product => POST reference to the controller
router.post('/add-product', adminController.postAddProduct);

// /admin/edit-product/:productId => POST reference to the controller
// :productId is a dynamic indicated segment
router.get('/edit-product/:productId', adminController.getEditProduct);

// /admin/edit-product => POST reference to the controller
router.post('/edit-product', adminController.postEditProduct);

// /admin/delete-product => POST reference to the controller
router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router; // export router object

***update /routes/shop.js
const express = require('express'); // import express
const router = express.Router(); // create router object
const shopController = require('../controllers/shop'); // import controller

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
router.get('/cart', shopController.getCart);

// '/cart' => POST reference to the controller
router.post('/cart', shopController.postCart);

// '/cart-remove-item' => POST reference to the controller
router.post('/cart-remove-item', shopController.postRemoveCartItem);

// '/create-order' => POST reference to the controller
router.post('/create-order', shopController.postOrder);

// '/orders' => GET reference to the controller
router.get('/orders', shopController.getOrders);

module.exports = router; // export router object

***update /controllers/admin.js
const Product = require('../models/product'); // import Product model

// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        editing: false
    });
}

// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const userId = req.user._id
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, price, description, imageUrl, null, userId);
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
                prod: product
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
    // create new product
    const product = new Product(
        updatedTitle,
        updatedPrice,
        updatedDescription,
        updatedImageUrl,
        updatedId
    )

    return product.save()
        .then(result => {
            console.log('PRODUCT UPDATED!');
            res.redirect('/admin/products'); // provide template update at once
        })
        .catch(err => console.log(err)); // will catch errors for both promises    
}

// post Delete product
exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    // mongoDB method
    Product.fetchAll()
        .then(products => {
            // get products only for current user
            res.render('admin/products', {
                prods: products,
                docTitle: 'Admin Products',
                path: "/admin/products"
            })
        })
        .catch(err => console.log(err));
}

***update /controllers/shop.js
const Product = require('../models/product'); // import Product model

// get Products action
exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => { // array of objects
            res.render('shop/product-list', {
                prods: products,
                docTitle: 'Products',
                path: '/products'
            });
        })
        .catch(err => console.log(err));
}

// get Single Product action
exports.getSingleProduct = (req, res, next) => {
    // assign variable for a dynamic segment part of a request path
    const productId = req.params.productId;
    // alternative way
    // Product.findAll({ where: { id: productId } })
    //     .then(productsArray => {
    //         res.render('shop/product-details', {
    //             prod: productsArray[0],
    //             docTitle: `${productsArray[0].title} (details)`,
    //             path: `/products/:${productId}`
    //         });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     })

    // call sequelize model method for object find
    Product.findById(productId)
        .then(product => { // return an object
            res.render('shop/product-details', {
                prod: product,
                docTitle: `${product.title} (details)`,
                path: `/products/:${productId}`
            });
        })
        .catch(err => console.log(err));
}

// get Index action
exports.getIndex = (req, res, next) => {
    // finds all the records for this model
    Product.fetchAll()
        .then(products => { // array of objects
            res.render('shop/index', {
                prods: products,
                docTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => console.log(err));
}

// get Cart action
exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(products => {
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
    //  model methods provided by sequelize depending on relationships
    req.user.removeItemFromCart(productId)        
        .then(result => {
            console.log('ITEM REMOVED FROM THE CART')
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

// post Order action
exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.addOrder()        
        .then(result => {
            console.log('NEW ORDER ADDED');
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}

// get Orders action
exports.getOrders = (req, res, next) => {    
    // return orders array for current user
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
}

***update /views/shop/product-list.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>                
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
                        <a href="/products/<%= prod._id %>" class="btn">Details</a>                        
                        <%- include('../includes/addtocart.ejs', {prod: prod}) %>
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

***update /views/shop/cart.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>    
    <% if (prods.length > 0) { %>
        <table class="cart-list">
            <tbody>
                <% for (prod of prods) { %>                
                    <tr class="cart-list__item">
                        <td class="cart-list__item__ttl"><h3>Title: "<%= prod.title %>"</h3></td>
                        <td class="cart-list__item__qty"><h3>Quantity: <%= prod.quantity %></h3></td>                        
                        <td class="cart-list__item__btn">
                            <form action="/cart-remove-item" method="POST">
                                <input type="hidden" name="productId" value="<%= prod._id %>">
                                <button class="rmbtn" type="submit">Remove</button>
                            </form>
                        </td>                        
                <% } %>
            </tbody>
        </table>
        <div class="centered">
            <hr>
            <form action="/create-order" method="POST">
                <button type="submit" class="btn">Order Now!</button>
            </form>
        </div>        
    <% } else { %>
        <div class="list-header">
            <h1>No products in your Cart</h1>
        </div>
    <% } %>
<%- include('../includes/end.ejs') %>

***update /views/shop/orders.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <% if (!orders.length) { %>
        <div class="list-header">
            <h1>Nothing here for now</h1>
        </div>
    <%} else {%>
        <ul class="order-list">
        <% orders.forEach(order => { %>            
            <li class="order-list__item">
                <h1 class="order-list__id">Order# <%= order._id %></h1>                
                <ul class="order-list-entire-list">
                    <% order.items.forEach(item => { %>
                        <li class="order-list-entire-list__item">
                            <h3>Title: <%= item.title %></h3>
                            <h3>Quantity: <%= item.quantity %></h3>
                        </li>
                    <% }); %>
                </ul>
            </li>
        <% }); %>
        </ul>
    <% } %>
<%- include('../includes/end.ejs') %>

***update /views/includes/addtocart.ejs
<form action="/cart" method="POST">        
    <button class="btn" type="submit">Add to Cart</button>
    <input type="hidden" name="productId" value="<%= prod._id %>">
</form>

***update /views/admin/products.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
        <% if (prods.length) { %>
            <div class="list-header">
                <h1>My Products</h1>                
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
                        <a href="/admin/edit-product/<%= prod._id %>?edit=true" class="btn">Edit</a>                                                
                        <form action="/admin/delete-product" method="POST">
                            <input type="hidden" name="productId" value="<%= prod._id %>">
                            <button type="submit" class="rmbtn">Delete</button>
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

***update /views/admin/edit-product.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">
    <link rel="stylesheet" href="/css/product.css">   
</head>

<%- include('../includes/navigation.ejs') %>
        <form class="product-form" action="/admin/<% if (editing) { %>edit-product<%} else {%>add-product<% } %>" method="POST">
            <div class="form-control">
                <label for="title">Title</label>
                <input id="title" type="text" name="title" value="<%if (editing) {%><%= prod.title %><%} %>">
            </div>
            <div class="form-control">
                <label for="imageUrl">Image URL</label>
                <input id="imageUrl" type="text" name="imageUrl" value="<%if (editing) {%><%= prod.imageUrl %><%} %>">
            </div>            
            <div class="form-control">
                <label for="price">Price</label>
                <input id="price" type="number" step="0.01" name="price" value="<%if (editing) {%><%= prod.price %><%} %>">
            </div>
            <div class="form-control">
                <label for="description">Description</label>                
                <textarea id="description" name="description" rows="5"><% if (editing) {%><%= prod.description %><% } %></textarea>
            </div>
            <% if(editing) { %>
                <input type="hidden" name="productId" value="<%= prod._id %>">
            <% } %>
            
            <button class="btn" type="submit">
                <% if(editing) { %>
                Update Product
                <% } else { %>
                Add Product
                <% } %>
            </button>
        </form>
<%- include('../includes/end.ejs') %>

***update /public/css/product.css
.product-form {
    width: 20rem;
    max-width: 90%;
    margin: auto;
    display: block;
}

.product-item {
    width: 20rem;
    max-width: 95%;
    margin: 1rem;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.product__title {
    font-size: 1.2rem;
    text-align: center;
}

.product__price {
    text-align: center;
    color: #4d4d4d;
    margin-bottom: 0.5rem;
}

.product__description {
    text-align: center;
}

.cart-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.cart-list__item {
    margin: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 1px 1px 1px 1px #696969fb;
}

.cart-list__item__ttl {
    width: 50%;
    display: flex;
    justify-content: flex-start;
    margin: 0 1rem;
}

.cart-list__item__qty {
    width: 8rem;
    display: flex;
    justify-content: center;
    margin: 0 1rem;
}

.cart-list__item__btn {    
    display: flex;
    justify-content: center;
    margin: 0 1rem;
}

.order-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.order-list__item {
    margin: 1rem 0;
    padding: 1rem;
    box-shadow: 1px 1px 2px 2px #696969fb;
}

.order-list__item h1 {
    width: 100%;
    margin: auto;
}

.order-list-entire-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.order-list__id {
    margin: auto;
}

.order-list-entire-list__item {
    margin: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 1px 1px 2px 2px #1f6919fb;
}

.order-list-entire-list__item h3 {
    margin: 1rem;
}

@media (max-width: 576px) {
    .cart-list__item {
        flex-direction: column;
        margin: 1rem 0;
    }
    .cart-list__item__ttl,
    .cart-list__item__qty {
        width: 90%;
        display: flex;
        justify-content: center;
        margin: 0 1rem;
    }

    .cart-list__item__btn {
        margin: 1rem 0;
    }
}


*/