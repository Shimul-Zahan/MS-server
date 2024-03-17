const express = require("express");
require("dotenv").config();
const router = express.Router();
const multer = require("multer");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const UPLOAD_FOLDER = "./public/image";
const fs = require("fs");
const path = require("path");
const { log } = require("console");
const bcrypt = require('bcrypt');
const transporter = require('../Utils/mail_transporter');
const User = require("../Schema/userSchema");

//! -----------multer for image upload------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        if (file) {
            const fileExt = path.extname(file.originalname);
            const fileName =
                file.originalname
                    .replace(fileExt, "")
                    .toLowerCase()
                    .split(" ")
                    .join("-") +
                "-" +
                Date.now();
            console.log("🚀 ~ fileName:", fileName);
            cb(null, fileName + fileExt);
        }
    },
});

var upload = multer({
    storage: storage,
});


//!----------- registration route-------------
router.post('/resgistration', upload.single('image'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(name, email, password);
        const useremail = await User.findOne({ email });
        if (useremail) {
            return res.status(400).json({ message: 'Eamil alreay uses. Try again with new email' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(otp);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            email,
            password: hashedPassword,
            name,
            role: 'user',
            otp,
            image: req.file.filename,
        }).save();
        const info = await transporter.sendMail({
            from: '"Fred Foo 👻" <testmail@gmail.com>',
            to: `${email}`,
            subject: "Hello ✔",
            text: "Confirmation email",
            html: `
                <b>Hello ${name}. Please confirm your otp.</b>
                <b>Your confirmation code is</b>
                <h1>${otp}</h1>
            `,
        });
        res.status(200).json({ message: 'successfully created', newUser });
    } catch (error) {
        console.log(error?.message);
    }
});

// !------------OTP Verification----------
router.post('/otp-verification', async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findOne({ otp });
        if (!user) {
            return res.status(401).json({ message: 'otp didn"t match' });
        }
        console.log(user);
        const result = await User.updateOne({ _id: user._id }, { verifyEmail: true });
        return res.status(200).json({ message: 'successfully verify email. have a good day', success: true })
    } catch (error) {
        console.log(error);
    }
})

//! -----------login route----------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'email didn"t match' });
        }
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.json({ message: 'password didn"t match' });
            }
        }
        const token = jwt.sign(user.email, 'dngfnjnxjmcxnxcn');
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        }).json({
            email: user.email,
            token,
            role: user.role,
            login: true,
        })
    } catch (error) {
        console.log(error);
    }
})

//!-----------reset password----------
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not exist.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const info = await transporter.sendMail({
            from: '"Fred Foo 👻" <testmail@gmail.com>',
            to: `${email}`,
            subject: "Hello ✔",
            text: "Password reset.",
            html: `
                <b>Hello ${user.name}. Please confirm your otp.</b>
                <b>Please cheek mail and verify otp and reset password.</b>
                <h1>${otp}</h1>
            `,
        });
        const result = await User.updateOne({ _id: user._id }, { otp });
        console.log(result);
        res.status(200).json({ message: 'Please cheek mail and verify otp and reset password.' });
    } catch (error) {
        console.log(error?.message);
    }
});

module.exports = router;