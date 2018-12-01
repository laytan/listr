const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const user = require('./database/user');
const authorized = require('./authorized-router');
const middleware = require('./middleware');
const app = express();

//Sets allowed origins
app.use(cors({
    origin: 'http://localhost:8081'
}));

//Parses the body to json
app.use(bodyParser.json());

//Decodes token if it is set
app.use(middleware.ifTokenSetUser);

//Handles sign up requests
app.post('/user/signup', (req, res) => {
    console.log('Post request on /user/signup');
    user.create(req.body)
    .then( (result) => {
        console.log(result);
        if( result.error ) res.json( { "error": result.error } );
        else res.json({"insertId": result.insertId});
    }, (error) => {
        console.log(error);
        res.json({"error": error});
    });
});

//Handles login requests
app.post('/user/login', (req, res) => {
    console.log('Post request on /user/login');
    console.log(req.body);
    user.login(req.body)
    .then( result => {
        console.log("Got back succes from login");
        console.log(result);
        res.json({ 
            "token": result,
         });
    }, error => {
        console.log("Got back error from login");
        console.log(error);
        res.json({
            error,
        });
    });

});

//Loads the /authorized endpoint
app.use('/authorized', authorized);

//Has to be the last use in the app, handles all the errors
app.use(middleware.errorHandler);


const port = process.env.PORT || 1234;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});