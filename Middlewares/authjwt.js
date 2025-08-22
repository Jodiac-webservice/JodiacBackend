const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js")
const db = require("../models/index.model.js");

verifyToken = (req, res, next) => {
  let token = req.session.token || req.headers["authorization"];
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};


const authJwt = {
  verifyToken,
};
module.exports = authJwt;