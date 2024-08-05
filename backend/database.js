const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

function dbConnect() {
    const DB_URL = process.env.DB_URL;

    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', () => {
        console.log('DB Connected...');
    });
}

module.exports = dbConnect;
