import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import the cookie-parser middleware
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js'
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();

// Enable CORS for credentials (cookies) from client
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Built-in Body Parsers & Cookie Parser
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Base Health Check Route (Good for testing initial server run)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ProjectHub API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orgs', orgRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tasks/:taskId/comments', commentRoutes);

// Fallback for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

app.use(errorHandler);

export default app;