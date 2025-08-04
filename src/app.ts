import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', (req, res) => {
  res.status(200).json({ message : 'Congrats bro your app is working fine' });
});

export default app;