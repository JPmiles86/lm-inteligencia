/**
 * Provider API Integration Tests
 * Tests for provider management endpoints
 */

import request from 'supertest';
import { app } from '../../../api/server';
import { db } from '../../../src/services/database/connection';
import { providers } from '../../../src/db/schema';
import { encryptApiKey, decryptApiKey } from '../../../api/utils/encryption';

describe('Provider API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up providers table
    await db.delete(providers);
  });

  afterAll(async () => {
    // Close database connection
    await db.$client.end();
  });

  describe('GET /api/providers', () => {
    it('should return empty array when no providers exist', async () => {
      const response = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        providers: [],
      });
    });

    it('should return all providers with decrypted keys', async () => {
      // Insert test provider
      await db.insert(providers).values({
        name: 'openai',
        active: true,
        apiKey: encryptApiKey('test-key-123'),
        models: ['gpt-4', 'gpt-3.5-turbo'],
        settings: {},
      });

      const response = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.providers).toHaveLength(1);
      expect(response.body.providers[0].name).toBe('openai');
      expect(response.body.providers[0].apiKey).toBe('test-key-123');
    });
  });

  describe('POST /api/providers', () => {
    it('should create a new provider with encrypted key', async () => {
      const newProvider = {
        name: 'anthropic',
        apiKey: 'claude-key-456',
        models: ['claude-3-opus', 'claude-3-sonnet'],
        active: true,
      };

      const response = await request(app)
        .post('/api/providers')
        .send(newProvider)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.provider.name).toBe('anthropic');
      expect(response.body.provider.apiKey).toBe('claude-key-456');

      // Verify encryption in database
      const dbProvider = await db
        .select()
        .from(providers)
        .where({ name: 'anthropic' })
        .limit(1);

      expect(dbProvider[0]).toBeDefined();
      expect(dbProvider[0].apiKey).not.toBe('claude-key-456');
      expect(decryptApiKey(dbProvider[0].apiKey)).toBe('claude-key-456');
    });

    it('should validate required fields', async () => {
      const invalidProvider = {
        name: 'openai',
        // Missing apiKey
      };

      const response = await request(app)
        .post('/api/providers')
        .send(invalidProvider)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should prevent duplicate providers', async () => {
      // Create first provider
      await request(app)
        .post('/api/providers')
        .send({
          name: 'openai',
          apiKey: 'key-1',
          models: ['gpt-4'],
        })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/providers')
        .send({
          name: 'openai',
          apiKey: 'key-2',
          models: ['gpt-4'],
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('PUT /api/providers/:id', () => {
    it('should update provider settings', async () => {
      // Create provider
      const createResponse = await request(app)
        .post('/api/providers')
        .send({
          name: 'google',
          apiKey: 'gemini-key',
          models: ['gemini-pro'],
        })
        .expect(201);

      const providerId = createResponse.body.provider.id;

      // Update provider
      const updateResponse = await request(app)
        .put(`/api/providers/${providerId}`)
        .send({
          apiKey: 'new-gemini-key',
          active: false,
          settings: { temperature: 0.7 },
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.provider.apiKey).toBe('new-gemini-key');
      expect(updateResponse.body.provider.active).toBe(false);
      expect(updateResponse.body.provider.settings.temperature).toBe(0.7);
    });

    it('should handle non-existent provider', async () => {
      const response = await request(app)
        .put('/api/providers/non-existent-id')
        .send({ apiKey: 'new-key' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/providers/:id', () => {
    it('should delete a provider', async () => {
      // Create provider
      const createResponse = await request(app)
        .post('/api/providers')
        .send({
          name: 'perplexity',
          apiKey: 'pplx-key',
          models: ['pplx-online'],
        })
        .expect(201);

      const providerId = createResponse.body.provider.id;

      // Delete provider
      const deleteResponse = await request(app)
        .delete(`/api/providers/${providerId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('deleted');

      // Verify deletion
      const getResponse = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(getResponse.body.providers).toHaveLength(0);
    });
  });

  describe('POST /api/providers/test', () => {
    it('should test provider connection', async () => {
      // Mock successful test
      const response = await request(app)
        .post('/api/providers/test')
        .send({
          name: 'openai',
          apiKey: 'test-key',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isValid).toBeDefined();
    });

    it('should handle invalid API key', async () => {
      const response = await request(app)
        .post('/api/providers/test')
        .send({
          name: 'openai',
          apiKey: 'invalid-key',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/providers/health', () => {
    it('should return health status for all providers', async () => {
      // Create test providers
      await request(app)
        .post('/api/providers')
        .send({
          name: 'openai',
          apiKey: 'key-1',
          models: ['gpt-4'],
          active: true,
        });

      await request(app)
        .post('/api/providers')
        .send({
          name: 'anthropic',
          apiKey: 'key-2',
          models: ['claude-3'],
          active: false,
        });

      const response = await request(app)
        .get('/api/providers/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.health).toBeDefined();
      expect(response.body.health.openai).toBeDefined();
      expect(response.body.health.anthropic).toBeDefined();
      expect(response.body.health.openai.isHealthy).toBeDefined();
      expect(response.body.health.anthropic.isHealthy).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on provider test endpoint', async () => {
      // Make multiple requests quickly
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          request(app)
            .post('/api/providers/test')
            .send({ name: 'openai', apiKey: 'test' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Check that some requests were rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});

export {};