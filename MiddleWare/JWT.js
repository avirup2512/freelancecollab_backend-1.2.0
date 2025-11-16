const jwt = require('jsonwebtoken');
const error = require('../Class/error');
function  checkJWT(req, res, next) {
    let { token } = req.body;
    console.log(token);
    
    if (!token) {
      return res.status(400).send(new error("Token missing"));
    } else {
      try {
        let u = jwt.verify(token, process.env.JWT_SECRET || 'replace_me');
        // let userDetails = await user.getUserByEmail(u.userEmail);
        if(!u){
          return res.status(400).send(new error("Invalid Token"));
        }
        req.params.userEmail = u.email;
        req.userEmail = u.email;
        return next();
      } catch (err) {
        return res.status(400).send(new error(err));
      }
    }
};
module.exports = checkJWT ;