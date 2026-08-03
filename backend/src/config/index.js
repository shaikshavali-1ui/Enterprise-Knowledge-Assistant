import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
} else {
  dotenv.config();
}

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'enterprise_rag_secret_key_2026_super_secure',
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeEnvironment: process.env.PINECONE_ENV || 'us-east-1-aws',
  pineconeIndex: process.env.PINECONE_INDEX || 'enterprise-docs',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'Enterprise HR Assistant',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'assistant@enterprise.corp'
  }
};
