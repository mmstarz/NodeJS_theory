/*
GraphQL - REST on steroids

agenda:
1.What is GraphQL
2.GraphQL vs REST
3.How to use GraphQL

characreristics:
REST API
stateless, client-independent API for exchanging data
REST API limitations:
GET/post => fetch Post => {
                            id: '01',
                            title: 'post title',
                            content: '...'
                            creator: {...}
                          }
    What if we need only title and id?
    [solution1]                         [solution2]             [solution3]
Create a new REST API           Use Query Parameters (e.g.      Use GraphQL
Endpoint (e.g. GET/post-slim)   GET/post?data=slim)             
Problem: Lots and lots of       Problems: API becomes hard      Problems: none
endpoints & lots of updating    to understand

GraphQL
stateless, client-independent API for exchanging data with higher query flexibility
How GraphQL works:
|C|   ===>    [      ?     ]    |S|   |           |
|L|   ===>    [POST/graphql]    |E|   |server-side|
|I|   (Post request contains    |R|   |Logic,     |
|E|    Query Extenssion.        |V|   |Database,  |
|N|    To define the Data       |E|   |Access etc.|
|T|    that should be           |R|   |           |
       returned)

GraphQL Query (JSON object like structure):
    {                   | Operation types:
        query {         | query - for geting data.
            user {      | mutation - for editing deleteing inserting data.
                field1, | subscription - for real-time data subscriptions using webSockets.
                field2  | Endpoints(commands):
            }           | user - in this case.
        }               | Fields you wanna extract:
    }                   | field1, field2

GraphQL Operation types:
query => Retrieve Data('GET')
mutation => Manipulate Data ('POST', 'PUT', 'PATCH', 'DELETE')
subscription => setup real-time connection via webSockets

features:
official web page - https://graphql.org/
GrahpQL - Graph [Q]uery [L]anguage
It's normal Node(+Express) Server
ONE single endpoint (typically/graphql)
Uses POST bcs Request Body defines Data structure of retrieved Data
(like routes)
Server-Side Resolver analyses Request Body, Fetches and Prepares and Returns Data.
(like controller)

GraphQL comes with a set of default scalar types out of the box:
Int: A signed 32‐bit integer.
Float: A signed double-precision floating-point value.
String: A UTF‐8 character sequence.
Boolean: true or false.
ID: The ID scalar type represents a unique identifier,
often used to refetch an object or as the key for a cache.
The ID type is serialized in the same way as a String;
however, defining it as an ID signifies that it is not intended to be human‐readable.

examples:
// schema.js
onst { buildSchema } = require('graphql'); // function which allows to build new schema

// exports new graphql schema object
// in type Query you define your queries and their type
// String! - means if hello() don't return a string it will return an error
module.exports = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }

    type RootQuery {
        hello: TestData!
    }

    schema {
        query: RootQuery
    }
`);

// resolvers.js
module.exports = {
  // method for query you defined in your schema
  // query name should match the method name
  hello() {
    return {
        text: 'Hello World',
        views: 12345
    }
  }
};

if use grqphiql: true in /app-09/app.js like this:
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

then after going to http://localhost:8080/graphql it will open GraphiQL 
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries.
we can add our queries there like this:
mutation {
  createUser(userInput: { 
    email: "test@test.com",
    name: "mmstar",
    password: "test"
  }) {
    _id
    email
  } 
}

FrontEnd queries examples:
// where FetchPosts is a name of the query
// FetchPosts($page: Int) - this will tell our GraphQL-server that we have a query
// with an internal variable of type integer
// query - stores query expression (dynamic variables assigned with $ sign)
// variables - store list of dynamic variables that are used in expression
// variables key names have to match with names in exrpession(but no $ sing)
const graphqlQuery = {
      query: `query FetchPosts($page: Int) {
        posts(page: $page ) {
          posts {
            _id
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
          totalPosts
        }
      }`,
      variables: {
        page: page
      }
    };


and then to see the result
Run Query:  Ctrl-Enter (or press the play button above)

Server-side validation with GraphQL:
As we have no routes, validation will take place in our /app-09/graphql/resolvers.js
for this we need to install another validator package
step1
> npm install --save validator
step2
create (/app-09/graphql/resolvers.js)
module.exports = {  
  // async/await way
  createUser: async function({ userInput }, req) {
    const email = userInput.email;
    const name = userInput.name;
    const password = userInput.password;
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "E-mail is invalid" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 4 })
    ) {
      errors.push({ message: "Password to short" });
    }
    if (validator.isEmpty(name) || !validator.isLength(name, { min: 2 })) {
      errors.push({ message: "Name is to short" });
    }
    if (errors.length > 0) {
      const error = new Error("Validation failed");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
      const error = new Error("Email already exists");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name
    });
    const storedUser = await user.save();
    // return mongoDB document with all params
    return { ...storedUser._doc, _id: storedUser._id.toString() };
  }
};
step3
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if(!err.originalError) {
        return err
      }
      const errorData = err.originalError.data;
      const message = err.message || 'Internal error occured';
      const statusCode = err.originalError.statusCode || 500;
      return {
        message: message,
        status: statusCode,
        data: errorData
      }
    }
  })
);

Authentication with GraphQL:
as REST API use token.
step1 (define token at graphql schema)
type AuthData {
    token: String!
    userId: Stirng!
}

type RootQuery {
    login(email: String!, password: String!): AuthData!
}
step2 (update /app-09/middleware/auth.js)
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
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
    req.isAuth = false;
    return next();
  }
  // if token undefined
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  // if no auth error occur
  // store user information in a request
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
step3 (update /app-09/app.js)
const auth = require("./middleware/auth");
...
// Auth middleware
// run on every request that reaches graphql endpoint.
// but it will not deny a request if it have no token.
// instead it will set req.isAuth to false.
// so we can check it in our resolver then
app.use(auth);

step4 (resolver login function)
login: async function({ email, password }, req) {
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Please enter valid password");
    error.statusCode = 401;
    throw error;
  }
  // create token
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    "someSuperLongSecretString",
    { expiresIn: "1h" }
  );
  return { token: token, userId: user._id.toString() };
}
step5 (update frontend loginHandler)
/app-10/src/App.js
loginHandler = (event, authData) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `query UserLogin($email: String!, $password: String!){
        login(email: $email, password: $password) {
          token
          userId
        }
      }`,
      variables: {
        email: authData.email,
        password: authData.password
      }
    }
    this.setState({ authLoading: true });
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {  
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 401) {
          throw new Error(
            "Validation failed. Please enter a valid email, password"
          );
        }
        if (resData.errors) {
          throw new Error("User login failed");
        }
        console.log(resData);
        this.setState({
          isAuth: true,
          token: resData.data.login.token,
          authLoading: false,
          userId: resData.data.login.userId
        });
        localStorage.setItem("token", resData.data.login.token);
        localStorage.setItem("userId", resData.data.login.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem("expiryDate", expiryDate.toISOString());
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

Create Post with GraphQL:
step1 (update /app-09/graphql/schema.js)
input PostInputData {
    title: String!
    imageUrl: String!
    content: String!
}

type RootMutation {
    createUser(userInput: UserInputData): User!
    createPsot(postInput: PostInputData): Post!
}
step2 (resolver createPost function)
createPost: async function({ postInput }, req) {
  if (!req.isAuth) {
    const error = new Error('Not Authenticated!');
    error.statusCode = 401;
    throw error;
  }
  const errors = [];
  if (
    validator.isEmpty(postInput.title) ||
    !validator.isLength(postInput.title, { min: 4 })
  ) {
    errors.push({ message: "Title length is to short" });
  }

  if (
    validator.isEmpty(postInput.content) ||
    !validator.isLength(postInput.content, { min: 4 })
  ) {
    errors.push({ message: "Content length is to short" });
  }

  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.data = errors;
    error.statusCode = 422;
    throw error;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("Invalid User");  
    error.statusCode = 401;
    throw error;
  }

  const post = new Post({
    title: postInput.title,
    content: postInput.content,
    imageUrl: postInput.imageUrl,
    creator: user
  });

  const storedPost = await post.save();
  // add post to user.posts[]
  user.posts.push(storedPost);
  return {
    ...storedPost._doc,
    _id: storedPost._id.toString(),
    createdAt: storedPost.createdAt.toISOString(),
    updatedAt: storedPost.updatedAt.toISOString()
  };
}
step3 (/app-10/src/pages/Feed/Feed.js finishEditHandler = postData => {...})
finishEditHandler = postData => {
  this.setState({
    editLoading: true
  });
  // image upload handling
  const formData = new FormData();
  formData.append("image", postData.image);
  if (this.state.editPost) {
    formData.append("oldPath", this.state.editPost.imagePath);
  }
  fetch("http://localhost:8080/post-image", {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + this.props.token
    },
    body: formData
  })
    .then(res => res.json())
    .then(fileResData => {
      const imageUrl = fileResData.filePath || "undefined";
      let graphqlQuery = {
        query: `mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!){
          createPost(
            postInput:
              {
                title: $title,
                content: $content,
                imageUrl: $imageUrl
              }
          ) {
            _id
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
        }`,
        variables: {
          title: postData.title,
          content: postData.content,
          imageUrl: imageUrl
        }
      };

      if (this.state.editPost) {
        graphqlQuery = {
          query: `mutation UpdateExistingPost($postId: ID!, $title: String!, $content: String!, $imageUrl: String!) {
            updatePost(id: $postId, postInput: {
              title: $title,
              content: $content,
              imageUrl: $imageUrl
            }) {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
              updatedAt
            }
          }`,
          variables: {
            postId: this.state.editPost._id,
            title: postData.title,
            content: postData.content,
            imageUrl: imageUrl
          }
        };
      }
    return fetch('http://localhost:8080/graphql', {
      method: 'POST', 
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json"
      } 
    })
    .then(res => {  
      return res.json();
    })
    .then(resData => {
      if (resData.errors && resData.errors[0].status === 422) {
        throw new Error(
          "Validation failed. Invalid data input."
        );
      }
      if (resData.errors) {
        throw new Error("Post creation failed");
      }
      console.log(resData); // browser console output
      const post = {
        _id: resData.post._id,
        title: resData.post.title,
        content: resData.post.content,
        creator: resData.post.creator,
        createdAt: resData.post.createdAt
      };
      // code for placing new post immediately at the page
      this.setState(prevState => {
        let updatedPosts = [...prevState.posts];
        let updatedTotalPosts = prevState.totalPosts;
        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
            post => post._id === prevState.editPost._id
          );
          updatedPosts[postIndex] = post;
        } else {
          updatedTotalPosts++;
          updatedPosts.unshift(post);
        }
        return {
          posts: updatedPosts,
          editPost: null,
          isEditing: false,
          editLoading: false,
          postsLoading: true,
          totalPosts: updatedTotalPosts
        }
      });
      this.loadPosts();
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

Fetching posts with GraphQL:
step1 (update /app-09/graphql/schema.js)
type PostsData {
  posts: [Post!]!
  totalPosts: Int!
}

type RootQuery {
  login(email: String!, password: String!): AuthData!
  posts: PostsData! 
}
step2 (update /app-09/graphql/resolvers.js)
posts: async function(args, req) {
  if (!req.isAuth) {
    const error = new Error("Not Authenticated!");
    error.statusCode = 401;
    throw error;
  }
  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("creator");
  // use .map() to refactor posts array
  // every element of the array will have _id in String format
  // createdAt in string format
  // updatedAt is string format
  return {
    posts: posts.map(p => {
      return {
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      };
    }),
    totalPosts: totalPosts
  };
}
step3 (update /app-10/src/pages/Feed/Feed.js loadPosts = direction => {...})
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
  const graphqlQuery = {
    query: `query FetchPosts($page: Int) {
      posts(page: $page ) {
        posts {
          _id
          title
          content
          imageUrl
          creator {
            name
          }
          createdAt
        }
        totalPosts
      }
    }`,
    variables: {
      page: page
    }
  };
  fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: {
      Authorization: "Bearer " + this.props.token,
      'Content-Type': "application/json",  
    },
    body: JSON.stringify(graphqlQuery)
  })
    .then(res => {        
      return res.json();
    })
    .then(resData => {
      if (resData.errors) {
        throw new Error("Fetching posts failed");
      }
      this.setState({
        posts: resData.data.posts.posts.map(post => {
          return {
            ...post,
            imagePath: post.imageUrl
          };
        }),
        totalPosts: resData.data.posts.totalPosts,
        postsLoading: false
      });
    })
    .catch(this.catchError);
};

Pagination with GraphQL:
step1 (schema update /app-09/graphql/schema.js)
type RootQuery {
  login(email: String!, password: String!): AuthData!
  posts(page: Int): PostsData!
}
step2 (resolver update /app-09/graphql/resolvers.js)
posts: async function({ page }, req) {
  if (!req.isAuth) {
    const error = new Error("Not Authenticated!");
    error.statusCode = 401;
    throw error;
  }
  if(!page) {
    page = 1;
  }
  
  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate("creator");
  // use .map() to refactor posts array
  // every element of the array will have _id in String format
  // createdAt in string format
  // updatedAt is string format
  return {
    posts: posts.map(p => {
      return {
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      };
    }),
    totalPosts: totalPosts
  };
}
step3 (update /app-10/src/pages/Feed/Feed.js )
  loadPosts = direction => {
    ...
    const graphqlQuery = {
      query: `query FetchPosts($page: Int) {
        posts(page: $page ) {
          posts {
            _id
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
          totalPosts
        }
      }`,
      variables: {
        page: page
      }
    };
    ...
  }

  finishEditHandler = postData => {
    ...
    // code for placing new post immediately at the page
    this.setState(prevState => {
      let updatedPosts = [...prevState.posts];
      let updatedTotalPosts = prevState.totalPosts;
      if (prevState.editPost) {
        const postIndex = prevState.posts.findIndex(
          post => post._id === prevState.editPost._id
        );
        updatedPosts[postIndex] = post;
      } else {
        updatedTotalPosts++;
        // updatedPosts.pop();
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        editPost: null,
        isEditing: false,
        editLoading: false,
        postsLoading: true,
        totalPosts: updatedTotalPosts
      };
    });
    this.loadPosts();
    ...
  }

Image UPLOAD with GraphQL:
step1(update /app-09/app.js) 
register new middleware 
// Image Upload hadling
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not Authenticated");
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  // was oldPath passed with the incoming request?
  if (req.body.oldPath) {
    deleteImage(req.body.oldPath);
  }
  // important if you are on Windows replace system path defaluts to POSIX
  // for correct file path save&display
  const filePath = req.file.path.replace(/\\/g, "/"); // get image file path
  return res.status(201).json({ message: "File stored", filePath: filePath });
});
step2 (update /app-10/src/pages/Feed/Feed.js)
finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    // image upload handling
    const formData = new FormData();
    formData.append("image", postData.image);
    if (this.state.editPost) {
      formData.append("oldPath", this.state.editPost.imagePath);
    }
    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token
      },
      body: formData
    })
      .then(res => res.json())
      .then(fileResData => {
        const imageUrl = fileResData.filePath || "undefined";
        let graphqlQuery = {
          query: `mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!){
            createPost(
              postInput:
                {
                  title: $title,
                  content: $content,
                  imageUrl: $imageUrl
                }
            ) {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
          }`,
          variables: {
            title: postData.title,
            content: postData.content,
            imageUrl: imageUrl
          }
        };

        if (this.state.editPost) {
          graphqlQuery = {
            query: `mutation UpdateExistingPost($postId: ID!, $title: String!, $content: String!, $imageUrl: String!) {
              updatePost(id: $postId, postInput: {
                title: $title,
                content: $content,
                imageUrl: $imageUrl
              }) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
                updatedAt
              }
            }`,
            variables: {
              postId: this.state.editPost._id,
              title: postData.title,
              content: postData.content,
              imageUrl: imageUrl
            }
          };
        }

        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            Authorization: "Bearer " + this.props.token,
            "Content-Type": "application/json"
          }
        });
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error("Validation failed. Invalid data input.");
        }
        if (resData.errors) {
          throw new Error("Post update failed.");
        }
        console.log(resData); // browser console output
        let resDataField = "createPost";
        if (this.state.editPost) {
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt,
          imagePath: resData.data[resDataField].imageUrl
        };
        // code for placing new post immediately at the page
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              post => post._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;
            // updatedPosts.pop();
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            editPost: null,
            isEditing: false,
            editLoading: false,
            postsLoading: true,
            totalPosts: updatedTotalPosts
          };
        });
        this.loadPosts();
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


CORS/CORB:
React sends OPTIONS request before POST. 
Express graphql can't handle anything but is POST/GET request.
that is why we have this CORS error.
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
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } 
  next();
});

preparations:
clear mongo database
> npm install --save validator

steps backend:
delete /app-09/socket.js
delete /app-09/routes
create /app-09/util/file.js
update /app-09/middleware/auth.js
create /app-09/graphql/schema.js
create /app-09/graphql/resolvers.js
update /app-09/app.js

steps frontend:
update /app-10/src/pages/Feed/Feed.js
    componentDidMount() {...}
    statusUpdateHandler = event => {...}
    finishEditHandler = postData => {...}
    deletePostHandler = postId => {...}
update /app-10/src/App.js
    loginHandler = (event, authData) => {...}
    signupHandler = (event, authData) => {...}
update /app-10/src/pages/Feed/SinglePost/SinglePost.js
    componentDidMount() {...}

logs backend:
delete /app-09/socket.js
delete /app-09/routes

// create /app-09/util/file.js
const path = require('path');
const fs = require('fs');

// helper function for deleting old image
const deleteImage = filepath => {
  filepath = path.join(__dirname, '..', filepath);
  fs.unlink(filepath, err => {
    console.log(err);
  });
};

exports.deleteImage = deleteImage;

// update /app-09/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
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
    req.isAuth = false;
    return next();
  }
  // if token undefined
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  // if no auth error occur
  // store user information in a request
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};

// create /app-09/graphql/schema.js
const { buildSchema } = require('graphql'); // function which allows to build new schema

// exports new graphql schema object
// in type Query you define your queries and their type
// String! - means if hello() don't return a string it will return an error
// input - special key word - for the Data that is used as an input.
module.exports = buildSchema(`
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInputData {
        title: String!
        imageUrl: String!
        content: String!
    }

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostsData {
        posts: [Post!]!
        totalPosts: Int!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int): PostsData!
        post(id: ID!): Post!
        user: User!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): Boolean
        updateStatus(status: String): User!
    }

    schema {
        mutation: RootMutation
        query: RootQuery
    }
`);

// create /app-09/graphql/resolvers.js
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Post = require("../models/post");
const { deleteImage } = require("../util/file");

const ITEMS_PER_PAGE = 2;

module.exports = {
  // method for query you defined in your schema
  // query name should match the method name
  // args - arguments object
  // req - request
  // createUser(args, req) {
  //   const email = args.userInput.email;
  //   const name = args.userInput.name;
  //   const password = args.userInput.password;
  // }
  // with nextgen JS destructuring
  // createUser({ userInput }, req) {
  //   const email = userInput.email;
  //   const name = userInput.name;
  //   const password = userInput.password;
  // }
  // .then().catch() way
  // !important note - should always return a promise object.
  // without return graphql will not wait for it resolve.
  // createUser({ userInput }, req) {
  //   const email = userInput.email;
  //   const name = userInput.name;
  //   const password = userInput.password;
  //   return User.findOne({email : email}).then().catch()
  // }
  // async/await way
  createUser: async function({ userInput }, req) {
    const email = userInput.email;
    const name = userInput.name;
    const password = userInput.password;
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "E-mail is invalid" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 4 })
    ) {
      errors.push({ message: "Password to short" });
    }
    if (validator.isEmpty(name) || !validator.isLength(name, { min: 2 })) {
      errors.push({ message: "Name is to short" });
    }
    if (errors.length > 0) {
      const error = new Error("Validation failed");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
      const error = new Error("Email already exists");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name
    });
    const storedUser = await user.save();
    // return mongoDB document with all params
    return { ...storedUser._doc, _id: storedUser._id.toString() };
  },
  login: async function({ email, password }, req) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Please enter valid password");
      error.statusCode = 401;
      throw error;
    }
    // create token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "someSuperLongSecretString",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createPost: async function({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 4 })
    ) {
      errors.push({ message: "Title length is to short" });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 4 })
    ) {
      errors.push({ message: "Content length is to short" });
    }

    if (errors.length > 0) {
      const error = new Error("Validation failed");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid User");
      error.statusCode = 401;
      throw error;
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    });

    const storedPost = await post.save();
    // add post to user.posts[]
    user.posts.push(storedPost);
    await user.save();
    return {
      ...storedPost._doc,
      _id: storedPost._id.toString(),
      createdAt: storedPost.createdAt.toISOString(),
      updatedAt: storedPost.updatedAt.toISOString()
    };
  },
  posts: async function({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("creator");
    // use .map() to refactor posts array
    // every element of the array will have _id in String format
    // createdAt in string format
    // updatedAt is string format
    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        };
      }),
      totalPosts: totalPosts
    };
  },
  post: async function({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    return {
      ...post._doc,
      id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  },
  updatePost: async function({ id, postInput }, req) {
    // authentication
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    // post existance
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    // author validation
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not Authorized!");
      error.statusCode = 403;
      throw error;
    }
    // input validation
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 4 })
    ) {
      errors.push({ message: "Title length is to short" });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 4 })
    ) {
      errors.push({ message: "Content length is to short" });
    }

    if (errors.length > 0) {
      const error = new Error("Validation failed");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    };
  },
  deletePost: async function({ id }, req) {
    // authentication
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(id);
    // post existance
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    // author validation
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not Authorized!");
      error.statusCode = 403;
      throw error;
    }
    // obvious try/catch need to be added to all resolver functions
    deleteImage(post.imageUrl);
    await Post.findOneAndDelete({ _id: post._id }); // !check
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();
    return true;
  },
  user: async function(args, req) {
    // authentication
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(req.userId);
    // extra user doc check
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return { ...user._doc, _id: user._id.toString() };
  },
  updateStatus: async function({ status }, req) {
    // authentication
    if (!req.isAuth) {
      const error = new Error("Not Authenticated!");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return { ...user._doc, _id: user._id.toString() };
  }
};

// update /app-09/app.js
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer"); // import multer
const graphqlHttp = require("express-graphql");

// graphql preparations
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { deleteImage } = require("./util/file");

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
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Auth middleware
// run on every request that reaches graphql endpoint.
// but it will not deny a request if it have no token.
// instead it will set req.isAuth to false.
// so we can check it in our resolver then
app.use(auth);

// Image Upload hadling
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not Authenticated");
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  // was oldPath passed with the incoming request?
  // console.log(req.body.oldPath);
  if (req.body.oldPath) {
    deleteImage(req.body.oldPath);
  }
  // important if you are on Windows replace system path defaluts to POSIX
  // for correct file path save&display
  const filePath = req.file.path.replace(/\\/g, "/"); // get image file path
  return res.status(201).json({ message: "File stored", filePath: filePath });
});

// GraphQL settings
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const errorData = err.originalError.data;
      const message = err.message || "Internal error occured";
      const statusCode = err.originalError.statusCode || 500;
      return {
        message: message,
        status: statusCode,
        data: errorData
      };
    }
  })
);
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
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));


logs frontend:
// update /app-10/src/pages/Feed/Feed.js
//    componentDidMount() {...}
//    statusUpdateHandler = event => {...}
//    finishEditHandler = postData => {...}
//    deletePostHandler = postId => {...}    
import React, { Component, Fragment } from "react";

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
    const graphqlQuery = {
      query: `{
        user {
          status
        }
      }`
    }
    fetch("http://localhost:8080/graphql", {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {  
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error("Failed to fetch user status.");
        }
        this.setState({ status: resData.data.user.status });
      })
      .catch(this.catchError);

    this.loadPosts();
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
    const graphqlQuery = {
      query: `query FetchPosts($page: Int) {
        posts(page: $page ) {
          posts {
            _id
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
          totalPosts
        }
      }`,
      variables: {
        page: page
      }
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error("Fetching posts failed");
        }
        this.setState({
          posts: resData.data.posts.posts.map(post => {
            return {
              ...post,
              imagePath: post.imageUrl
            };
          }),
          totalPosts: resData.data.posts.totalPosts,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    const graphqlQuery = {
      query: `mutation UpdateUserStatus($userStatus: String){
        updateStatus(status: $userStatus) {
            status      
        }
      }`,
      variables: {
        userStatus: this.state.status
      }
    }
    // const formData = new FormData();
    // formData.append("newStatus", this.state.status);
    // console.log(status);
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {  
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error("Can't update status!");
        }
        console.log(resData);
        this.setState({
          status: resData.data.updateStatus.status
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
    // image upload handling
    const formData = new FormData();
    formData.append("image", postData.image);
    if (this.state.editPost) {
      formData.append("oldPath", this.state.editPost.imagePath);
    }
    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token
      },
      body: formData
    })
      .then(res => res.json())
      .then(fileResData => {
        const imageUrl = fileResData.filePath || "undefined";
        let graphqlQuery = {
          query: `mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!){
            createPost(
              postInput:
                {
                  title: $title,
                  content: $content,
                  imageUrl: $imageUrl
                }
            ) {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
          }`,
          variables: {
            title: postData.title,
            content: postData.content,
            imageUrl: imageUrl
          }
        };

        if (this.state.editPost) {
          graphqlQuery = {
            query: `mutation UpdateExistingPost($postId: ID!, $title: String!, $content: String!, $imageUrl: String!) {
              updatePost(id: $postId, postInput: {
                title: $title,
                content: $content,
                imageUrl: $imageUrl
              }) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
                updatedAt
              }
            }`,
            variables: {
              postId: this.state.editPost._id,
              title: postData.title,
              content: postData.content,
              imageUrl: imageUrl
            }
          };
        }

        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            Authorization: "Bearer " + this.props.token,
            "Content-Type": "application/json"
          }
        });
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error("Validation failed. Invalid data input.");
        }
        if (resData.errors) {
          throw new Error("Post update failed.");
        }
        console.log(resData); // browser console output
        let resDataField = "createPost";
        if (this.state.editPost) {
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt,
          imagePath: resData.data[resDataField].imageUrl
        };
        // code for placing new post immediately at the page
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              post => post._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;
            // updatedPosts.pop();
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            editPost: null,
            isEditing: false,
            editLoading: false,
            postsLoading: true,
            totalPosts: updatedTotalPosts
          };
        });
        this.loadPosts();
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
    const graphqlQuery = {
      query: `mutation DeleteExistingPost($postId: ID!){
        deletePost(id: $postId)
      }`,
      variables: {
        postId: postId
      }
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error("Deleting the post failed!");
        }
        console.log(resData);
        let direction;
        // code for placing left posts immediately at the page
        this.setState(prevState => {
          const posts = [...prevState.posts];
          const updatedPosts = posts.filter(post => post._id !== postId);
          if(updatedPosts.length === 0) {
            direction = 'previous'
          }
          return {
            posts: updatedPosts,
            postsLoading: false
          };
        });
        this.loadPosts(direction);
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

// update /app-10/src/App.js
//     loginHandler = (event, authData) => {...}
//     signupHandler = (event, authData) => {...}
import React, { Component, Fragment } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import FeedPage from "./pages/Feed/Feed";
import SinglePostPage from "./pages/Feed/SinglePost/SinglePost";
import LoginPage from "./pages/Auth/Login";
import SignupPage from "./pages/Auth/Signup";
import "./App.css";

class App extends Component {
  state = {
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      this.logoutHandler();
      return;
    }
    const userId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.setState({ isAuth: true, token: token, userId: userId });
    this.setAutoLogout(remainingMilliseconds);
  }

  mobileNavHandler = isOpen => {
    this.setState({ showMobileNav: isOpen, showBackdrop: isOpen });
  };

  backdropClickHandler = () => {
    this.setState({ showBackdrop: false, showMobileNav: false, error: null });
  };

  logoutHandler = () => {
    this.setState({ isAuth: false, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
  };

  loginHandler = (event, authData) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `query UserLogin($email: String!, $password: String!){
        login(email: $email, password: $password) {
          token
          userId
        }
      }`,
      variables: {
        email: authData.email,
        password: authData.password
      }
    }
    this.setState({ authLoading: true });
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {  
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 401) {
          throw new Error(
            "Validation failed. Please enter a valid email, password"
          );
        }
        if (resData.errors) {
          throw new Error("User login failed");
        }
        // console.log(resData);
        this.setState({
          isAuth: true,
          token: resData.data.login.token,
          authLoading: false,
          userId: resData.data.login.userId
        });
        localStorage.setItem("token", resData.data.login.token);
        localStorage.setItem("userId", resData.data.login.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem("expiryDate", expiryDate.toISOString());
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

  signupHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: true });
    const graphqlQuery = {
      query: `
        mutation SignupNewUser($email: String!, $name: String!, $password: String!) {
          createUser(userInput: {
            email: $email,
            name: $name,
            password: $password
          }) {
            _id        
          }
        }
      `,
      variables: {
        email: authData.signupForm.email.value,
        password: authData.signupForm.password.value,
        name: authData.signupForm.name.value
      }
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Email already taken or other fields incorrect"
          );
        }
        if (resData.errors) {
          throw new Error("User creation failed");
        }
        // console.log(resData);
        this.setState({ isAuth: false, authLoading: false });
        this.props.history.replace("/");  
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

  setAutoLogout = milliseconds => {
    setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    let routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => (
            <LoginPage
              {...props}
              onLogin={this.loginHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Route
          path="/signup"
          exact
          render={props => (
            <SignupPage
              {...props}
              onSignup={this.signupHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Redirect to="/" />
      </Switch>
    );
    if (this.state.isAuth) {
      routes = (
        <Switch>
          <Route
            path="/"
            exact
            render={props => (
              <FeedPage userId={this.state.userId} token={this.state.token} />
            )}
          />
          <Route
            path="/:postId"
            render={props => (
              <SinglePostPage
                {...props}
                userId={this.state.userId}
                token={this.state.token}
              />
            )}
          />
          <Redirect to="/" />
        </Switch>
      );
    }
    return (
      <Fragment>
        {this.state.showBackdrop && (
          <Backdrop onClick={this.backdropClickHandler} />
        )}
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onOpenMobileNav={this.mobileNavHandler.bind(this, true)}
                onLogout={this.logoutHandler}
                isAuth={this.state.isAuth}
              />
            </Toolbar>
          }
          mobileNav={
            <MobileNavigation
              open={this.state.showMobileNav}
              mobile
              onChooseItem={this.mobileNavHandler.bind(this, false)}
              onLogout={this.logoutHandler}
              isAuth={this.state.isAuth}
            />
          }
        />
        {routes}
      </Fragment>
    );
  }
}

export default withRouter(App);


// update /app-10/src/pages/Feed/SinglePost/SinglePost.js
//     componentDidMount() {...}
import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: ` query FetchSinglePost($postId: ID!){
        post(id: $postId) {
          title
          content
          imageUrl
          creator {
            name
          }
          createdAt
        }
      }`,
      variables: {
        postId: postId
      }
    }
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => { 
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error('Fetching post failed.');
        }
        this.setState({
          title: resData.data.post.title,
          author: resData.data.post.creator.name,
          date: new Date(resData.data.post.createdAt).toLocaleDateString('en-GB'),
          content: resData.data.post.content,
          image: 'http://localhost:8080/' + resData.data.post.imageUrl
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;

! obvious try/catch need to be added to all resolver functions

summary:
Stateless Client-independent API.
Higher Flexibility then REST APIs offer due to custom query language
that is exposed to the client.
Queries ('GET'), Mutation('POST', PUT', 'PATCH', 'DELETE')
and Subscriptions can be used to exchange and manage data.
All GrqphQL requests are directed to ONE endpoint (POST/graphql).
The server parses the incoming query expression(typically done by 3-rd party packages)
and calls the appropriate resolvers.
GraphQL is not limited to React.js applications.

GraphQL vs REST API
REST APIs are great for static data requirements(e.g. file upload, scenarios where
  you need some data all the time)
GraphQL gives you higher flexibility by exposing a full query language to the client.
Both GraphQL and REST APIs can be implemented with ANY framework and actually 
even with ANY server-side language.

*/