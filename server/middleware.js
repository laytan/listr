const jwt = require('jsonwebtoken');

/**
 * Function: ifTokenSetUser
 * 
 * Middleware that checks if there is an authorization header, if there is it:
 * 
 * -  Extracts the token
 * -  Verifies the token
 * -  Sets the req.user object to the extracted user
 * -  Calls next() to proceed to the next middleware
 * 
 * If anything fails or there is no authorization set it calls next()
 */
function ifTokenSetUser(req, res, next) {
    const authHeader = req.get('authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        jwt.verify(token, process.env.SECRET, (error, user) => {
          if (error) {
            console.log(error);
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

/**
 * Function: isAuthorized
 * 
 * Middleware that is used on all the authorized routes.
 * 
 * It checks if req.user is set by our <ifTokenSetUser> Middleware. 
 * if it is proceed, else call next with an unauthorized request error.
 * 
 */
function isAuthorized(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.status(501);
        const error = new Error("Unauthorized request");
        next(error);
    }
}

module.exports = {
    isAuthorized,
    ifTokenSetUser
}
