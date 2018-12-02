const express = require('express');
const router = express.Router();

const user = require('../tables/user');

//Handles sign up requests
router.post('/signup', (req, res, next) => {
    console.log('Post request on /user/signup');
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
    
    //Check if the username is free
    user.getUserByUserName(user_name)
    .then(userObj => {
        //If there is a user with that name throw an error,
        //After an error is thrown it goes right to the catch
        if(userObj.length > 0) {
            res.status(409);
            throw new Error("Username in use.");
        }        
        //If the username is not in use continue with signing up
        return user.hashPassword(user_password);
    })
    .then(hashedPassword => user.insert(user_name, hashedPassword)) //Inserts into the db
    .then(response => user.getUserById(response.insertId)) //Gets the newly inserted user
    .then(queriedUser => {
        //Sign a token with the users information,
        //so that the client can log them in right after the sign up process
        const payload = {
            "user_id": queriedUser.user_id,
            "user_name": queriedUser.user_name,
        }
        return user.signToken(payload);
    })
    .then(token => res.json({"token": token, "message": "succesfully signed up!"})) //Respond with the token and a succes message
    .catch(next); //Any error we get goes right to our errorhandler
});

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