if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  maxHttpBufferSize: 1e20,
  pingTimeout: 7000,
  cors: {
    origin: "*", // TODO: fix cors to trusted domains only
  },
});
const { nanoid, customAlphabet } = require("nanoid");
const roomIdGen = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
const { text, query } = require("express");
const e = require("cors");
app.use(express.urlencoded({ extended: false, limit: "150mb" }));
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/client/dist"));

// socket logic

const rooms = ["AVI008"];
const personalRooms = [];
const chatRooms = [];

// ! Room check
app.post("/api/room", (req, res) => {
  if (rooms.includes(req.query.code)) {
    res.json(true);
  } else {
    res.json(false);
  }
});

app.post("/api/create", (req, res) => {
  const id = roomIdGen();
  rooms.push(id);
  personalRooms.push({ name: id, members: 0 });
  res.send({ status: 200, id: id });
  console.log(rooms);
});

app.post("/api/create/group", (req, res) => {
  const id = roomIdGen();
  rooms.push(id);
  chatRooms.push({ name: id, members: 0 });
  res.send({ status: 200, id: id });
  console.log(rooms);
});

//  ! SOCKETS
io.on("connection", async (socket) => {
  let room = await socket.handshake.query.room;
  let name = await socket.handshake.query.name;
  let group = await socket.handshake.query.group;
  console.log("got connection from ", name, room, group);
  // ! connect and auth
  if (rooms.includes(room)) {
    if (group === true) {
      socket.join(room);
      socket.to(room).emit("text", `${name} connected`);
    } else {
      if (personalRooms.findIndex((e) => e.name === room) >= 0) {
        const num = personalRooms.find((e) => (e.name = room));
        if (num.members < 2) {
          socket.join(room);
          num.members += 1;
          socket.to(room).emit("text", `${name} connected`);
        } else {
          io.in(socket.id).emit("back");
        }
      } else {
        socket.join(room);
        socket.to(room).emit("text", `${name} connected`);
      }
    }
  }
  // ! socket msg handling
  socket.on("msg", (data) => {
    socket.to(data.room).emit("text", data.msg);
  });
});

http.listen(process.env.PORT || 8081, () => {
  console.log(`Started server at ${process.env.PORT}`);
});
