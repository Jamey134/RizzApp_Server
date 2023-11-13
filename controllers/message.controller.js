const asyncHandler = require("express-async-handler");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");

module.exports = {
    sendMessage: asyncHandler(async (req, res) => {
        // Extract content and chatId from the request body
        const { content, chatId } = req.body;

        // Check if either content or chatId is missing in the request
        if (!content || !chatId) {
            console.log("Invalid data passed into request");

            // Respond with a 400 Bad Request status and an error message
            return res.status(400).json({ error: "Invalid data passed into the request" });
        }

        // Create a new message object
        var newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId,
        };

        try {
            // Create a new message using the Message model
            var message = await Message.create(newMessage);

            // Populate sender, chat, and users for the message
            message = await message.populate("sender", "name profilePic");
            message = await message.populate("chat");
            message = await User.populate(message, {
                path: "chat.users",
                select: "name email profilePic",
            });

            // Update the latestMessage field in the associated chat
            await Chat.findByIdAndUpdate(req.body.chatId, {
                latestMessage: message,
            });

            // Respond with the created message
            res.json(message);
        } catch (error) {
            // Handle any errors that occur during message creation
            // Set the response status to 400 and provide an error response
            res.status(400).json({ error: error.message });
        }
    }),

    allMessages: asyncHandler(async (req, res) => {
        try {
            // Retrieve all messages associated with a specific chat
            const messages = await Message.find({ chat: req.params.chatId })
                .populate("sender", "name profilePic email")
                .populate("chat");

            // Respond with the retrieved messages
            res.json(messages);
        } catch (error) {
            // Handle errors that may occur during message retrieval
            // Set the response status to 400 and provide an error response
            res.status(400).json({ error: error.message });
        }
    })
    };
