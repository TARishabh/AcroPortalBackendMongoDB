const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    enrollment_number: { type: String, max: 15,required:false },
    first_name: { type: String, required: true, max: 20 },
    last_name: { type: String, required: true, max: 20 },
    section: { type: String, enum: ['IT-1', 'IT-2', 'IOT', 'DS'],required:false },
    year: { type: String, enum: ['I', 'II', 'III', 'IV'],required:false },
    email: { type: String, required: true, unique: true },
    password: {type:String,required: true,},
    user_type: { type: String, default: 'Student', required: true },
    login_otp: { type: String, max: 6,required:false },
    is_deleted: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;