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
const { nanoid } = require("nanoid");
const { text } = require("express");
app.use(express.urlencoded({ extended: false, limit: "150mb" }));
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/client/dist"));

// socket logic

const rooms = ["AVI008"];
const users = {
  AVI008: [],
};

// io.on("connection", (socket) => {
//   if (users.AVI008.length < 2) {
//     console.log("got connection");
//     socket.join(rooms[0]);
//     users.AVI008.push(socket.id);
//   }
//   socket.on('cred', (data) => {
//     console.log(data.name, data.room);
//     io.emit('text',`${data.name} connected`);
//   })
//   socket.on("msg", (data) => {
//       if (users.AVI008.find(room => room === socket.id)) {
//         socket.to("AVI008").emit("text", data);
//       }
//   });
// });
//  TODO: implement middleware to auth
io.on("connection", (socket) => {
  console.log("got connection", socket.handshake.query);
  if (rooms.find(room => room === socket.handshake.query.room)) {
    socket.join(socket.handshake.query.room);
    socket.to(socket.handshake.query.room).emit("text", `${socket.handshake.query.name} connected`);
  }
  // TODO: join room accordingly
  socket.on("msg", (data) => {
    // if (users.AVI008.find((room) => room === socket.id)) {
      socket.to(data.room).emit("text", data.msg);
    // }
  });
});

http.listen(process.env.PORT || 8081, () => {
  console.log(`Started server at ${process.env.PORT}`);
});
