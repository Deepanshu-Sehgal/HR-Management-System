const jwt = require("jsonwebtoken");

// Generate a JWT token that includes the user ID and expires after 2 hours
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

module.exports = generateToken;
