import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const activeUsers = {};

io.on('connection', (socket) => {
    // Give them a random orbit start position
    activeUsers[socket.id] = { id: socket.id, position: [0, 10, 0], action: 'idling', islandId: null };
    io.emit('usersUpdated', Object.values(activeUsers));

    socket.on('mousemove', (pos) => {
        if (activeUsers[socket.id]) {
            activeUsers[socket.id].position = pos;
            activeUsers[socket.id].action = 'moving';
            io.emit('usersUpdated', Object.values(activeUsers));
        }
    });

    socket.on('clickIsland', (islandId) => {
        if (activeUsers[socket.id]) {
            activeUsers[socket.id].action = 'inspecting';
            activeUsers[socket.id].islandId = islandId;
            io.emit('usersUpdated', Object.values(activeUsers));
        }
    });

    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
        io.emit('usersUpdated', Object.values(activeUsers));
    });
});

server.listen(4000, () => {
    console.log('Ghost Avatar Multiplayer WebSocket listening on *:4000');
});
