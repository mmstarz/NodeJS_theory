/* EJS template Engine

EJS supported in the box.
So you don't need to register the engine.
EJS - can do both extends, comparison expressions and normal HTML.
EJS doesn't support layouts.

syntax:
<%= key %> - for data that template receives. direct data output
<% if ( prods.length > 0 ) { %> - comparisons 
<% } %>
or
<% if (...) { %>
<% } else { %>
<% } %>

<% for (let prod of prods) { %> - iteration
<% } %>
or
<% prods.forEach(prod => { %>
<% }) %>

<%- include()  %> - add unescape html code
in include('string') - you pass in the path to the file you want to include.
                       begin from the file you are in.

steps:
1. update app.js
...
app.set('view engine', 'ejs'); // TE set
...

2. create templates:
// 404.ejs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%= docTitle %></title>
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
            <h2>404 page not found</h2>
        </div>
    </main>
</body>

</html>


// shop.ejs
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
    </main>
</body>

</html>


// add-product.ejs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%= docTitle %></title>
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


***NEXT***Partials EJS
Partials - something like opposite to the handlebars and pug layouts.
When you have some partials(blocks) of code, that you can share with templates,
instead of one main layout.

steps:
1.create 'includes' folder in views
2.create ejs files for shared parts of code in that folder:
head.ejs, end.ejs, navigation.ejs

// head.ejs
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%= docTitle %></title>
    <link rel="stylesheet" href="/css/main.css">

// navigation.ejs
<body>
    <header class="main-header">
        <nav class="main-header__nav">
            <ul class="main-header__item-list">
                <li class="main-header__item">
                    <a href="/" class="<%= docTitle === 'Shop' ? 'active' : '' %>">Shop</a>
                </li>
                <li class="main-header__item">
                    <a href="/admin/add-product" class="<%= docTitle === 'Add Product' ? 'active' : '' %>">Add Product</a>
                </li>
            </ul>
        </nav>
    </header>
    
    <main>
    
// end.ejs
    </main>
</body>

</html>

3. refactor 404.ejs, shop.ejs and add-product.ejs with partials
// 404.ejs
<%- include('includes/head.ejs') %>
</head>

<%- include('includes/navigation.ejs') %>
        <div class="list-header">
            <h1>Something went wrong</h1>
            <h2>404 page not found</h2>
        </div>
<%- include('includes/end.ejs') %>

// shop.ejs
<%- include('includes/head.ejs') %>
    <link rel="stylesheet" href="/css/product.css">
</head>

<%- include('includes/navigation.ejs') %>
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
<%- include('includes/end.ejs') %>

// add-product.ejs
<%- include('includes/head.ejs') %>
    <link rel="stylesheet" href="/css/forms.css">
    <link rel="stylesheet" href="/css/product.css">   
</head>

<%- include('includes/navigation.ejs') %>
        <form class="product-form" action="/admin/add-product" method="POST">
            <div class="form-control">
                <label for="title">Title</label>
                <input id="title" type="text" name="title">
            </div>
            <button class="btn" type="submit">Add Product</button>
        </form>
<%- include('includes/end.ejs') %>

*/