// Integration test setup - configures database and API testing
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../../src/db/schema';

// Test database configuration
const DATABASE_URL = process.env.DATABASE_TEST_URL || 'postgresql://test:test@localhost:5432/inteligencia_test';

let testDb: ReturnType<typeof drizzle>;
let testConnection: postgres.Sql;

// Setup test database connection
export const setupTestDatabase = async () => {
  try {
    // Create test database connection
    testConnection = postgres(DATABASE_URL, {
      max: 1, // Single connection for tests
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    testDb = drizzle(testConnection, { schema });
    
    // Run migrations
    await migrate(testDb, { migrationsFolder: './src/db/migrations' });
    
    console.log('Test database setup completed');
    return testDb;
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
};

// Clean up test database
export const teardownTestDatabase = async () => {
  try {
    if (testConnection) {
      await testConnection.end();
      console.log('Test database connection closed');
    }
  } catch (error) {
    console.error('Error closing test database:', error);
  }
};

// Clean all test data between tests
export const cleanTestDatabase = async () => {
  if (!testDb) return;
  
  try {
    // Clean tables in reverse dependency order
    await testDb.delete(schema.usageLogs);
    await testDb.delete(schema.imagePrompts);
    await testDb.delete(schema.generationAnalytics);
    await testDb.delete(schema.contextTemplates);
    await testDb.delete(schema.characters);
    await testDb.delete(schema.referenceImages);
    await testDb.delete(schema.generationNodes);
    await testDb.delete(schema.styleGuides);
    await testDb.delete(schema.providerSettings);
    
    console.log('Test database cleaned');
  } catch (error) {
    console.error('Error cleaning test database:', error);
    throw error;
  }
};

// Setup test data fixtures
export const seedTestData = async () => {
  if (!testDb) throw new Error('Test database not initialized');
  
  // Insert test provider settings
  const testProviders = await testDb.insert(schema.providerSettings).values([
    {
      provider: 'openai',
      apiKeyEncrypted: 'test-encrypted-openai-key',
      defaultModel: 'gpt-4',
      fallbackModel: 'gpt-3.5-turbo',
      monthlyLimit: 100.00,
      currentUsage: 15.50,
      active: true,
      testSuccess: true,
    },
    {
      provider: 'anthropic',
      apiKeyEncrypted: 'test-encrypted-anthropic-key',
      defaultModel: 'claude-3-sonnet-20240229',
      fallbackModel: 'claude-3-haiku-20240307',
      monthlyLimit: 150.00,
      currentUsage: 23.75,
      active: true,
      testSuccess: true,
    },
  ]).returning();
  
  // Insert test style guides
  const testStyleGuides = await testDb.insert(schema.styleGuides).values([
    {
      type: 'brand',
      name: 'Inteligencia Brand Guide',
      content: 'Professional, authoritative, data-driven writing style...',
      active: true,
      isDefault: true,
    },
    {
      type: 'vertical',
      name: 'Hospitality Style Guide',
      vertical: 'hospitality',
      content: 'Warm, welcoming tone for hospitality industry...',
      active: true,
    },
    {
      type: 'writing_style',
      name: 'Professional',
      content: 'Formal, structured, business-oriented writing...',
      active: true,
    },
  ]).returning();
  
  // Insert test generation tree
  const rootNode = await testDb.insert(schema.generationNodes).values({
    type: 'idea',
    content: 'Viral Video Marketing Strategies',
    selected: true,
    visible: true,
    vertical: 'hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    prompt: 'Generate blog ideas about viral video marketing',
    tokensInput: 50,
    tokensOutput: 75,
    cost: 0.0025,
    status: 'completed',
  }).returning();
  
  const titleNodes = await testDb.insert(schema.generationNodes).values([
    {
      type: 'title',
      content: '10 Viral Video Marketing Strategies That Actually Work',
      parentId: rootNode[0].id,
      rootId: rootNode[0].id,
      selected: true,
      visible: true,
      vertical: 'hospitality',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      prompt: 'Generate engaging titles for viral video marketing blog',
      tokensInput: 100,
      tokensOutput: 25,
      cost: 0.0015,
      status: 'completed',
    },
    {
      type: 'title',
      content: 'The Psychology Behind Viral Hotel Marketing Videos',
      parentId: rootNode[0].id,
      rootId: rootNode[0].id,
      selected: false,
      visible: true,
      vertical: 'hospitality',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      prompt: 'Generate engaging titles for viral video marketing blog',
      tokensInput: 100,
      tokensOutput: 28,
      cost: 0.0016,
      status: 'completed',
    },
  ]).returning();
  
  return {
    providers: testProviders,
    styleGuides: testStyleGuides,
    rootNode: rootNode[0],
    titleNodes,
  };
};

// Jest lifecycle hooks
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await cleanTestDatabase();
});

// Export database instance for tests
export { testDb };

// Mock AI providers for integration tests
jest.mock('../../src/services/ai/providers/OpenAIProvider.js', () => ({
  OpenAIProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockImplementation(async ({ prompt, context: _context }) => { // context preserved for future use
      // Simulate realistic response times
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
      
      return {
        content: `Generated content for: ${prompt.slice(0, 50)}...`,
        tokensUsed: Math.floor(50 + Math.random() * 200),
        cost: Math.random() * 0.01,
        finishReason: 'stop',
        model: 'gpt-4',
      };
    }),
    
    testConnection: jest.fn().mockResolvedValue({ 
      success: true,
      model: 'gpt-4',
      provider: 'openai',
    }),
    
    streamGenerate: jest.fn().mockImplementation(async function* ({ prompt }) {
      const words = `Generated streaming content for: ${prompt}`.split(' ');
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 50));
        yield {
          chunk: word + ' ',
          type: 'content',
          tokensUsed: 1,
          cost: 0.0001,
        };
      }
      
      yield {
        chunk: '',
        type: 'complete',
        tokensUsed: words.length,
        cost: words.length * 0.0001,
      };
    }),
  })),
}));

// Export test utilities
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

export const createMockResponse = () => {
  const res: unknown = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
};

console.log('Integration test setup loaded');