const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow all CORS requests for easy testing
const server = http.createServer(app);

// Socket.io configuration with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Static files (HTML, JS, CSS) serve kora
app.use(express.static(path.join(__dirname)));

// Health check endpoint jate live deployment thik thake
app.get('/healthz', (req, res) => res.send('OK'));

// Active rooms storage (RAM)
const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 1. Admin room toiri korle
  socket.on('create-room', (roomId, callback) => {
    if (rooms[roomId]) {
      callback({ success: false, message: 'Room already exists' });
    } else {
      rooms[roomId] = { admin: socket.id, member: null };
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'admin';
      console.log(`Room created: ${roomId} by Admin: ${socket.id}`);
      callback({ success: true });
    }
  });

  // 2. Member (Girlfriend) room-e join korle
  socket.on('join-room', (roomId, callback) => {
    const room = rooms[roomId];
    if (!room) {
      callback({ success: false, message: 'ভুল লিঙ্ক! সঠিক লিঙ্কে ক্লিক করুন।' });
    } else if (room.member) {
      callback({ success: false, message: 'রুমে ইতিমধ্যেই কেউ আছেন।' });
    } else {
      room.member = socket.id;
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'member';
      
      callback({ success: true });
      
      // Admin-ke notify kora hoy jate she Offer pathano shuru kore
      io.to(room.admin).emit('member-joined');
      console.log(`Member: ${socket.id} joined Room: ${roomId}`);
    }
  });

  // 3. WebRTC Signaling relay (Offer, Answer, ICE Candidates)
  // Ekhane logic thik kora hoyeche timing issue solve korte
  socket.on('offer', ({ roomId, offer }) => {
    if (rooms[roomId] && rooms[roomId].member) {
      socket.to(rooms[roomId].member).emit('offer', offer);
    }
  });

  socket.on('answer', ({ roomId, answer }) => {
    if (rooms[roomId] && rooms[roomId].admin) {
      socket.to(rooms[roomId].admin).emit('answer', answer);
    }
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  // 4. Disconnection Handling proper cleanup
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const role = socket.data.role;

    if (roomId && rooms[roomId]) {
      if (role === 'admin') {
        // Admin chole gele room delete hobe ebong member-ke notify korbe
        if (rooms[roomId].member) {
          io.to(rooms[roomId].member).emit('admin-left');
        }
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted because Admin left.`);
      } else if (role === 'member') {
        // Member chole gele admin-ke notify korbe
        rooms[roomId].member = null;
        io.to(rooms[roomId].admin).emit('member-left');
        console.log(`Member left Room: ${roomId}`);
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
