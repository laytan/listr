const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const middleware = require('./middleware');

const authorized = require('./routers/authorized');
const userRoutes = require('./routers/user-router');

console.log(process.env.ALLOWED_ORIGIN);
//Sets allowed origins
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN
}));

//Parses the body to json
app.use(bodyParser.json());

//Decodes token if it is set
app.use(middleware.ifTokenSetUser);


app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Listr!',
        user: req.user,
    });
});

app.use('/user', userRoutes);
app.use('/authorized', authorized);


function notFound(req, res, next) {
    console.log("Not found");
    res.status(404);
    const error = new Error('Not found - ' + req.originalUrl);
    next(error);
}

function errorHandler(err, req, res, next) {
    console.log("Error handler", err.message);
    if(res.statusCode == 200) res.status(500);
    else res.status(res.statusCode);
    console.log(res.statusCode);
    res.json({
        message: err.message,
        stack: err.stack
    });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 1234;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});