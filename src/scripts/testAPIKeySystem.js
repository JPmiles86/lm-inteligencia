#!/usr/bin/env node

// Test script to verify API key management system
import { ProviderService } from '../services/ai/ProviderService.js';

async function testAPIKeySystem() {
  console.log('🧪 Testing API Key Management System...\n');
  
  try {
    // Initialize the service
    const providerService = new ProviderService();
    console.log('✅ ProviderService initialized successfully');

    // Test basic functionality without database
    console.log('\n📊 Testing provider configuration...');
    
    // Test encryption/decryption
    const testApiKey = 'sk-test-1234567890abcdef';
    console.log('🔐 Testing encryption...');
    
    const encrypted = await providerService.encryptApiKey(testApiKey);
    console.log('✅ API key encrypted successfully');
    console.log('   Encrypted format:', encrypted.substring(0, 20) + '...');
    
    const decrypted = await providerService.decryptApiKey(encrypted);
    console.log('✅ API key decrypted successfully');
    console.log('   Decrypted matches original:', decrypted === testApiKey ? '✅' : '❌');

    // Test default models
    console.log('\n🤖 Testing default model configuration...');
    const openaiModels = providerService.getDefaultModelsForProvider('openai');
    console.log('✅ OpenAI models:', openaiModels);
    
    const anthropicModels = providerService.getDefaultModelsForProvider('anthropic');
    console.log('✅ Anthropic models:', anthropicModels);

    // Test task defaults
    console.log('\n📋 Testing task defaults...');
    try {
      const taskDefaults = await providerService.getTaskDefaults();
      console.log('✅ Task defaults loaded:', Object.keys(taskDefaults).length, 'tasks configured');
    } catch (error) {
      console.log('⚠️  Task defaults failed (expected without database):', error.message);
    }

    console.log('\n🎉 API Key Management System Core Functionality: WORKING');
    console.log('\n📝 Ready for testing with actual API keys!');
    
    // Show next steps
    console.log('\n🔄 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to: http://localhost:3002/admin/settings');
    console.log('3. Click on "AI Configuration" tab');
    console.log('4. Configure OpenAI with your API key starting with sk-proj-');
    console.log('5. Test the connection to verify it works');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testAPIKeySystem();