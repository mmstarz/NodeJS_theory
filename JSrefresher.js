/*
JavaScript language:
Weakly typed language       Object-oriented language        Versatile language
        |                               |                            |
No explicit type            Data can be organized in        Runs in browser & directly
assignment                  logical objects                 on a PC/Server
Data types can be           Primitive and Reference         Can perform a broad variety
switched dynamically        types                           of tasks

Core Syntax
let - create a variable and allow to change its value.
const - create a variable and do not allow to change its value.

Functions
old versions:
    function funcname(arg1, arg2) {...}; // assign function
    const functname = function(arg1, arg2) {...}; // store anonymous function in a const
new versions:
    const funcname = (arg1, arg2) => {...}; // ES2015 arrow function assign
    const add = (a, b) => a + b; // arrow function that have only one statement
    const add = a => a + 1; // arrow function with one argument
    const add = () => 2 + 1; // arrow function with no arguments
    
Objects
const person = {
    name: 'Name', // key-value pair, field, property
    age: 30,
    greet() { // object method
        console.log('Hello, I am  ' + this.name);
    }
}
console.log(person);
person.greet(); // return Hello I am mmstar
*/

// Objects
const person = {
        name: 'mmstar', // key-value pair, field, property
        age: 30,
        greet: function () {
                // arrow function won't work. this. will refer to the global scope
                console.log(`Hello, I am ${this.name}`);
        }
}

console.log(person);
person.greet();

// Arrays
const hobbies = ['Sports', 'Cooking'];
// .map() return new array with help of call back function
// console.log(hobbies.map(hobby => {
//         return 'Hobby: ' + hobby; // returns [Hobby: 'Sport', Hobby: 'Cooking'];
// }))
console.log(hobbies.map(hobby => 'Hobby: ' + hobby)); // one statement arrow function

for (let hobby of hobbies) { // let value of
        console.log(hobby);
}

for (let index in hobbies) { // let index in
        console.log(index);
}

// Reference types
// Even though array hobbies and object person are assigned with const.
// They are refence types data structures.
// This means their values/properies can be changed.
/* Reference types store only a refernce(pointer)
   to a place in memory where they are stored. */
hobbies.push('Programming');
console.log(hobbies);

// ES2015 operators:
// 1. Spread Operator (spread array/object to its values/fields one by one)
// Copy array
const copiedHobbies = hobbies.slice(); // old version
const copiedHobbies2 = [...hobbies]; // ES2015 version with spread operator
console.log('copy1: ', copiedHobbies);
console.log('copy2: ', copiedHobbies2);
// Copy object
const copiedPerson = { ...person };
console.log('copy3: ', copiedPerson);
// 2. Rest operator (opposite to spread operator)
// Compose values/fields
const toArray = (...theArgs) => {
        return theArgs; // return array of arguments
}
console.log(toArray(1, 2, 3)); // old version
console.log(toArray(1, 3, 4, 5, 6, 7)); // ECMA2015 version
// 3. Destructuring
// Get value/field
// old version
const printName = (personData) => { // takes whole entire object
        return personData.name; // return name property
}
console.log('Name: ', printName(person));

// Object destructuring new ES6 version
const getName = ({ name }) => { // take only name property from the object
        // store this property in the name variable
        return name; // return name
}
console.log('Name: ', getName(person));
const { name, age } = person; // store properties values from object into variables
console.log(name, age);
// Array destructuring
const [hobby1, hobby2, hobby3] = hobbies; // store values from array into variables
console.log(hobby1, hobby2, hobby3);
/* Unlike object destucturing while at array destructuring,
   you can choose any name you want for the variables.
   Values get stored by their position in array. */

/* Asynchronous Code (Async). Code that do not execute/finish immediately. */
// first argument is a function of what is going to happen
// second argument is a timer of when to start the first argument function 

const fetchData = () => { // takes callback as an argument
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => { // set timer to call callback to 1500ms
            resolve('Resolve Done'); // execute a callback
        }, 1500);
    });
    return promise;
}

setTimeout(() => { // run after 1000ms timer is done
    console.log('Timer is done');
    fetchData()
        .then(text => { // .then() is called for promise
            console.log(text);
            return fetchData(); // return new promise
        })
        .then(text2 => { // called for new returned promise
            console.log(text2);    
        });
}, 1000);