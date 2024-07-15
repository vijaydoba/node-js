const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 5500;

let waitingUser = null;
let connectedUsers = {}; // To store connected sockets

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('startChat', () => {
        if (waitingUser) {
            // Pair the current socket with the waiting user
            io.to(waitingUser.id).emit('paired', socket.id);
            io.to(socket.id).emit('paired', waitingUser.id);
            connectedUsers[socket.id] = waitingUser.id;
            connectedUsers[waitingUser.id] = socket.id;
            waitingUser = null;
        } else {
            // Put the current socket in the waiting queue
            waitingUser = socket;
            socket.emit('waiting');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const opponentId = connectedUsers[socket.id];
        if (opponentId) {
            // Notify opponent to go to home page
            io.to(opponentId).emit('opponentLeft');
            delete connectedUsers[socket.id];
            delete connectedUsers[opponentId];
        }
        if (waitingUser && waitingUser.id === socket.id) {
            waitingUser = null;
        }
    });

    socket.on('message', ({ to, message }) => {
        io.to(to).emit('message', { from: socket.id, message });
    });

    socket.on('newChat', () => {
        const opponentId = connectedUsers[socket.id];
        if (opponentId) {
            io.to(opponentId).emit('newChat');
            io.to(socket.id).emit('newChat');
            delete connectedUsers[socket.id];
            delete connectedUsers[opponentId];
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
