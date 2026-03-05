const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes'); // New route

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes); // Registered for Principal tasks

app.set('socketio', io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ PROJECT: SpotFix | STATUS: Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

app.get('/', (req, res) => res.send('SpotFix API is live.'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));