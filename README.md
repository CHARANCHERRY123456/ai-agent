# AI Agent Backend

A powerful AI agent backend system built with TypeScript and Express.js, featuring contextual RAG (Retrieval-Augmented Generation), session-based memory, and an extensible plugin system.

## Features

🧠 **Intelligent AI Agent**
- Powered by Google's Gemini AI model
- Contextual responses using knowledge base
- Session-based conversation memory

📚 **Knowledge Base (RAG)**
- Vector embeddings for document search
- Curated knowledge about technology, blogging, and web development
- Intelligent context retrieval for enhanced responses

🔌 **Plugin System**
- Weather information plugin
- Mathematical expression evaluator
- Extensible architecture for custom plugins

💾 **Session Management**
- Persistent conversation memory per session
- Automatic memory optimization
- Multi-user support

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google AI API key (Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CHARANCHERRY123456/ai-agent.git
   cd ai-agent/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Edit .env and add your Google AI API key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
GOOGLE_API_KEY=your_google_ai_api_key_here
NODE_ENV=development
```

## API Endpoints

### Chat with the Agent
```http
POST /api/agent/message
Content-Type: application/json

{
  "message": "What is markdown and why is it useful?",
  "session_id": "user_123"
}
```

**Response:**
```json
{
  "reply": "Markdown is a lightweight markup language that's particularly popular among developers and content creators..."
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-09T12:00:00.000Z",
  "uptime": 3600,
  "memory": { "rss": 50331648, "heapTotal": 20971520 }
}
```

## Plugin Examples

### Weather Plugin
```bash
curl -X POST http://localhost:3000/api/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather like in Bangalore?",
    "session_id": "test_session"
  }'
```

### Math Plugin
```bash
curl -X POST http://localhost:3000/api/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 15 * 24 + 100",
    "session_id": "test_session"
  }'
```

### Knowledge Base Queries
```bash
curl -X POST http://localhost:3000/api/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I create a blog with Next.js?",
    "session_id": "test_session"
  }'
```

## Architecture

### Core Components

- **Agent Core** (`/src/routes/agent.ts`) - Main API endpoint and orchestration
- **RAG System** (`/src/rag/`) - Document embedding and retrieval
- **Plugin Manager** (`/src/plugins/`) - Plugin discovery and execution
- **Memory System** (`/src/memory/`) - Session-based conversation storage

### Data Flow

1. User sends message to `/api/agent/message`
2. System adds message to session memory
3. Plugin manager detects if any plugins should be triggered
4. RAG system retrieves relevant knowledge base chunks
5. AI generates response using context from memory, plugins, and knowledge base
6. Response is stored in session and returned to user

## Performance

- **Response Time**: Typically 1-3 seconds for complex queries
- **Memory Usage**: ~50MB base, scales with active sessions
- **Concurrency**: Supports multiple simultaneous conversations
- **Rate Limiting**: Built-in protection against API rate limits

## Troubleshooting

### Common Issues

**"GOOGLE_API_KEY environment variable is required"**
- Ensure your `.env` file contains a valid Google AI API key
- Verify the key has access to Gemini API

**Slow response times**
- Check your internet connection to Google AI API
- Verify your API key hasn't hit rate limits

**Plugin not triggering**
- Check the intent detection patterns in plugin manager
- Ensure your message contains expected keywords

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

---

Built with ❤️ using TypeScript, Express.js, and Google Gemini AI
