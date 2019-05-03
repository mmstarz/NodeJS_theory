/* express handlebars is not preinstalled TE so you need first to import it
!!! important to know, the name that you use for handlebars init, you
also will have to use for handlebars(templates) files extension.
example:
if in app.js
// set express-handlebars as a Template engine
app.engine('hbs', expressHbs({ // initialize express handlebars
    layoutsDir: 'views/layouts/',
    defaultLayout: 'main-layout',
    extname: 'hbs', // init extension name
})); 
app.set('view engine', 'hbs'); // TE set
than 
in 'views' should use 
shop.hbs


steps:
1. // update app.js
...
const expressHbs = require('express-handlebars'); // import express-handlebars TE
// set express-handlebars as a Template engine
app.engine('handlebars', expressHbs()); // initialize express handlebars
// set global configuration app.set(name, value);
app.set('view engine', 'handlebars'); // TE set
app.set('views', './views'); // views(HTML) folder set
...

2. create handlebars templates at 'views' folder
The way of passing data into engine doesn't change.
So all objects we sent before are still passed in.

for block statements is handlebars such syntax is used:
(but it handles only true/false results,
    so first need to pass this result to the template)
    
{{#if prods.length > 0 }} - open if logic operator
{{ else }} - else
{{#/if}} - closing if logic operator
{{#each}} - iterate every element in the array
{{/each}} - closing iteration
to access properties of each iterated element handlebars give us only one way
this - keyword. (e.g. {{ this.title }} )
{{{ body }}} - is used as a placeholder

!!!special key that can be passed into handlebars layouts:
layout: false, - means that it shouldn't use default layout.

3. update templates:
// 404.hbs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ docTitle }}</title>
    <link rel="stylesheet" href="/css/main.css">
</head>

<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item"><a href="/">Shop</a></li>
                <li class="main-header__item"><a href="/admin/add-product">Add Product</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="list-header">
            <h1>Something went wrong</h1>
            <h2>{{ status }} page not found</h2>
        </div>
    </main>
</body>

</html>

// shop.hbs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Shop</title>
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/product.css">
</head>

<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item"><a class="active" href="/">Shop</a></li>
                <li class="main-header__item"><a href="/admin/add-product">Add Product</a></li>
            </ul>
        </nav>
    </header>

    <main>
        {{#if hasProducts }}
        <div class="list-header">
            <h1>My Products</h1>
            <p>reserved for list of all products...</p>
        </div>
        <div class="grid">
            {{#each prods}}
            <article class="card product-item">
                <header class="card__header">
                    <h1 class="product__title">{{this.title}}</h1>
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
            {{/each}}
        </div>
        {{ else }}
        <div class="list-header">
            <h1>No Products left</h1>
        </div>
        {{/if}}
    </main>
</body>

</html>


// add-product.hbs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ docTitle }}</title>
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/forms.css">
    <link rel="stylesheet" href="/css/product.css">
</head>

<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item"><a href="/">Shop</a></li>
                <li class="main-header__item"><a class="active" href="/admin/add-product">Add Product</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <form class="product-form" action="/admin/add-product" method="POST">
            <div class="form-control">
                <label for="title">Title</label>
                <input id="title" type="text" name="title">
            </div>
            <button class="btn" type="submit">Add Product</button>
        </form>
    </main>
</body>

</html>

***NEXT***Layout with handlebars
!!! important to know, the name that you use for handlebars init, you
also will have to use for handlebars(templates) files extension.

1.need to add layouts folder to the handlebars TE
// update app.js
...
app.engine(
    'hbs',
    expressHbs({
        layoutsDir: 'views/layouts/',
        defaultLayout: 'main-layout',
        extname: 'hbs',
    })
);
...
2. create main-layout.hbs in 'views/layouts/' folder
as a place holder handlebars using {{{ body }}} 
and inline statement for class verify:
<a href="/" class="{{#if activeShop}}active{{/if}}">Shop</a>

// main-layout.hbs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ docTitle }}</title>
    <link rel="stylesheet" href="/css/main.css">
    {{#if formsCSS}}
        <link rel="stylesheet" href="/css/forms.css">
    {{/if}}
    {{#if productCSS}}
        <link rel="stylesheet" href="/css/product.css">
    {{/if}}
</head>

<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item">
                    <a href="/" class="{{#if activeShop}}active{{/if}}">Shop</a>
                </li>
                <li class="main-header__item">
                    <a href="/admin/add-product" class="{{#if activeAddProduct}}active{{/if}}">Add Product</a>
                </li>
            </ul>
        </nav>
    </header>

    <main>
        {{{ body }}}
    </main>
</body>

</html>

// shop.js
...
// middleware (if we don't call .next() it won't go to the next middleware)
router.get('/', (req, res, next) => {    
    res.render('shop', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,    
    }); 
});
...

// shop.hbs
(remove everything, but the content.
Which will pass in {{{ body }}} placeholder at main-layout.hbs)

{{#if hasProducts }}
<div class="list-header">
    <h1>My Products</h1>
    <p>reserved for list of all products...</p>
</div>
<div class="grid">
    {{#each prods}}
    <article class="card product-item">
        <header class="card__header">
            <h1 class="product__title">{{this.title}}</h1>
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
    {{/each}}
</div>
{{ else }}
<div class="list-header">
    <h1>No Products left</h1>
</div>
{{/if}}


// admin.js
...
router.get('/add-product', (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('add-product', {
        docTitle: 'Add Product',
        path: "/admin/add-product",
        activeAddProduct: true,
        productCSS: true,
        formsCSS: true,
    });
});
...

// add-product.hbs
(remove everything, but the content.
Which will pass in {{{ body }}} placeholder at main-layout.hbs)

<form class="product-form" action="/admin/add-product" method="POST">
    <div class="form-control">
        <label for="title">Title</label>
        <input id="title" type="text" name="title">
    </div>
    <button class="btn" type="submit">Add Product</button>
</form>

// 404.hbs
(remove everything, but the content.
Which will pass in {{{ body }}} placeholder at main-layout.hbs)

<div class="list-header">
    <h1>Something went wrong</h1>
    <h2>{{ status }} page not found</h2>
</div>
*/