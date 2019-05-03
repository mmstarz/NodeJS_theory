/*
Deploying Node.js applications.
From development to production.

agenda:
1.Preparing for deployment.
2.Deployment steps & config.
3.Security.

characteristics:
Kind of applications:
[     Server-side rendered views     ]          [       APIs        ]
|Vanilla HTML|      |Templating      |          |REST|      |GraphQL|
                    |engine e.g(EJS) |          |    |      |       |
                                    Both build with
                                      Node Server
                                           +
                                      Node Framework(e.g. Express)
                                           |
                                All have same Hosting Requirements

Providers how it works:
      |--<------<--------<----<- [<your code>]
      |
 ----------------------------------   -----------
|  |Virtual Server|<===> |Managed| | | [Public ] | ======>  |Your  |
|  |Managed space |      |Servers| | | [Gateway] | <======  |Users |
 ----------------------------------   -----------
Private Network            SSL
no external             Compression
Access                    Logging
                        Load Balancing

Git(Version control system):
Save & manage source code.
Git works with:
        [Commits]                [Branches]             [Remote Repositories]
"snapshots" of your code.   Different versions of       Store code + commits + branches
Easily switch between       your code.                  in the cloud.
commits.                    e.g. master (production)    Protect against loss of local
Create commits after:       development, new-feature    data.
bug fix, new features, ...  Separate development of     Deploy code automatically.
                            new-feature and bugfixing
features:
Prepare Code for Production
Use Environment variables (avoid hard-coded values in code).
Use Production API keys (don't use that testing Stripe API).
Reduce Error output details. (don't send sensetive info to your users)
Set Secure Response Headers (implement best practices)
Add Assets Compression (reduce resonse size)
Configure Logging (stay up to date about what is happening)
Use SSL/TLS (Encrypt data in transit)

Compression, Logging, SSL/TLS - often handled by the Hosting Provider.

preparations:
process - is part of the Node Core Runtime.
process.env - is a globally valiable object in a node app.
we can add our environment variables in there.

Environment Variables exaples:
// /app-06/app.js 
// mongoDB entry point: 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop?retryWrites=true'
const MONGODB_URI = 'mongodb+srv://mmstar:4ebyrawka@cluster0-annvu.mongodb.net/shop';
// application port
app.listen(process.env.PORT || 3000);
// stripe API_KEY
const stripe = require("stripe")(process.env.STRIPE_KEY);

Where to set those variables?
For Linux/Unix/Posix...
// if you using nodemon package you need to:
create /app-06/nodemon.json
{
    "env": {
        "NODE_ENV": production
        "MONGO_USER": "mmstar",
        "MONGO_PASSWORD": "4ebyrawka",
        "M0NGO_DEFAULT_DATABSE": "shop",
        "PORT": "5000",
        "STRIPE_KEY": "sk_test_NAuL84MEMaYfuAtFALF4njTg"
    }
}

// if you use simple node app !without nodemon!
// MONGO_USER=mmstar MONGO_PASSWORD=4ebyrawka MONGO_DEFAULT_DATABASE=shop STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg node app.js
then update /app-06/package.json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "NODE_ENV=production MONGO_USER=mmstar MONGO_PASSWORD=4ebyrawka MONGO_DEFAULT_DATABASE=shop STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg node app.js",
    "start-server": "node app.js",  
    "start:dev": "nodemon app.js"
},

For Windows:
// if you use simple node app !without nodemon!
// MONGO_USER=mmstar MONGO_PASSWORD=4ebyrawka MONGO_DEFAULT_DATABASE=shop STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg node app.js
step1
then update /app-06/package.json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "set NODE_ENV=production && set MONGO_USER=mmstar && set MONGO_PASSWORD=4ebyrawka && set MONGO_DEFAULT_DATABASE=shop && set STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg && node app.js",
    "start-windows": "set NODE_ENV=production&& node app.js",
    "start-server": "node app.js",
    "start:dev": "set NODE_ENV=development && set MONGO_USER=mmstar && set MONGO_PASSWORD=4ebyrawka && set MONGO_DEFAULT_DATABASE=shop && set STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg && nodemon app.js"
},
step2
restart IDE
or
step1
> npm install --save-dev cross-env
step2
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "cross-env NODE_ENV=production MONGO_USER=mmstar MONGO_PASSWORD=4ebyrawka MONGO_DEFAULT_DATABASE=shop STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg node app.js",
    "start-server": "node app.js",
    "start:dev": "set NODE_ENV=development && set MONGO_USER=mmstar && set MONGO_PASSWORD=4ebyrawka && set MONGO_DEFAULT_DATABASE=shop && set STRIPE_KEY=sk_test_NAuL84MEMaYfuAtFALF4njTg && nodemon app.js"
},

!important NODE_ENV=production and PORT hosting providers typically do it for you
!important STRIPE have to switch from 'TEST' to 'PRODUCTION' and replace API_KEY.

Secure HEADERS:
use 3rd party package node helmet
official docs: https://helmetjs.github.io/
step1
> npm install --save helmet
step2
update /app-06/app.js
const helmet = require('helmet');
...
const app = express();
...
// headers secure middleware
app.use(helmet());

Compression:
official docs: https://github.com/expressjs/compression
step1
> npm install --save compression
step2 
update /app-06/app.js
const compression = require('compression');
...
const app = express();
...
// compression middleware
app.use(compression());

!important should use compression only if hosting provider doesn't offer this for you.

Logging:
step1
> npm install --save morgan
step2
update /app-06/app.js
const fs = require('fs');
...
const morgan = require('morgan');
...
const app = express();
...
// flags: 'a' - means append new logs to the end of the file, not rewrite existing.
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
// logging middleware
app.use(morgan("combined", { stream: accessLogStream }));

!important should use logging only if hosting provider doesn't offer this for you.

SSL/TLS:
                                (bind key to identity)
[Public key] <----- [SSL Certificate] <----- Public key
    |                 [Decrypt]  <---------- Privet key
[Client]      [          DATA          ]     [Server]
                        | (SSL/TLS Encryption)
                        | (Eavesdropping)
                      [Attack]

!important For Windows:
create a certificate: https://slproweb.com/products/Win32OpenSSL.html
choose version and install (in this case Win64 OpenSSL v1.1.1a)
step1
> openssl req -nodes -new -x509 -keyout server.key -out server.cert
step2
answer questions
Common Name (should be set to domain name)
!important set Common Name(...) []:localhost
after that operation you'll get new files server.cert, server.key
step3
update /app-06/app.js
const https = require('https');
...
// SSL/TLS certification
const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");
...
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(result => {
    https
      .createServer({ key: privateKey, cert: certificate }, app)
      .listen(process.env.PORT || 3000);
  })
  .catch(err => console.log(err));

!important should use SSL/TLS only if hosting provider doesn't offer this for you.

Deployment to Heroku Provider:
step1 create account and login
step2 https://git-scm.com/ download and install
step3 install Heroku CLI (command line interface)
step4 > heroku login (can do it right in VSCode terminal, at your application folder)
after login
step5 
$ cd my-project/ (if you already in app folder do next commands)
$ git init
$ heroku git:remote -a node-mvc-shop
step6
> node -v (check your node version)
update package.json
"engines": {
    "node": "8.11.3"
},
step7
create /app-06/Procfile (without extension)
web: node app.js
step8
create /app-06/.getignore (this file tells .git which folders and files it should ignore)
node_modules
server.cert
server.key
step9
$ git add .
$ git commit -am "<your comment>"
$ git push heroku master
step10
go to https://dashboard.heroku.com/apps/node-mvc-shop/settings
add Config Vars (the Environment variables) we added to the package.json
!important NODE_ENV=production - this will bet automatically by heroku no need to add this.
step11
change mongoDB setting at https://cloud.mongodb.com/v2/5c2346cd9ccf643dc925aa74#clusters
go to "Security" tab => IP Whitelist => add ip address => 0.0.0.0/0 ('access from everywhere')
step12 
go to https://dashboard.heroku.com/apps/node-mvc-shop/settings
'MORE' tab => 'Restart all dynos'
'Open APP'

steps:
// Deployment app-06 Node.js MVC to Heroku 
update /app-06/app.js
update /app-o6/package.json
=> 211 line

// Deployment REST API
Server-side deployment logic stays the same
React APP should then be update with new entry points
npm run build
ship that build to a hosting (e.g. AWS, Firebase)

logs:

*/