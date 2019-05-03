/* Storing data in Database(DB)

***Agenda***
1. Kind of Databases.(SQL and NoSQL)
2. Scaling DB. (Vertical vs Horizontal scaling)
3. Using SQL DB in Node.js
4. Using NoSQL DB in Node.Js

goal of DB: store data and make it easy accessible.
DB has quicker access than with a file for one piece of information.
SQL DB example : MySQL
NoSQL DB example : MongoDB

***SQL vs NoSQL***
SQL representation: Tables with Fields.
Fill in data for this fields, are called - records(simply rows).
SQL allow you to relate different tables example:
[User]
[[id]   [email]         [name]]
[[1]    [max@gm.com]    [max]]
[[2]    [ray@gm.com]    [ray]]
[[3]    [jey@gm.com]    [jey]]
                                                    [Order]
                                                    [[id]   [user_id]   [product_id]]
                                                    [[1]        [2]         [1]     ]
                                                    [[2]        [1]         [1]     ]
                                                    [[3]        [2]         [2]     ]
[Product]
[[id]   [title]     [price]     [description]]
[[1]    [fr book]   [10.99]     [awesom book]]
[[2]    [dn book]   [12.99]     [awesom book]]
[[3]    [gb book]   [14.99]     [awesom book]]

Core SQL DB Characteristics:
1.Stong data schema.(All data in a Table has to fit!) [id] [email] [name]
2.Data relations.(Tables are connected) [one-to-one], [one-to-many], [many-to-many]
3.SQL queries(commands we use to interact with Database).
4.Horizontal scaling is very is difficult / impossible. Vertical scaling is possible.
5.Limitations for lots of (thousands) read & write queries per second.
SELECT * FROM users WHERE age > 28
             
SELECT, FROM, WHERE - these are the queries(special keywords/syntax)
*, users, age, 28 - parameters/Data


Core NoSQL DB Characteristics:
1.NoSQL DB have a name.
2.And tables/collections([users], [products], [orders]).
3.Collections store documents({...}, {...}, {...})
4.NoSQL don't have strict schema.
5.No Data relations. Instead of that it duplicates data.
6.Both Horizontal and Vertical scaling is possible.
7.Great perfomance for mass read & write requests.

disadvantage:
1. Means if one collection have changes, you need to update all duplicated collectons.

advntage: 
1. In result you need to read only one collection to have all needed data.
   (as they all are up to date)
2. Very fast compare to SQL. Makes it more efficient.

NoSQL structure example:
[Database] -        [                 Shop                   ]
                        |                |                |
[collections] -     [users]         [products]        [orders]
                        |                |                |
                    {name:max}       {title: fr}       {id: 1}
[documents] -   {name:ray, age: 28}  {title: dn}       {id: 2}
                    {name:jey}       {title: gb}       {id: 3}

NoSQL duplicating data example:
[orders]
[{ id: 'first' , user: {id: 2, email: 'tay@g.com' }, product: {id: 2, price: 8.99} }]
[{ id: 'fifth' , user: {id: 1, email: 'max@g.com' }, product: {id: 1, price: 9.99} }]
[{ id: 'third' , user: {id: 3, email: 'jey@g.com' }, product: {id: 3, price: 7.99} }]

[users]                                             [products]
[{ id: 1, name: 'max', email: 'max@g.com' }]        [{ id: 1, title: fr, price: 9.99 }]
[{ id: 2, name: 'ray', email: 'ray@g.com' }]        [{ id: 2, title: dn, price: 8.99 }]
[{ id: 3, name: 'jey', email: 'jey@g.com' }]        [{ id: 3, title: gb, price: 7.99 }]


***Scaling DB. (Vertical vs Horizontal scaling)***
Horizontal vs Vertical scaling examples:

Horizontal - add more servers to merge data into one database.
Can always buy new servers or Data Cloud and connect them to our DB.
Split all the data across all these servers.
Need process that runs queries among all of them and merge them all together intelligently.

Vertical - means that we make our existing server stronger.
Adding more cpu or memory.
But you are limited to the single machine power.

                [Horizontal]                    [ Vertical ]
                                                        [ ]
                [] + [] + []                    [] ->   [ ]
                                                        [ ]

use SQL for not of often changes part of data(e.g. Users)
use NoSQL for a lot updates parts of data (e.g. Orders, Cart, Products)

preparations:
1. For SQL database we'll use MySQL(from MySQL.com)
2. MySQL.com -> Downloads -> MySQL Community Edition
3. need MySQL Community Server and MySQL Workbench
(on windows you can download combined installer by choose:
MySQL on Windows (Installer & Tools). on Linux you need to install every separately)
4. can choose MySQL installer for Windows and download it.
5. Run MySQL installer for Windows and install custom
    5.1 MySQL Community Server
    5.2 MySQL Workbench
    5.3 Execute
    5.4 MySQL installer 
        5.4.1 Group replication: Standalone MySQL Server/ Classic MySQL replication
        5.4.2 Type and Networking (default)
        5.4.3 Authentication Method : use Legacy Authentication Method
        5.4.4 Accounts and Roles: enter root password/repeat password (mmstar)
        5.4.5 Windows Service: "Configure MySQL server as Windows Service" (uncheck)
        5.4.6 Apply configuration: execute.
6. Product configuration: next
7. Installation Complete: Start MySQL Wokrbench after Setup (check)


In MySQL workbench:
1.choose/set up new SQL connection:
    1.0 connection name: mySQLserver
    1.1 Connection Method: TCP/IP
    1.2 hostname: localhost
    1.3 port: 3306
    1.4 username: root

2. select mySQLserver(open sql editor)
    2.1 right click below 'Schemas' -> Create Schema
    2.2 name: node-complete
    2.3 charset/collation: default
    2.4 'apply'(bottom right).
    2.5 Apply SQL script to Database: no changes for now just 'apply'(bottom right).
    2.6 'finish'(bottom right)

***NEXT*** Connecting APP to the SQL Database
to operate with SQL database first of all need to install another package:
> npm install --save mysql2

!!!important 
.promise() - is a basic JS object wich allows to work with ASYNC code.
promise can chain with .then() or .catch() instead of using callbacks.

.then(() => {...})
.then(result => { console.log(result[0], result[1]); })
result is an array with nested arrays.
result[0] - holds the data readed from the table.
result[1] - is a meta data.

.catch(() => {...}) - has anonymous function to execute in case of an error.
.cath(err => { console.log(err); }) - e.g. Database connection fails.

steps:
1. create new table named 'products' in 'node-complete' schema, at MySQL workbench.
2. add new fileds to that 'products' table:
    2.1 id          INT              [PK] [NN] [UQ] [UN] [AI]
    2.2 title       VARCHAR(255)     [NN]
    2.3 price       DOUBLE           [NN]
    2.4 desription  TEXT             [NN]
    2.5 imageUrl    VARCHAR(255)     [NN]

    where:
    PK - primary key;
    NN - not null;
    UQ - unique index;
    B -  binary column;
    UN - unsigned data type(no negative values);
    ZF - zero field
    AI - auto increment(add 1 when recieve new element)
    G  - general column

    INT - holds only integers
    VARCHAR(255) - holds only 255 long stings everything more will be cut off
    DOUBLE - holds a large number with a floating decimal point
    TEXT - holds long texts
3.'apply'(bottom right)
4. create /utils/database.js
5. update /models/product.js
6. update /routes.shop.js
7. update /controllers/shop.js
8. update /controllers/admin.js

// create /utils/database.js
const mysql = require('mysql2'); // import sql library

// create a connection pool
const pool = mysql.createPool({
    host: 'localhost', // hostname
    user: 'root', // user
    database: 'node-complete', // schema name(database)
    password: 'mmstar' // root password
});

// export pool promise chain for mysql connections
// .promise() - is a basic JS object wich allows to work with ASYNC code
module.exports = pool.promise();

// update /models/product.js
const db = require('../utils/database'); // import sql database pool configuration file

const Cart = require('./cart'); // import Cart class

// Product class initialization
module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    // refactored from using a file to use db MySQL
    // returns a promise
    save() { // return promise
        // fields name must match the name of the fields in the DB
        // ? are used for a secure injection
        // array elements order should match the fields order at the beginning        
        return db.execute(
            'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
            [this.title, this.price, this.imageUrl, this.description]
        ); 
    }

    // delete product by id
    static deleteById(id) {
        
    }

    // fetch(отримувати) products (e.g. traverse)
    // static allows to call method on the class itself
    // refactored from using a file to use db MySQL
    // returns a promise
    static fetchAll() {
        // return entire promise from db connections pool
        return db.execute('SELECT * FROM products');
    }

    // refactored from using a file to use db MySQL
    // returns a promise
    static findById(id) { // fetch single product
        return db.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
    }
}

// update /routes/shop.js
...
// '/products/id' => GET reference to the controller
router.get('/products/:productId', shopController.getSingleProduct);
...

// update /controllers/shop.js
...
// get Products and render Products page
exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([sqlTableRows, metaData]) => {
            // ES2015 destructuring feature instead of result[0] and result[1]
            res.render('shop/product-list', {
                prods: sqlTableRows,
                docTitle: 'Products',
                path: '/products'
            });
        })
        .catch(err => console.log(err));
}

// get ProductId and render details page
exports.getSingleProduct = (req, res, next) => {
    // assign variable for a dynamic segment part of a request path
    const productId = req.params.productId;
    // call DS method for object find
    Product.findById(productId)
        .then(([sqlTableRow]) => { // return array with one element(key-values object)
            res.render('shop/product-details', {
                prod: sqlTableRow[0],
                docTitle: `${sqlTableRow[0].title} (details)`,
                path: `/products/:${productId}`
            });
        })
        .catch(err => console.log(err));
}

// get Products and render Shop page
exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([sqlTableRows, metaData]) => {
            // ES2015 destructuring feature instead of result[0] and result[1]
            res.render('shop/index', {
                prods: sqlTableRows,
                docTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => console.log(err));
}
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
    product.save()
        .then(() => { // only redirect once the insert completed
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        }); // save new object into DS    
}
...

*/