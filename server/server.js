const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

mongoose.connect(process.env.LOCAL_DATABASE_URL);

mongoose.connection.on('connected', () => {
    console.log("Database Connected");
});

// Routes
const authRoute = require('./routes/auth');

// MiddleWares
app.use('/api', authRoute);

let port = process.env.PORT || 3300;

app.listen(port, console.log(`Server Started on port: ${port}`));
