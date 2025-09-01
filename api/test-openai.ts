/**
 * Test OpenAI Integration
 * Verify that the API key works and we can generate content
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

async function testOpenAI() {
  console.log('🧪 Testing OpenAI Integration...\n');

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No OpenAI API key found in environment variables');
    return;
  }

  console.log('✅ API Key found (first 20 chars):', apiKey.substring(0, 20) + '...');

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('\n📝 Testing text generation...');
    
    // Test text generation
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using cheaper model for testing
      messages: [
        {
          role: 'user',
          content: 'Write a one-sentence description of AI blog writing.',
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content;
    console.log('✅ Text generated successfully:');
    console.log('   Response:', generatedText);
    console.log('   Model used:', completion.model);
    console.log('   Tokens used:', completion.usage?.total_tokens);

    console.log('\n🎨 Testing image generation...');
    
    // Test image generation
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A simple abstract logo for an AI blog platform, minimalist design',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data[0]?.url;
    console.log('✅ Image generated successfully:');
    console.log('   Image URL:', imageUrl ? 'Generated (URL available)' : 'Failed');

    console.log('\n✅ All tests passed! OpenAI integration is working.\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ OpenAI test failed:');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Details:', error.response.data);
    }
    
    if (error.message.includes('401')) {
      console.error('\n⚠️  This appears to be an authentication error.');
      console.error('   Please check that your API key is valid and has not expired.');
    }
    
    return false;
  }
}

// Run the test
testOpenAI().then(success => {
  process.exit(success ? 0 : 1);
});