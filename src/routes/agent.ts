import express from 'express';
import { addMessageToSession, getLastNMessages } from '../memory/sessionStorage';
import { getTopKRelevantChunks, generateResponse, buildPrompt } from '../rag/embed';
import { PluginManager } from '../plugins/pluginManager';

const agentRouter = express.Router();
const pluginManager = new PluginManager();

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

    // Execute plugins if needed
    const pluginResults = await pluginManager.executePlugins(message);
    const formattedPluginResults = pluginManager.formatPluginResults(pluginResults);

    // Build comprehensive prompt with system instructions, memory, RAG context, and plugin results
    const prompt = buildPrompt(message, history, topChunks, formattedPluginResults);

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
