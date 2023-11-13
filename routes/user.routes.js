const UserController = require('../controllers/user.controller');
//const { registerUser, authUser, allUsers } = require("../controllers/user.controller");
const { protect } = require('../middleware/authMiddleware');


module.exports = app => {
    app.get("/api/user/test", UserController.testTest);
    
    app.post("/api/user",  UserController.registerUser,); 
    
    app.post("/api/user/login", UserController.authUser);

    app.get("/api/user", protect, UserController.allUsers); // "Protect" is used to import the middleware
    
}