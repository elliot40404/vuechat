if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    maxHttpBufferSize: 1e20,
    pingTimeout: 7000,
    cors: { 
        origin: "*"
    }
});
const { nanoid } = require('nanoid');
app.use(express.urlencoded({ extended: false, limit: '150mb' }));
app.use(cors())
app.use(express.json());
app.use(express.static(__dirname + '/client/dist'));

io.on('connection', (socket) => {
    console.log('got connection');
    socket.on('msg', data => {
        socket.broadcast.emit('text', data);
    })
});

http.listen(process.env.PORT || 8081, () => {
    console.log(`Started server at ${process.env.PORT}`)
});