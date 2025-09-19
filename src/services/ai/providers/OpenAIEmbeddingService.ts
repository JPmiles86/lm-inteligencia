import OpenAI from 'openai';
import { openAIService } from './OpenAIService.js';

export class OpenAIEmbeddingService {
  private client: OpenAI | null = null;
  
  async initialize(): Promise<void> {
    await openAIService.initialize();
    this.client = (openAIService as any).client;
  }
  
  async createEmbedding(
    text: string,
    model: string = 'text-embedding-3-small'
  ): Promise<number[]> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client!.embeddings.create({
        model,
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding creation failed:', error);
      throw error;
    }
  }
  
  async createBatchEmbeddings(
    texts: string[],
    model: string = 'text-embedding-3-small'
  ): Promise<number[][]> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client!.embeddings.create({
        model,
        input: texts
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('OpenAI batch embedding failed:', error);
      throw error;
    }
  }
  
  async semanticSearch(
    query: string,
    documents: Array<{ id: string; text: string }>,
    topK: number = 5
  ): Promise<Array<{ id: string; text: string; score: number }>> {
    // Get query embedding
    const queryEmbedding = await this.createEmbedding(query);
    
    // Get document embeddings
    const docTexts = documents.map(d => d.text);
    const docEmbeddings = await this.createBatchEmbeddings(docTexts);
    
    // Calculate cosine similarity
    const results = documents.map((doc, idx) => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, docEmbeddings[idx])
    }));
    
    // Sort by similarity and return top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  async generateResearchSummary(
    topic: string,
    sources: string[]
  ): Promise<{
    summary: string;
    keyPoints: string[];
    relatedTopics: string[];
  }> {
    const prompt = `
      Research Topic: ${topic}
      
      Sources:
      ${sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}
      
      Please provide:
      1. A comprehensive summary (200-300 words)
      2. 5-7 key points
      3. 3-5 related topics for further research
      
      Format as JSON with keys: summary, keyPoints, relatedTopics
    `;
    
    try {
      const response = await openAIService.generateText(prompt, {
        model: 'gpt-4-turbo-preview',
        temperature: 0.3, // Lower temperature for factual content
        maxTokens: 2000
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Research summary generation failed:', error);
      throw error;
    }
  }
}

export const openAIEmbeddingService = new OpenAIEmbeddingService();