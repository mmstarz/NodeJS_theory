/*
Mongoose (a MongoDB ODM)

agenda:
1.what is mongoose
2.using mongoose in Node.js

Mongoose - is an Object-Document Mapping Library (ODM)

[User]                  [Users]
name        mapped      [id]    [name]  [age]   [password]
age         ======>      1       'Max'    28     'sometext'
email
password

instead of using MongoDB query for this operation:
db.collection('users').insertOne({name: 'Max', age: 28, password: 'sometext'})
mongoose can do it for us:
const user = User.create({name: 'Max', age: 28, password: 'sometext'})

core concepts:
[schemas&models] ---> [e.g. User , Product]
[instances]      ---> [const user = new User()]
[queries]        ---> [User.find()]

characteristics:
official docs - https://mongoosejs.com/

The $pull operator removes from an existing array all instances,
of a value or values that match a specified condition.
https://docs.mongodb.com/manual/reference/operator/update/pull/

preparations:
npm install --save mongoose
connect mongoose to our database

important:
relation set up
// ref: 'User' will tell mongoose to which collection this related to
userId: {type: Schema.Types.ObjectId, ref: 'User', required: true}

cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    }
// should use the same name of the collection that was passed to the mongoose model
module.exports = mongoose.model('User', userSchema);

module.exports = mongoose.model('Product', productSchema);

// Product.find().populate('userId', 'name') is a mongoose chain method
it takes property path as an argument
and return not just related userId but whole entire user Object inside products
or a single field from that object by passing second argument with field name
// .select() another mongoose chain method
Product.find().select('title price -_id').populate('userId', 'name')
it takes arguments of what exectly fields data you want
// basically you can controll what fields to return
// for the main document .select('title price -_id')
// and for the related document .populate('userId', 'name')

to return that(.select() and .populate()) methods as a promises
need to add .execSelect() .execPopulate() after call
Example:
req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        res.render('shop/cart', {
            docTitle: 'Your Cart',
            path: '/cart',
            prods: products,
        });
    })
    .catch(err => console.log(err));

// special mongoose { ...item.productId._doc } takes all fields from that document
// and create new document with all that data
const products = user.cart.items.map(item => {
    return { product: { ...item.productId._doc }, quantity: item.quantity }
})

steps:
1.  delete /utils/database.js
2.  delete /models/order-item.js
3.  update app.js
4.  update /models/product.js
5.  update /models/user.js
6.  update /models/order.js
7.  update /controllers/shop.js
8.  update /controllers/admin.js
9.  update /views/shop/cart.ejs
10. update /views/shop/orders.ejs

// ***update app.js
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const bodyParser = require('body-parser'); // imports parser
const mongoose = require('mongoose'); // import mongoose

const app = express(); // initial new object to store and manage express behind the scenes
const errorController = require('./controllers/error'); // import controller
const User = require('./models/user'); // import User model

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
    User.findById('5c263543cfe19f180499219c')
        .then(user => {
            // user here we get is a mongoose object
            req.user = user
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

mongoose
    .connect(
        'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop?retryWrites=true',
        { useNewUrlParser: true }
    )
    .then(result => {
        // .findOne() mongoose method that returns first user found
        User.findOne().then(user => {
            if (!user) {
                // assign user
                const user = new User({
                    name: 'mmstar',
                    email: 'test@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save(); // save user document into the collection
            }
            
            app.listen(3000);
        })
    })
    .catch(err => console.log(err));

// ***update /models/product.js
const mongoose = require('mongoose'); // import mongoose

const Schema = mongoose.Schema; // mongoose schema constructor

// define product data schema with help of mongoose schema constructor
const productSchema = new Schema({
    title: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String, required: true},
    imageUrl: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = mongoose.model('Product', productSchema);

// ***update /models/user.js
const mongoose = require('mongoose'); // import mongoose lib

const Schema = mongoose.Schema; // define mongoose schema constructor

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
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

// ***update /models/order.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    user: {
        name: { type: String, required: true},       
        userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    } 
});

module.exports = mongoose.model('Order', orderSchema);

// ***update /controllers/shop.js
const Product = require('../models/product'); // import mongoose model
const Order = require('../models/order'); // import mongoose model

// get Products action
exports.getProducts = (req, res, next) => {
    // mongoose .find() method don't return a cursor
    // to get a cursor use .find().cursor().eachAsync()
    // or .find().cursor().next()
    // mongoose .find() method return all documents for products collection
    Product.find()
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
    // mongoose .findById() method auto convert string into mongodb.ObjectId()    
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
    // mongoose .find() method return all documents for products collection
    // simply returns array of products
    Product.find()
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
                    name: req.user.name,
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
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
}

// ***update /controllers/admin.js
const Product = require('../models/product'); // import mongoose model

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
        userId: req.user
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

    Product.findById(updatedId)
        .then(product => {
            // product here we get is a mongoose object
            // we can call .save() mongoose method on it
            // and .save() will update this object with all changes
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            // promise return
            return product.save()
        })
        .then(result => {
            console.log('PRODUCT UPDATED!');
            res.redirect('/admin/products'); // provide template update at once
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
    Product.findOneAndDelete({ _id: productId })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    // use mongoose .find() method
    // .populate() is a mongoose method that can chain .find()
    // it takes property path as an argument
    // and return not just related userId but whole entire user Object inside products
    Product.find()
        // .select('title price -_id')
        // .populate('userId', 'name')
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

// ***update /routes/shop.js
const Product = require('../models/product'); // import mongoose model
const Order = require('../models/order'); // import mongoose model

// get Products action
exports.getProducts = (req, res, next) => {
    // mongoose .find() method don't return a cursor
    // to get a cursor use .find().cursor().eachAsync()
    // or .find().cursor().next()
    // mongoose .find() method return all documents for products collection
    Product.find()
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
    // mongoose .findById() method auto convert string into mongodb.ObjectId()    
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
    // mongoose .find() method return all documents for products collection
    // simply returns array of products
    Product.find()
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
                    name: req.user.name,
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
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
}

// ***update /views/shop/cart.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>    
    <% if (prods.length > 0) { %>
        <table class="cart-list">
            <tbody>
                <% for (prod of prods) { %>                
                    <tr class="cart-list__item">
                        <td class="cart-list__item__ttl"><h3>Title: "<%= prod.productId.title %>"</h3></td>
                        <td class="cart-list__item__qty"><h3>Quantity: <%= prod.quantity %></h3></td>                        
                        <td class="cart-list__item__btn">
                            <form action="/cart-remove-item" method="POST">
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
                <button type="submit" class="btn">Order Now!</button>
            </form>
        </div>        
    <% } else { %>
        <div class="list-header">
            <h1>No products in your Cart</h1>
        </div>
    <% } %>
<%- include('../includes/end.ejs') %>

// ***update /views/shop/orders.ejs
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