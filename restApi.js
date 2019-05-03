/*
REST APi
Decoupling Frontend and Backend

agenda:
1.What are REST APi?
2.Why use/build Rest APi?
3.Core REST Concepts & Principles
4.Build FIRST REST APi

characteristics:
Not every Frontend (UI) requires HTML pages!
examples:
Mobile Apps (Twitter...)
Single Page Web Apps
Service APIs (Google maps...)

Different kind of response is needed
REST([Re]presentational [S]tate [T]ransfer)
Transfers Data instead of User Interfaces
What's the difference? Only the response(and the request data) changes.
Not the general server-side logic.

REST APi Big Picture
                            [CLIENT]
    [ Mobile App ]      [    SPA    ]       [  Any App  ]
        |   |               |   |               |   |       Only DATA exchange,
        |   |               |   |               |   |       not the UI.
    [       App Backend API         ]       [Service API]
                            [SERVER]

Data Formats:
!JSON - [J]ava[S]cript [O]bject [N]otation

    [HTML]              [Plain text]            [XML]                    [JSON]

<p>Node.js</p>           Node.js                 <name>Node.js</name>    {"name": "Node.js"}

Data + Structure         Data                    Data                     Data

Contains UI              No UI Assumptions       No UI Assumptions        No UI Assumptions

Unnecessarily            Unnecessarily           Machine-readable         Machine-readable
difficult to parse if    difficult to parse, no  but relatively           and concise; Can
you just need the        clear data structure    verbose; XML-parser      easily be 
data                                             needed.                  converted
                                                                          to JavaScript.

Routing:
C    ====> [Http Verb + path]      S (server-side logic,
L    ====> [POST /post]            E  Database, Access
I    ====> [GET /posts]            R  etc.)
E    ====> [GET /posts/:postid]    V
N    ====> [API Endpoints]         E
T    ====>                         R

Http Methods(Http Verbs):
GET, POST, PUT, PATCH, DELETE, OPTIONS - used to build APi

GET                 POST                    PUT
get Resource        post Resource to the    put Resource onto the server
from the Server     Server(create or        (create or overwrite a Resource)
                    append Resource)

PATCH               DELETE                  OPTIONS
update parts of an  delete a Resource       determine weather followed up
existing Resource   on the Server           Request is allowed
on the Server                               (sent automatically)

REST Core Principles:
1.Uniform Interface
Clearly define API Endpoints, which clearly define request + response data structure.
2.Stateless Interactions
Server and Client don`t store any connection history. Every request is handled
separately.
3.Cachable
Servers may set caching headers, to allow the client to cache responses.
4.Client-Server separation
Server and client are separated, client is not concerned with persistent data storage.
5.Layered system
Server may forward requests to other APIs.
6.Code on Demand
Executable code may be transferred from server to client.

features:
REST API is all about data.
We'll use JSON format for this and .json() method provided by express in responses.
like this:
res.json() instead of res.render()

For testing this go to https://www.getpostman.com/
register, download and install "postman".
then send a POST request with JSON body via posman to URL http://localhost:8080/feed/post

Another way go to https://codepen.io/ , register and create new pen
no CSS, only html and JS like this:
https://codepen.io/mmstar/pen/aXZJaB
and we get an Error: 
Access to fetch at 'http://localhost:8080/feed/posts' from origin 'https://s.codepen.io'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on
the requested resource. If an opaque response serves your needs, set the request's mode
to 'no-cors' to fetch the resource with CORS disabled.

CORS:
Cross-Origin Resource Sharing (CORS)
[    Client    ]                    [    Server    ]
//loclahost:3000    <==(true)==>    //localhost:3000

[    Client    ]                    [    Server    ]
//loclahost:3000    <==(false)==>    //localhost:4000

Cross-Origin Read Blocking (CORB)
To hadle with cors error you need to set up headers at your server,
for every outgoing request.
To do this a new middleware need to be setup at app.js:
// CORS error handling
app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', 'codepen.io'); // for certain domain
    // res.setHeader('Access-Control-Allow-Origin', 'name1, name2,...'); // for special domains
    res.setHeader('Access-Control-Allow-Origin', '*'); // for any client access
    // also need to setup list of methods to allow access
    res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DELETE');
    // setup header to access
    // res.setHeader('Access-Control-Allow-Headers', '*'); // for any headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

!important while sending a post request via codepen.io we need to set
body and header of the request
postBtn.addEventListener('click', () => {
  fetch('http://localhost:8080/feed/post', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Codepen post',
      content: 'Post made via Codepen'
    }),
    headers: {
      'Content-Type': 'Application/json'
    }
  })
  .then(res => {
    return res.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => console.log(err))
})

summary:
REST APIs are all about data, no UI logic is exchanged.
REST APIs are normal Node servers which expose different endpoints (Http method + path)
for clients to send requests to
JSON is a common data fromat that is used both for requests and responses
REST APIs are decoupled from the clients that use them.

Attach data in JSON format and let the other end know by setting "Content-Type" header.
CORS errors occur when using an API that doesn't set CORS headers.

steps:
create new /app-07/app.js
go to that folder
> npm install --save express
> npm install --save-dev nodemon
> npm install --save body-parser
> npm init
update package.json
create /routes/feed.js
create /controllers/feed.js
update app.js

logs:
app.js
const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
// CORS error handling
app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', 'codepen.io'); // for certain domain
    // res.setHeader('Access-Control-Allow-Origin', 'name1, name2,...'); // for special domains
    res.setHeader('Access-Control-Allow-Origin', '*'); // for any client access
    // also need to setup list of methods to allow access
    res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DELETE');
    // setup header to access
    // res.setHeader('Access-Control-Allow-Headers', '*'); // for any headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})
// /feed
app.use('/feed', feedRoutes);

app.listen(8080);

/routes/feed.js
const express = require('express');
const feedController = require('../controllers/feed');

const router = express.Router();
// GET /feed/posts
router.get('/posts', feedController.getPosts);
// POST /feed/post
router.post('/post', feedController.postPost);

module.exports = router;

/controllers/feed.js
exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            title: "First Post",
            content: "This is the first post"
        }]
    })
}

// http method + path
exports.postPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    // create a post in db
    // 201 - success resource created
    res.status(201).json({
        message: "Post created successfully!",
        post: {
            id: new Date().toISOString().split('.')[1],
            title: title,
            content: content
        }
    })
}

https://codepen.io/mmstar/pen/aXZJaB
html
<button id="get">Get posts</button>
<button id="post">Create post</button>

js
const getBtn = document.getElementById('get');
const postBtn = document.getElementById('post');

getBtn.addEventListener('click', () => {
  fetch('http://localhost:8080/feed/posts')
  .then(res => {
    return res.json()
  })
  .then(dataObject => {
    console.log(dataObject);
  })
  .catch(err => console.log(err));
});

postBtn.addEventListener('click', () => {
  fetch('http://localhost:8080/feed/post', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Codepen post',
      content: 'Post made via Codepen'
    }),
    headers: {
      'Content-Type': 'Application/json'
    }
  })
  .then(res => {
    return res.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => console.log(err))
})

*/