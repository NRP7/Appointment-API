 //This is our MIDDLEWARE

//IMPORT OUR DEPENDENCIES
const express = require('express');
const app = express(); // -> functions under the express module / package
const morgan = require('morgan');
const bodyParser = require('body-parser');


//This is where we will place the DB CONNECTION
const db = require('./API/models/connection_db');
db.connectDatabase();


//This is where we will place our ROUTERS
const userRouter = require('./API/routers/user_router'); //RECHECK LATER
const consultationRouter = require('./API/routers/consultation_router');


//Define SETTING for BODY-PARSER and MORGAN
app.use(morgan('dev')); // sa development phase lang gagamitin si Morgan; mag l'log lang ng reqests and reponses kapag nag d'develop
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // automatically use json as requests body


//Define HEADER SETTINGS
app.use((req, res, next) => { // NOTE: next - param; callback function
    res.header("Access-Control-Allow-Origin", "*"); // * = any orign na nasa request natin, i-aallow
    res.header("Access-Control-Allow-Headers", "*");

    if (req.method === 'OPTIONS'){
        res.header("Access-Control-Allow-Methods", "*");
        
        return res.status(200).json({}); // = successful
    }

    next(); // next na function na ilalagay after the header settings will be called
});


//Define our MODULE ENDPOINT + the ROUTER
// /users
app.use('/users', userRouter);
app.use('/consultations', consultationRouter); // RECHECK LATER
// /users/add-user -> final endpoint


//ERROR MIDDLEWARE
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;

    next(error);

});


app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });


});


module.exports = app;