const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const generateToken = require("../config/generateToken");

module.exports = {
    testTest: asyncHandler(async (req, res) => {
        res.json({ msg: "ITS WORKING!!!" });
    }),

    registerUser: asyncHandler(async (req, res) => {
        const { name, email, password, profilePic } = req.body;

        console.log(req.body);

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        } else {
            const user = await User.create({
                name,
                email,
                password,
                profilePic,
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    token: generateToken(user._id),
                });
            } else {
                res.status(400);
                throw new Error("Failed to create User");
            }
        }
    }),

    authUser: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error("Invalid Email or Password. Please Try Again.");
        }
    }),

    allUsers: asyncHandler(async (req, res) => {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ]
            }
            : {};

        const users = await User.find({
            ...keyword,
            _id: { $ne: req.user._id },
        });

        res.send(users);
    }),
};


//module.exports = { registerUser, authUser, testTest, allUsers };