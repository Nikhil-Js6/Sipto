const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AWS = require("aws-sdk");
const crypto = require('crypto');
const bcrypt = require("bcrypt");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

class AuthController {
    
    async sendRegisterOtp (req, res) {

        const { name, phone } = req.body;
        
        User.findOne({ phone }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    message: 'Number is already Taken',
                });
            }
            if(err) console.log(err);

            const otp = crypto.randomInt(1000, 9999);

            const token = jwt.sign({ phone, otp }, process.env.JWT_SECRET, { expiresIn: '10min' });

            const params = {
                PhoneNumber: phone,
                Message: `Your Sipto OTP is: ${otp}`,
            };
            
            const sendOtp = sns.publish(params).promise();

            sendOtp
            .then(data => {
                console.log(`Message sent to the user: ${params.PhoneNumber}`);
                res.status(200).json({
                    message: `Hello ${name}, Your OTP has been sent to ${phone}`,
                    token
                });
            })
            .catch(err => {
                console.error('SMS Failed!', err);
                res.status(400).json({
                    message: 'Could not send OTP. Please try again.'
                });
            });
        });
    }

    async verifyRegisterOtp (req, res) {

        const { name, phone, email, password, userOtp, userToken } = req.body;
        
        User.findOne({ phone }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    message: 'User is already Registered!',
                });
            }

            jwt.verify(userToken, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(400).json({
                        message: 'OTP expired. Please try again!',
                    });
                }

                const { otp } = user;

                if (otp !== +userOtp) {
                    return res.status(400).json({
                        message: 'Please enter the correct OTP',
                    });
                }

             // Creating the user:
                const username = phone.slice(3);
                const hashed_password = bcrypt.hashSync(password, 12);

                const token = jwt.sign({ name, phone, hashed_password }, process.env.JWT_SECRET, { expiresIn: '7d' });

                const newUser = new User({ name, username, phone, hashed_password });

                const savedUser = newUser.save((err, user) => {
                    if (err) {
                        return res.status(400).json({
                            message: 'Can\'t create user!',
                        });
                    }
                    res.status(201).json({
                        messsage: 'User created!',
                        user, token
                    });
                });
            });
        });
    }
    
    async sendLoginOtp (req, res) {

        const { phone } = req.body;

        User.findOne({ phone }).exec((err, user) => {
            if(!user){
                return res.status(401).json({
                    message: 'User not found!'
                });
            }
            if(err) {
                return res.status(500).json({
                    message: 'Something went wrong!'
                });
            }

            const otp = crypto.randomInt(1000, 9999);

            const token = jwt.sign({ phone, otp }, process.env.JWT_SECRET, { expiresIn: '10min' });

            const params = {
                PhoneNumber: phone,
                Message: `Your Sipto OTP is: ${otp}`,
            };
            
            const sendOtp = sns.publish(params).promise();

            sendOtp
            .then(data => {
                console.log(`Message sent to the user: ${params.PhoneNumber}`);
                res.status(200).json({
                    message: `Hello ${user.name}, Your OTP has been sent to ${phone}`,
                    token
                });
            })
            .catch(err => {
                console.error('SMS Failed!', err);
                res.status(400).json({
                    message: 'Could not send OTP. Please try again.'
                });
            });
        });
    }
    
    async verifyLoginOtp (req, res) {

        const { userOtp, userToken } = req.body;

        jwt.verify(userToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: 'OTP expired. Please try again!',
                });
            }
            
            const { phone, otp } = user;

            if (otp !== +userOtp) {
                return res.status(400).json({
                    message: 'Please enter the correct OTP',
                });
            }

            User.findOne({ phone }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        message: 'User not found!',
                    });
                }

                const { _id, name, email, phone, hashed_password } = user;

                const token = jwt.sign({ email, phone, hashed_password }, process.env.JWT_SECRET, { expiresIn: '7d' });

                return res.status(200).json({ 
                    message: `Hello ${name}, Login Success!`,
                    user: {
                        _id, name, email, phone
                    },
                    token,
                });
            });
        });
    }
    
    async login (req, res) {

        const { phone, password } = req.body;

        User.findOne({ phone }).exec((err, user) => {

            if(!user){
                return res.status(401).json({
                    message: 'User not found!'
                });
            }
            if(err) {
                return res.status(500).json({
                    message: 'Something went wrong!'
                });
            }
            
            const validPassword = bcrypt.compareSync(password, user.hashed_password);

            if(!validPassword) return res.status(401).json({
                message: 'Wrong Credentials!',
            });

            const { _id, name, email, phone } = user;
            
            const token = jwt.sign({ _id, email, phone }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return res.status(200).json({ 
                message: `Hello ${name}, Login Success!`,
                token,
                user: {
                    name, email, phone
                }
            });
        });
    }
}

module.exports = new AuthController();
