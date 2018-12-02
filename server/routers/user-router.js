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
        if(userObj.length > 0) {
            res.status(409);
            throw new Error("Username in use.");
        }
        else {
            user.hashPassword(user_password)
            .then(hashedPassword => user.insert(user_name, hashedPassword))
            .then(response => user.getUserById(response.insertId))
            .then(queriedUser => {
                const payload = {
                    "user_id": queriedUser.user_id,
                    "user_name": queriedUser.user_name,
                }
                return user.signToken(payload);
            })
            .then(token => res.json({"token": token, "message": "succes"}))
            .catch(next);
        }
    })
    .catch(next);
    /*.then(hashedPassword => {
        console.log(hashedPassword);
        return hashedPassword;
    });*/
    /*user.create(req.body)
    .then( (result) => {
        console.log(result);
        if( result.error ) res.json( { "error": result.error } );
        else res.json({"insertId": result.insertId});
    }, (error) => {
        console.log(error);
        res.json({"error": error});
    });*/
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