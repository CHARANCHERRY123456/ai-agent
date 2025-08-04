// just for testing i will updagte it soon
import express from 'express';

const router = express.Router();

router.post('/message', async (req, res, next) => {
  try {
    const { message, session_id } = req.body;
    if (!message?.trim() || !session_id?.trim()) {
      return res.status(400).json({ error: 'message and session_id are required' });
    }
    res.json({ reply: `Received: "${message}" in session: ${session_id}` });
  } catch (err) {
    next(err);
  }
});

export default router;