import express from 'express';
import { addMessageToSession, getLastNMessages } from '../memory/sessionStorage';

const agentRouter = express.Router();

agentRouter.post('/message', async (req, res, next) => {
  try {
    const { message, session_id } = req.body;
    if (!message?.trim() || !session_id?.trim()) {
      return res.status(400).json({ error: 'message and session_id are required' });
    }

    addMessageToSession(session_id, 'user', message);

    const history = getLastNMessages(session_id, 2);

    const memoryPreview = history.map((m) => `[${m.role}]: ${m.content}`).join('\n');
    const reply = `Memory:\n${memoryPreview}\n\n Reply: [llm response here]`;

    addMessageToSession(session_id, 'assistant', reply);
    
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

export default agentRouter;
