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

    addMessageToSession(session_id, 'user', message);

    const history = getLastNMessages(session_id, 2);

    const topChunks = await getTopKRelevantChunks(message, 3);

    const pluginResults = await pluginManager.executePlugins(message);
    const formattedPluginResults = pluginManager.formatPluginResults(pluginResults);

    const prompt = buildPrompt(message, history, topChunks, formattedPluginResults);

    const aiResponse = await generateResponse(prompt);

    addMessageToSession(session_id, 'assistant', aiResponse);
    
    res.json({ reply: aiResponse });
  } catch (err) {
    next(err);
  }
});

export default agentRouter;
