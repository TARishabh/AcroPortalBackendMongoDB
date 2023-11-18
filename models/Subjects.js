const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
    name: {type: String, required: true},
    code: {type: String, required: true},
    section: { type: String, enum: ['IT-1', 'IT-2', 'IOT', 'DS'],required:true },
    is_deleted: { type: Boolean, default: false },
});


const Subjects = mongoose.model('Subjects', SubjectsSchema);

module.exports = Subjects;