const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { registerValidation, loginValidation } = require('../validators/authValidators');
const validate = require('../utils/validate');
const router = express.Router();


router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);

module.exports = router;
