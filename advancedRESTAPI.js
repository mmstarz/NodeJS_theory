/*
Advanced REST API topics (RESTful API)
Complete project, Authentication...

agenda:
1. planning REST API
2. CRUD operations & endpoints ([C]reate [R]ead [U]pdate [D]elete)
3. Validation
4. Image upload
5. Authentacation

characteristics:
[Render templates setup]        ===>    [REST API setup]
Node + express app setup        ===>    No changes
Routing / Endpoints             ===>    No real changes, more http methods(verbs)
Handling Requests & Responses   ===>    Parse + Send JSON data, no Views
Request Validation              ===>    No changes
Database communication          ===>    No changes
Files, uploads, downloads       ===>    No changes on server-side, only on client-side
Sessions & Cookies              ===>    No Sessions & Cookies Usage
Authentication                  ===>    Different Authentication Approach

Auhtentication in REST API
[Storage]   <--------       [Client(React App)] -------------
          (store token)         |       |                   |
                                |       | receive token     | Stored token is send to
                                |       |                   | authorize subsequent
                send Auth data  |       |                   | request
                                |       |                   |
    Restful API stateless   [Server(Node.js)] <--------------

What is Token in REST API Authorization:
[JSON DATA] + [signature] => [JSON Web Token(JWT)]

signature - generated on the server.
With a special private key, which is only stored on the server.
Signature can be verified by server(via secret key)
to use JSON WEB TOKEN:
https://jwt.io/ - official website
step1
> npm install -- save jsonwebtoken

step2
import it to your controller
const jwt = require('jsonwebtoken');

step3
add to the action
// should not store password in token bcs it will return to the frontend
// .sign() takes 3 raguments
// first - data object {...}. can pass anything you want, except password.
// second - privat key
// third - object with token params. e.g.{ expiresIn: "1h" } expires in 1 hour
const token = jwt.sign(
    {
        userId: loadedUser._id.toString(),
        email: loadedUser.email
    },
    "someSuperLongSecretString",
    { expiresIn: "1h" }
);

!important - great way to send stored token in a request is, to add it to the header.
e.g.
/app-08/src/pages/Feed/Feed.js at loadPosts = direction => {...} :
fetch("http://localhost:8080/feed/posts?page=" + page, {
    headers: {
        Authorization: 'Bearer ' + this.state.token
    }
})
'Bearer ' - is a just a convention to identify the type of token you have.
Bearer - authentication token type, commonly used for JWT.

!important get token from incoming request
create /app-07/middleware/is-auth.js :
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // get data from the 'Authorization' header 
    // split token from that data and store it in a variable
    const token = req.get('Authorization').split(' ')[1];
}

features:
!important - put and patch requests also have a req.body

REST API
step0
open app-08
// install all dependencies
> npm install
analyze /app-08/ application to find endpoints
app.js - ('URL') missing
/pages/Feed/feed.js - ('URL') missing
/pages/Feed/SinglePost/SinglePost.js - ('URL') missing
> npm start

step1
add new terminal in VScode
go to /d/vadim/visual studio/prjcts/nodejs-zero-advanced/app-07
// start nodejs REST API Server
> npm start

2 servers use:
REST API
app-07 - Backend Node.js server
app-08 - Frontend React server

steps backend:
> npm install --save express-validator
> npm install --save mongoose
> npm install --save multer
> npm install --save bcryptjs
> npm install -- save jsonwebtoken
create /app-07/models/post.js
create /app-07/models/user.js
update /app-07/app.js
update /app-07/routes/feed.js
create /app-07/routes/auth.js
update /app-07/controllers/feed.js
create /app-07/controllers/auth.js
create /app-07/middleware/is-auth.js

steps frontend:
update /app-08/src/pages/Feed/Feed.js
    loadPosts = direction => {...}
    finishEditHandler = postData => {...}
    deletePostHandler = postId => {...}
    render({ return( ... <Post /> )})
update /app-08/src/pages/Feed/SinglePost/SinglePost.js
    componentDidMount() {...}
update /app-08/App.js
    state = {...}
    signupHandler = (event, authData) => {...}
    loginHandler = (event, authData) => {...}
update /app-08/src/pages/Auth/Signup.js
    state = {...}
update /app-08/src/pages/Auth/Login.js
    state = {...}

logs backend:
create /app-07/models/post.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);

create /app-07/models/user.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    equired: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'I am new!'
  },
  posts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
  }]
});

module.exports = mongoose.model("User", userSchema);

update /app-07/app.js
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer"); // import multer

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();
// mongoDB entrie point:
// 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/messages?retryWrites=true'
const MONGODB_URI =
  "mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/messages?retryWrites=true";

// init filestorage configuration
// .diskStorage() multer method that takes 2 params destination & filename
// new Date().toISOString() - is used  here for unique name definition
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueKey = new Date().toISOString().split(".");
    // new Date().toISOString().replace(/:/g, '-')
    // cb(null, uniqueKey + '-' + file.originalname);
    cb(null, `${uniqueKey[1]}_${file.originalname}`);
  }
});

// init filefilter config
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

// register multer middleware
// .single() multer method if we expect one file. it takes input field name as argument.
// .array() for array of files
// multer({dest: 'images'}) - sets destination folder for file upload
// multer({ storage: fileStorage }) - storage configuration
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// images files handling
app.use("/images", express.static(path.join(__dirname, "images")));

// CORS error handling
app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', 'codepen.io'); // for certain domain
  // res.setHeader('Access-Control-Allow-Origin', 'name1, name2,...'); // for special domains
  res.setHeader("Access-Control-Allow-Origin", "*"); // for any client access
  // also need to setup list of methods to allow access
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  // setup header to access
  // res.setHeader('Access-Control-Allow-Headers', '*'); // for any headers
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // allow preflight
  // if (req.method === 'OPTIONS') {
  //   res.sendStatus(200);
  // } else {
  //   next();
  // }
  next();
});
// Routes init
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data
  });
});

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));


update /app-07/routes/feed.js
const express = require("express");
const { body } = require("express-validator/check");
const feedController = require("../controllers/feed");
const isAuth = require('../middleware/is-auth');
const router = express.Router();

// GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);
// POST /feed/post
router.post(
  "/post",
  isAuth,
  [
    body("title")
      .trim()
      .isLength({
        min: 5
      }),
    body("content")
      .trim()
      .isLength({
        min: 5
      })
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title")
      .trim()
      .isLength({
        min: 5
      }),
    body("content")
      .trim()
      .isLength({
        min: 5
      })
  ],
  feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router;

create /app-07/routes/auth.js
const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();

const authController = require("../controllers/auth.js");
const User = require("../models/user");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDocument => {
          if (userDocument) {
            return Promise.reject("Email already exist");
          }
        });
      })
      .normalizeEmail(),
    body("name")
      .trim()
      .not()
      .isEmpty(),
    body("password")
      .trim()
      .isLength({ min: 4 })
  ],
  authController.signup
);

router.post('/login', authController.login)

module.exports = router;

update /app-07/controllers/feed.js
const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const User = require("../models/user");

const ITEMS_PER_PAGE = 2;

// get /feed/posts action
exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1; // get page from url query
  let totalItems;
  Post.find()
    .countDocuments()
    .then(countNumber => {
      totalItems = countNumber;
      return Post.find()
        .skip((currentPage - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(posts => {
      res.status(200).json({
        message: "DB fetched successfully",
        posts: posts,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
// get /feed/post/:postId action
exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "Post fetched successfully",
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// put /feed/post/:postId action
exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Entered data incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image; // retrieved from the frontEnd
  // if new file found
  if (req.file) {
    const filePath = req.file.path.replace(/\\/g, "/"); // get image file path
    imageUrl = filePath;
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }

      if (post.imageUrl !== imageUrl) {
        deleteImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: "Post updated successfully",
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// http method + path
exports.createPost = (req, res, next) => {
  const image = req.file; // fetch uploaded file object config
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Entered data incorrect.");
    error.statusCode = 422;
    throw error;
  }

  // console.log(image);
  if (!image) {
    // if no file was uploaded edge case
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }

  // important if you are on Windows replace system path defaluts to POSIX
  // for correct file path save&display
  const imageUrl = image.path.replace(/\\/g, "/"); // get image file path

  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId
  });
  post
    .save()
    .then(result => {
      // console.log(result);
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      // 201 - success resource created
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: {
          _id: creator._id,
          name: creator.name
        }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }

      // check logged user
      deleteImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      // https://docs.mongodb.com/manual/reference/operator/update/pull/
      return User.findOneAndUpdate({
        _id: req.userId,
        $pull: { posts: postId }
      });
    })    
    .then(result => {
      res.status(200).json({
        message: "Post deleted successfully!"
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// helper function for deleting old image
const deleteImage = filepath => {
  filepath = path.join(__dirname, "..", filepath);
  fs.unlink(filepath, err => {
    console.log(err);
  });
};

create /app-07/controllers/auth.js
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

// PUT /auth/signup
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword
      });
      return user.save();
    })
    .then(result => {
      res
        .status(201)
        .json({ message: "New User was created", userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// POST /auth/login action
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error("This email was not found");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(result => {
      if (!result) {
        // if result is false
        const error = new Error("Please enter a valid password");
        error.statusCode = 401;
        throw error;
      }
      // should not store password in token bcs it will return to the frontend
      // .sign() takes 3 raguments
      // first - data object {...}. can pass anything you want, except password.
      // second - privat key
      // third - object with token params. e.g.{ expiresIn: "1h" } expires in 1 hour
      const token = jwt.sign(
        {
          userId: loadedUser._id.toString(),
          email: loadedUser.email
        },
        "someSuperLongSecretString",
        { expiresIn: "1h" }
      );
      res
        .status(200)
        .json({
          message: "Logged successfully",
          token: token,
          userId: loadedUser._id.toString()
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

create /app-07/middleware/is-auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {  
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  // get data from the 'Authorization' header
  // split token from that data and store it in a variable
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    // .decode() method only decodes token
    // .verify() method decodes token and verify data
    // verify takes 2 arguments
    // fist - generated token
    // second - your private secret key that was used to generate token
    decodedToken = jwt.verify(token, "someSuperLongSecretString");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  // if token undefined
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  // if no auth error occur
  // store user information in a request
  req.userId = decodedToken.userId;
  next();
};


logs frontend:
update /app-08/src/pages/Feed/Feed.js
    // loadPosts = direction => {...}
    loadPosts = direction => {
        if (direction) {
        this.setState({ postsLoading: true, posts: [] });
        }
        let page = this.state.postPage;
        if (direction === "next") {
        page++;
        this.setState({ postPage: page });
        }
        if (direction === "previous") {
        page--;
        this.setState({ postPage: page });
        }
        fetch("http://localhost:8080/feed/posts?page=" + page, {
        headers: {
            Authorization: "Bearer " + this.props.token
        }
        })
        .then(res => {
            if (res.status !== 200) {
            throw new Error("Failed to fetch posts.");
            }
            return res.json();
        })
        .then(resData => {
            this.setState({
            posts: resData.posts.map(post => {
                return {
                ...post,
                imagePath: post.imageUrl
                };
            }),
            totalPosts: resData.totalItems,
            postsLoading: false
            });
        })
        .catch(this.catchError);
    };

    // finishEditHandler = postData => {...}
    finishEditHandler = postData => {
        this.setState({
        editLoading: true
        });
        const formData = new FormData();
        formData.append("title", postData.title);
        formData.append("content", postData.content);
        formData.append("image", postData.image);
        // Set up data (with image!)
        let url = "http://localhost:8080/feed/post";
        let method = "POST";
        if (this.state.editPost) {
        url = "http://localhost:8080/feed/post/" + this.state.editPost._id;
        method = "PUT";
        }

        // const config = {
        //   headers: {
        //       'Content-Type': 'multipart/form-data'
        //   }
        // };

        fetch(url, {
        method: method,
        // headers: {
        //   "Content-Type": "application/json"
        // },
        body: formData,
        headers: {
            Authorization: "Bearer " + this.props.token
        }
        // body: JSON.stringify({
        //   title: postData.title,
        //   content: postData.content,
        //   image: postData.image
        // })
        })
        .then(res => {
            console.log(res); // browser console output
            if (res.status !== 200 && res.status !== 201) {
            throw new Error("Creating or editing a post failed!");
            }
            return res.json();
        })
        .then(resData => {
            console.log(resData); // browser console output
            const post = {
            _id: resData.post._id,
            title: resData.post.title,
            content: resData.post.content,
            creator: resData.post.creator,
            createdAt: resData.post.createdAt
            };
            this.setState(prevState => {
            let updatedPosts = [...prevState.posts];
            if (prevState.editPost) {
                const postIndex = prevState.posts.findIndex(
                p => p._id === prevState.editPost._id
                );
                updatedPosts[postIndex] = post;
            } else if (prevState.posts.length < 2) {
                updatedPosts = prevState.posts.concat(post);
            }
            return {
                posts: updatedPosts,
                isEditing: false,
                editPost: null,
                editLoading: false
            };
            });
        })
        .catch(err => {
            console.log(err);
            this.setState({
            isEditing: false,
            editPost: null,
            editLoading: false,
            error: err
            });
        });
    };

    // deletePostHandler = postId => {...}
    deletePostHandler = postId => {
        this.setState({ postsLoading: true });
        fetch("http://localhost:8080/feed/post/" + postId, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + this.props.token
        }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
            throw new Error("Deleting a post failed!");
            }
            return res.json();
        })
        .then(resData => {
            console.log(resData);
            this.setState(prevState => {
            const updatedPosts = prevState.posts.filter(p => p._id !== postId);
            return { posts: updatedPosts, postsLoading: false };
            });
        })
        .catch(err => {
            console.log(err);
            this.setState({ postsLoading: false });
        });
    };

    // render({ return( ... <Post /> )})
    render() {
        return (
        <Fragment>
            <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
            <FeedEdit
            editing={this.state.isEditing}
            selectedPost={this.state.editPost}
            loading={this.state.editLoading}
            onCancelEdit={this.cancelEditHandler}
            onFinishEdit={this.finishEditHandler}
            />
            <section className="feed__status">
            <form onSubmit={this.statusUpdateHandler}>
                <Input
                type="text"
                placeholder="Your status"
                control="input"
                onChange={this.statusInputChangeHandler}
                value={this.state.status}
                />
                <Button mode="flat" type="submit">
                Update
                </Button>
            </form>
            </section>
            <section className="feed__control">
            <Button mode="raised" design="accent" onClick={this.newPostHandler}>
                New Post
            </Button>
            </section>
            <section className="feed">
            {this.state.postsLoading && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Loader />
                </div>
            )}
            {this.state.posts.length <= 0 && !this.state.postsLoading ? (
                <p style={{ textAlign: "center" }}>No posts found.</p>
            ) : null}
            {!this.state.postsLoading && (
                <Paginator
                onPrevious={this.loadPosts.bind(this, "previous")}
                onNext={this.loadPosts.bind(this, "next")}
                lastPage={Math.ceil(this.state.totalPosts / 2)}
                currentPage={this.state.postPage}
                >
                {this.state.posts.map(post => (
                    <Post
                    key={post._id}
                    id={post._id}
                    author={post.creator.name}
                    date={new Date(post.createdAt).toLocaleDateString("en-GB")}
                    title={post.title}
                    image={post.imageUrl}
                    content={post.content}
                    onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                    onDelete={this.deletePostHandler.bind(this, post._id)}
                    />
                ))}
                </Paginator>
            )}
            </section>
        </Fragment>
        );
    }

update /app-08/src/pages/Feed/SinglePost/SinglePost.js
    // componentDidMount() {...}
    componentDidMount() {
        const postId = this.props.match.params.postId;
        fetch('http://localhost:8080/feed/post/' + postId, {
        headers: {
            Authorization: "Bearer " + this.props.token
        }
        })
        .then(res => {
            if (res.status !== 200) {
            throw new Error('Failed to fetch status');
            }
            return res.json();
        })
        .then(resData => {
            this.setState({
            title: resData.post.title,
            author: resData.post.creator.name,
            date: new Date(resData.post.createdAt).toLocaleDateString('en-GB'),
            content: resData.post.content,
            image: 'http://localhost:8080/' + resData.post.imageUrl
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

update /app-08/App.js
    // state = {...}
    state = {
        showBackdrop: false,
        showMobileNav: false,
        isAuth: false,
        token: null,
        userId: null,
        authLoading: false,
        error: null
    };

    // signupHandler = (event, authData) => {...}
    signupHandler = (event, authData) => {
        event.preventDefault();
        this.setState({ authLoading: true });
        fetch('http://localhost:8080/auth/signup', {
        method: 'PUT',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            email: authData.signupForm.email.value,
            password: authData.signupForm.password.value,
            name: authData.signupForm.name.value
        })
        })
        .then(res => {
            if (res.status === 422) {
            throw new Error(
                "Validation failed. Make sure the email address isn't used yet!"
            );
            }
            if (res.status !== 200 && res.status !== 201) {
            console.log('Error!');
            throw new Error('Creating a user failed!');
            }
            return res.json();
        })
        .then(resData => {
            console.log(resData);
            this.setState({ isAuth: false, authLoading: false });
            this.props.history.replace('/');
        })
        .catch(err => {
            console.log(err);
            this.setState({
            isAuth: false,
            authLoading: false,
            error: err
            });
        });
    };

    // loginHandler = (event, authData) => {...}
    loginHandler = (event, authData) => {
        event.preventDefault();
        this.setState({ authLoading: true });
        fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: authData.email,
            password: authData.password
        })
        })
        .then(res => {
            if (res.status === 422) {
            throw new Error('Validation failed.');
            }
            if (res.status !== 200 && res.status !== 201) {
            console.log('Error!');
            throw new Error('Could not authenticate you!');
            }
            return res.json();
        })
        .then(resData => {
            console.log(resData);
            this.setState({
            isAuth: true,
            token: resData.token,
            authLoading: false,
            userId: resData.userId
            });
            localStorage.setItem('token', resData.token);
            localStorage.setItem('userId', resData.userId);
            const remainingMilliseconds = 60 * 60 * 1000;
            const expiryDate = new Date(
            new Date().getTime() + remainingMilliseconds
            );
            localStorage.setItem('expiryDate', expiryDate.toISOString());
            this.setAutoLogout(remainingMilliseconds);
        })
        .catch(err => {
            console.log(err);
            this.setState({
            isAuth: false,
            authLoading: false,
            error: err
            });
        });
    };

update /app-08/src/pages/Auth/Signup.js
    // state = {...}
    state = {
        signupForm: {
        email: {
            value: '',
            valid: false,
            touched: false,
            validators: [required, email]
        },
        password: {
            value: '',
            valid: false,
            touched: false,
            validators: [required, length({ min: 4 })]
        },
        name: {
            value: '',
            valid: false,
            touched: false,
            validators: [required]
        },
        formIsValid: false
        }
    };

update /app-08/src/pages/Auth/Login.js
    // state = {...}
    state = {
        loginForm: {
        email: {
            value: '',
            valid: false,
            touched: false,
            validators: [required, email]
        },
        password: {
            value: '',
            valid: false,
            touched: false,
            validators: [required, length({ min: 4 })]
        },
        formIsValid: false
        }
    };

Errors:
Request URL: http://localhost:8080/feed/posts?page=1
Request Method: GET
Status Code: 500 Internal Server Error
message: "jwt malformed"

solution:
fetch("http://localhost:8080/feed/posts?page=" + page, {
    headers: {
        Authorization: "Bearer " + this.props.token
    }
})

summary:
From 'classic' to REST API:
Most of the server-side code doesn't change only request + response data affected.
More http methods are available.
Rest API server doesn't care about the client.
Requests are handled in isolation => no sessions.

Authentication:
Due to no sessions being used, authentication works differently.
Each request need to be adble send some data,
that proves that the request is authenticated.
JSON Web Tokens('JWT') are common way of storing authentication information
on the client and procing authentication status.
JWTs are signed by the server and can only be validated by the server. 

!logs missing.

*/