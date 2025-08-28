#!/usr/bin/env node

/**
 * Style Guides Database Population Script
 * Populates the style_guides table with brand guides, industry guides, writing styles, and personas
 * Based on hard-coded content in the application
 */

import { db, testConnection } from '../db/index.ts';
import { styleGuides } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';

// Style guide data based on hard-coded content in the application
const styleGuideData = [
  // BRAND GUIDE - LM Inteligencia main brand
  {
    type: 'brand',
    name: 'LM Inteligencia Brand Guide',
    vertical: null,
    description: 'Core brand voice, tone, and messaging guidelines for Inteligencia across all verticals',
    content: `# LM INTELIGENCIA BRAND GUIDE

## Brand Voice & Tone
- **Data-Driven & Results-Focused**: Lead with measurable outcomes and specific metrics
- **Professional & Approachable**: Expert knowledge delivered in accessible language
- **Partnership-Oriented**: Position as extension of client's team, not external vendor
- **Innovation-Forward**: Emphasize AI-powered solutions and cutting-edge strategies

## Core Value Propositions
1. **AI-Powered Marketing**: Leverage artificial intelligence for smarter campaigns
2. **Industry Specialization**: Deep expertise in hospitality, healthcare, tech, and athletics
3. **Measurable ROI**: Every strategy ties to concrete business outcomes
4. **Custom Solutions**: No cookie-cutter approaches - tailored to each client's needs

## Brand Messaging Pillars
- **Smart Strategy**: Data-driven decisions backed by AI insights
- **Bold Execution**: Confident implementation with creative solutions  
- **Real Results**: Transparent reporting with measurable business impact
- **Transparent Partnership**: Clear communication and collaborative approach

## Writing Style Guidelines
- Use active voice: "We drive results" not "Results are driven"
- Lead with specific metrics: "40% increase in direct bookings" not "significant growth"
- Problem-solution format: Acknowledge pain point, present our solution
- Mix short punchy sentences with detailed explanations
- Industry-specific terminology used naturally, not forced

## Brand Personality
- Confident but never arrogant
- Data-oriented but human-centered  
- Innovative but proven
- Expert but accessible
- Professional but personable

## Tone Variations by Content Type
- **Website Copy**: Professional, confident, results-focused
- **Blog Posts**: Educational, authoritative, helpful
- **Social Media**: Engaging, timely, conversational
- **Case Studies**: Data-rich, narrative-driven, proof-focused
- **Email**: Personal, valuable, action-oriented

## Key Differentiators
- AI-driven approach to marketing strategy
- Vertical specialization vs. generalist agencies
- Founder-led expertise with hands-on involvement
- Performance marketing focus with brand building
- Transparent reporting and collaborative partnership`,
    active: true,
    isDefault: true
  },

  // VERTICAL GUIDES - Industry-specific brand adaptations
  {
    type: 'vertical',
    name: 'Hospitality Marketing Guide',
    vertical: 'hospitality',
    description: 'Brand voice and messaging guidelines specifically adapted for hospitality industry clients',
    content: `# HOSPITALITY VERTICAL BRAND GUIDE

## Industry Voice & Tone
- **Professional & Results-Driven**: Focus on metrics that matter (RevPAR, ADR, Occupancy)
- **Partnership-Oriented**: Position as extension of hotel's marketing team
- **Industry Insider**: Use hospitality-specific terminology naturally
- **Urgency Without Pressure**: Emphasize seasonal opportunities and booking windows

## Key Messaging Pillars
1. **Direct Booking Independence**: Reduce OTA dependency, increase profit margins
2. **Revenue Optimization**: Every marketing dollar drives measurable RevPAR growth
3. **Guest Lifetime Value**: Convert one-time guests into loyal returning customers
4. **Market Positioning**: Stand out in competitive markets with strategic differentiation

## Industry-Specific Content Guidelines
- Lead with hospitality metrics: "40% increase in direct bookings, 25% OTA reduction"
- Use industry terminology: RevPAR, ADR, comp set, walk-ins, shoulder season
- Include seasonal hooks: peak season prep, off-season strategies, event-driven demand
- Address pain points: OTA commissions, rate parity, review management, local competition

## Target Audience Language
- Speak to General Managers, Revenue Managers, Marketing Directors
- Focus on occupancy, revenue per available room, and profit margins
- Emphasize competitive differentiation and market positioning
- Address operational challenges unique to hotels and restaurants

## Success Metrics to Highlight
- Direct booking percentage increases
- OTA commission savings
- RevPAR and ADR improvements
- Guest retention and lifetime value
- Seasonal performance optimization`,
    active: true
  },

  {
    type: 'vertical',
    name: 'Healthcare Marketing Guide',
    vertical: 'healthcare',
    description: 'Brand voice and messaging guidelines for healthcare industry clients with HIPAA compliance focus',
    content: `# HEALTHCARE VERTICAL BRAND GUIDE

## Industry Voice & Tone
- **Trustworthy & Compassionate**: Build confidence while showing understanding
- **Educational & Authoritative**: Position as healthcare marketing experts
- **Compliant & Professional**: Always HIPAA-aware, never compromise on privacy
- **Patient-Centric**: Focus on patient journey and experience

## Key Messaging Pillars
1. **Quality Patient Acquisition**: Attract the right patients, not just any patients
2. **Trust Building**: Establish practice credibility and reputation
3. **Patient Education**: Inform and empower patient decision-making
4. **Practice Growth**: Sustainable, compliant growth strategies

## Industry-Specific Content Guidelines
- Emphasize compliance and trust: "HIPAA-compliant, patient privacy, ethical marketing"
- Use healthcare terminology appropriately: patient acquisition, practice management, care continuum
- Include success metrics: new patient appointments, patient retention, average patient value
- Address concerns: regulatory compliance, reputation management, patient education

## Target Audience Language
- Speak to Practice Owners, Marketing Coordinators, Administrators
- Focus on patient quality over quantity
- Emphasize ethical, compliant marketing practices
- Address unique healthcare marketing challenges

## Success Metrics to Highlight
- New patient appointment increases
- Patient retention improvements
- Average patient value growth
- Online reputation scores
- Compliance-friendly lead generation`,
    active: true
  },

  {
    type: 'vertical',
    name: 'Technology Marketing Guide',
    vertical: 'tech',
    description: 'Brand voice and messaging guidelines for technology and SaaS industry clients',
    content: `# TECHNOLOGY VERTICAL BRAND GUIDE

## Industry Voice & Tone
- **Data-Driven & Analytical**: Lead with metrics, benchmarks, and performance data
- **Technical Yet Accessible**: Speak the language without alienating non-technical stakeholders
- **Innovation-Focused**: Emphasize cutting-edge strategies and emerging channels
- **Growth-Oriented**: Everything ties back to scalable, sustainable growth

## Key Messaging Pillars
1. **Scalable Growth Systems**: Build marketing that grows with your tech
2. **Product-Market Fit**: Find and dominate your ideal customer segment
3. **Developer Marketing**: Reach technical audiences authentically
4. **SaaS Metrics Mastery**: CAC, LTV, MRR growth that investors love

## Industry-Specific Content Guidelines
- Lead with SaaS metrics: "CAC reduction, LTV:CAC ratio, MRR growth, churn reduction"
- Use tech terminology: API, integration, deployment, scalability, product-led growth
- Include growth benchmarks: "3x pipeline growth, 40% CAC reduction, 2x conversion rates"
- Address challenges: long sales cycles, technical buyers, competitive differentiation

## Target Audience Language
- Speak to Founders, CMOs, Growth Managers, Product Managers
- Focus on scalable, measurable growth
- Emphasize technical credibility and innovation
- Address unique B2B and SaaS challenges

## Success Metrics to Highlight
- Customer Acquisition Cost (CAC) reduction
- Lifetime Value (LTV) improvements
- Monthly Recurring Revenue (MRR) growth
- Pipeline velocity increases
- Product-led growth metrics`,
    active: true
  },

  {
    type: 'vertical',
    name: 'Athletics Marketing Guide',
    vertical: 'athletics',
    description: 'Brand voice and messaging guidelines for athletics and sports facility clients',
    content: `# ATHLETICS VERTICAL BRAND GUIDE

## Industry Voice & Tone
- **Energetic & Enthusiastic**: Match the passion of sports communities
- **Community-Focused**: Emphasize building and engaging local sports communities
- **Results-Oriented**: Focus on participation, engagement, and facility utilization
- **Inclusive & Accessible**: Sports for everyone, all skill levels welcome

## Key Messaging Pillars
1. **Community Building**: Create thriving sports communities that drive loyalty
2. **Facility Optimization**: Maximize court time, field usage, and program enrollment
3. **Event Success**: Pack tournaments, leagues, and special events
4. **Youth Development**: Grow the next generation of athletes and fans

## Industry-Specific Content Guidelines
- Focus on participation metrics: "registration increases, facility utilization, community growth"
- Use sports terminology: leagues, tournaments, clinics, camps, drop-in sessions
- Include seasonal opportunities: summer camps, winter leagues, tournament season
- Address pain points: empty courts, low registration, sponsor acquisition, weather dependencies

## Target Audience Language
- Speak to Facility Directors, Program Coordinators, Tournament Organizers
- Focus on community engagement and facility utilization
- Emphasize inclusive participation and youth development
- Address unique challenges of seasonal sports and weather dependencies

## Success Metrics to Highlight
- Registration and participation increases
- Facility utilization improvements
- Community engagement growth
- Tournament and event attendance
- Youth program development success`,
    active: true
  },

  // WRITING STYLE GUIDES
  {
    type: 'writing_style',
    name: 'Professional & Data-Driven Style',
    vertical: null,
    description: 'Formal, metrics-focused writing style for B2B communications and case studies',
    content: `# PROFESSIONAL & DATA-DRIVEN WRITING STYLE

## Core Characteristics
- Lead with specific metrics and quantifiable results
- Use formal but accessible business language
- Structure arguments with data-backed evidence
- Maintain professional tone throughout

## Sentence Structure
- Start with impact statements: "Achieved 40% increase in revenue..."
- Use active voice: "We implemented" not "Implementation was done"
- Vary sentence length: Mix short impact statements with detailed explanations
- Include specific numbers and percentages

## Language Guidelines
- Use industry-specific terminology appropriately
- Avoid jargon that doesn't serve a purpose
- Choose precise verbs over generic ones
- Include benchmarks and comparative data

## Content Organization
1. **Hook**: Start with compelling metric or result
2. **Context**: Provide relevant background
3. **Strategy**: Explain approach with data support
4. **Results**: Quantify outcomes with specifics
5. **Implications**: Connect to broader business impact

## Best Practices
- Always lead with numbers when possible
- Use bullet points for key metrics
- Include before/after comparisons
- Reference industry benchmarks
- Conclude with actionable insights`,
    active: true
  },

  {
    type: 'writing_style',
    name: 'Conversational & Engaging Style',
    vertical: null,
    description: 'Friendly, approachable writing style for blog posts and social media content',
    content: `# CONVERSATIONAL & ENGAGING WRITING STYLE

## Core Characteristics
- Use friendly, approachable tone
- Include direct address to reader
- Ask engaging questions
- Share relatable experiences and examples

## Sentence Structure
- Use contractions: "You're" instead of "You are"
- Start sentences with "And" or "But" when it flows naturally
- Include rhetorical questions to engage readers
- Vary rhythm with short and longer sentences

## Language Guidelines
- Choose conversational words over formal ones
- Use "you" to directly address the reader
- Include storytelling elements
- Share behind-the-scenes insights

## Content Organization
1. **Hook**: Start with relatable question or scenario
2. **Story**: Share relevant experience or example  
3. **Insight**: Provide valuable takeaway
4. **Application**: Show how reader can apply it
5. **Engagement**: End with question or call to share

## Best Practices
- Tell stories to illustrate points
- Use analogies and metaphors
- Include personal touches and experiences
- Ask questions to encourage engagement
- Keep paragraphs short for easy reading`,
    active: false
  },

  {
    type: 'writing_style',
    name: 'Educational & Authoritative Style',
    vertical: null,
    description: 'Expert-level writing style for thought leadership and educational content',
    content: `# EDUCATIONAL & AUTHORITATIVE WRITING STYLE

## Core Characteristics
- Demonstrate deep expertise and knowledge
- Provide comprehensive, well-researched information
- Use authoritative but accessible language
- Structure content for learning and retention

## Sentence Structure
- Use declarative statements to establish expertise
- Include supporting evidence and citations
- Build logical argument progression
- Summarize key points clearly

## Language Guidelines
- Use precise technical terminology with explanations
- Include industry context and background
- Reference current trends and best practices
- Provide actionable advice and frameworks

## Content Organization
1. **Overview**: Establish topic importance and scope
2. **Background**: Provide necessary context and history
3. **Analysis**: Break down key components or strategies
4. **Application**: Show practical implementation
5. **Summary**: Reinforce key takeaways and next steps

## Best Practices
- Support claims with data and examples
- Provide step-by-step guidance
- Include relevant case studies
- Offer multiple perspectives or approaches
- End with clear action items`,
    active: false
  },

  // PERSONA GUIDE
  {
    type: 'persona',
    name: 'Laurie Meiring - Founder Voice',
    vertical: null,
    description: 'Personal brand voice and perspective for Laurie Meiring, founder of LM Inteligencia',
    perspective: 'Experienced digital marketing leader with MBA and hospitality background',
    voiceCharacteristics: ['authentic', 'experienced', 'data-driven', 'approachable', 'results-focused'],
    content: `# LAURIE MEIRING PERSONA GUIDE

## Personal Background & Perspective
- **Experience**: Over 15 years in digital marketing with MBA education
- **Industry Journey**: From hospitality management to digital marketing leadership
- **Specialization**: Performance marketing, AI integration, multi-vertical expertise
- **Leadership Style**: Hands-on, collaborative, results-oriented

## Voice Characteristics
- **Authentic & Genuine**: Speaks from real experience, not theory
- **Data-Driven**: Always backs statements with metrics and results
- **Approachable Expert**: Knowledgeable but never condescending  
- **Solution-Focused**: Identifies problems and presents actionable solutions
- **Transparent**: Honest about challenges and realistic about outcomes

## Personal Story Elements
- Founded Inteligencia with belief that every industry needs specialized marketing
- Led teams managing $750K+/month in Google Ads for 200+ practices
- Background spans hospitality, healthcare, technology, and athletics
- Combines MBA strategic thinking with hands-on implementation experience
- Early adopter of AI and automation tools for marketing efficiency

## Communication Style
- Shares specific examples from client work (within confidentiality limits)
- References personal experiences in hospitality and team leadership
- Uses first person when appropriate: "In my experience..." "I've found that..."
- Balances confidence with humility and continuous learning mindset
- Focuses on client success stories and business impact

## Key Messages When Speaking as Laurie
- Industry specialization delivers better results than generalist approach
- AI and data should enhance human insight, not replace it
- Every marketing strategy should tie to measurable business outcomes
- Collaboration and transparency build stronger client partnerships
- Continuous learning and adaptation are essential in digital marketing

## Tone Variations by Context
- **Speaking Engagements**: Confident expert sharing insights
- **Client Communications**: Collaborative partner focused on results  
- **Content Creation**: Experienced practitioner sharing knowledge
- **Social Media**: Professional but personable industry leader
- **Team Interactions**: Supportive leader fostering growth`,
    active: true
  }
];

async function checkExistingGuides() {
  console.log('\n🔍 Checking for existing style guides...');
  
  try {
    const existingGuides = await db.select().from(styleGuides);
    
    if (existingGuides.length > 0) {
      console.log(`📋 Found ${existingGuides.length} existing style guides:`);
      
      const groupedGuides = existingGuides.reduce((acc, guide) => {
        if (!acc[guide.type]) acc[guide.type] = [];
        acc[guide.type].push(guide);
        return acc;
      }, {});
      
      Object.entries(groupedGuides).forEach(([type, guides]) => {
        console.log(`  ${type}: ${guides.length} guides`);
        guides.forEach(guide => {
          console.log(`    - ${guide.name} ${guide.active ? '(active)' : '(inactive)'}`);
        });
      });
      
      console.log('\n⚠️  Existing guides found. Do you want to:');
      console.log('   1. Skip population (abort)');
      console.log('   2. Add new guides alongside existing ones');
      console.log('   3. Replace all existing guides');
      
      return existingGuides;
    } else {
      console.log('✅ No existing style guides found. Safe to populate.');
      return [];
    }
  } catch (error) {
    console.error('❌ Error checking existing guides:', error.message);
    throw error;
  }
}

async function populateStyleGuides(replaceExisting = false) {
  console.log('\n📝 Starting style guides population...');
  
  if (replaceExisting) {
    console.log('🗑️  Clearing existing style guides...');
    await db.delete(styleGuides);
    console.log('✅ Existing guides cleared.');
  }
  
  const results = {
    success: [],
    errors: [],
    skipped: []
  };
  
  for (const guideData of styleGuideData) {
    try {
      // Check if guide already exists (by name and type)
      const existing = await db.select()
        .from(styleGuides)
        .where(and(
          eq(styleGuides.name, guideData.name),
          eq(styleGuides.type, guideData.type)
        ))
        .limit(1);
      
      if (existing.length > 0 && !replaceExisting) {
        console.log(`⏭️  Skipping existing guide: ${guideData.name}`);
        results.skipped.push(guideData.name);
        continue;
      }
      
      // Insert the guide
      const [newGuide] = await db.insert(styleGuides)
        .values({
          type: guideData.type,
          name: guideData.name,
          vertical: guideData.vertical,
          content: guideData.content,
          description: guideData.description,
          perspective: guideData.perspective || null,
          voiceCharacteristics: guideData.voiceCharacteristics || [],
          active: guideData.active !== undefined ? guideData.active : true,
          isDefault: guideData.isDefault || false,
          version: 1
        })
        .returning();
      
      console.log(`✅ Created ${guideData.type} guide: ${guideData.name} ${newGuide.active ? '(active)' : '(inactive)'}`);
      results.success.push(newGuide);
      
    } catch (error) {
      console.error(`❌ Failed to create guide "${guideData.name}":`, error.message);
      results.errors.push({ name: guideData.name, error: error.message });
    }
  }
  
  return results;
}

async function displayResults(results) {
  console.log('\n📊 POPULATION RESULTS');
  console.log('='.repeat(50));
  
  if (results.success.length > 0) {
    console.log(`\n✅ Successfully created ${results.success.length} style guides:`);
    
    const byType = results.success.reduce((acc, guide) => {
      if (!acc[guide.type]) acc[guide.type] = [];
      acc[guide.type].push(guide);
      return acc;
    }, {});
    
    Object.entries(byType).forEach(([type, guides]) => {
      console.log(`\n  📁 ${type.toUpperCase()} (${guides.length}):`);
      guides.forEach(guide => {
        const status = guide.active ? '🟢 active' : '⚪ inactive';
        const vertical = guide.vertical ? ` [${guide.vertical}]` : '';
        console.log(`    ${status} ${guide.name}${vertical}`);
      });
    });
  }
  
  if (results.skipped.length > 0) {
    console.log(`\n⏭️  Skipped ${results.skipped.length} existing guides:`);
    results.skipped.forEach(name => console.log(`    - ${name}`));
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Failed to create ${results.errors.length} guides:`);
    results.errors.forEach(error => console.log(`    - ${error.name}: ${error.error}`));
  }
  
  console.log(`\n📈 Summary: ${results.success.length} created, ${results.skipped.length} skipped, ${results.errors.length} failed`);
}

async function displayCurrentGuides() {
  console.log('\n📋 CURRENT STYLE GUIDES IN DATABASE');
  console.log('='.repeat(50));
  
  try {
    const guides = await db.select().from(styleGuides);
    
    if (guides.length === 0) {
      console.log('\n📭 No style guides found in database.');
      return;
    }
    
    const groupedGuides = guides.reduce((acc, guide) => {
      if (!acc[guide.type]) acc[guide.type] = [];
      acc[guide.type].push(guide);
      return acc;
    }, {});
    
    let totalActive = 0;
    
    Object.entries(groupedGuides).forEach(([type, typeGuides]) => {
      const activeCount = typeGuides.filter(g => g.active).length;
      totalActive += activeCount;
      
      console.log(`\n📁 ${type.toUpperCase()} (${typeGuides.length} total, ${activeCount} active):`);
      
      typeGuides
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(guide => {
          const status = guide.active ? '🟢' : '⚪';
          const vertical = guide.vertical ? ` [${guide.vertical}]` : '';
          const isDefault = guide.isDefault ? ' ⭐' : '';
          console.log(`  ${status} ${guide.name}${vertical}${isDefault}`);
          if (guide.description) {
            console.log(`     📝 ${guide.description}`);
          }
        });
    });
    
    console.log(`\n📊 Total: ${guides.length} guides (${totalActive} active)`);
    
  } catch (error) {
    console.error('❌ Error fetching guides:', error.message);
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'populate';
  
  console.log('🎨 LM INTELIGENCIA STYLE GUIDES MANAGER');
  console.log('=====================================');
  
  // Test database connection
  console.log('\n🔌 Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Exiting.');
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'check':
      case 'list':
        await displayCurrentGuides();
        break;
        
      case 'populate':
      case 'add':
        const existing = await checkExistingGuides();
        
        if (existing.length > 0) {
          console.log('\n⚠️  Found existing guides. Use --force to replace them, or --add to add alongside them.');
          console.log('    Examples:');
          console.log('      npm run populate-guides -- populate --force  (replace all)');
          console.log('      npm run populate-guides -- populate --add    (add alongside)');
          
          if (!args.includes('--force') && !args.includes('--add')) {
            console.log('\n⏹️  Aborted to prevent accidental overwrites.');
            await displayCurrentGuides();
            process.exit(0);
          }
        }
        
        const replaceExisting = args.includes('--force');
        const results = await populateStyleGuides(replaceExisting);
        await displayResults(results);
        break;
        
      case 'clear':
        if (!args.includes('--confirm')) {
          console.log('\n⚠️  This will delete ALL style guides from the database.');
          console.log('    Use: npm run populate-guides -- clear --confirm');
          process.exit(0);
        }
        
        console.log('\n🗑️  Clearing all style guides...');
        await db.delete(styleGuides);
        console.log('✅ All style guides cleared.');
        break;
        
      default:
        console.log('\n📖 USAGE:');
        console.log('  npm run populate-guides                    # Check existing and prompt');
        console.log('  npm run populate-guides -- populate       # Populate (skip existing)');
        console.log('  npm run populate-guides -- populate --add # Add alongside existing');
        console.log('  npm run populate-guides -- populate --force # Replace all existing');
        console.log('  npm run populate-guides -- check          # List current guides');
        console.log('  npm run populate-guides -- clear --confirm # Delete all guides');
        break;
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
  
  console.log('\n✨ Script completed successfully!');
  process.exit(0);
}

// Handle CLI execution for ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { populateStyleGuides, checkExistingGuides, displayCurrentGuides };