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
      throw new Error('Invalid response from Gemini Chat API');
    }
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const buildPrompt = (
  userMessage: string,
  memoryMessages: Message[],
  ragChunks: string[],
  pluginResults?: string
): string => {
  const systemInstructions = `You are a helpful AI agent with access to knowledge about technology, blogging, markdown, AI concepts, and web development. 

Your capabilities:
- Answer questions using your knowledge base
- Maintain conversation context
- Help with technical concepts
- Provide clear, helpful explanations

Guidelines:
- Use the provided context to enhance your responses
- Reference relevant information from the knowledge base when applicable
- Keep responses concise but informative
- If you don't know something, say so honestly`;

  const contextSection = ragChunks.length > 0 
    ? `\n\nRelevant Knowledge Base Information:\n${ragChunks.map((chunk, i) => `[${i + 1}] ${chunk.trim()}`).join('\n\n')}`
    : '';

  const memorySection = memoryMessages.length > 0
    ? `\n\nRecent Conversation History:\n${memoryMessages.map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`).join('\n')}`
    : '';

  const pluginSection = pluginResults 
    ? `\n\nPlugin Results:\n${pluginResults}`
    : '';

  const prompt = `${systemInstructions}${contextSection}${memorySection}${pluginSection}

Current User Message: ${userMessage}

Please provide a helpful response:`;

  return prompt;
};

export const loadAndEmbedChunks = async () => {
  try {
    const chunks = loadChunks();
    console.log(`Loading ${chunks.length} chunks for embedding...`);
    
    memoryStore = [];

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      if (text.trim().length > 10) { // Only embed meaningful chunks
        const vector = await embedText(text);
        memoryStore.push({ text, vector });
        
        // Add small delay to avoid rate limiting
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
    return []; // Return empty array on error to not break the flow
  }
};
