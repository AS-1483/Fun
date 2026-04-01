const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname)));

const rooms = {};

io.on('connection', (socket) => {
  socket.on('create-room', (roomId, callback) => {
    rooms[roomId] = { admin: socket.id, member: null };
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = 'admin';
    callback({ success: true });
  });

  socket.on('join-room', (roomId, callback) => {
    const room = rooms[roomId];
    if (room && !room.member) {
      room.member = socket.id;
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'member';
      callback({ success: true });
      io.to(room.admin).emit('member-joined'); // Admin-ke offer trigger korte bole
    } else {
      callback({ success: false, message: room ? 'রুম ফুল' : 'রুম পাওয়া যায়নি' });
    }
  });

  socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', offer));
  socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', answer));
  socket.on('ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('ice-candidate', candidate));

  socket.on('disconnect', () => {
    const { roomId, role } = socket.data;
    if (roomId && rooms[roomId]) {
      if (role === 'admin') {
        io.to(roomId).emit('admin-left');
        delete rooms[roomId];
      } else {
        rooms[roomId].member = null;
        io.to(rooms[roomId].admin).emit('member-left');
      }
    }
  });
});

server.listen(3000, () => console.log('Server: http://localhost:3000'));
