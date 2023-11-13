const ChatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/authMiddleware');

module.exports = app => {
    app.post("/api/chat", protect, ChatController.accessChat)
    
    app.get("/api/chat", protect, ChatController.fetchChats)
    
    app.post("/api/chat/group", protect, ChatController.createGroupChats)
    
    app.put("/api/chat/rename", protect, ChatController.renameGroup)
    
    app.put("/api/chat/addGroup", protect, ChatController.addToGroup)

    app.put("/api/chat/removeGroup", protect, ChatController.removeFromGroup)
};






