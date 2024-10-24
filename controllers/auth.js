const { validationResult } = require('express-validator');
const { Types } = require('mongoose');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Token } = require('../models/token');
const mailSender = require('../helper/email_sender');

exports.register = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return res.status(400).json({ error: errorMessage });
    }
    try {
        let user = new User({
            ...req.body,
            passwordHash: bcrypt.hashSync(req.body.password, 8)
        });
        user = await user.save();

        if (!user) {
            return res.status(500).json({
                type: 'Internal Server Error',
                message: 'Could not create a new user'
            })
        }
        return res.status(201).json(user);
        //console.info(req.body)
    } catch (error) {
        if (error.message.includes('email_1 dup key')) {
            return res.status(409).json({
                type: "AuthError",
                message: "User with that email already exists",
            })
        }
        return res.status(500).json({ type: error.name, message: error.message });
    }
};


exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, });
        if (!user) {
            return res.status(404).json({ message: "User not found\nCheck your email and try again." });
        }
        if (!bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(400).json({ message: "Incorrect password!" });
        }

        const accessToken = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' },
        );

        const refreshToken = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '60d' },
        );

        const token = await Token.findOne({ userId: user.id });
        if (token) await token.deleteOne();
        await new Token({
            userId: user.id,
            accessToken,
            refreshToken: refreshToken
        }).save();

        user.passwordHash = undefined;
        return res.json({ ...user._doc, accessToken })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message })
    }
};


exports.verifyToken = async function (req, res) {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) return res.json(false);
        accessToken = accessToken.replace('Bearer', '').trim()

        const token = await Token.findOne({ accessToken });
        if (!token) return res.json(false);

        const tokenData = jwt.decode(token.refreshToken);

        const user = await User.findById(tokenData.id);
        if (!user) return res.json(false);

        const isvalid = jwt.verify(
            token.refreshToken,
            process.env.REFRESH_TOKEN_SECRET);
        if (!isvalid) return res.json(false);

        return res.json(true);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message })
    }
};

exports.forgotPassword = async function (req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with that email does not exists' })
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 600000;

        await user.save();

        const response = await mailSender.sendMail(
            email,
            'Password Reset OTP',
            `Your OTP for password reset is: ${otp}`
        );

        return res.json({ message: response });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ json: error.name, message: error.message })
    }
};


exports.verifyPasswordResetOTP = async function (req, res) {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        if (user.resetPasswordOTP !== +otp ||
            Date.now() > user.resetPasswordOTPExpires) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }
        user.resetPasswordOTP = 1;
        user.resetPasswordOTPExpires = undefined;

        await user.save();
        return res.json({ message: "OTP confirmed successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
};


exports.resetPassword = async function (req, res) {
    try {
        const { email, newPassword } = req.body;
        const user = await user.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.resetPasswordOTP !== 1) {
            return res.status(401).json({ message: "Comfirm OTP before seseting password" });
        }

        user.passwordHash = bcrypt.hashSync(newPassword, 8);
        await user.save();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
};