/*
async/await

agenda:
1.What is async/await?

characteristics:
Async/Await allows you to write async code in a synchronous way.

Asyncronous requests in a Synchronous way*
*Only by the way it looks, not the way it behaves.

features:
if you planning to use async/await in function first of all you need to put async
in front of it:
async (req, res, next) => {...}
then use await in fron of async operations inside async function
const totalItems = await Post().find().countDocuments();

what await do? 
it takes you code, creates .then() after it,
and stores result of that operation in a variable.

if you have few await lines one after another they will be chained
just like .then().then() promise blocks behind the scenes.

to handle errors with async/await should use try {...} catch (err) {...} like this:
// get /feed/posts action
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1; // get page from url query
  // let totalItems;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.status(200).json({
      message: "DB fetched successfully",
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

!important mongoose operations return promise-like object.
if we want to use a real promise in our await oparations
we should add .exec() to the end of operation like this:
const totalItems = await Post.find().countDocuments().exec(); //this is now a real promise
but we don't need it this project.

steps backend:
update /app-07/routes/auth.js
update /app-07/controllers/auth.js
update /app-07/controllers/feed.js

steps frontend:
update /app-08/src/pages/Feed/Feed.js
    componentDidMount() {...}
    statusUpdateHandler = event => {...}

logs backend:
// update /app-07/routes/auth.js
const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();

const authController = require("../controllers/auth.js");
const User = require("../models/user");
const isAuth = require("../middleware/is-auth");

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

router.post("/login", authController.login);

router.get("/status", isAuth, authController.status);

router.put("/status", isAuth, authController.updateStatus);

module.exports = router;

// update /app-07/controllers/auth.js
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

// PUT /auth/signup
exports.signup = async (req, res, next) => {
  try {
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

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword
    });
    const newUser = await user.save();
    res
      .status(201)
      .json({ message: "New User was created", userId: newUser._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// POST /auth/login action
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // let loadedUser;
  try {
    const currUser = await User.findOne({ email: email });
    if (!currUser) {
      const error = new Error("This email was not found");
      error.statusCode = 401;
      throw error;
    }
    const result = await bcrypt.compare(password, currUser.password);
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
        userId: currUser._id.toString(),
        email: currUser.email
      },
      "someSuperLongSecretString",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Logged successfully",
      token: token,
      userId: currUser._id.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.status = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      status: user.status
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const newStatus = req.body.newStatus;
  // console.log(newStatus)
  try {
    const user = await User.findById(req.userId);
    user.status = newStatus;
    const updatedUser = await user.save();
    // console.log(user.status);
    res.status(201).json({
      status: updatedUser.status
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


// update /app-07/controllers/feed.js
const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const User = require("../models/user");

const ITEMS_PER_PAGE = 2;

// get /feed/posts action
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1; // get page from url query
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.status(200).json({
      message: "DB fetched successfully",
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// get /feed/post/:postId action
exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Post fetched successfully",
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// put /feed/post/:postId action
exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  try {
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

    const post = await Post.findById(postId);

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

    const updatedPost = await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// http method + path
exports.createPost = async (req, res, next) => {
  const image = req.file; // fetch uploaded file object config
  const errors = validationResult(req);
  try {
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

    const newPost = await post.save();
    const user = await User.findById(req.userId);
    creator = user;
    user.posts.push(post);
    await user.save();

    // 201 - success resource created
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: {
        _id: creator._id,
        name: creator.name
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

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
    await Post.findOneAndDelete({ _id: postId });

    // https://docs.mongodb.com/manual/reference/operator/update/pull/
    await User.findOneAndUpdate({
      _id: req.userId,
      $pull: { posts: postId }
    });

    res.status(200).json({
      message: "Post deleted successfully!"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// helper function for deleting old image
const deleteImage = filepath => {
  filepath = path.join(__dirname, "..", filepath);
  fs.unlink(filepath, err => {
    console.log(err);
  });
};


logs frontend:
update /app-08/src/pages/Feed/Feed.js
    // componentDidMount() {...}
    componentDidMount() {
      fetch("http://localhost:8080/auth/status", {
        headers: {
          Authorization: 'Bearer ' + this.props.token
        }
      })
        .then(res => {
          if (res.status !== 200) {
            throw new Error("Failed to fetch user status.");
          }
          return res.json();
        })
        .then(resData => {
          this.setState({ status: resData.status });
        })
        .catch(this.catchError);

      this.loadPosts();
    }

    // statusUpdateHandler = event => {...}
    statusUpdateHandler = event => {
      event.preventDefault();
      const formData = new FormData();
      formData.append("newStatus", this.state.status);  
      // console.log(status);
      fetch("http://localhost:8080/auth/status", {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + this.props.token
        },
        body: formData
      })
        .then(res => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Can't update status!");
          }
          return res.json();
        })
        .then(resData => {
          console.log(resData);
          this.setState({
            status: resData.status
          })
        })
        .catch(this.catchError);
    };

*/