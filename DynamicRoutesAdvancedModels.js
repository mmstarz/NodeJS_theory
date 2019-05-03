/* Dynamic Routes & Advanced Models

agenda:
1.Passing and using Dynamic Data.
2.Passing Route params
3.Use Query params
4.Enhance models

***NEXT*** preparation
1. update main.css
2. update product.css
3. create public/js/main.js
4. update /views/includes/end.ejs
5. update /views.includes/navigation.ejs

// update main.css
... second update section

// update product.css
... second update section

// create public/js/main.js
const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

// update /views/includes/end.ejs
    </main>
<script src="/js/main.js"></script>
</body>

</html>

// update /views.includes/navigation.ejs
<body>
    <div class="backdrop"></div>
    <header class="main-header">
        <button id="side-menu-toggle">Menu</button>
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item">
                    <a class="<%= path === '/' ? 'active' : '' %>" href="/">Shop</a>
                </li>
                <li class="main-header__item">
                    <a class="<%= path === '/products' ? 'active' : '' %>" href="/products">Products</a>
                </li>
                <li class="main-header__item">
                    <a class="<%= path === '/cart' ? 'active' : '' %>" href="/cart">Cart</a>
                </li>
                <li class="main-header__item">
                    <a class="<%= path === '/orders' ? 'active' : '' %>" href="/orders">Orders</a>
                </li>
                <li class="main-header__item">
                    <a class="<%= path === '/admin/add-product' ? 'active' : '' %>" href="/admin/add-product">Add Product
                    </a>
                </li>
                <li class="main-header__item">
                    <a class="<%= path === '/admin/products' ? 'active' : '' %>" href="/admin/products">Admin Products
                    </a>
                </li>                
            </ul>
        </nav>
    </header>

    <nav class="mobile-nav">
        <ul class="mobile-nav__item-list">
            <li class="mobile-nav__item">
                <a class="<%= path === '/' ? 'active' : '' %>" href="/">Shop</a>
            </li>
            <li class="mobile-nav__item">
                <a class="<%= path === '/products' ? 'active' : '' %>" href="/products">Products</a>
            </li>
            <li class="mobile-nav__item">
                <a class="<%= path === '/cart' ? 'active' : '' %>" href="/cart">Cart</a>
            </li>
            <li class="mobile-nav__item">
                <a class="<%= path === '/orders' ? 'active' : '' %>" href="/orders">Orders</a>
            </li>
            <li class="mobile-nav__item">
                <a class="<%= path === '/admin/add-product' ? 'active' : '' %>" href="/admin/add-product">Add Product
                </a>
            </li>
            <li class="mobile-nav__item">
                <a class="<%= path === '/admin/products' ? 'active' : '' %>" href="/admin/products">Admin Products
                </a>
            </li>
        </ul>
    </nav>
    
    <main>

***NEXT*** update main.css
//main.css
.card__actions {
    display: flex;
    padding: 1rem;
    text-align: center;
    justify-content: space-evenly;    
}

.card__actions button,
.card__actions a {
    height: 2rem;
    margin: 0 0.25rem;
}

.mobile-nav {
    width: 30rem;
    height: 100vh;
    max-width: 90%;
    position: fixed;
    left: 0;
    top: 0;     
    background: #778ba3;
    z-index: 10;
    padding: 1rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease-out;
}
  
.mobile-nav__item-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
}
  
.mobile-nav__item {
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 1rem;
    padding: 0;
}

.mobile-nav__item a {
    text-decoration: none;
    text-shadow: 2px 2px 4px #979797;    
    color: #1c1e2e;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0.5rem 2rem;
}

.mobile-nav__item a:active,
.mobile-nav__item a:hover,
.mobile-nav__item a.active {
  background: #798a8a; 
  color: #73ff00;
  border-radius: 3px;
}


***NEXT*** passing unique identifires in between routes
steps:
1. update /views/shop/product-list.ejs
2. clear /data/products.json
3. update /controllers/error.js
4. update /routes/shop.js
5. update /controllers/shop.js
6. update /models/product.js

!!!important - Query data pass and extraction
// : - allows to set a placeholder for future information
// : - signals to express that it shouldn't look for a route
// :productId can be anything and we can than extraxt that information
// :productId is a dynamic segment and the order also matters
// if you will place any routes with same path after dynamic segment
// you'll never reach them
router.get('/products/:productId', shopController.getProductId);

// update /views/shop/product-list.ejs
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
                        <a href="/products/<%= prod.id %>" class="btn">Details</a>
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

// clear /data/products.json
[]

// update /controllers/error.js
// get 404 Page
exports.get404 = (req, res, next) => {    
    res.status(404).render('404', {
        status: res.statusCode,
        docTitle: "Page not found",
        path: ""
    });
}

// update /routes/shop.js
...
router.get('/products/:productId', shopController.getProductId);
...

// update /controllers/shop.js
// get ProductId and render page
exports.getProductId = (req, res, next) => {
    // assign variable for a dynamic segment part of a request path
    const productId = req.params.productId;
    // call DS method for object find
    Product.findById(productId, product => {
        console.log(product);
    });
    res.redirect('/');
}

// update /models/product.js
module.exports = class Product {
    constructor(title, imageUrl, price, description) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
...
// expects an id and a callback function wich will return after all is done
    static findById(id, cb) {        
        getProductsFromfile(products => { // get array of objects
            // assign variable for single object, where id === id passed to the func
            const product = products.find(obj => obj.id === id);
            // return callback
            cb(product);
        });

    }
...
}    

***NEXT*** implement /views/shop/product-details.ejs
steps:
1. update /views/shop/product-details.ejs
2. update /controllers/shop.js
3. update /public/css/main.css

// update /views/shop/product-details.ejs
<%- include('../includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('../includes/navigation.ejs') %>
    <div class="centered">
        <h1><%= prod.title %></h1>
        <hr>
        <div class="details__image">
            <img src="<%= prod.imageUrl %>" alt="<%= prod.title %>">
        </div>
        <h2><%= prod.price %></h2>
        <p><%= prod.description %></p>
        <form action="/cart" method="POST">
            <button class="btn" type="submit">Add to Cart</button>
        </form>
    </div> 
<%- include('../includes/end.ejs') %>

// update /controllers/shop.js
...
// get ProductId and render details page
exports.getProductId = (req, res, next) => {
    // assign variable for a dynamic segment part of a request path
    const productId = req.params.productId;
    // call DS method for object find
    Product.findById(productId, product => {        
        res.render('shop/product-details', {
            prod: product,
            docTitle: `${product.title} (details)`,
            path: `/products/:${productId}`
        });
    });
}
...

// update /public/css/main.css
.details__image {
    width: 60%;
    margin: 0 auto;
}

.details__image img{
    width: 100%;
}

***NEXT*** Add to Cart functionality
To pass data to the req.body POST method is used.
<form action="/cart" method="POST">        
    <button class="btn" type="submit">Add to Cart</button>
    <input type="hidden" name="productId" value="<%= prod.id %>">
</form>
now id can be retrieved(інформація може бути вилучена) from the req.body.productId

!!!important in .ejs when you include inside iteration,
you need to add second argument to the include function.
this will be an object with passing data to the include from iteration.
<%- include('../includes/addtocart.ejs', {prod: prod}) %>

steps:
0. create /views/includes/addtocart.ejs
1. update /views/shop/product-details.ejs
2. update /views/shop/index.ejs
3. update /views/shop/product-list.ejs
4. update /routes/shop.js
5. update /controllers/shop.js

// /views/includes/addtocart.ejs
<form action="/cart" method="POST">        
    <button class="btn" type="submit">Add to Cart</button>
    <input type="hidden" name="productId" value="<%= prod.id %>">
</form>

// update /views/shop/product-details.ejs
...
<%- include('../includes/navigation.ejs') %>
    <div class="centered">
        <h1><%= prod.title %></h1>
        <hr>
        <div class="details__image">
            <img src="<%= prod.imageUrl %>" alt="<%= prod.title %>">
        </div>
        <h2><%= prod.price %></h2>
        <p><%= prod.description %></p>
        <%- include('../includes/addtocart.ejs') %>
    </div> 
<%- include('../includes/end.ejs') %>


// update /views/shop/index.ejs
...
<div class="card__actions">
    <%- include('../includes/addtocart.ejs') %>
</div>
...

// update /views/shop/product-list.ejs
...
<div class="card__actions">
    <a href="/products/<%= prod.id %>" class="btn">Details</a>                        
    <%- include('../includes/addtocart.ejs', {prod: prod}) %>
</div>
...

// update /routes/shop.js
...
// '/cart' => POST reference to the controller
router.post('/cart', shopController.postCart);
...

// update /controllers/shop.js
...
// post render Cart page
exports.postCart = (req, res, next) => {
    const id = req.body.productId;
    console.log(id);
    res.redirect('/cart');
}
...

***NEXT*** add cart model/edit-product.ejs
steps:
1. create /models/cart.js
2. move code from views/admin/add-product.ejs to edit-product.ejs
3. update /controllers/admin.js
4. udapte /routes/admin.js
5. udapte /views/admin/products.ejs
6. update /views/admin/edit-product.ejs

// create /models/cart.js
const fs = require('fs');
const path = require('path');
const folderPath = require('../utils/path');

// define path to the file global
const filePath = path.join(folderPath, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // fetch previous cart
        fs.readFile(filePath, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            // analyze the cart => find existing product
            const currProductIndex = cart.products.findIndex(product => product.id === id);
            const currProduct = cart.products[currProductIndex];
            // add new product / increase quantity
            let updatedProduct;
            if (currProduct) { // if such product already in the cart
                updatedProduct = { ...currProduct }; // copy all properties
                updatedProduct.quantity += 1; // upadte quantity 
                cart.products = [...cart.products]; // copy all properties
                cart.products[currProductIndex] = updatedProduct; // update current product properties
            } else { // if there is no such product in the cart
                updatedProduct = { id: id, quantity: 1 }; // store data in variable adn increase qty by 1
                cart.products = [...cart.products, updatedProduct]; // update array of objects
            }
            // cart DS updating adn write into a file
            // convert price to a number and add to total
            cart.totalPrice += +productPrice; 
            fs.writeFileSync(filePath, JSON.stringify(cart), err => {
                console.log(err);
            });
        });

    }
}

//  update /controllers/admin.js
...
// get Add Product Page
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        editing: false
    });
}
...
// get Edit Product Page
exports.getEditProduct = (req, res, next) => {
    const editMode = req.body.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const id = req.params.productId;
    Product.findById(id, product => {
        if(!product) {
            return res.redirect('/');
        }        
        res.render('admin/edit-product', {
            docTitle: 'Add Product',
            path: "/admin/add-product",
            editing: editMode,
            prod: product
        });
    });
}
...

//  udapte /routes/admin.js
...
// /admin/edit-product => POST reference to the controller
// :productId is a dynamic indicated segment
router.post('/edit-product/:productId', adminController.getEditProduct);
...

//  udapte /views/admin/products.ejs
...
<div class="card__actions">
    <form action="/admin/edit-product/<%= prod.id %>" method="POST">
        <button type="submit" class="btn" >Edit</button>
        <input type="hidden" name="edit" value="true">
    </form>                        
    <form action="/admin/delete-product" method="POST">
        <button type="submit" class="btn">Delete</button>
    </form>                        
</div>
...

// update /views/admin/edit-product.ejs
...
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
        
        <button class="btn" type="submit">
            <% if(editing) { %>
            Update Product
            <% } else { %>
            Add Product
            <% } %>
        </button>
    </form>
<%- include('../includes/end.ejs') %>

***NEXT*** Linking to the edit page and set changes
!!! important
added query param to the link like this
<a href="/admin/edit-product/<%= prod.id %>?edit=true" class="btn">Edit</a>
query can be read than by controller like this
const editMode = req.query.edit;
there can be multiple queries separated with & '/url?param=value&param2=value2&...'

add param data segment like this 
router.get('/edit-product/:productId', adminController.getEditProduct);
router param can be read by controller like this
const id = req.params.productId;
there can be only one dynamic segment param in the url

steps:
1. update /views/admin/products.ejs
2. update /views/admin/edit-product.ejs
3. update /routes/admin.js
4. update /controllers/admin.js
5. update /models/product.js

// update /views/admin/products.ejs
...
<div class="card__actions">
    <a href="/admin/edit-product/<%= prod.id %>?edit=true" class="btn">Edit</a>                                                
    <form action="/admin/delete-product" method="POST">
        <button type="submit" class="btn">Delete</button>
    </form>                        
</div>  
...

// update /views/admin/edit-product.ejs
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
                <input type="hidden" name="productId" value="<%= prod.id %>">
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

// update /routes/admin.js
...
// /admin/edit-product => POST reference to the controller
router.post('/edit-product', adminController.postEditProduct);
...

// update /controllers/admin.js
...
// post new product from Add Product page
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(null, title, imageUrl, price, description); // create new Data Structure(DS) array
    product.save(); // save new object into DS
    res.redirect('/');
}

// get Edit Product Page
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const id = req.params.productId;
    Product.findById(id, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Add Product',
            path: "/admin/add-product",
            editing: editMode,
            prod: product
        });
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

    const updatedProduct = new Product(
        updatedId,
        updatedTitle,
        updatedImageUrl,
        updatedPrice,
        updatedDescription
    );
    
    updatedProduct.save();
    res.redirect('/admin/products');
}
...

// update /models/product.js
...
module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    // store product in the products DS and store it into file 
    save() {
        getProductsFromfile(products => { // get array of objects
            if (this.id) { // update products if such product exist
                const currentProductIndex = products.findIndex(product => product.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[currentProductIndex] = this;
                // rewrite file with updated data(stringify() - converts JS => JSON)
                fs.writeFileSync(filePath, JSON.stringify(updatedProducts), err => {
                    console.log(err); // if any errors occur
                });
            } else { // add new product and update products
                this.id = Math.random().toString(); // temp solution
                products.push(this); // add new product to the products
                // fs.createReadStream() - for big files reading with chunks
                // rewrite file with updated data(stringify() - converts JS => JSON)
                fs.writeFileSync(filePath, JSON.stringify(products), err => {
                    console.log(err); // if any errors occur
                });
            }
        });
    }
...

***NEXT*** add delete product functionality and /views/shop/cart.ejs
steps:
1. update /routes/admin.js
2. update /views/admin/edit-product.ejs
3. update /controllers/admin.js
4. update /models/product.js
5. update /models/cart.js
6. update /views/shop/cart.ejs
7. update /routes/shop.js
8. updated /public/css/product.css

// update /routes/admin.js
...
// /admin/edit-product/:productId => POST reference to the controller
// :productId is a dynamic indicated segment
router.get('/edit-product/:productId', adminController.getEditProduct);

// /admin/edit-product => POST reference to the controller
router.post('/edit-product', adminController.postEditProduct);

// /admin/delete-product => POST reference to the controller
router.post('/delete-product', adminController.postDeleteProduct);
...

// update /views/admin/edit-product.ejs
...
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
                <input type="hidden" name="productId" value="<%= prod.id %>">
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

// update /controllers/admin.js
...
// get Edit Product Page
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const id = req.params.productId;
    Product.findById(id, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Add Product',
            path: "/admin/add-product",
            editing: editMode,
            prod: product
        });
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

    const updatedProduct = new Product(
        updatedId,
        updatedTitle,
        updatedImageUrl,
        updatedPrice,
        updatedDescription
    );
    
    updatedProduct.save();
    res.redirect('/admin/products');
}

// post delete product
exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productId;
    Product.deleteById(id);
    res.redirect('/admin/products');
}
...

// update /models/product.js
    ...
    // delete product by id
    static deleteById(id) {
        getProductsFromfile(products => { // get array of objects
            const product = products.find(prod => prod.id === id);
            // assign variable for single object, where id === id passed to the func
            const updatedProducts = products.filter(obj => obj.id !== id);
            // Cart.removeProduct(id, product.price);
            fs.writeFile(filePath, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.removeProduct(id, product.price);
                } else {
                    console.log('/models/product.js', err);
                }
            });
        });
    }

// update /models/cart.js
...
module.exports = class Cart {
    ...
    // remove product from the Cart
    static removeProduct(id, productPrice) {
        // read cart file
        fs.readFile(filePath, (err, fileContent) => {
            if (err) {
                return
            }
            const updatedCart = { ...JSON.parse(fileContent) }; // copy cart content to a new object            
            const currProduct = updatedCart.products.find(prod => prod.id === id);
            if (!currProduct) { // if there is no current product in the cart edge case
                return;
            }
            const currProductQty = currProduct.quantity;
            updatedCart.products = updatedCart.products.filter(product => product.id !== id);
            updatedCart.totalPrice -= currProductQty * productPrice;

            fs.writeFile(filePath, JSON.stringify(updatedCart), err => {
                console.log('/models/cart.js', err);
            });
        });
    }

    // get Cart products
    static getCart(cb) {
        // read cart file
        fs.readFile(filePath, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                cb(null);
            } else {
                cb(cart);
            }
        });
    }
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
                        <td><h3>Title: "<%= prod.productData.title %>"</h3></td>
                        <td><h3>Quantity: <%= prod.qty %></h3></td> 
                        <td>
                            <form action="/cart-remove-item" method="POST">
                                <input type="hidden" name="productId" value="<%= prod.productData.id %>">
                                <button class="btn" type="submit">Remove</button>
                            </form>
                        </td>
                <% } %>
            </tbody>
        </table>
    <% } else { %>
        <div class="list-header">
            <h1>No products in your Cart</h1>
        </div>
    <% } %>
<%- include('../includes/end.ejs') %>

// update /routes/shop.js
...
// '/cart-remove-item' => POST reference to the controller
router.post('/cart-remove-item', shopController.postRemoveCartItem);
...

// updated /public/css/product.css
.cart-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    padding: 0;    
}

.cart-list__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-list__item h3 {    
    width: 15rem;
}

@media (max-width: 320px) {
    .cart-list__item {
        flex-direction: column;
        margin: 1rem 0;
    }

    .cart-list__item h3 {    
        width: 16rem;
        text-align: center;
    }
}

*/