import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './src/app';
import { loadAndEmbedChunks } from './src/rag/embed';
loadAndEmbedChunks().catch(err => {
  console.error('Error loading and embedding chunks:', err);
});

const PORT = process.env.PORT || 3000

app.listen(PORT , ()=>{
  console.log(`server running on http://localhost:${PORT}`);
  
})