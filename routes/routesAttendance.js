const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { query, validationResult, body } = require("express-validator");
const Attendance = require("../models/Attendance");
const User = require("../models/UserModal");
const Subjects = require("../models/Subjects");
const fetchuser = require("../middleware/fetchUser");
const { parse } = require("date-fns");

router.post("/getsubjects", fetchuser, async (req, res) => {
    try {
        const all_subjects = await Subjects.find(); // Assuming Subjects is your mongoose model
        return res.status(200).json({ results: all_subjects });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: "Something Went Wrong" });
    }
});

router.post(
    "/markattendance",
    fetchuser,
    [
        body("student_id").isArray(),
        body("subject_id").exists(),
        body("date").exists(),
        body("time").exists(),
        body("section").exists(),
        body("year").exists(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            let errorsArray = [];
            if (!errors.isEmpty()) {
                console.log(errors);
                errorsArray = errors
                    .array()
                    .map((error) => ({ errors: error.msg, field: error.path }));
                return res.status(400).json(errorsArray);
            }
            const user = await User.findById(req.user.id);
            if (user.user_type !== "Faculty") {
                return res.status(401).json({ errors: "Permission Denied" });
            }
            let student_ids = req.body.student_id;
            if (student_ids.length < 1) {
                return res.status(400).json({ errors: "No Students Selected" });
            }
            const { date, year, section, student_id, subject_id } = req.body;
            let { time } = req.body;
            const validTime = time.split(":").map((str) => parseInt(str));
            if (
                validTime.length === 2 &&
                !isNaN(validTime[0]) &&
                !isNaN(validTime[1])
            ) {
                const formattedTime = parse(
                    `${validTime[0].toString().padStart(2, "0")}:${validTime[1]
                        .toString()
                        .padStart(2, "0")}`,
                    "HH:mm",
                    new Date()
                );
                time = formattedTime;
            } else {
                // Handle invalid time format
                console.error("Invalid time format");
            }
            if (subject_id.length < 1) {
                return res.status(400).json({ errors: "Please Select a Subject" });
            }
            const attendanceRecords = await Attendance.create(
                student_id.map((student) => ({
                    student_id: student,
                    year: year,
                    section: section,
                    date: date,
                    time: time,
                    subject_id: subject_id,
                    faculty_id: req.user.id,
                }))
            );
            return res
                .status(200)
                .json({ message: "Attendance marked successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: "Something Went Wrong" });
        }
    }
);

router
    .route("/viewattendance")
    .post(fetchuser, async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (user.user_type === "Faculty") {
                const attendances = await Attendance.find({ faculty_id: req.user.id });
                return res.status(200).json({ results: attendances });
            }
            let attendances = await Attendance.find({ student_id: req.user.id });
            const { subject_id, date } = req.body;
            if (subject_id) {
                attendances = attendances.filter((attendance) => {
                    return attendance.subject_id.equals(
                        new mongoose.Types.ObjectId(subject_id)
                    );
                });
            }
            if (date) {
                attendances = attendances.filter((attendance) => {
                    let unformattedTimeDate = attendance.date.toISOString().split("T")[0];
                    let dd = unformattedTimeDate[8] + unformattedTimeDate[9];

                    if (dd.length === 1) {
                        dd = "0" + dd;
                    }

                    unformattedTimeDate = `${dd}/${unformattedTimeDate[5]}${unformattedTimeDate[6]}/${unformattedTimeDate[0]}${unformattedTimeDate[1]}${unformattedTimeDate[2]}${unformattedTimeDate[3]}`;
                    let new_date = date;               
                    if (new_date[1] === '/'){
                        new_date = `0${date[0]}${date[1]}${date[2]}${date[3]}${date[4]}${date[5]}${date[6]}${date[7]}${date[8]}`
                    }
                    return unformattedTimeDate === new_date;
                });
            }

            return res.status(200).json({ results: attendances });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: "Something Went Wrong" });
        }
    })
    .delete(fetchuser, async (req, res) => {
        try {
            const { attendance_id } = req.body;
            if (!attendance_id) {
                return res.status(400).json({ message: "No Attendance Selected" });
            }
            const user = await User.findById(req.user.id);
            if (user.user_type !== "Faculty") {
                return res.status(401).json({ message: "Permission Denied" });
            }
            const attendance = await Attendance.findById(attendance_id);
            if (!attendance) {
                return res.status(404).json({ message: "Attendance not found" });
            }
            await Attendance.deleteOne({ _id: attendance_id });

            return res.status(200).json({ message: "Deleted Successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: "Something Went Wrong" });
        }
    });

module.exports = router;
