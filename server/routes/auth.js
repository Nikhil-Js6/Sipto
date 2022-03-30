const router = require('express').Router();
const { sendOtp, verifyOtp, login } = require('../controllers/authController');

// const { userRegisterValidator , userVerifyValidator} = require('../validators/auth');
// const { runValidation } = require('../validators');

// Routes
router.post('/send-otp',  sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

module.exports = router;
