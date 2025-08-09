import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(__dirname, 'docs');

export const loadChunks = (): string[] => {
  const CHUNK_SIZE = 300; // characters
  const chunks: string[] = [];

  const files = fs.readdirSync(DOCS_DIR).filter(file => file.endsWith('.md') || file.endsWith('.txt'));

  files.forEach(file => {
    const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
      chunks.push(content.slice(i, i + CHUNK_SIZE));
    }
  });

  return chunks;
};
