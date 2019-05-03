/*
Real-Time Web Services with WebSockets

agenda:
1.Why Realtime?
2.How to add Realtime Communication to a Node App?

characteristics:
          http            ====>          webSockets
        [client]  (established via http)  [client]

request   |  |  response                     | push Data

        [server]                          [server]

preparations:
There are a lot of websockets packages.
We'll use Socket.io
https://socket.io/
To use socket.io we'll have to install and add it to both: 
backend(Node Server) and frontend(React App).
bcs client - server will communicate through websockets channel.
> npm install --save socket.io
> npm install --save socket.io-client
// step1
go to /app-07
> npm install --save socket.io
// io.on() - establish connection function that will be executed for every new client
update /app-07/app.js
mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(result => {
    const server = app.listen(8080);
    const io = require('socket.io')(server);
    io.on('connection', socket => {
      console.log('Client connected')
    })
  })
  .catch(err => console.log(err));

step2
go to /app-08
> npm install --save socket.io-client
update /app-08/src/pages/Feed/Feed.js
import openSocket from 'socket.io-client';
...
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
    openSocket('http://localhost:8080');
}

step3
after both apps(Node and React) start and user login
webSockets connection established

features:
Socket.io use and setup webSockets protocol for you behind the scenes.
socket.io connection object has build-in methods such as:
.emit() - sends a message to all connected users
.broadcast() - sends a message to all users, except for the one who created send request.

// first argument is a name of the event(websocket channel)
// second - is a data you want to send
.emit('<event name>', { <send data> })

// at the React App we can now listen to that channel like this:
// at /app-08/src/pages/Feed/Feed.js
    componentDidMount() {
      fetch("http://localhost:8080/auth/status", {
      headers: {
          Authorization: "Bearer " + this.props.token
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
      const socket = openSocket("http://localhost:8080");
      socket.on('posts', data => {
        if(data.action === 'create') {
          this.addPost(data.post)
        } else if (data.action === 'update') {
          this.updatePost(data.post)
        } else if (data.action === 'delete') {  
          this.loadPosts();
        }
      })
    }

steps backend:
create /app-07/socket.js
update /app-07/app.js
update /app-07/controllers/feed.js

steps frontend:
update /app-08/src/pages/Feed/Feed.js
    componentDidMount() {...}
    addPost = post => {...}
    updatePost = post => {...}
    finishEditHandler = postData => {...}
    deletePostHandler = postId => {...}

logs backend:
// create /app-07/socket.js
let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer);
        return io;
    },
    getIO: () => {
        if(!io) {
            throw new Error('Socket.io not initialized!')
        }
        return io;
    }
}

// update /app-07/app.js
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
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    })
  })
  .catch(err => console.log(err));


// update /app-07/controllers/feed.js
const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");
const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");

const ITEMS_PER_PAGE = 2;

// get /feed/posts action
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1; // get page from url query
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
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

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId) {
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
    io.getIO().emit("posts", { action: "update", post: updatedPost });
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

    const post = new Post({
      title: title,
      imageUrl: imageUrl,
      content: content,
      creator: req.userId
    });

    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });
    // 201 - success resource created
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: {
        _id: user._id,
        name: user.name
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
    const user = await User.findById({ _id: req.userId})
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', {action: 'delete', post: postId})
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
//  update /app-08/src/pages/Feed/Feed.js
      componentDidMount() {...}
      addPost = post => {...}
      updatePost = post => {...}
      finishEditHandler = postData => {...}
      deletePostHandler = postId => {...}

import React, { Component, Fragment } from "react";
import openSocket from "socket.io-client";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";

import "./Feed.css";

// const axios = require('axios');

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    fetch("http://localhost:8080/auth/status", {
      headers: {
        Authorization: "Bearer " + this.props.token
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
    const socket = openSocket("http://localhost:8080");
    socket.on('posts', data => {
      if(data.action === 'create') {
        this.addPost(data.post)
      } else if (data.action === 'update') {
        this.updatePost(data.post)
      } else if (data.action === 'delete') {  
        this.loadPosts();
      }
    })
  }

  addPost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      };
    });
  };

  updatePost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
      if (updatedPostIndex > -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return {
        posts: updatedPosts
      };
    });
  }

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

  statusUpdateHandler = event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("newStatus", this.state.status);
    // console.log(status);
    fetch("http://localhost:8080/auth/status", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token
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
        });
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

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
          return {  
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

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

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
        this.loadPosts();
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

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
}

export default Feed;

*/