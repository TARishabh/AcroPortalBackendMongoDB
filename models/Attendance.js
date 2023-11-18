const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'User', null: true, blank: true },
    faculty_id: { type: Schema.Types.ObjectId, ref: 'User', null: true, blank: true },
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subjects', null: true, blank: true },
    created_at: { type: Date, default: Date.now },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    section: { type: String, enum: ['IT-1', 'IT-2', 'IOT', 'DS'], null: true, blank: true },
    year: { type: String, enum: ['I', 'II', 'III', 'IV'], null: true, blank: true },
    is_deleted: { type: Boolean, default: false }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
