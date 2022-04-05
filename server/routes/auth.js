const router = require('express').Router();
const { sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp } = require('../controllers/authController');


// Routes
router.post('/register/send-otp', sendRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login/send-otp',  sendLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);

module.exports = router;
