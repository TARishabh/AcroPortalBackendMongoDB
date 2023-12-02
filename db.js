const mongoose = require('mongoose');
require('dotenv').config()

const mongoURI = process.env.mongoURI

const connectToMongo = async () =>{
    try {
        await mongoose.connect(mongoURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connection to MongoDB successful");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

module.exports = connectToMongo;