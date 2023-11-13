const MessageController = require("../controllers/message.controller");
const { protect } = require('../middleware/authMiddleware');

module.exports = app => {
    app.post("/api/message", protect, MessageController.sendMessage)

    app.get("/api/message/:chatId", protect, MessageController.allMessages)

};