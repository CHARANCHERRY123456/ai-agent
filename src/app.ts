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
app.use('/', (req, res) => {
  res.status(200).json({ message : 'Congrats bro your app is working fine' });
});


app.use(errorHandler)

export default app;