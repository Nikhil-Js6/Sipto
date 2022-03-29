const router = require('express').Router();
const { sendOtp, verifyOtp } = require('../controllers/authController');

// const { userRegisterValidator , userVerifyValidator} = require('../validators/auth');
// const { runValidation } = require('../validators');

// Routes
router.post('/send-otp',  sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
