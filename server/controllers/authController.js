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
    
    async sendOtp(req, res) {

        const { name, phone } = req.body;
        
        User.findOne({ phone }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    message: 'Number is already Taken',
                });
            }
            if(err) console.log(err);

            const otp = crypto.randomInt(1000, 9999);

            const token = jwt.sign({ otp }, process.env.JWT_SECRET, { expiresIn: '10min' });

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

    async verifyOtp(req, res) {

        const { name, phone, password, userOtp, userToken } = req.body;

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
    }
}

module.exports = new AuthController();
