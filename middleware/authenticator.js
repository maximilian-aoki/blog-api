require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    console.log("verifying token");
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET,
      (err, user) => {
        if (err) {
          console.log("verification denied");
          return res.status(401).json({ error: err });
        }
        console.log("verification successful");
        req.user = user;
        next();
      }
    );
  } catch (err) {
    console.log("error in verification");
    res.status(400).json({ error: err });
  }
};

module.exports = verifyToken;
