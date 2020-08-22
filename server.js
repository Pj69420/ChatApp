if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", error => console.log(error));
db.once("open", () => console.log("Connected to Mongoose"));
const users = {};

const history = [];

io.on("connection", socket => {
    socket.on("new-user-joined", name => {
        history.push({ "name": name, "message": "has joined the chat.", "class": "center" });
        users[socket.id] = name;
        socket.broadcast.emit("user-joined", name);
        socket.emit("load", history);
    });

    socket.on("image", image => {
        socket.broadcast.emit("image-send", image);
        history.push({ "name": image.name, "message": "image", "class": "left", "file": image.file });
    });

    socket.on("send", data => {
        socket.broadcast.emit("receive", { message: data.message, name: users[socket.id] });
        history.push({ "name": data.name, "message": data.message, "class": "left" });
    });

    socket.on("disconnect", () => {
        history.push({ "name": users[socket.id], "message": "has left the chat.", "class": "center" });
        socket.broadcast.emit("left", users[socket.id]);
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

