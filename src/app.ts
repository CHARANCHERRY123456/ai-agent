import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import agentRouter from './routes/agent';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/agent', agentRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.use('/', (req, res) => {
  res.status(200).json({ message : 'AI Agent API is running successfully' });
});


app.use(errorHandler)

export default app;