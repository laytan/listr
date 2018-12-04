const db = require('../database/connection');
const bcrypt = require('bcrypt');

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
    const { updated, attempts } = user;
    //If we have ever set updated
    if(updated) {
        const now = new Date().getTime();
        //The difference between now and the last time we updated in seconds
        const difference = (now - updated) / 1000;
        //If the last login attempt was more than 5 minutes ago, the login is valid
        if(difference > 300) return true;
        //If they tryed to login more than 5 times in a row, they are locked out
        else if(attempts > 5) return difference;
        //If that's not the case they can try logging in
        else return true;
    }    
    //Not updated, so no login request has ever been made, so they are allowed to login
    else return true;
}

//Alphanumeric and digits, between 3 and 50 characters and no whitespace
function validateName(name) {
    if( ! name ) return false;
    name = name.toString().trim();
    //Must be alphanumeric or digits, no whitespace and be between 3 and 50 characters
    const nameRegex = /^[a-zA-Z0-9]{3,50}$/;
    return nameRegex.test(name);
}

//No whitespace and above 6 characters
function validatePassword(password) {
    if( ! password ) return false;
    password = password.toString().trim();
    const passRegex = /^[^\s]{6,}$/;
    return passRegex.test(password);
}

function getUserByUserName(user_name) {
    return new Promise(async (resolve, reject) => {
        [err, user] = await to(db.queryPromise('SELECT * FROM user WHERE user_name = ?', user_name));
        if(err) return reject(err);

        return resolve(user);
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
    return new Promise(async (resolve, reject) => {
        const saltRounds = 15;
        [err, hash] = await to(bcrypt.hash(password, saltRounds));
        if(err) return reject(err);

        return resolve(hash);
    });
}

module.exports = {
    validateName,
    validatePassword,
    getUserByUserName,
    insert,
    hashPassword,
    signToken,
    allowedToLogin,
    addToLoginAttempt,
    resetAttempts
}