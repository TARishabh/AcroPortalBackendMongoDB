const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { query, validationResult, body } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');


router.post('/markattendance', fetchuser, [
    body('student_id').isArray(),
    body('subject_id').exists(),
    body('date').exists(),
    body('time').exists(),
    body('section').exists(),
    body('year').exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        let errorsArray = [];

        if (!errors.isEmpty()) {
            console.log(errors)
            errorsArray = errors.array().map((error) => ({ errors: error.msg, field: error.path }));
            return res.status(400).json(errorsArray);
        }
        const user = await User.findById(req.user.id);
        if (user.user_type !== 'Faculty') {
            return res.status(401).json({ "message": "Permission Denied" })
        }
        let student_ids = req.body.student_id;
        if (student_ids.length < 1) {
            return res.status(400).json({ "message": "No Students Selected" })
        };
        const { date, time, year, section, student_id, subject_id } = req.body;
        const formattedTime = new Date(`${date}T${time}`);
        const attendanceRecords = await Attendance.create(
            student_id.map(student => ({
                student_id: student,
                year: year,
                section: section,
                date: date,
                time: formattedTime,
                subject_id: subject_id,
                faculty_id: req.user.id
            }))
        );
        return res.status(200).json({ "message": "Attendance marked successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "results": "Something Went Wrong" })

    }
});

router.route('/viewattendance')
    .post(fetchuser, async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (user.user_type === 'Faculty') {
                const attendances = await Attendance.find({ faculty_id: req.user.id });
                return res.status(200).json({ "results": attendances });
            }
            let attendances = await Attendance.find({ student_id: req.user.id });
            const { subject_id, date } = req.body;
            if (subject_id) {
                attendances = attendances.filter((attendance) => {
                    return attendance.subject_id.equals(new mongoose.Types.ObjectId(subject_id));
                });
            }
            if (date) {
                attendances = attendances.filter((attendance) => {
                    return attendance.date.toISOString().split('T')[0] === date;
                });
            }
            return res.status(200).json({ "results": attendances });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ "results": "Something Went Wrong" });
        }
    })
    .delete(fetchuser, async (req, res) => {
        try {
            const { attendance_id } = req.body;
            if (!attendance_id) {
                return res.status(400).json({ "message": "No Attendance Selected" });
            }
            const user = await User.findById(req.user.id);
            if (user.user_type !== 'Faculty') {
                return res.status(401).json({ "message": "Permission Denied" });
            }
            const attendance = await Attendance.findById(attendance_id);
            if (!attendance) {
                return res.status(404).json({ "message": "Attendance not found" });
            }
            await Attendance.deleteOne({ _id: attendance_id });
    
            return res.status(200).json({ "message": "Deleted Successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ "results": "Something Went Wrong" });
        }
    });

module.exports = router;