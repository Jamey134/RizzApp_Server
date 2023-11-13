const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // <----- Name of Model
    }],

    // This is used to display the last message sent or received by the user.
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message" // <----- Name of Model
    },

    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    chatName: {
        type: String,
        trim: true,
        //required: [true, "Please provide a title"]

    },
    isGroupChat: {
        type: Boolean,
        default: false,
        //required: [true, "Please provide a price"]
    },

},
    { timestamps: true }
);

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat