const Chat = require("../models/chat.model")
const User = require("../models/user.model")
const asyncHandler = require("express-async-handler");




module.exports = {

    //TEST COMMAND
    // testTest: (req, res) => {
    //     res.json({msg: "ITS WORKING!!!"})
    // },

    // function for requesting one chat
    accessChat: asyncHandler(async (req, res) => {
        const { userId } = req.body

        if (!userId) {
            console.log("UserId param not sent with request");
            return res.sendStatus(400);
        }

        var isChat = await Chat.find({
            isGroupChat: false,
            //"$and" makes sure that both of the requests are true.
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        }).populate("users", "-password")
            .populate("latestMessage")

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name profilePic email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };
            try {
                const createChat = await Chat.create(chatData);

                const FullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password");

                res.status(200).send(FullChat);
            } catch (error) {
                res.status(400);
                throw new Error(error.message);
            }
        }
    }),
    // function for finding one or more chats
    fetchChats: asyncHandler(async (req, res) => {
        try {
            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }) //.then(result => res.send(result)) // This will find the chat
                .populate("users", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updated: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: "latestMessage.sender",
                        select: "name profilePic email",
                    });

                    res.status(200).send(results);
                });
        } catch (error) {
            res.status(400);
            throw new Error({message: error.message});
        }
    }),
    // function for creating a group chat
    createGroupChats: asyncHandler(async (req, res) => {
        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: "Please Fill All of The Fields" });
        }

        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res
                .status(400)
                .send("Two or more users are required");
        }

        users.push(req.user);

        try {
            const groupChat = await Chat.create({
                chatName: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user,
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate("users", "-password")
                .populate("groupAdmin", "-password");

            res.status(200).json(fullGroupChat);

        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }),
    // function for renaming a group chat
    renameGroup: asyncHandler(async (req, res) => {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId, // find ID
            {
                chatName: chatName, // updated chatName
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(updatedChat);
        }
    }),
    // function for adding someone to a group chat
    addToGroup: asyncHandler(async (req, res) => {
        const { chatId, userId } = req.body;

        // check if the user is admin in order to add another user

        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId }, // <--Updating the users' array
            },
            {
                new: true, // <-- Return the latest field
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(added);
        }
    }),
    // function to remove someone from group
    removeFromGroup: asyncHandler(async (req, res) => {
        const { chatId, userId } = req.body;

        // check if the user is admin in order to add another user

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId }, // <--Removing the users' array
            },
            {
                new: true, // <-- Return the latest field
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(removed);
        }
    }),
};







