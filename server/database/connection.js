const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    insecureAuth : true,
    database: 'listr',
    port: process.env.DATABASE_PORT,
    charset: 'utf8mb4',
});

mysqlConnection.connect(function(err) {
    if(err) throw err;
    console.log("connected");
});

const catchErrors = (fn) => {
    return function(req, res, next) {
        return fn(req, res, next).catch(next);
    }
}

//Turns a sql query which uses callbacks into a promise based system
function queryPromise(sql, args) {
    return new Promise((resolve, reject) => {
        mysqlConnection.query(sql, args, (err, res, fields) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

module.exports = {
    mysqlConnection,
    catchErrors,
    queryPromise,
}