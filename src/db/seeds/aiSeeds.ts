// AI Content Generation System - Seed Data
// Creates initial style guides, characters, and reference data

import { db } from '../index';
import * as schema from '../schema';

export async function seedAISystem() {
  console.log('🌱 Seeding AI Content Generation System...');

  try {
    // ================================
    // BRAND STYLE GUIDE
    // ================================
    
    const brandGuideResult = await db
      .insert(schema.styleGuides)
      .values({
        type: 'brand',
        name: 'Inteligencia Brand Guide',
        content: `# Inteligencia Brand Voice & Style Guide

## Brand Personality
- **Professional yet approachable**: We're experts who speak human, not jargon
- **Results-focused**: Every piece of content should demonstrate value and ROI
- **Client-centric**: Always frame benefits in terms of client success
- **Innovative**: We stay ahead of trends and embrace new technologies

## Tone Characteristics
- **Confident without arrogance**: We know our stuff but remain humble
- **Educational**: We teach, don't just sell
- **Conversational**: Write like you're talking to a smart friend
- **Action-oriented**: Always include clear next steps

## Writing Style
- **Clear and concise**: No fluff or unnecessary words
- **Active voice preferred**: "We increase conversions" not "Conversions are increased"
- **Specific examples**: Use real numbers and case studies when possible
- **Industry expertise**: Demonstrate deep knowledge of digital marketing

## Key Messaging
- We deliver measurable marketing results
- Every client success story reinforces our expertise
- We adapt strategies to each vertical's unique needs
- ROI and growth are the ultimate measures of success

## Avoid
- Marketing buzzwords without substance
- Generic claims without proof
- Overly technical jargon that excludes readers
- Negative language about competitors`,
        description: 'Master brand guide for Inteligencia content',
        active: true,
        isDefault: true
      })
      .returning();
    
    const brandGuide = Array.isArray(brandGuideResult) ? brandGuideResult[0] : brandGuideResult;

    console.log('✅ Created brand style guide');

    // ================================
    // VERTICAL STYLE GUIDES
    // ================================

    const verticalGuides = [
      {
        type: 'vertical' as const,
        name: 'Hospitality Marketing Guide',
        vertical: 'hospitality' as const,
        content: `# Hospitality Marketing Style Guide

## Industry Context
- High competition, especially in tourism hotspots
- Guest experience is paramount - marketing must reflect service quality
- Seasonal variations require flexible campaigns
- Online reviews and reputation management are critical
- Visual appeal drives bookings more than other industries

## Audience Characteristics
- **Decision makers**: Hotel GMs, Restaurant Owners, Resort Directors
- **Pain points**: Occupancy rates, direct bookings vs OTA dependency, staff turnover
- **Goals**: Increase direct bookings, build brand loyalty, manage reputation

## Content Approach
- **Visual-first**: Always include examples of beautiful property imagery
- **Experience-focused**: Emphasize guest journey and emotional connection
- **Seasonal relevance**: Tie content to tourism seasons and local events
- **Local emphasis**: Highlight community connections and local partnerships

## Key Terminology
- Guest experience, occupancy rates, ADR (Average Daily Rate)
- RevPAR (Revenue Per Available Room), direct bookings
- OTA (Online Travel Agency), reputation management
- Seasonal campaigns, local SEO, Google My Business

## Proof Points to Include
- Occupancy rate improvements (percentage increases)
- Direct booking percentage increases
- Review score improvements
- Revenue growth during specific periods

## Examples & Case Studies
- Emphasize boutique properties and unique experiences
- Include seasonal campaign results
- Show before/after reputation scores
- Highlight successful local partnership campaigns`,
        description: 'Content guidance for hospitality industry clients',
        active: true
      },
      {
        type: 'vertical' as const,
        name: 'Healthcare Marketing Guide',
        vertical: 'healthcare' as const,
        content: `# Healthcare Marketing Style Guide

## Industry Context
- Heavily regulated industry with strict compliance requirements
- High trust threshold - credibility is essential
- Patient privacy and HIPAA compliance are non-negotiable
- Long decision cycles for both B2B and B2C
- Evidence-based claims are mandatory

## Audience Characteristics
- **B2B**: Practice administrators, healthcare executives, department heads
- **B2C**: Patients, caregivers, family members making healthcare decisions
- **Pain points**: Patient acquisition, regulatory compliance, competition from larger systems
- **Goals**: Build trust, demonstrate expertise, generate qualified leads

## Content Approach
- **Evidence-based**: Every claim must be supported by data or research
- **Empathy-driven**: Acknowledge patient concerns and emotional aspects
- **Educational**: Focus on informing rather than selling
- **Compliance-first**: Always consider HIPAA and regulatory requirements

## Key Terminology
- Patient acquisition, HIPAA compliance, telehealth
- Practice management, patient experience, quality metrics
- Healthcare SEO, medical marketing, patient retention
- Referral networks, specialty care, preventive medicine

## Compliance Considerations
- No specific patient information or case details
- Avoid guarantees about medical outcomes
- Include appropriate disclaimers
- Focus on process improvements, not medical advice

## Proof Points to Include
- Patient satisfaction scores
- Referral network growth
- Website traffic increases for health-related searches
- Appointment booking improvements
- Practice growth metrics (when appropriate)

## Content Types That Work
- Educational blog posts about health topics
- Practice efficiency improvements
- Technology adoption success stories
- Community health initiatives`,
        description: 'Content guidance for healthcare industry compliance and effectiveness',
        active: true
      },
      {
        type: 'vertical' as const,
        name: 'Technology Marketing Guide',
        vertical: 'tech' as const,
        content: `# Technology Marketing Style Guide

## Industry Context
- Rapidly evolving landscape requires cutting-edge knowledge
- Technical audiences expect depth and accuracy
- B2B sales cycles are often long and complex
- Product demos and technical specifications are crucial
- Competition is global and innovation-driven

## Audience Characteristics
- **Technical decision makers**: CTOs, IT Directors, Software Engineers
- **Business decision makers**: CEOs, COOs, Department Heads
- **Pain points**: Scaling technology, integration challenges, staying competitive
- **Goals**: Technology adoption, operational efficiency, competitive advantage

## Content Approach
- **Technical accuracy**: Get the details right or lose credibility instantly
- **Innovation focus**: Highlight cutting-edge solutions and future trends
- **Problem-solution framework**: Lead with pain points, present solutions
- **ROI emphasis**: Technology investments need clear business justification

## Key Terminology
- Digital transformation, cloud migration, API integration
- Scalability, security protocols, data analytics
- SaaS, PaaS, IaaS, cybersecurity, AI/ML implementation
- DevOps, agile development, technical debt
- User experience (UX), conversion optimization, A/B testing

## Proof Points to Include
- System performance improvements (load times, uptime)
- Cost savings from technology implementations
- Scalability achievements (user growth, transaction volume)
- Security improvements and compliance certifications
- Integration success stories

## Content Complexity Levels
- **Executive level**: Focus on business impact and ROI
- **Technical level**: Include architecture details and specifications
- **End-user level**: Emphasize usability and practical benefits

## Trending Topics to Address
- AI and machine learning applications
- Cybersecurity and data privacy
- Cloud-native development
- API-first architecture
- Sustainable technology practices`,
        description: 'Content guidance for technology industry expertise and innovation',
        active: true
      },
      {
        type: 'vertical' as const,
        name: 'Athletics & Sports Marketing Guide',
        vertical: 'athletics' as const,
        content: `# Athletics & Sports Marketing Style Guide

## Industry Context
- Passionate, engaged audiences with strong emotional connections
- Seasonal cycles drive marketing intensity
- Community involvement and local pride are significant factors
- Social media and visual content are extremely important
- Sponsorship and partnership opportunities are common

## Audience Characteristics
- **Facility owners**: Gym owners, sports complex managers, athletic directors
- **Coaches and trainers**: Personal trainers, team coaches, fitness instructors
- **Pain points**: Member retention, seasonal fluctuations, competition from chains
- **Goals**: Increase membership, build community, establish local dominance

## Content Approach
- **Energy and motivation**: Content should inspire and energize
- **Community-focused**: Emphasize local connections and team spirit
- **Results-oriented**: Before/after transformations, performance improvements
- **Visual storytelling**: Action photos, video content, success stories

## Key Terminology
- Member retention, fitness goals, training programs
- Athletic performance, sports medicine, injury prevention
- Community events, youth programs, adult leagues
- Membership growth, retention rates, local partnerships
- Seasonal programming, equipment upgrades, facility management

## Proof Points to Include
- Membership growth percentages
- Retention rate improvements
- Community event participation numbers
- Social media engagement increases
- Local partnership successes

## Seasonal Considerations
- **Spring/Summer**: Outdoor activities, summer body preparation, youth camps
- **Fall**: Back-to-school fitness routines, team sport preparations
- **Winter**: Indoor activities, New Year fitness resolutions, group classes
- **Year-round**: Consistent programming, member retention strategies

## Community Elements
- Local sports team sponsorships
- Youth development programs
- Community health initiatives
- Charity events and fundraisers
- Local business partnerships

## Success Metrics
- Membership numbers and retention rates
- Class attendance and participation
- Social media engagement and community building
- Event participation and local visibility
- Revenue growth and seasonal performance`,
        description: 'Content guidance for athletics and sports industry community building',
        active: true
      }
    ];

    const insertedVerticalGuides = await db
      .insert(schema.styleGuides)
      .values(verticalGuides)
      .returning();

    console.log(`✅ Created ${Array.isArray(insertedVerticalGuides) ? insertedVerticalGuides.length : 0} vertical style guides`);

    // ================================
    // WRITING STYLE GUIDES
    // ================================

    const writingStyles = [
      {
        type: 'writing_style' as const,
        name: 'Professional & Authoritative',
        content: `# Professional & Authoritative Writing Style

## Characteristics
- Confident, expert tone without being condescending
- Data-driven arguments with solid evidence
- Industry-specific terminology used appropriately
- Clear structure with logical flow

## Sentence Structure
- Vary sentence length for rhythm
- Use active voice predominantly
- Include transitional phrases for smooth flow
- Start with strong, declarative statements

## Language Choices
- Industry terminology that demonstrates expertise
- Specific numbers and metrics when available
- Action-oriented verbs
- Avoid hedge words (maybe, perhaps, might)

## Content Structure
- Lead with key insight or benefit
- Support with evidence and examples
- Include clear calls to action
- End with next steps or recommendations

## Examples
- "Our data-driven approach increased client conversions by 34% within 90 days"
- "Three key factors drive successful digital marketing campaigns..."
- "Based on our analysis of 500+ campaigns, we've identified..."`,
        description: 'For thought leadership and B2B decision makers',
        active: true
      },
      {
        type: 'writing_style' as const,
        name: 'Conversational & Engaging',
        content: `# Conversational & Engaging Writing Style

## Characteristics
- Friendly, approachable tone like talking to a colleague
- Use contractions and casual language appropriately
- Include rhetorical questions to engage readers
- Personal anecdotes and relatable examples

## Sentence Structure
- Mix short, punchy sentences with longer explanations
- Use second person ("you") to address readers directly
- Include questions to create dialogue
- Break up longer paragraphs for easy reading

## Language Choices
- Everyday language over jargon when possible
- Contractions (we'll, you're, it's) for natural flow
- Metaphors and analogies for complex concepts
- Conversational phrases ("Here's the thing...")

## Engagement Techniques
- Ask questions throughout the content
- Use "we" and "you" to create connection
- Include relatable scenarios
- Add humor when appropriate (but not forced)

## Examples
- "You know what's frustrating? When your marketing budget disappears with no results to show for it."
- "Let's be honest – most marketing feels like throwing spaghetti at the wall."
- "Here's what we've learned after working with 200+ clients..."`,
        description: 'For blog posts and client education content',
        active: true
      },
      {
        type: 'writing_style' as const,
        name: 'Educational & How-To',
        content: `# Educational & How-To Writing Style

## Characteristics
- Clear, step-by-step instructions
- Logical progression from basic to advanced
- Definitions of technical terms
- Practical, actionable advice

## Structure Patterns
- Problem → Solution → Steps → Results
- "What, Why, How" framework
- Numbered or bulleted lists for clarity
- Clear headings and subheadings

## Language Choices
- Simple, direct language
- Technical terms with explanations
- Action verbs for instructions
- "First, then, next, finally" sequences

## Educational Elements
- Define terms before using them
- Provide context for recommendations
- Include examples and case studies
- Offer alternatives and options

## Content Organization
- Overview at the beginning
- Clear section breaks
- Summary or recap at the end
- Additional resources when helpful

## Examples
- "Step 1: Set up your Google Analytics goals..."
- "Before we dive into advanced tactics, let's cover the basics..."
- "Here's a real example from one of our hospitality clients..."`,
        description: 'For tutorials, guides, and educational content',
        active: true
      }
    ];

    const insertedWritingStyles = await db
      .insert(schema.styleGuides)
      .values(writingStyles)
      .returning();

    console.log(`✅ Created ${Array.isArray(insertedWritingStyles) ? insertedWritingStyles.length : 0} writing style guides`);

    // ================================
    // PERSONA GUIDES
    // ================================

    const lauriePersonaResult = await db
      .insert(schema.styleGuides)
      .values({
        type: 'persona',
        name: 'Laurie Meiring - Founder Voice',
        content: `# Laurie Meiring - Founder Voice & Persona

## Background
- 15+ years in digital marketing across multiple industries
- Founded Inteligencia to provide results-focused marketing
- Deep expertise in hospitality, healthcare, technology, and athletics
- Based in South Africa with global perspective

## Voice Characteristics
- **Experienced but approachable**: Shares knowledge without talking down
- **Results-focused**: Always ties advice back to measurable outcomes
- **Practical**: Prefers actionable advice over theoretical concepts
- **International perspective**: Draws from global experience

## Communication Style
- Uses first-person when sharing personal insights
- References specific client success stories (anonymized)
- Includes metrics and data to support points
- Balances professional expertise with personal warmth

## Key Phrases & Expressions
- "In my experience working with [industry] clients..."
- "I've seen this approach increase [metric] by [percentage]..."
- "One thing I always tell my clients is..."
- "After 15 years in digital marketing, I can say..."

## Personal Elements to Include
- References to international marketing perspectives
- Stories from different vertical industries
- Lessons learned from client successes and challenges
- Insights from staying current with marketing trends

## Professional Credibility
- Specific metrics from client work
- Industry trend predictions
- Process improvements she's implemented
- Technology adoption recommendations

## Tone Balance
- 70% professional expertise
- 20% personal insights and experiences
- 10% forward-looking industry perspective`,
        description: 'Founder voice for thought leadership content',
        perspective: 'female marketing expert',
        voiceCharacteristics: [
          'experienced',
          'results-focused',
          'international perspective',
          'approachable expert',
          'data-driven'
        ],
        active: true
      })
      .returning();
    
    const lauriePersona = Array.isArray(lauriePersonaResult) ? lauriePersonaResult[0] : lauriePersonaResult;

    console.log('✅ Created Laurie persona guide');

    // ================================
    // CHARACTERS FOR IMAGE GENERATION
    // ================================

    const laurieCharacterResult = await db
      .insert(schema.characters)
      .values({
        name: 'Laurie Meiring',
        description: 'Founder and lead marketing strategist for Inteligencia',
        physicalDescription: 'Professional woman with confident demeanor, modern business attire, warm smile that conveys expertise and approachability',
        personality: 'Confident, knowledgeable, approachable, results-oriented, internationally experienced',
        role: 'CEO/Founder',
        active: true
      })
      .returning();
    
    const laurieCharacter = Array.isArray(laurieCharacterResult) ? laurieCharacterResult[0] : laurieCharacterResult;

    console.log('✅ Created Laurie character for image generation');

    // ================================
    // REFERENCE IMAGES (PLACEHOLDERS)
    // ================================

    const referenceImages = [
      {
        type: 'logo' as const,
        name: 'Inteligencia Primary Logo',
        url: '/public/LM_inteligencia/Inteligencia-logo-trans.png',
        description: 'Main Inteligencia logo with transparent background',
        tags: ['logo', 'brand', 'primary']
      },
      {
        type: 'persona' as const,
        name: 'Laurie Professional Headshot',
        url: '/public/images/LaurieHeadshot.png',
        description: 'Professional headshot of Laurie Meiring',
        tags: ['laurie', 'headshot', 'professional'],
      },
      {
        type: 'style' as const,
        name: 'Modern Professional Style',
        url: '/public/images/team/Laurie Meiring/laurie ai face 1x1.jpg',
        description: 'Example of modern, professional imagery style for Inteligencia',
        tags: ['professional', 'modern', 'business']
      }
    ];

    const insertedReferenceImages = await db
      .insert(schema.referenceImages)
      .values(referenceImages)
      .returning();

    console.log(`✅ Created ${Array.isArray(insertedReferenceImages) ? insertedReferenceImages.length : 0} reference images`);

    // ================================
    // CONTEXT TEMPLATES
    // ================================

    const contextTemplates = [
      {
        name: 'Standard Blog Generation',
        description: 'Default context for most blog posts',
        config: {
          styleGuideIds: [brandGuide.id],
          defaultVerticals: ['hospitality'],
          includeElements: {
            titles: true,
            synopsis: true,
            content: false,
            tags: true,
            metadata: false,
            images: false
          },
          customContext: 'Focus on actionable advice with specific examples and metrics when possible.',
          referenceImageIds: []
        }
      },
      {
        name: 'Multi-Vertical Campaign',
        description: 'Context for generating content across all verticals',
        config: {
          styleGuideIds: [brandGuide.id],
          defaultVerticals: ['hospitality', 'healthcare', 'tech', 'athletics'],
          includeElements: {
            titles: true,
            synopsis: true,
            content: true,
            tags: true,
            metadata: true,
            images: true
          },
          customContext: 'Create variations that speak to each vertical\'s unique challenges and opportunities.',
          referenceImageIds: []
        }
      },
      {
        name: 'Thought Leadership',
        description: 'Context for authoritative, expert content',
        config: {
          styleGuideIds: [brandGuide.id, lauriePersona.id],
          defaultVerticals: [],
          includeElements: {
            titles: true,
            synopsis: true,
            content: true,
            tags: true,
            metadata: true,
            images: false
          },
          customContext: 'Write from Laurie\'s perspective with industry insights and experience-based advice.',
          referenceImageIds: []
        }
      }
    ];

    const insertedTemplates = await db
      .insert(schema.contextTemplates)
      .values(contextTemplates)
      .returning();

    console.log(`✅ Created ${Array.isArray(insertedTemplates) ? insertedTemplates.length : 0} context templates`);

    // ================================
    // INITIAL ANALYTICS ENTRY
    // ================================

    await db
      .insert(schema.generationAnalytics)
      .values({
        date: new Date(),
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        totalCost: '0',
        averageCost: '0',
        averageDuration: 0,
        averageContentLength: 0,
        totalContentLength: 0,
        taskBreakdown: {}
      });

    console.log('✅ Created initial analytics entry');

    console.log('🎉 AI Content Generation System seeded successfully!');
    
    return {
      brandGuide,
      verticalGuides: insertedVerticalGuides,
      writingStyles: insertedWritingStyles,
      lauriePersona,
      laurieCharacter,
      referenceImages: insertedReferenceImages,
      contextTemplates: insertedTemplates
    };

  } catch (error) {
    console.error('❌ Error seeding AI system:', error);
    throw error;
  }
}

// Helper function to run seeds
export async function runAISeeds() {
  try {
    await seedAISystem();
    process.exit(0);
  } catch (error) {
    console.error('Failed to run AI seeds:', error);
    process.exit(1);
  }
}