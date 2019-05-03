/* using npm(node packet manager)
1.go to the app folder
2.npm init(promt quick questions)
  this will make a package.json configuration file.

package.json looks like:
{
  "name": "nodejs-app-02",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node app.js",
    "start-app": "nodemon app.js"
  },
  "author": "mmstar",
  "license": "ISC",
  "devDependencies": {
    "nodemon": "^1.18.7"
  }
}

"nodemon": "^1.18.7" - ^ means that after you use(in that project folder)
> npm install
npm will look through package.json file and locally update such dependencies
for latest verion.
if you need more space or want project to require less space,
you can than delete 'node_modules' folder.
and use
> npm install
again when you come back to working on that project


"scripts": {...} - is a special section for different scripts
scripts usage:
1.go to pakcage.json folder
2.use npm start in command prompt to start node app.js
> npm start
start - is a commonly known script name for npm.
you can also use your own names for scripts.
to run your own scripts names need to add run before the script name
> npm run start-app

npm is also used to install different third party packages.
They are stores at npm Repository installed and managed via npm.

npm & packages:
[Local project]
[<Your code>]
[Core node packages]
                                / [ Express ]
[Dependencies 3rd party] -------  [ body-parser ]
                                \ [ ... ]

some npm packages examples:
1.nodemon (nodemon is a tool that helps develop node.js based
  applications by automatically restarting the node application
  when file changes in the directory are detected.)

  -g means install globaly on this machine so you can use it anywhere:
  > npm install -g nodemon

  You can also install nodemon as a development dependency
  (means it use this package only while development):
  > npm install --save-dev nodemon

  This will install nodemon as a production dependency
  (means it will include this package even after publishin/deploying in the real internet):
  > npm install nodemon --save
  
if you install some package with dev dependence and try to call it from global path it will
cause an error.
*/