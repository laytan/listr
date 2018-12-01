const jwt = require('jsonwebtoken');

function ifTokenSetUser(req, res, next) {
    const authHeader = req.get('authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        jwt.verify(token, process.env.SECRET, (error, user) => {
          if (error) {
            next();
          }  
          req.user = user;
          next();
        });
      } else {
        next();
      }
    } else {
      next();
  }
}

function isAuthorized(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.status(501);
        const error = new Error("Unauthorized request");
        next(error);
    }
}

function errorHandler(err, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
        "error": err.message,
    });
}

module.exports = {
    isAuthorized,
    ifTokenSetUser,
    errorHandler
}
