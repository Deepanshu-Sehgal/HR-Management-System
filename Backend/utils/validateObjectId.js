const mongoose = require("mongoose");

// Express `router.param` handler factory that rejects malformed Mongo ObjectIds
// with a clean 400 instead of letting a CastError bubble up as a 500.
// Usage: router.param("id", validateObjectId("id"));
module.exports = (paramName) => (req, res, next, value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ message: `Invalid ${paramName}: ${value}` });
  }
  next();
};
