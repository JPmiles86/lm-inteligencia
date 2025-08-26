// Test data fixtures for AI Content Generation System
// Comprehensive mock data for testing various scenarios

export interface MockProviderResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    latencyMs?: number;
  };
  metadata?: {
    provider: string;
    model: string;
    finishReason: string;
    [key: string]: unknown;
  };
}

export interface MockGenerationNode {
  id: string;
  type: 'idea' | 'title' | 'synopsis' | 'outline' | 'blog' | 'social' | 'image_prompt';
  content: string;
  vertical?: string;
  provider: string;
  model: string;
  parentId?: string;
  rootId?: string;
  selected: boolean;
  visible: boolean;
  deleted: boolean;
  tokensUsed: number;
  cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

// Mock AI Provider Responses
export const mockOpenAIResponses: Record<string, MockProviderResponse> = {
  blog_writing_complete: {
    content: `# The Future of AI in Hospitality: Transforming Guest Experiences

The hospitality industry is experiencing a revolutionary transformation through artificial intelligence. From personalized guest services to operational optimization, AI is reshaping how hotels, restaurants, and travel companies deliver exceptional experiences.

## Personalized Guest Services

Modern hotels are leveraging AI to create tailored experiences for each guest. Machine learning algorithms analyze guest preferences, booking history, and behavioral patterns to offer personalized recommendations for dining, activities, and room amenities.

Key benefits include:
- **Enhanced guest satisfaction** through personalized service delivery
- **Increased revenue** via targeted upselling and cross-selling opportunities  
- **Improved operational efficiency** through automated guest communications

## Operational Excellence Through AI

Behind the scenes, AI is streamlining hotel operations in unprecedented ways. Predictive analytics help optimize staffing levels, while intelligent systems manage inventory and maintenance schedules.

### Revenue Management
Dynamic pricing algorithms analyze market demand, competitor rates, and historical data to optimize room pricing in real-time. This sophisticated approach can increase revenue by 10-15% compared to traditional pricing methods.

### Maintenance Optimization
IoT sensors combined with AI predictive models identify maintenance needs before equipment failures occur, reducing downtime and repair costs by up to 30%.

## The Road Ahead

As AI technology continues to evolve, we can expect even more innovative applications in hospitality. Virtual concierges, emotion recognition systems, and fully automated check-in processes are already being piloted by forward-thinking hotel chains.

The hotels that embrace these technologies today will be best positioned to thrive in tomorrow's competitive landscape.

[IMAGE: A modern hotel lobby with AI-powered digital concierge displays and guests interacting with technology]`,
    usage: {
      inputTokens: 125,
      outputTokens: 432,
      totalTokens: 557,
      cost: 0.0147,
      latencyMs: 2350,
    },
    metadata: {
      provider: 'openai',
      model: 'gpt-5',
      finishReason: 'stop',
      reasoning: 'I structured this blog post to cover the current state and future of AI in hospitality, focusing on practical applications and measurable benefits.',
    },
  },

  title_generation: {
    content: `1. "The Future of AI in Hospitality: Transforming Guest Experiences"
2. "How Artificial Intelligence is Revolutionizing Hotel Operations" 
3. "AI-Powered Hotels: The Next Generation of Guest Service"
4. "Smart Hospitality: 10 Ways AI is Changing the Industry"
5. "From Check-in to Check-out: AI's Role in Modern Hotels"
6. "Artificial Intelligence in Travel: Enhancing Every Guest Journey"
7. "The AI Hotel Revolution: Technology Meets Hospitality"
8. "Predictive Analytics and Personalization: AI's Impact on Hotels"
9. "Digital Concierges and Beyond: AI Applications in Hospitality"
10. "The Intelligent Hotel: How AI Creates Memorable Experiences"`,
    usage: {
      inputTokens: 85,
      outputTokens: 156,
      totalTokens: 241,
      cost: 0.0062,
      latencyMs: 1250,
    },
    metadata: {
      provider: 'openai',
      model: 'gpt-5',
      finishReason: 'stop',
    },
  },

  idea_generation: {
    content: `Here are compelling blog ideas for the hospitality industry:

**AI and Technology:**
- How chatbots are transforming guest services in luxury hotels
- The rise of voice assistants in hotel rooms
- Predictive maintenance: Reducing costs through AI

**Guest Experience:**
- Creating personalized experiences through data analytics
- The psychology of hotel design in the digital age
- Contactless service: Post-pandemic hospitality trends

**Operations and Management:**
- Dynamic pricing strategies for maximum occupancy
- Staff training in the age of automation
- Sustainable practices through smart building technology`,
    usage: {
      inputTokens: 45,
      outputTokens: 128,
      totalTokens: 173,
      cost: 0.0048,
      latencyMs: 980,
    },
    metadata: {
      provider: 'openai',
      model: 'gpt-5',
      finishReason: 'stop',
    },
  },
};

export const mockAnthropicResponses: Record<string, MockProviderResponse> = {
  blog_writing_complete: {
    content: `# Healthcare AI: Transforming Patient Care Through Innovation

The healthcare industry stands at the threshold of a technological revolution. Artificial intelligence is not just changing how we deliver care—it's fundamentally transforming patient outcomes and operational efficiency across medical facilities worldwide.

## Diagnostic Excellence Through Machine Learning

AI-powered diagnostic tools are achieving remarkable accuracy rates, often surpassing human specialists in specific areas. Radiologists now work alongside AI systems that can detect early-stage cancers, while pathologists use machine learning to identify cellular abnormalities with unprecedented precision.

### Key Diagnostic Applications:
- **Medical Imaging**: AI analyzes CT scans, MRIs, and X-rays with 95%+ accuracy
- **Laboratory Analysis**: Automated blood work interpretation reduces processing time by 60%
- **Pathology**: Digital microscopy with AI assists in cancer detection and staging

## Personalized Treatment Protocols

Perhaps most exciting is AI's ability to personalize treatment plans. By analyzing vast datasets of patient histories, genetic information, and treatment outcomes, AI systems can recommend optimal therapies tailored to individual patients.

This precision medicine approach has shown remarkable results:
- 40% improvement in treatment efficacy for certain cancer types
- Reduced adverse drug reactions through AI-powered medication screening
- Faster identification of rare diseases through pattern recognition

## Operational Transformation

Beyond clinical applications, AI is streamlining healthcare operations. Predictive analytics help hospitals manage bed capacity, optimize staff scheduling, and reduce wait times. Smart systems monitor equipment performance and predict maintenance needs, ensuring critical medical devices remain operational.

## Challenges and Considerations

While the benefits are clear, healthcare AI implementation faces important challenges:
- **Data Privacy**: Ensuring patient information remains secure and confidential
- **Regulatory Compliance**: Meeting FDA and other regulatory requirements
- **Integration**: Seamlessly incorporating AI into existing clinical workflows
- **Training**: Educating healthcare professionals on AI tool usage

## The Future of Healthcare AI

Looking ahead, we anticipate even more transformative applications. Virtual health assistants will provide 24/7 patient support, while AI-driven drug discovery could reduce development timelines from decades to years.

The healthcare organizations investing in AI today are positioning themselves to deliver superior patient care while achieving operational excellence tomorrow.

[IMAGE: A modern hospital ward with AI-powered monitoring systems and healthcare professionals using tablet devices]`,
    usage: {
      inputTokens: 145,
      outputTokens: 523,
      totalTokens: 668,
      cost: 0.0187,
      latencyMs: 3200,
    },
    metadata: {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      finishReason: 'end_turn',
    },
  },

  synopsis_generation: {
    content: `This comprehensive blog post explores how artificial intelligence is revolutionizing healthcare delivery and patient outcomes. The article covers AI's impact on diagnostic accuracy, personalized treatment protocols, and operational efficiency in medical facilities. Key topics include machine learning applications in medical imaging, precision medicine approaches, and the operational benefits of predictive analytics in healthcare settings. The post also addresses implementation challenges including data privacy, regulatory compliance, and staff training requirements. Looking forward, the article discusses emerging trends like virtual health assistants and AI-driven drug discovery that will further transform the healthcare landscape.`,
    usage: {
      inputTokens: 75,
      outputTokens: 112,
      totalTokens: 187,
      cost: 0.0053,
      latencyMs: 1450,
    },
    metadata: {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      finishReason: 'end_turn',
    },
  },

  research: {
    content: `Based on recent research and industry reports, here are the key healthcare AI trends for 2025:

**Clinical AI Breakthroughs:**
- FDA-approved AI diagnostic tools increased by 150% in 2024
- Large language models adapted for clinical documentation show 85% accuracy
- AI-powered drug discovery platforms reduced development timelines by 40%

**Market Growth:**
- Healthcare AI market projected to reach $148 billion by 2025 (CAGR: 44.9%)
- Radiology AI adoption now at 78% in major hospitals
- 65% of health systems investing in predictive analytics platforms

**Regulatory Developments:**
- New AI/ML Software as Medical Device guidelines published by FDA
- European AI Act implications for healthcare applications
- Increased focus on algorithmic bias and fairness in medical AI

**Technology Trends:**
- Edge AI deployment in medical devices for real-time processing
- Federated learning enabling collaborative AI without data sharing
- Multimodal AI combining imaging, text, and genomic data

**Citations:**
- Healthcare AI Market Report 2024, Grand View Research
- FDA AI/ML Medical Device Database, December 2024
- Nature Digital Medicine AI Research Compilation 2024`,
    usage: {
      inputTokens: 95,
      outputTokens: 234,
      totalTokens: 329,
      cost: 0.0092,
      latencyMs: 2100,
    },
    metadata: {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      finishReason: 'end_turn',
      searchResults: [
        {
          title: 'Healthcare AI Market Growth 2024',
          url: 'https://www.grandviewresearch.com/healthcare-ai-market',
          snippet: 'The global healthcare AI market size is projected to reach $148.4 billion by 2025...',
        },
        {
          title: 'FDA AI/ML Device Approvals 2024',
          url: 'https://www.fda.gov/medical-devices/ai-ml-medical-devices',
          snippet: 'Over 520 AI-enabled medical devices have received FDA authorization as of 2024...',
        },
      ],
    },
  },
};

export const mockGoogleResponses: Record<string, MockProviderResponse> = {
  image_analysis: {
    content: `This image shows a modern hotel lobby with sophisticated AI-powered technology integration. Key elements visible include:

**Digital Infrastructure:**
- Large interactive displays serving as digital concierges
- Guests using tablets and mobile devices for self-service check-in
- Smart lighting systems that adjust based on occupancy and time of day

**Design Elements:**
- Contemporary architecture with clean lines and open spaces
- Strategic placement of technology that feels natural and unobtrusive
- Comfortable seating areas that blend traditional hospitality with modern tech

**Guest Interactions:**
- Multiple guests actively engaging with digital interfaces
- Seamless blend of human staff and automated services
- Evidence of contactless service options throughout the space

**Technology Features:**
- Voice recognition capabilities suggested by overhead microphone arrays
- Facial recognition cameras for personalized guest experiences
- IoT sensors integrated into furniture and fixtures

The overall impression is of a hospitality environment that successfully integrates advanced AI technology while maintaining the warm, welcoming atmosphere essential to the hotel industry.`,
    usage: {
      inputTokens: 1250, // Higher due to image processing
      outputTokens: 187,
      totalTokens: 1437,
      cost: 0.0215,
      latencyMs: 2800,
    },
    metadata: {
      provider: 'google',
      model: 'gemini-2.5-pro',
      finishReason: 'STOP',
      safetyRatings: [
        { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
      ],
    },
  },

  code_generation: {
    content: `Here's a Python implementation for an AI-powered hotel recommendation system:

\`\`\`python
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timedelta

class AIHotelRecommendationSystem:
    def __init__(self):
        self.hotels_df = None
        self.guest_profiles = None
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.hotel_features = None
        
    def load_hotel_data(self, hotels_data):
        """Load and preprocess hotel data"""
        self.hotels_df = pd.DataFrame(hotels_data)
        self.preprocess_features()
        
    def preprocess_features(self):
        """Create feature vectors for hotels"""
        # Combine text features
        text_features = (
            self.hotels_df['description'] + ' ' + 
            self.hotels_df['amenities'].astype(str) + ' ' +
            self.hotels_df['location_type']
        )
        
        # Create TF-IDF vectors
        self.hotel_features = self.tfidf_vectorizer.fit_transform(text_features)
        
    def generate_recommendations(self, guest_profile, num_recommendations=5):
        """Generate personalized hotel recommendations"""
        if self.hotel_features is None:
            raise ValueError("Hotel data not loaded. Call load_hotel_data() first.")
            
        # Create guest preference vector
        guest_preferences = (
            f"{guest_profile.get('preferred_amenities', '')} "
            f"{guest_profile.get('location_preference', '')} "
            f"{guest_profile.get('travel_purpose', '')}"
        )
        
        guest_vector = self.tfidf_vectorizer.transform([guest_preferences])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(guest_vector, self.hotel_features).flatten()
        
        # Apply business rules
        scores_with_rules = self._apply_business_rules(
            similarity_scores, guest_profile
        )
        
        # Get top recommendations
        top_indices = np.argsort(scores_with_rules)[::-1][:num_recommendations]
        
        recommendations = []
        for idx in top_indices:
            hotel = self.hotels_df.iloc[idx].to_dict()
            hotel['ai_confidence'] = float(scores_with_rules[idx])
            hotel['recommendation_reason'] = self._generate_reason(
                guest_profile, hotel
            )
            recommendations.append(hotel)
            
        return recommendations
    
    def _apply_business_rules(self, scores, guest_profile):
        """Apply business logic to modify recommendation scores"""
        modified_scores = scores.copy()
        
        # Boost hotels based on guest preferences
        budget_range = guest_profile.get('budget_range', 'medium')
        if budget_range == 'luxury':
            luxury_mask = self.hotels_df['price_category'] == 'luxury'
            modified_scores[luxury_mask] *= 1.3
        elif budget_range == 'budget':
            budget_mask = self.hotels_df['price_category'] == 'budget'
            modified_scores[budget_mask] *= 1.2
            
        # Boost highly rated hotels
        high_rating_mask = self.hotels_df['rating'] >= 4.5
        modified_scores[high_rating_mask] *= 1.1
        
        # Consider loyalty program membership
        if guest_profile.get('loyalty_member', False):
            chain_hotels = self.hotels_df['chain'] == guest_profile.get('preferred_chain')
            modified_scores[chain_hotels] *= 1.15
            
        return modified_scores
    
    def _generate_reason(self, guest_profile, hotel):
        """Generate explanation for recommendation"""
        reasons = []
        
        if hotel['rating'] >= 4.5:
            reasons.append("Highly rated by guests")
            
        if guest_profile.get('travel_purpose') == 'business':
            if 'business center' in hotel.get('amenities', '').lower():
                reasons.append("Excellent business facilities")
                
        if guest_profile.get('preferred_amenities'):
            matching_amenities = set(
                guest_profile['preferred_amenities'].lower().split()
            ) & set(hotel.get('amenities', '').lower().split())
            if matching_amenities:
                reasons.append(f"Has preferred amenities: {', '.join(matching_amenities)}")
        
        return "; ".join(reasons) if reasons else "Good match for your preferences"

# Usage example
if __name__ == "__main__":
    # Initialize recommendation system
    recommender = AIHotelRecommendationSystem()
    
    # Sample hotel data
    hotels = [
        {
            'name': 'Grand Business Hotel',
            'description': 'Luxury business hotel in downtown',
            'amenities': 'business center, spa, pool, wifi',
            'location_type': 'downtown business district',
            'price_category': 'luxury',
            'rating': 4.7,
            'chain': 'Marriott'
        },
        # ... more hotel data
    ]
    
    # Load data
    recommender.load_hotel_data(hotels)
    
    # Generate recommendations for a business traveler
    guest_profile = {
        'preferred_amenities': 'business center wifi gym',
        'location_preference': 'downtown',
        'travel_purpose': 'business',
        'budget_range': 'luxury',
        'loyalty_member': True,
        'preferred_chain': 'Marriott'
    }
    
    recommendations = recommender.generate_recommendations(guest_profile)
    
    for i, hotel in enumerate(recommendations, 1):
        print(f"{i}. {hotel['name']} (Confidence: {hotel['ai_confidence']:.3f})")
        print(f"   Reason: {hotel['recommendation_reason']}")
        print()
\`\`\`

This AI-powered recommendation system uses TF-IDF vectorization and cosine similarity to match guest preferences with hotel features. The system incorporates business rules for budget preferences, loyalty programs, and ratings to provide personalized recommendations with explanations.`,
    usage: {
      inputTokens: 125,
      outputTokens: 1156,
      totalTokens: 1281,
      cost: 0.0189,
      latencyMs: 4200,
    },
    metadata: {
      provider: 'google',
      model: 'gemini-2.5-pro',
      finishReason: 'STOP',
    },
  },
};

// Mock Generation Nodes for Database Testing
export const mockGenerationNodes: MockGenerationNode[] = [
  {
    id: 'node-root-1',
    type: 'idea',
    content: 'AI implementation strategies for modern hotels',
    vertical: 'hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    rootId: 'node-root-1',
    selected: true,
    visible: true,
    deleted: false,
    tokensUsed: 85,
    cost: 0.0032,
    status: 'completed',
    createdAt: new Date('2025-08-25T10:00:00Z'),
  },
  {
    id: 'node-title-1',
    type: 'title',
    content: 'Smart Hotels: How AI is Revolutionizing Guest Experiences',
    vertical: 'hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    parentId: 'node-root-1',
    rootId: 'node-root-1',
    selected: true,
    visible: true,
    deleted: false,
    tokensUsed: 42,
    cost: 0.0018,
    status: 'completed',
    createdAt: new Date('2025-08-25T10:05:00Z'),
  },
  {
    id: 'node-title-2',
    type: 'title',
    content: 'The Future of Hospitality: AI-Powered Innovation',
    vertical: 'hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    parentId: 'node-root-1',
    rootId: 'node-root-1',
    selected: false,
    visible: true,
    deleted: false,
    tokensUsed: 38,
    cost: 0.0016,
    status: 'completed',
    createdAt: new Date('2025-08-25T10:05:15Z'),
  },
  {
    id: 'node-blog-1',
    type: 'blog',
    content: mockAnthropicResponses.blog_writing_complete.content,
    vertical: 'hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    parentId: 'node-title-1',
    rootId: 'node-root-1',
    selected: true,
    visible: true,
    deleted: false,
    tokensUsed: 668,
    cost: 0.0187,
    status: 'completed',
    createdAt: new Date('2025-08-25T10:10:00Z'),
  },
];

// Mock Style Guides
export const mockStyleGuides = [
  {
    id: 'style-brand-1',
    type: 'brand' as const,
    name: 'Inteligencia Brand Guide',
    content: `Professional, authoritative writing style with data-driven insights. Use industry terminology appropriately while remaining accessible to business decision-makers. Emphasize measurable outcomes and practical implementation strategies. Maintain a consultative tone that positions Inteligencia as a trusted advisor in digital marketing and AI implementation.

Key characteristics:
- Professional yet approachable tone
- Data-backed statements with specific metrics when possible
- Industry expertise demonstrated through technical accuracy
- Solution-oriented approach to challenges
- Clear, actionable recommendations`,
    description: 'Main brand voice and style guidelines for all Inteligencia content',
    active: true,
    isDefault: true,
    version: 1,
    createdAt: new Date('2025-08-25T09:00:00Z'),
  },
  {
    id: 'style-hospitality-1',
    type: 'vertical' as const,
    name: 'Hospitality Industry Style',
    vertical: 'hospitality',
    content: `Warm, welcoming tone that reflects hospitality industry values while maintaining professionalism. Focus on guest experience, operational efficiency, and revenue optimization. Use hospitality-specific terminology accurately (ADR, RevPAR, occupancy rates, guest satisfaction scores).

Industry focus areas:
- Guest experience and satisfaction
- Operational efficiency and cost management  
- Revenue management and pricing strategies
- Staff training and service quality
- Technology integration in hospitality settings
- Sustainability and responsible tourism

Tone: Warm yet professional, service-oriented, results-focused`,
    description: 'Style guide tailored for hospitality industry content',
    active: true,
    version: 1,
    createdAt: new Date('2025-08-25T09:15:00Z'),
  },
  {
    id: 'style-technical-1',
    type: 'writing_style' as const,
    name: 'Technical Deep-Dive',
    content: `Detailed, technical writing style for in-depth analysis and implementation guides. Use precise technical terminology, include code examples where relevant, and provide step-by-step implementation details. Target audience is technical decision-makers and implementation teams.

Characteristics:
- Precise technical language and terminology
- Detailed implementation steps and procedures
- Code examples and technical specifications
- Architecture diagrams and system design considerations
- Performance metrics and benchmarking data
- Security and compliance considerations`,
    description: 'Technical writing style for detailed implementation content',
    active: true,
    version: 1,
    createdAt: new Date('2025-08-25T09:30:00Z'),
  },
];

// Mock Context Templates
export const mockContextTemplates = [
  {
    id: 'context-comprehensive-1',
    name: 'Comprehensive Analysis',
    description: 'Full context including brand guide, vertical expertise, and recent content',
    config: {
      styleGuides: {
        brand: true,
        vertical: ['hospitality'],
        writingStyle: ['technical'],
      },
      previousContent: {
        mode: 'recent',
        count: 5,
        includeElements: {
          titles: true,
          synopsis: true,
          content: false,
          tags: true,
        },
      },
      referenceImages: {
        logo: true,
        style: false,
      },
    },
    usageCount: 15,
    createdAt: new Date('2025-08-25T09:45:00Z'),
  },
  {
    id: 'context-quick-1',
    name: 'Quick Generation',
    description: 'Minimal context for fast content generation',
    config: {
      styleGuides: {
        brand: true,
        vertical: [],
        writingStyle: [],
      },
      previousContent: {
        mode: 'none',
      },
    },
    usageCount: 32,
    createdAt: new Date('2025-08-25T09:50:00Z'),
  },
];

// Mock Error Responses
export const mockErrorResponses = {
  rateLimit: {
    status: 429,
    error: 'Rate limit exceeded. Please wait before making another request.',
    retryAfter: 60,
  },
  invalidProvider: {
    status: 400,
    error: 'Invalid provider specified. Supported providers: openai, anthropic, google, perplexity',
  },
  authenticationRequired: {
    status: 401,
    error: 'Authentication required. Please provide a valid API token.',
  },
  insufficientCredits: {
    status: 402,
    error: 'Insufficient credits for this generation. Please add credits to your account.',
  },
  contentPolicyViolation: {
    status: 400,
    error: 'Content policy violation detected. Please modify your request and try again.',
  },
  serverError: {
    status: 500,
    error: 'Internal server error. Please try again later.',
  },
};

// Mock Streaming Responses
export const mockStreamingChunks = [
  { chunk: '# AI in Hospitality', type: 'content', tokens: 4 },
  { chunk: '\n\nThe hospitality industry', type: 'content', tokens: 4 },
  { chunk: ' is rapidly evolving', type: 'content', tokens: 4 },
  { chunk: ' with artificial intelligence', type: 'content', tokens: 4 },
  { chunk: ' leading the transformation.', type: 'content', tokens: 4 },
  { chunk: '\n\n## Key Benefits', type: 'content', tokens: 4 },
  { chunk: '\n\n- Enhanced guest experiences', type: 'content', tokens: 5 },
  { chunk: '\n- Operational efficiency', type: 'content', tokens: 4 },
  { chunk: '\n- Revenue optimization', type: 'content', tokens: 4 },
  { 
    chunk: '', 
    type: 'complete', 
    usage: { 
      totalTokens: 37, 
      cost: 0.00085,
      latencyMs: 2100 
    } 
  },
];

// Utility Functions for Test Data
export function createMockGenerationRequest(overrides: Record<string, unknown> = {}) {
  return {
    task: 'blog_writing_complete',
    mode: 'direct',
    vertical: 'hospitality',
    prompt: 'Write about AI in hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    outputCount: 1,
    context: {
      styleGuides: {
        brand: true,
        vertical: ['hospitality'],
      },
    },
    ...overrides,
  };
}

export function createMockProviderResponse(provider: string, task: string): MockProviderResponse {
  const responses = {
    openai: mockOpenAIResponses,
    anthropic: mockAnthropicResponses,
    google: mockGoogleResponses,
  };

  return responses[provider]?.[task] || {
    content: `Mock ${provider} response for ${task}`,
    usage: {
      inputTokens: 100,
      outputTokens: 200,
      totalTokens: 300,
      cost: 0.01,
      latencyMs: 1500,
    },
    metadata: {
      provider,
      model: `${provider}-default-model`,
      finishReason: 'stop',
    },
  };
}

export function generateRandomNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createMockGenerationTree(rootPrompt: string, depth: number = 3) {
  const nodes: MockGenerationNode[] = [];
  const rootId = generateRandomNodeId();
  
  // Root idea node
  nodes.push({
    id: rootId,
    type: 'idea',
    content: rootPrompt,
    vertical: 'hospitality',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    rootId: rootId,
    selected: true,
    visible: true,
    deleted: false,
    tokensUsed: 75,
    cost: 0.003,
    status: 'completed',
    createdAt: new Date(),
  });

  if (depth > 1) {
    // Title alternatives
    for (let i = 0; i < 3; i++) {
      const titleId = generateRandomNodeId();
      nodes.push({
        id: titleId,
        type: 'title',
        content: `Generated Title Option ${i + 1}`,
        vertical: 'hospitality',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        parentId: rootId,
        rootId: rootId,
        selected: i === 0,
        visible: true,
        deleted: false,
        tokensUsed: 25,
        cost: 0.001,
        status: 'completed',
        createdAt: new Date(Date.now() + i * 1000),
      });

      if (depth > 2 && i === 0) {
        // Blog content for selected title
        const blogId = generateRandomNodeId();
        nodes.push({
          id: blogId,
          type: 'blog',
          content: 'Generated blog content...',
          vertical: 'hospitality',
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          parentId: titleId,
          rootId: rootId,
          selected: true,
          visible: true,
          deleted: false,
          tokensUsed: 450,
          cost: 0.015,
          status: 'completed',
          createdAt: new Date(Date.now() + 5000),
        });
      }
    }
  }

  return nodes;
}

// Export all mock data
export default {
  mockOpenAIResponses,
  mockAnthropicResponses,
  mockGoogleResponses,
  mockGenerationNodes,
  mockStyleGuides,
  mockContextTemplates,
  mockErrorResponses,
  mockStreamingChunks,
  createMockGenerationRequest,
  createMockProviderResponse,
  generateRandomNodeId,
  createMockGenerationTree,
};