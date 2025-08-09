import axios from 'axios';
import { cosineSimilarity } from '../utils/cosine';
import { loadChunks } from './loadDocs';
import { Message } from '../memory/sessionStorage';

const getGeminiApiKey = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is required. Please add it to your .env file.');
  }
  return apiKey;
};

const getGeminiEmbedUrl = () => {
  return 'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=' + getGeminiApiKey();
};

const getGeminiChatUrl = () => {
  return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + getGeminiApiKey();
};

type ChunkData = { text: string; vector: number[] };
let memoryStore: ChunkData[] = [];

export const embedText = async (text: string): Promise<number[]> => {
  try {
    const response = await axios.post(getGeminiEmbedUrl(), {
      content: { parts: [{ text }] }
    });
    
    if (!response.data?.embedding?.values) {
      throw new Error('Invalid response from Gemini API');
    }
    
    return response.data.embedding.values;
  } catch (error) {
    console.error('Error embedding text:', error);
    throw new Error(`Failed to embed text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(getGeminiChatUrl(), {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Received empty response from Gemini API');
    }
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return "I'm experiencing high demand right now. Please try again in a moment.";
    } else if (error instanceof Error && error.message.includes('API key')) {
      return "I'm having trouble accessing my knowledge right now. Please check back soon.";
    }
    
    return "I apologize, but I'm having trouble generating a response right now. Could you try rephrasing your question?";
  }
};

export const buildPrompt = (
  userMessage: string,
  memoryMessages: Message[],
  ragChunks: string[],
  pluginResults?: string
): string => {
  const systemInstructions = `You're a knowledgeable assistant specializing in technology, blogging, web development, and AI concepts. You have access to a curated knowledge base and can use various tools when needed.

Communication style:
- Be conversational and helpful, like talking to a colleague
- Reference specific information from your knowledge base when relevant
- Don't mention that you're an AI or reference "training data"
- If using tools (weather, calculations), incorporate results naturally into your response
- Keep responses practical and actionable

When answering:
- Draw from your knowledge base to provide accurate, detailed information
- Use examples and practical tips when helpful
- If you're not sure about something, say so honestly
- Structure longer responses with clear sections or bullet points`;

  const contextSection = ragChunks.length > 0 
    ? `\n\nRelevant information from knowledge base:\n${ragChunks.map((chunk, i) => `${chunk.trim()}`).join('\n\n---\n\n')}`
    : '';

  const memorySection = memoryMessages.length > 0
    ? `\n\nConversation context:\n${memoryMessages.map(m => `${m.role === 'user' ? 'User' : 'You'}: ${m.content}`).join('\n')}`
    : '';

  const pluginSection = pluginResults 
    ? `\n\nTool results:\n${pluginResults}`
    : '';

  const prompt = `${systemInstructions}${contextSection}${memorySection}${pluginSection}

User asks: ${userMessage}

Response:`;

  return prompt;
};

export const loadAndEmbedChunks = async () => {
  try {
    const chunks = loadChunks();
    console.log(`Loading ${chunks.length} chunks for embedding...`);
    
    memoryStore = [];

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      if (text.trim().length > 10) {
        const vector = await embedText(text);
        memoryStore.push({ text, vector });
        
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    console.log(`RAG loaded ${memoryStore.length} chunks successfully`);
  } catch (error) {
    console.error('Error loading and embedding chunks:', error);
    throw error;
  }
};

export const getTopKRelevantChunks = async (query: string, k: number): Promise<string[]> => {
  try {
    if (memoryStore.length === 0) {
      console.warn('Memory store is empty. Make sure to call loadAndEmbedChunks first.');
      return [];
    }

    const queryVec = await embedText(query);
    const scored = memoryStore.map(chunk => ({
      score: cosineSimilarity(queryVec, chunk.vector),
      text: chunk.text
    }));
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(x => x.text);
  } catch (error) {
    console.error('Error getting relevant chunks:', error);
    return [];
  }
};
