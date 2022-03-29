const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: '*' }));

mongoose.connect(process.env.LOCAL_DATABASE_URL);

mongoose.connection.on('connected', () => {
    console.log("Database Connected \u{1F525}");
});

// Routes
const authRoute = require('./routes/auth');
// const userRoute = require('./routes/user');

// MiddleWares
app.use('/api', authRoute);
// app.use('/api', userRoute);

let port = process.env.PORT || 3300;

app.listen(port, console.log(`Server Started on port: ${port} \u{1F525}\u{1F680}`));
