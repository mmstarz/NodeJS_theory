/* Sequelize - is a third party package.
An Object-Relational Mapping Library (ORM library)

Example:
User {                                      [users]
    name: 'Max',            Mapping         [id] [name]     [age]   [password]
    age: 29,                =======>        [1]  ['Max']    [29]    ['pass']
    password: 'pass',
}

                                   queries
                    INSER INTO users VALUES (1, 'Max', 29, 'pass')
                                   becomes
        const user = User.create({ name: 'Max', age: 29, password: 'pass' });

Core concepts:
1. Sequelize provides Models (e.g. User, Product)
2. Instances that can call constructor() function or use utility method
   on that Models(e.g. const user = User.build())
3. Queries run on that Models (e.g. User.findALL())
4. Associations Models (e.g. User.hasMany(Product))

Associations:
http://docs.sequelizejs.com/manual/tutorial/associations.html
Product                                             User
[     ] <------------- .hasMany() ----------------- [   ]
      |                                             |
      | Belongs to many   Cart      has one         |
      ------------------> [   ] <--------------------
      |                                             |
      | Belongs to many   Order     has many        |
      ------------------> [   ] <--------------------

in the app.js
// create associations(relations)
// this will auto create .createProduct() method for User
Product.belongsTo(User)
or
User.hasMany(Product)

*** additional model methods provided by sequelize:
<model name>.destroy()
<model name>.findAll()
<model name>.findById()

User.create({...})
Product.destroy()
Product.findAll()
Product.findById()


*** model methods provided by sequelize depending on relationships:
<associated model name>.get<associated model name>()
<associated model name>.add<associated model name>()
<associated model name>.create<associated model name>()

cart.getProducts()
fetchedCart.addProduct()
fetchedCart.setProducts(null); // drops all items from the cart by setting them to null
user.createCart();
req.user.getCart()
req,user.getOrders()
req.user.createProduct()
req.user.createOrder()


preparations:
> npm install --save sequelize

1.create a model with sequelize
2.conect it to database

steps:
!!! sequelize uses 'mysql2' behind the scenes.
!!! http://docs.sequelizejs.com/manual/tutorial/querying.html#operators

1.  MySQL Workbench Schemas -> node-complete -> tables -> products -> drop table
2.  update /utils/database.js
3.  update /models/product.js
4.  create /models/user.js
5.  create /models/order.js
6.  create /models/order-items.js
7.  update /models/cart.js
8.  update /models/cart-item.js
9.  update app.js
10.  update /controllers/admin.js
11. update /controllers/shop.js
12. update /views/shop/cart.ejs
13. update /views/admin/products.ejs
14. update /views/shop/orders.ejs
15  update /public/css/main.css (
        .rmbtn {...},
        .rmbtn:hover,
        .rmbtn:active {...},
        .centered {...}
        @media { .rmbtn {...}}
    )
16. update /public/css/product.css (
        .cart-list__item{...},
        .cart-list__item td {...}
    )

// update /utils/database.js
const Sequelize = require('sequelize'); // import package

// init needs arguments db name, root, password, {config object}
// create connections pool
const sequelize = new Sequelize('node-complete', 'root', 'mmstar', {
    dialect: 'mysql',
    host: 'localhost',
});

module.exports = sequelize; // export db connection pool

// update /models/product.js
const Sequelize = require('sequelize'); // import package

const sequelize = require('../utils/database'); // import db connections pool

// first argument name of a model, second - structure
// model name will be auto transformed to plurals after creation
// id: {...} for more specific config setups
// title: Sequelize.STRING if you want only setup a type
const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Product;

// create /models/user.js
const Sequelize = require('sequelize'); // import sequelize constructor package

const sequelize = require('../utils/database'); // import db connections pool

// first argument name of a model, second - structure
// model name will be auto transformed to plurals after creation
// id: {...} for more specific config setups
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    }    
});

module.exports = User;

// create /models/order.js
const Sequelize = require('sequelize'); // import package

const sequelize = require('../utils/database'); // import db connections pool

// create Order model which in the end will be inbetween table
// between User(to which order belongs) and
// multiple Products(which are part of the order)
// and these Products again will have quantity attached to them
const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    }   
})

module.exports = Order;

// create /models/order-items.js
const Sequelize = require('sequelize'); // import package

const sequelize = require('../utils/database'); // import db connections pool

// create cart model
const OrderItem = sequelize.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    quantity: Sequelize.INTEGER
})

module.exports = OrderItem;

// update /models/cart.js
const Sequelize = require('sequelize'); // import package

const sequelize = require('../utils/database'); // import db connections pool

// create cart model
const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    }
})

module.exports = Cart;

// create cart-item model
const Sequelize = require('sequelize'); // import package

const sequelize = require('../utils/database'); // import db connections pool

// create cart model
const CartItem = sequelize.define('cartItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    quantity: Sequelize.INTEGER
})

module.exports = CartItem;

// update app.js
const path = require('path');
const express = require('express'); // hold Ctrl and hover mouse for detailed info
const bodyParser = require('body-parser'); // imports parser

const sequelize = require('./utils/database'); // import db connections pool
const Product = require('./models/product'); // import sequelize Product model
const User = require('./models/user'); // import sequelize User model
const Cart = require('./models/cart'); // import sequelize Cart model
const CartItem = require('./models/cart-item'); // import sequelize CartItem model
const Order = require('./models/order'); // import sequelize Order model
const OrderItem = require('./models/order-item'); // import sequelize OrderItem model

const app = express(); // initial new object to store and manage express behind the scenes
const errorController = require('./controllers/error'); // import controller

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
    User.findById(1)
        .then(user => {
            // store current sequelized user object in the request
            req.user = user;
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

// Sequelize Associations(relations define)
// only user can delete product
// this will auto create .createProduct() method for User
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product); // inverse of previous line

User.hasOne(Cart); // every User has one Cart (auto user.getCart())
Cart.belongsTo(User); // inverse prev. (optional, one direction is enough)

// many -to- many relationship
// second argument is a reference to intermediate table
// where these connections should be stored
// auto create cart.getProducts()
Cart.belongsToMany(Product, { through: CartItem }); // one cart can hold multiple products
Product.belongsToMany(Cart, { through: CartItem }); // single product can be part of many Carts

User.hasMany(Order); // user can have many orders
Order.belongsTo(User); // order belongs to single user
// order can have many products through inbetween OrderItem table
Order.belongsToMany(Product, { through: OrderItem }); 

// .sync() look for all defined models and create tables for them in the db
// basically sync db with you models and if you have them relations
// sequelize.sync({ force: true }) // meta setup that connects tables in the db
sequelize.sync()
    .then(result => {
        // dummy user setup
        return User.findById(1);
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'mmstar',
                email: 'test@test.com',
                password: 'test'
            });
        }
        return Promise.resolve(user);
    })
    .then(user => {
        Cart.findAll({ where: { userId: user.id } })
            .then(cart => {
                // console.log(cart);
                if (!cart.length) {
                    return user.createCart();
                }
                return Promise.resolve(cart);
            })
            .catch(err => {
                console.log(err);
            })
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });


// update /controllers/admin.js
const Product = require('../models/product'); // import sequelize Product model

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
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
    }).then(() => {
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
    req.user.getProducts({ where: { id: productId } })
        // Product.findById(productId)
        .then(products => {
            const product = products[0];
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
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;
            // .save() method provided by sequelize
            // takes product as we edited and saves it to the database
            // if product not exist it will create new one
            return product.save(); // return to prevent nested promises
        })
        .then(result => {
            console.log('PRODUCT UPDATED!');
            res.redirect('/admin/products'); // provide template update at once
        })
        .catch(err => console.log(err)); // will catch errors for both promises    
}

// post delete product
exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    // .destroy() sequelize method for deleting records from db
    Product.destroy({ where: { id: productId, userId: req.user.id } })
        .then(result => {
            console.log('PRODUCT DELETED!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));

    // another way
    // Product.findById(productId)
    //     .then(product => {
    //         return product.destroy()
    //     })
    //     .then(result => {
    //         console.log('PRODUCT DELETED!');
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => console.log(err));
}

// get Admin Products Page
exports.getProducts = (req, res, next) => {
    // sequelize model method
    req.user.getProducts()
        //Product.findAll()
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

// update /controllers/shop.js
const Product = require('../models/product'); // import sequelize Product model

// get Products action
exports.getProducts = (req, res, next) => {
    Product.findAll()
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
    Product.findAll()
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
        .then(cart => {
            cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        docTitle: 'Your Cart',
                        path: '/cart',
                        prods: products,
                    });
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));
}

// post Cart action
exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart; // assign variable for the cart
    let newQuantity = 1; // assign variable for quantity
    req.user.getCart()
        .then(cart => { // access to the cart
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } })
        })
        .then(products => { // get array of products
            let product;
            if (products.length) {
                product = products[0];
            }
            if (product) { // increment quantity if product already exist in cart
                // cartItem extra field added by sequelize from inbetween table
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findById(productId)
        })
        .then(product => {
            return fetchedCart.addProduct(
                product,
                { through: { quantity: newQuantity } }
            )
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
}

// post remove cart item action
exports.postRemoveCartItem = (req, res, next) => {
    const productId = req.body.productId;
    //  model methods provided by sequelize depending on relationships
    req.user.getCart()
        .then(cart => { // access to the cart
            return cart.getProducts({ where: { id: productId } })
        })
        .then(products => { // products array 
            const product = products[0]; // store exact product object            
            return product.cartItem.destroy(); // use extra field of inbetween table
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

// post Order action
exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => { // access to the cart
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => { // get products array
            return req.user.createOrder()
                .then(order => {
                    // add updated products array to the order
                    return order.addProducts(products.map(product => {
                        product.orderItem = { // update every product
                            quantity: product.cartItem.quantity
                        }
                        return product;
                    }))
                })
                .catch(err => console.log(err))
        })
        .then(() => {
            return fetchedCart.setProducts(null); // clear products from the cart            
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}

// get Orders action
exports.getOrders = (req, res, next) => {
    // {include: ['products]} works only bcs we have relationship between these tables
    // fetch not only orders but also a products array
    req.user.getOrders({include: ['products']})
        .then(orders => { // access array of orders + products per order
            // orders[{data, [products]}, {data, [products]}]
            res.render('shop/orders', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
}

// update /views/shop/cart.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>    
    <% if (prods.length > 0) { %>
        <table class="cart-list">
            <tbody>
                <% for (prod of prods) { %>                
                    <tr class="cart-list__item">
                        <td><h3>Title: "<%= prod.title %>"</h3></td>
                        <td><h3>Quantity: <%= prod.cartItem.quantity %></h3></td>                        
                        <td>
                            <form action="/cart-remove-item" method="POST">
                                <input type="hidden" name="productId" value="<%= prod.id %>">
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

// update /views/admin/products.ejs
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
                        <a href="/admin/edit-product/<%= prod.id %>?edit=true" class="btn">Edit</a>                                                
                        <form action="/admin/delete-product" method="POST">
                            <input type="hidden" name="productId" value="<%= prod.id %>">
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

// update /views/shop/orders.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <% if (!orders.length) { %>
        <div class="list-header">
            <h1>Nothing here for now</h1>
        </div>
    <%} else {%>
        <ul>
        <% orders.forEach(order => { %>            
            <li>
                <h1># <%= order.id %></h1>
                <h2>Date: <%= order.updatedAt %></h2>
                <ul>
                    <% order.products.forEach(product => { %>
                        <li>
                            <P>Title: <%= product.title %>, Quantity: <%= product.orderItem.quantity %> </P>
                        </li>
                    <% }); %>
                </ul>
            </li>
        <% }); %>
        </ul>
    <% } %>
<%- include('../includes/end.ejs') %>

Summary:
SQL uses strict data schemas and relations.
You can connect you Node.js App via pakcages like mysql2
Writing SQL is not directly related to Node.js
and something you have to learn in addition to Node.js.

Instead of writing SQL queries manually, you can use packages (ORMs) like Sequelize.
To focus on the node.js code and work with native JS objects.
Sequelize allows you to define models and interact with database through them.
You can also easily set up relations ('Associations') and
interact with your related models through them.
*/