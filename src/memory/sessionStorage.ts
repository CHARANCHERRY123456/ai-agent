export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// sessionid : [messages]
const sessionMemory: Map<string, Message[]> = new Map();
const MAX_MESSAGES_PER_SESSION = 50;

export const addMessageToSession = (sessionId: string, role: Message['role'], content: string) => {
  const messages = sessionMemory.get(sessionId) || [];
  messages.push({ role, content });
  
  if (messages.length > MAX_MESSAGES_PER_SESSION) {
    messages.splice(0, messages.length - MAX_MESSAGES_PER_SESSION);
  }
  
  sessionMemory.set(sessionId, messages);
  
  if (sessionMemory.size > 100) {
    const oldestSession = sessionMemory.keys().next().value;
    if (oldestSession) {
      sessionMemory.delete(oldestSession);
    }
  }
};

export const getLastNMessages = (sessionId: string, n: number): Message[] => {
  const messages = sessionMemory.get(sessionId) || [];
  return messages.slice(-n);
};
