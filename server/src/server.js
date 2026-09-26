import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database, then spin up the server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections (e.g., bad connection string after startup)
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();