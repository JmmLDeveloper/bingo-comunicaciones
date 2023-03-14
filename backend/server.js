const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const { assignEvents } = require("./socket-events");

const app = express();
const corsOption = {
  origin: ["http://localhost:5173"],
};
app.use(cors(corsOption));
const server = http.createServer(app);
const io = socketio(server, {
  cors: ["*"],
});

assignEvents(io);


const port = 3000;

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
