const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');


// Load environment variables dynamically
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);

app.set('socketio', io);

// --- SPOTFIX DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Keep trying to send operations for 5 seconds
})
  .then(() => {
    console.log('--------------------------------------');
    console.log('✅ PROJECT: SpotFix');
    console.log('✅ TEAM: The Architects');
    console.log('✅ STATUS: MongoDB Connected Successfully');
    console.log('--------------------------------------');

    // Root Route
    app.get('/', (req, res) => {
      res.send('SpotFix API by The Architects is live.');
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection FATAL Error:', err);
    process.exit(1); // Exit if DB fails to connect
  });