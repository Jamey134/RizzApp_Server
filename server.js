require('dotenv').config();
require('./config/mongoose.config');

const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT;
// const path = require("path"); //<--- deployment

const { notFound, errorHandler } = require("../server/middleware/errorMiddleware")

app.use(express.json()); //Allows app to accept json
app.use(express.urlencoded({ extended: true })); //Allows app to read json
app.use(cors())

//connects ther server to the routes section. Therefore, attaching all of the routes.

const routeBridgeUser = require("./routes/user.routes")
routeBridgeUser(app);
const routeBridgeChat = require("./routes/chat.routes")
routeBridgeChat(app);
const routeBridgeMessage = require("./routes/message.routes")
routeBridgeMessage(app);

// ------------------------------Deployment------------------------------ //
// const __dirname1 = path.resolve();
// if(process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname1, "/client/build")));

//     app.get("*", (req, res) => {
//         res.sendFile()
//     })
// } else {
//     app.get("/", (req, res)=> {
//         res.send("API IS RUNNING WELL!");
//     });
// }
// ------------------------------Deployment------------------------------ //

const server = app.listen(port, () => console.log("---------> SERVER IS ONLINE!!! port = ", port));

// socket.io setup
const io = require("socket.io")(server, {

    pingTimeout: 60000, // pingTimeout is the amount of time it will wait while being inactive, thus closing the connection to save bandwidth
    cors: {
        origin: "http://localhost:3000",
    },
});

app.use(notFound);
app.use(errorHandler);



io.on("connection", (socket) => {
    console.log("CONNECTED TO SOCKET.IO");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");

    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined!");

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});