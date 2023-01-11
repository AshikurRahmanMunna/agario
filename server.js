const express = require("express");
const cors = require('cors');
const socketio = require("socket.io");
const app = express();

const PORT = process.env.PORT || 5000;

// application middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
    res.send("Express server is running");
})

const expressServer = app.listen(PORT, () => {
    console.log("Agar clone is running on port ", PORT);
})

const io = socketio(expressServer);

io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} has connected`);
})

module.exports = {
    io,
    app
}