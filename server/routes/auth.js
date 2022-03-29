const router = require('express').Router();
const { sendOtp, verifyOtp } = require('../controllers/authController');

const { userRegisterValidator , userVerifyValidator} = require('../validators/auth');
const { runValidation } = require('../validators');

// Routes
router.post('/send-otp', userRegisterValidator, runValidation, sendOtp);
router.post('/verify-otp',userVerifyValidator, runValidation, verifyOtp);

module.exports = router;
