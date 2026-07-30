import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import logRoutes from './routes/logRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Nexus Knowledge Hub API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/logs', logRoutes);

// Start Express Server
app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Nexus Knowledge Hub Backend Running`);
  console.log(`📡 Server Port: http://localhost:${config.port}`);
  console.log(`🔒 Security RBAC Engine: Active`);
  console.log(`🌲 Pinecone / Vector Index Engine: Active`);
  console.log(`📧 SMTP Email Transport: Ready`);
  console.log(`=======================================================`);
});
