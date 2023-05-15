//ENTRY POINT of our project

const HTTP = require('http'); // -> Node JS dependency / package / module
const app = require('./app'); // importing files requires a './' which means CURRENT DIRECTORY

const port = 8000;

const server = HTTP.createServer(app); // app will act as a MIDDLEWARE for the API; it will handle all requests going to port 8000 

server.listen(port, () => {
    console.log(`Server is listening in port ${port}`);
});
