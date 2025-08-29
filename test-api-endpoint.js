// Test script to simulate the API endpoint locally
import { StyleGuideService } from './src/services/ai/StyleGuideService.js';

async function testEndpoint() {
  console.log('Testing StyleGuideService...');
  
  try {
    const service = new StyleGuideService();
    console.log('Service created successfully');
    
    const guides = await service.getStyleGuides({
      activeOnly: false
    });
    
    console.log('Guides fetched:', guides.length);
    console.log('First guide:', guides[0]);
    
    // Test the response format
    const response = {
      success: true,
      guides: guides
    };
    
    console.log('Response would be:', JSON.stringify(response, null, 2).slice(0, 500));
    
  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testEndpoint();