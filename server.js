const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(path.join(__dirname)));

app.get('/healthz', (req, res) => res.send('OK'));

const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('create-room', (roomId, callback) => {
    if (rooms[roomId]) callback({ success: false, message: 'Room exists' });
    else {
      rooms[roomId] = { admin: socket.id, member: null };
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'admin';
      callback({ success: true });
    }
  });

  socket.on('join-room', (roomId, callback) => {
    const room = rooms[roomId];
    if (!room) callback({ success: false, message: 'Room does not exist' });
    else if (room.member) callback({ success: false, message: 'Room already has a member' });
    else {
      room.member = socket.id;
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'member';
      callback({ success: true });
      io.to(room.admin).emit('member-joined');
    }
  });

  socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', offer));
  socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', answer));
  socket.on('ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('ice-candidate', candidate));

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      if (rooms[roomId].admin === socket.id) {
        if (rooms[roomId].member) io.to(rooms[roomId].member).emit('admin-left');
        delete rooms[roomId];
      } else if (rooms[roomId].member === socket.id) {
        rooms[roomId].member = null;
        io.to(rooms[roomId].admin).emit('member-left');
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));