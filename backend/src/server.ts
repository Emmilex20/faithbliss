// src/server.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { initializeSocketIO } from './socket/socket';

// 🛑 REMOVED: passport and express-session imports
// import passport from './config/passport'; 
// import session from 'express-session';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import matchRoutes from './routes/matchRoutes';
import messageRoutes from './routes/messageRoutes';
// 💡 NEW: Import the custom Firebase authentication middleware
import { protect } from './middleware/authMiddleware'; 
import uploadRoutes from './routes/uploadRoutes';
import photoRoutes from './routes/photoRoutes';


const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const httpServer = http.createServer(app);

// SOCKET.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL, // 🎯 Use the environment variable
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initializeSocketIO(io);

// 🔑 CORS & Middleware
app.use(
  cors({
    origin: CLIENT_URL, // 🎯 Use the environment variable
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], 
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 🛑 REMOVED: All session and passport setup is gone
/* app.use(session({...}));
app.use(passport.initialize());
app.use(passport.session());
*/

// MongoDB Connection (Remains unchanged)
const connectDB = async () => { 
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Health Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Server Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    service: 'Faithbliss Backend',
  });
});

// 🎯 MAIN ROUTES - APPLYING THE FIREBASE AUTH MIDDLEWARE
// Auth routes (login/register) do NOT use the middleware
app.use('/api/auth', authRoutes);

// Secure routes MUST use the 'protect' middleware
app.use('/api/users', protect, userRoutes);
app.use('/api/matches', protect, matchRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', photoRoutes);

// Central Error Handler (Remains unchanged)
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err.message);
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
      code: err.code,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT} (HTTP + WebSocket)`);
  });
});