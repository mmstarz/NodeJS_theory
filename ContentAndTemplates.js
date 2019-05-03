/* Content and Templates
1. Managing Data (without Database)
2. Render dynamic content in views
3. Understanding Templating Engines

// ***Managing Data without Database Start***
Sharing data provides with reference type of data structures.
steps:
1. update admin.js
...
const products = []; // assign array for sharing Data
...
router.post('/add-product', (req, res, next) => {    
    // push inputed title object to the poducts array
    products.push({ title: req.body.title });
    res.redirect('/');
});
...
exports.routes = router; // same as module.exports = router;
exports.products = products; // same as module.exports = products;

2. update app.js
...
const adminData = require('./routes/admin');
...
app.use('/admin', adminData.routes);
...

3. update shop.js
...
const adminData = require('./admin'); // import adminData object from admin.js
...
router.get('/', (req, res, next) => {
    console.log('shop.js products: ', adminData.products); // shared Data array  
    res.sendFile(path.join(rootDir, 'views', 'shop.html')); // send response
});
// ***Managing Data without Database End***

// ***Template engines Start***
[HTML template with placeholders] <--------------------< |
[Node/Express content(e.g. products array)] -----> |     |
        <----------------------------------------< |     |
        |                                                |
[Templating Engines(TE)] --------------------------------> | 

TE understands the HTML template and replace placeholders/snippets(уривок)
with the content recieved from Node/Express.
And than return an updated HTML file.

Available TE:
            EJS                 Pug(Jade)               Handlebars
    <p><%= name %></p>          p #{name}           <p><{{ name }}></p>

use normal HTML and plain   use a minimal HTML and   use normal HTML and 
JavaScript in templates     custom template          custom template 
                            language                 language

> npm install --save ejs pug express-handlebars
now we can tell express to use these.

steps:
1. update app.js
...
// set global configuration app.set(name, value);
// view engine: 'string', set up what TE express should use for dynamic HTML building
// views: 'string' or [array],  tells where to find those HTML views.

***PUG Template Engine***
app.set('view engine', 'pug'); // TE set
app.set('views', './views'); // views(HTML) folder set

2. open views(HTML) folder and create those templates
// shop.pug
open that file
html -> html:5 -> TAB (give us pug html scelet)
write pug representation of HTML file

3. need to tell express to render pug.file
// update shop.js
...
router.get('/', (req, res, next) => {
    const products = adminData.products; // shared products array
    // render method will use default TE (app.set('view engine', 'pug'))
    // first argument is a name of the pug file to render
    // second argument is a name of variable to pass in that file
    // .pug file can now access this variable via passed object key
    res.render('shop', {prods: products, docTitle: 'Shop'}); // send response    
    // btw can use more then one key    
    // res.render('shop', {prods: products, docTitle: 'shop'}); 
});
...

4. set placeholders in shop.pug template for passed data
// update shop.pug
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        title #{docTitle}
        link(rel="stylesheet", href="/css/main.css")
        link(rel="stylesheet", href="/css/product.css")
    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a.active(href="/") Shop
                    li.main-header__item
                        a(href="/admin/add-product") Add Product
        main
            h1 My Products
            p reserved for list of all products...
            .grid
                each product is prods (iteration syntax for every product in prods)
                    article.card.product-item
                        header.card__header
                            h1.product__title #{product.title} (dynamicaly adds product title)
                        div.card__image
                            img(src="https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png", alt="A Book")
                        div.card__content
                            h2.product__price $19.99
                            p.product__description A very interesting book about so many even more interesting things!
                        div.card__actions
                            button.btn Add to Cart


// update admin.js
...
router.get('/add-product', (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('add-product', {docTitle: 'Add Product'}); // send response
});
...

// update add-product.pug
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        title #{docTitle}
        link(rel="stylesheet", href="/css/main.css")
        link(rel="stylesheet", href="/css/forms.css")
        link(rel="stylesheet", href="/css/product.css")
    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a(href="/") Shop
                    li.main-header__item
                        a.active(href="/admin/add-product") Add Product
        main
            form.product-form(action="/admin/add-product", method="POST")
                .form-control
                    label(for="title") Title
                    input#title(type="text", name="title")                
                button.btn(type="submit") Add Product


// update app.js
...
app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));    
    res.status(404).render('404', {status: res.statusCode});
});
...


// update 404.pug
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        title #{status} Page Not Found
        link(rel="stylesheet", href="/css/main.css")
    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a(href="/") Shop
                    li.main-header__item
                        a(href="/admin/add-product") Add Product
        main
            .list-header
                h1 Something went wrong
                h2 #{status} page not found


***Next*** Creating Template
1.create 'layouts' folder in 'views'
2.create main-layout.pug in 'layouts' folder

// main-layout.pug (contains 3 dynamic blocks: title, styles and content)
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        block title
        link(rel="stylesheet", href="/css/main.css")
        block styles
    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a(href="/") Shop
                    li.main-header__item
                        a(href="/admin/add-product") Add Product
        main
            block content


// refactor 404.pug with help of layout
extends layouts/main-layout.pug

block title
    title #{status} Page Not Found

block content
    .list-header
        h1 Something went wrong
        h2 #{status} page not found

// refactor shop.pug with help of layout
extends layouts/main-layout.pug

block title
    title #{docTitle}

block styles
    link(rel="stylesheet", href="/css/product.css")

block content
    if prods.length > 0
        .list-header            
            h1 My Products
            p reserved for list of all products...
            .grid
                each product in prods
                    article.card.product-item
                        header.card__header
                            h1.product__title #{product.title}
                        div.card__image
                            img(src="/images/book3.jpg", alt="A Book")
                            // img(src="https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png", alt="A Book")
                        div.card__content
                            h2.product__price $19.99
                            p.product__description A very interesting book about so many even more interesting things!
                        div.card__actions
                            button.btn Add to Cart
    else
        .list-header
            h1 No products left

// refactor add-product.pug with help of layout
extends layouts/main-layout.pug

block title
    title #{docTitle}

block styles
    link(rel="stylesheet", href="/css/forms.css")
    link(rel="stylesheet", href="/css/product.css")

block content
    form.product-form(action="/admin/add-product", method="POST")
        .form-control
            label(for="title") Title
            input#title(type="text", name="title")                
        button.btn(type="submit") Add Product


***next***removing block title from templates
// main-layout.pug
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        title #{docTitle}
        link(rel="stylesheet", href="/css/main.css")
        block styles
    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item                        
                        a(href="/" class=(docTitle === 'Shop' ? 'active' : '')) Shop
                    li.main-header__item
                        a(href="/admin/add-product" class=(docTitle === 'Add Product' ? 'active' : '')) Add Product
        main
            block content


// 404.pug
extends layouts/main-layout.pug

block content
    .list-header
        h1 Something went wrong
        h2 #{status} page not found

// shop.pug
extends layouts/main-layout.pug

block styles
    link(rel="stylesheet", href="/css/product.css")

block content
    if prods.length > 0
        .list-header            
            h1 My Products
            p reserved for list of all products...
            .grid
                each product in prods
                    article.card.product-item
                        header.card__header
                            h1.product__title #{product.title}
                        div.card__image
                            img(src="/images/book3.jpg", alt="A Book")
                            // img(src="https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png", alt="A Book")
                        div.card__content
                            h2.product__price $19.99
                            p.product__description A very interesting book about so many even more interesting things!
                        div.card__actions
                            button.btn Add to Cart
    else
        .list-header
            h1 No products left

//add-product.pug
extends layouts/main-layout.pug

block styles
    link(rel="stylesheet", href="/css/forms.css")
    link(rel="stylesheet", href="/css/product.css")

block content
    form.product-form(action="/admin/add-product", method="POST")
        .form-control
            label(for="title") Title
            input#title(type="text", name="title")                
        button.btn(type="submit") Add Product

// update admin.js
...
router.get('/add-product', (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('add-product', {docTitle: 'Add Product'}); // send response
});
...

// update app.js
...
app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));    
    res.status(404).render('404', {status: res.statusCode, docTitle: "Page not found"});
});
...

***NEXT***Handlebars Template Engine

*/