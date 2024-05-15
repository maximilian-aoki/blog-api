require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET,
      (err, user) => {
        if (err) {
          return res.status(401).json({ error: err });
        }
        req.user = user;
        next();
      }
    );
  } catch (err) {
    res.status(400).json({ error: "error parsing Bearer Token" });
  }
};

const verifyAdminToken = (req, res, next) => {
  try {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET,
      (err, user) => {
        if (err) {
          return res.status(401).json({ error: err });
        }
        if (user.user.isAdmin === false) {
          return res.status(401).json({ error: "not an authorized admin!" });
        }
        req.user = user;
        next();
      }
    );
  } catch (err) {
    res.status(400).json({ error: "error parsing Bearer Token" });
  }
};

module.exports = {
  verifyToken,
  verifyAdminToken,
};
