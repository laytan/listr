const express = require('express');
const router = express.Router();

const connection = require('../database/connection');
const user = require('../tables/user');

const signup = async (req, res, next) => {
    console.log('Request on signup');
    //Extract the needed variables
    const { user_name, user_password } = req.body;
    //Validate input
    if(!user.validateName(user_name)) {
        res.status(422);
        throw new Error("Username not valid.");
    }
    if(!user.validatePassword(user_password)) {
        res.status(422);
        throw new Error("Password is not valid.");
    }
    //Check if the username is in use
    const userObj = await user.getUserByUserName(user_name);
    if(userObj.length > 0) {
        res.status(409);
        throw new Error("Username is in use.");
    }
    //Hash the password
    const hashedPassword = await user.hashPassword(user_password);
    //Insert user in the db
    const insertId = await user.insert(user_name, hashedPassword);
    //Payload to be sent in the token
    const payload = {
        "user_id": insertId,
        "user_name": user_name,
    }
    //Make a token and respond with it
    const token = await user.signToken(payload);
    res.json({
        "token": token,
        "message": "Succesfully signed up!",
    });
}
//Handles sign up requests
//connection.catcherrors basically returns the function we pass with a catch block 
//that passes any error it raises to our errorhandler
router.post('/signup', connection.catchErrors(signup));
    
//Handles login requests
router.post('/login', (req, res, next) => {
    console.log('Post request on /user/login');
    console.log(req.body);
    user.login(req.body)
    .then( result => {
        console.log("Got back succes from login");
        console.log(result);
        res.json({ 
            "token": result,
         });
    })
    .catch(next);

});

module.exports = router;