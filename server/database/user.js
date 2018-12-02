const db = require('./connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//calback gets (error, result),
//Error: false by default, a json object if there is an error
//Result: null by default, a json object with the db result when the user is inserted
function create(body) {
    return new Promise(async (resolve, reject) => {
        const date = new Date().getTime();
        const userName = body.user_name;
        const userPassword = body.user_password;
        if (!validateName(userName)) {
            return resolve({ "error": "username not valid" });
        }
        if (!validatePassword(userPassword)) {
            return resolve({ "error": "password not valid" });
        }

        //Get user associated with this username
        [err, user] = await to(getUserByUserName(userName));
        if(err) return reject({ "error": err });
        //If there is a user with this name
        if (user.length > 0) return resolve({ "error": "User exists" });
        //Hash the password
        [err, hash] = await to(hashPassword(userPassword));
        if(err) return reject({ "error": err });
        //Insert into the db
        [err, newUser] = await to(queryPromise('INSERT INTO user (user_name, user_hash, user_created) VALUES( ?, ?, ? );',
            [userName, hash, date]));
        if(err) return reject({ "error": err });

        //Return the database response
        return resolve(newUser); 
        
    });
}
//validates username, returns if not valid
//validates password, returns if not valid
//Tries to get the user, returns if there isn't a user with that name
//Checks if this user is allowed to login, returns if he isn't
//Adds a login attempt
//Checks the password, returns if invalid
//Resets the login attempts
//Signs a token and sends it back
function login( body ) {
    return new Promise(async (resolve, reject) => {
        try {
            //Validate the request
            const userName = validateName(body.user_name) ? body.user_name : false;
            if(!userName) return reject("Invalid credentials1" );

            const password = validatePassword(body.user_password) ? body.user_password : false;
            if(!password) return reject("Invalid credentials2");

            res = await getUserByUserName(userName);
            if(res.length !== 1) return reject("Invalid credentials 3");

            const user = res[0];

            const allowed = await allowedToLogin(userName);
            if(allowed === false) return reject("Maximum login attempts exceeded");

            const valid = await bcrypt.compare(password, user.user_hash);
            if(valid === false) {
                await addToLoginAttempt(userName);
                return reject("Invalid credentials 5");
            } 

            await resetAttempts(userName);
                
            //Define the payload
            const payload = {
                "user_id": user.user_id,
                "user_name": user.user_name
            }
            //Generate a token, and send it back
            jwt.sign( payload, process.env.SECRET, { expiresIn: '1d' }, (err, token) => {
                if(err) return reject("Invalid credentials6");
                return resolve(token);
            });
        } catch( err ) {
            console.log(err);
            return reject("Invalid credentials7");
        }
    })
}   

//Add a column with loginattempts, default 0
//Everytime an attempt is made to login and it's unsuccesfull add 1 to it
//Add a set number stop them from making login attempts
//On a succesfull login, set count to 0 again

//Check difference between last updated and 'now' and see if enough time has passed
//If so, set the count to 0
//Else don't let them login

function resetAttempts(username) {
    console.log("Resetting the login attempts");
    return queryPromise('UPDATE user SET user_attempts = 0, user_updated = ? WHERE user_name = ?', [new Date().getTime(), username]);
}

function addToLoginAttempt(username) {
    console.log("Adding 1 to the login attempts");
    return queryPromise('UPDATE user SET user_attempts = user_attempts + 1, user_updated = ? WHERE user_name = ?', [new Date().getTime(), username]);
}

function allowedToLogin(username) {
    console.log("Checking if the user is allowed to login");
    return new Promise((resolve, reject) => {
        queryPromise('SELECT user_attempts, user_updated FROM user WHERE user_name = ?', username)
        .then( res => {
            console.log(res);
            const attempts = res[0].user_attempts;
            let updated = res[0].user_updated;
            if(updated) {
                const now = new Date().getTime();
                const difference = (now - updated) / 1000;
                //5 minutes
                console.log(difference);
                if(difference > 300) {
                    return resolve(true);
                }
            }
            //Reset attempts
            if(attempts > 5) return resolve(false);
            return resolve(true);
        })
        .then( res => {
            return resolve(true);
        })
        .catch( err => {
            return reject(err);
        });
    });
}

function queryPromise(sql, args) {
    return new Promise((resolve, reject) => {
        db.mysqlConnection.query(sql, args, (err, res, fields) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function to(promise) {
    return promise.then(data => {
        return [null, data];
     })
     .catch(err => [err]);
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
        [err, user] = await to(queryPromise('SELECT * FROM user WHERE user_name = ?', user_name));
        if(err) return reject({ "error": err });

        return resolve(user);
    });
}

function hashPassword(password) {
    return new Promise(async (resolve, reject) => {
        const saltRounds = 15;
        [err, hash] = await to(bcrypt.hash(password, saltRounds));
        if(err) return reject(err);

        return resolve(hash);
    });
}

module.exports = {
    create,
    login,
}