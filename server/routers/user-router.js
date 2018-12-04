const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

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
 
//Called by the /users/signup route
const login = async (req, res, next) => {
    console.log('Request on login');
    //Extract login fields
    const { user_name, user_password } = req.body;
    //Check if the input is valid
    if(!user.validateName(user_name) || !user.validatePassword(user_password)) {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    //Check if the username is in use
    const userObj = await user.getUserByUserName(user_name);
    if(userObj.length != 1) {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    const user = userObj[0];
    //Check if the user is allowed to login (Time since last login / Is locked out)
    //Returns the time that the user can login next or true if the user is allowed
    const allowedToLogin = user.allowedToLogin(user);
    if(allowedToLogin !== true) {
        res.status(400);
        throw new Error(`Maximum login attempts reached.
        Please wait: ${allowedToLogin} seconds before trying again.`);
    }

    //Let bcrypt compare the password
    const validPassword = await bcrypt.compare(user_password, user.user_hash);
    if(!validPassword) {
        //If it's not valid we add an attempt to the logins
        await user.addToLoginAttempt(user_name);
        res.status(401);
        throw new Error("Invalid credentials");
    }
    //If it's valid we reset the attempts
    await user.resetAttempts(user_name);

    //Sign token with the payload and send it to the user
    const payload = {
        "user_id": user.user_id,
        "user_name": user.user_name,
    }
    const token = await user.signToken(payload);
    res.json({
        "token": token,
        "message": "succes",
    });
}
//Handles login requests
router.post('/login', connection.catchErrors(login));

module.exports = router;