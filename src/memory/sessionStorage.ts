type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// sessionid : [messages]
const sessionMemory: Map<string, Message[]> = new Map();

export const addMessageToSession = (sessionId: string, role: Message['role'], content: string) => {
  const messages = sessionMemory.get(sessionId) || [];
  messages.push({ role, content });
  console.log(messages);
  sessionMemory.set(sessionId, messages);
};

export const getLastNMessages = (sessionId: string, n: number): Message[] => {
  const messages = sessionMemory.get(sessionId) || [];
  return messages.slice(-n);
};
