const express = require("express");
const router = express.Router();
require('dotenv').config()
const { query, validationResult, body } = require("express-validator");
const User = require("../models/UserModal");
const SECRET_KEY = process.env.SECRET_KEY
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SIGNATURE = process.env.JWT_SIGNATURE
const fetchuser = require("../middleware/fetchUser");

router.post(
    "/getuser",
    [
        body("email")
            .isEmail()
            .custom((value) => {
                if (!value.includes("@acropolis.in")) {
                    throw new Error("Invalid Email");
                }
                return true;
            }),
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
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(200).json({ results: true });
            }
            return res.status(200).json({ results: false });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Something Went Wrong" });
        }
    }
);

router.post(
    "/registeruser",
    [
        body("email")
            .isEmail()
            .custom((value) => {
                if (!value.includes("@acropolis.in")) {
                    throw new Error("Invalid Email");
                }
                return true;
            }),
        body("first_name").exists(),
        body("last_name").exists(),
        body("password").exists(),
        body("password2").exists(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            let errorsArray = [];
            // const sectionMap = {
            //     'CD': 'DS',  // CD maps to DS
            //     'IO': 'IOT', // IO maps to IOT
            //     // Add more mappings as needed
            //   };
            if (!errors.isEmpty()) {
                console.log(errors);
                errorsArray = errors
                    .array()
                    .map((error) => ({ errors: error.msg, field: error.path }));
                return res.status(400).json(errorsArray);
            }
            const { email, first_name, last_name, password, password2 } = req.body;
            if (email) {
                const fetch_user = await User.findOne({ email: email });
                if (fetch_user) {
                    return res.status(400).json({ message: "User Already Exists" });
                }
            }
            if (password.length < 8) {
                return res.status(400).json({ message: "Password Too Small" });
            }
            if (password !== password2) {
                return res
                    .status(400)
                    .json({ message: "Passwords Fields Don't Match" });
            }
            const userType = /\d/.test(email) ? "Student" : "Faculty";
            let enrollment_number, year, section,secret_key;
            if (userType === 'Faculty'){
                if (req.body.secret_key !== SECRET_KEY){
                    return res
                        .status(400)
                        .json({ message: "Invalid Secret Key" });
                }
                enrollment_number = '2112121212'
            }
            if (userType === "Student") {
                if (!req.body.enrollment_number) {
                    return res
                        .status(400)
                        .json({ message: "Enrollment Number is Mandatory for Students" });
                }
                if (req.body.enrollment_number.length < 12){
                    return res
                        .status(400)
                        .json({ message: "Invalid Enrollment Number" });
                }
                const student_fetch_user = await User.findOne({ enrollment_number: req.body.enrollment_number });
                if (student_fetch_user) {
                    return res.status(400).json({ message: "Enrollment Number Already Exists" });
                }
                if (!req.body.year) {
                    year = "3";
                    // return res.status(400).json({message:"Year is Mandatory for Students"});
                }
                if (!req.body.section) {
                    // Extract the section code from the enrollment number
                    // const code = req.body.enrollment_number.substring(4, 6);
                    section = "DS";
                    // Use the hashmap to get the corresponding section
                    // section = sectionMap[code] || "Unknown";
                }
                ({ enrollment_number, year, section } = req.body);
                if (enrollment_number) {
                    const student = await User.findOne({
                        enrollment_number: enrollment_number,
                    });
                    if (student) {
                        return res
                            .status(400)
                            .json({ message: "Enrollment Number Already Exists" });
                    }
                }
            }

            const salt = await bcrypt.genSalt(10);
            const SecPassword = await bcrypt.hash(req.body.password, salt);
            const user = new User({
                email: email,
                first_name: first_name,
                last_name: last_name,
                user_type: userType,
                password: SecPassword,
                enrollment_number: enrollment_number,
                year: year,
                section: section,
            });
            const createdUser = await user.save();
            let userObject = createdUser.toObject();
            delete userObject.password;
            if (userType === "Faculty") {
                delete userObject.enrollment_number;
                delete userObject.year;
                delete userObject.section;
            }
            return res.status(200).json({ results: userObject });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .custom((value) => {
                if (!value.includes("@acropolis.in")) {
                    throw new Error("Invalid Email");
                }
                return true;
            }),
        body("password").exists(),
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
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(400).json({ errors: "Wrong Credentials" });
            }
            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return res.status(400).json({ errors: "Wrong Credentials" });
            }
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SIGNATURE);
            res.status(200).json({ results: authToken, message: "Logged In",user_type:user.user_type});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.post("/verifyuser", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: "Something went wrong" });
    }
});

router.post('/getallusers', fetchuser, async (req, res) => {
    try {
        const all_users = await User.find();
        const filtered_users = all_users.filter((user)=>(user.user_type === 'Student'));
        return res.status(200).json({ results: filtered_users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: "Something Went Wrong" });
    }
});

module.exports = router;
