/* There are two main concepts: Streams & Buffers
example:

The idea to start working on data early.
Not waiting for full parse is done.

                [Incoming requset]
*rbp - request body part.
[Stream] ----> [rbp1] ----> [rbp2] ---->| [rbp3] ----> [rbp4] |---> : [Fully parsed]
                  |                     |                     |
                  | (how to work        |                     |
                  |  with flow          |                     |
                  |  data ?)            |                     |
             [Your code] ------------>  | ------[Buffer]----- |             
                (work with chuncks of data)

req.on() - method allows to listen server events
           (close, data, end, error, readable)
           
example:
req.on('data', callback function)
function get called for every incoming data event
this listener is working with chunks of data.
*/
if (url === '/message' && method === 'POST') {
    const body = []; // variable for request body part
    req.on('data', (chunk) => {
        body.push(chunk); // NodeJS will continue untill it gets all chunks of data request
    });
    // get called once its done parsing request data or incoming request in general
    req.on('end', () => {
        // buffer object is available globaly(made available by NodeJS).
        // creates new Buffer and store all chunks of data in it.
        const parsedBody = Buffer.concat(body).toString(); // convert into a string
        // toString() works only when incoming data is a text
        // can use also toJSON(), toLocaleString()
        console.log(parsedBody); // e.g. message=123456789
        // split parsedBody by '=' symbol on two strings. (['message', '123456789'])
        // and store the one(index of [1]) into a variable
        const message = parsedBody.split('=')[1];
        // store data from message into file
        fs.writeFileSync('./message.txt', message);
        // first argument is for Status Code (can use also res.statusCode = 302)
        // second is an object of head information        
        // res.writeHead(302, {});
        res.statusCode = 302;
        // set response location to '/'(simply redirects)
        res.setHeader('Location', '/');
        return res.end(); // return prevents running the code below
    });
}