const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'laytan',
    password: 'laytan',
    insecureAuth : true,
    database: 'listr',
    port: '3306',
});

mysqlConnection.connect(function(err) {
    if(err) throw err;
    console.log("connected");
});


module.exports = {
    mysqlConnection,
}