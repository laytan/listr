const db = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function insert(name, hash) {
    return new Promise((resolve, reject) => {
        db.queryPromise('INSERT INTO user(user_name, user_hash, user_created) VALUES(?, ?, ?);', [name, hash, new Date().getTime()])
        .then(result => {
            const { insertId } = result;
            return resolve({ "insertId": insertId });
        })
        .catch(err => {
            return reject(err);
        });
    });
}

function resetAttempts(username) {
    console.log("Resetting the login attempts");
    return db.queryPromise('UPDATE user SET user_attempts = 0, user_updated = ? WHERE user_name = ?', [new Date().getTime(), username]);
}

function addToLoginAttempt(username) {
    console.log("Adding 1 to the login attempts");
    return db.queryPromise('UPDATE user SET user_attempts = user_attempts + 1, user_updated = ? WHERE user_name = ?', [new Date().getTime(), username]);
}

function allowedToLogin(user) {
    console.log("Checking if the user is allowed to login");
    //Get the needed variables from the user object
    const { user_updated, user_attempts } = user;
    console.log(`updated: ${user_updated}, attempts: ${user_attempts}`);
    //If we have ever set updated
    if(user_updated) {
        console.log("Updated isset");
        const now = new Date().getTime();
        //The difference between now and the last time we updated in seconds
        const difference = (now - user_updated) / 1000;
        console.log(`Difference: ${difference}`);
        //If the last login attempt was more than 5 minutes ago, the login is valid
        if(difference > 300) return true;
        //If they tryed to login more than 5 times in a row, they are locked out
        else if(user_attempts > 5) return (300 - difference);
        //If that's not the case they can try logging in
        else return true;
    }    
    //Not updated, so no login request has ever been made, so they are allowed to login
    else return true;
}

function getUserByUserName(user_name) {
    return new Promise(async (resolve, reject) => {
        db.queryPromise('SELECT * FROM user WHERE user_name = ?', user_name)
        .then((res) => {
            return resolve(res);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

/*function getUserById(user_id) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM user WHERE user_id = ?', user_id)
        .then(user => {
            return resolve(user);
        })
        .catch(err => {
            console.log("erorr");
            return reject(err);
        });
    });
}*/

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const saltRounds = 15;
        bcrypt.hash(password, saltRounds)
        .then((hash) => {
            return resolve(hash);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

function signToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' }, (err, token) => {
            if(err) return reject(err);
            return resolve(token);
        });
    });
}

module.exports = {
    getUserByUserName,
    insert,
    hashPassword,
    signToken,
    allowedToLogin,
    addToLoginAttempt,
    resetAttempts
}