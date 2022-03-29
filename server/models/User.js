const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 3,
        max: 20,
        trim: true,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
        max: 32,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        max: 32,
    },
    hashed_password: {
        type: String,
        required: true,
    }
},
    {timestamps: true, timeseries: true},
);

module.exports = new mongoose.model("User", userSchema);
