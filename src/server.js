import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 AWS S3 Upload/Download API Server                    ║
  ║                                                           ║
  ║   Server is running on port ${PORT}                          ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                                ║
  ║                                                           ║
  ║   Health Check: http://localhost:${PORT}/health              ║
  ║   API Base URL: http://localhost:${PORT}/api                 ║
  ║                                                           ║
  ║   📝 Endpoints:                                           ║
  ║      POST   /api/auth/register                            ║
  ║      POST   /api/auth/login                               ║
  ║      POST   /api/files/upload-url                         ║
  ║      GET    /api/files/:fileId/download-url               ║
  ║      GET    /api/files                                    ║
  ║      DELETE /api/files/:fileId                            ║
  ║      GET    /api/files/:fileId/metadata                   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);
    server.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    gracefulShutdown('Unhandled Rejection');
});

export default server;
