const express = require('express');
const router = express.Router();

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
        if(userObj) {
            res.status(409);
            throw new Error("Username in use.");
        }
        else {
            user.hashPassword(user_password)
            .then(hashedPassword => user.insert(user_name, hashedPassword))
            .then(response => user.getUserById(response.insertId))
            .then(queriedUser => res.json(queriedUser))
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
router.post('/login', (req, res) => {
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

router.get('/:id', async (req, res, next) => {
    console.log('Get request on /user/:id');
    //console.log(req.params.id);
    //let { id } = req.params;
    let id = 2;
    /*if(!id) {
        console.log("no id");
        res.status(422);
        throw new Error("No id given");
    }
    else if(!Number(id)) {
        console.log("no id 2");
        res.status(422);
        throw new Error("Id not valid.");
    }
    else {*/
        console.log("proceed");
        try {
            const theUser = await user.getUserById(id);
            console.log(theUser);
            res.json(theUser);
        } catch(err) {
            console.log("error");
            console.log(err);
            res.status(500);
            next(err);
        }
        /*user.getUserById(id)
        .then(theUser => {
            console.log(theUser);
            res.json(theUser[0]);  
        })
        .catch(err => {
            console.log(err);
            console.log("caught");
            next(err);
        });*/
    //}
});

module.exports = router;