import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import logRoutes from './routes/logRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Endpoint for Cloud Deployments (Render / Vercel)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Enterprise Knowledge Assistant API',
    version: '1.0.0',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Enterprise Knowledge Assistant API',
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
app.use('/api/leave', leaveRoutes);

// Start Express Server
const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || config.port || '5000', 10);

app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Enterprise Knowledge Assistant Backend Running`);
  console.log(`📡 Bound Server: http://${HOST}:${PORT}`);
  console.log(`🔒 Security RBAC Engine: Active`);
  console.log(`🌲 Pinecone / Vector Index Engine: Active`);
  console.log(`📧 SMTP Email Transport: Ready`);
  console.log(`=======================================================`);
});

export default app;
