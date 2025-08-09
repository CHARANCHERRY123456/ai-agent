import express from 'express';
import { addMessageToSession, getLastNMessages } from '../memory/sessionStorage';
import { getTopKRelevantChunks, generateResponse, buildPrompt } from '../rag/embed';

const agentRouter = express.Router();

agentRouter.post('/message', async (req, res, next) => {
  try {
    const { message, session_id } = req.body;
    if (!message?.trim() || !session_id?.trim()) {
      return res.status(400).json({ error: 'message and session_id are required' });
    }

    // Add user message to session memory
    addMessageToSession(session_id, 'user', message);

    // Get conversation history (last 2 messages for context)
    const history = getLastNMessages(session_id, 2);

    // Get relevant chunks from knowledge base
    const topChunks = await getTopKRelevantChunks(message, 3);

    // Build comprehensive prompt with system instructions, memory, and RAG context
    const prompt = buildPrompt(message, history, topChunks);

    // Generate AI response using Gemini
    const aiResponse = await generateResponse(prompt);

    // Add AI response to session memory
    addMessageToSession(session_id, 'assistant', aiResponse);
    
    res.json({ reply: aiResponse });
  } catch (err) {
    next(err);
  }
});

export default agentRouter;
