const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { registerSchema, loginSchema } = require('../validators/authValidators');
const validate = require('../utils/validate');
const router = express.Router();


router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

module.exports = router;
