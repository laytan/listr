const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    insecureAuth : true,
    database: 'listr',
    port: process.env.DATABASE_PORT,
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

module.exports = {
    mysqlConnection,
    catchErrors,
}