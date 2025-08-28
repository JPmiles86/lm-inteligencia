#!/usr/bin/env node

/**
 * Quick Style Guides Database Checker
 * Simple script to check what style guides exist in the database
 */

import { db, testConnection } from '../db/index.ts';
import { styleGuides } from '../db/schema.ts';

async function checkStyleGuides() {
  console.log('🎨 LM INTELIGENCIA - Style Guides Database Check');
  console.log('='.repeat(50));
  
  // Test database connection
  console.log('\n🔌 Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed.');
    return false;
  }
  console.log('✅ Database connected successfully.');
  
  try {
    // Query all style guides
    console.log('\n📋 Querying style guides table...');
    const guides = await db.select().from(styleGuides);
    
    if (guides.length === 0) {
      console.log('\n📭 No style guides found in database.');
      console.log('\n💡 To populate the database with style guides, run:');
      console.log('   npm run style-guides:populate');
      return false;
    }
    
    // Group by type
    const groupedGuides = guides.reduce((acc, guide) => {
      if (!acc[guide.type]) acc[guide.type] = [];
      acc[guide.type].push(guide);
      return acc;
    }, {});
    
    let totalActive = 0;
    
    console.log(`\n📊 Found ${guides.length} style guides:`);
    console.log('='.repeat(40));
    
    Object.entries(groupedGuides).forEach(([type, typeGuides]) => {
      const activeCount = typeGuides.filter(g => g.active).length;
      totalActive += activeCount;
      
      console.log(`\n📁 ${type.toUpperCase()} (${typeGuides.length} total, ${activeCount} active):`);
      
      typeGuides
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(guide => {
          const status = guide.active ? '🟢 ACTIVE' : '⚪ inactive';
          const vertical = guide.vertical ? ` [${guide.vertical}]` : '';
          const isDefault = guide.isDefault ? ' ⭐ DEFAULT' : '';
          console.log(`  ${status}: ${guide.name}${vertical}${isDefault}`);
        });
    });
    
    console.log('\n' + '='.repeat(40));
    console.log(`📈 Summary: ${guides.length} total guides, ${totalActive} active`);
    
    // Show which types we have
    const availableTypes = Object.keys(groupedGuides);
    const expectedTypes = ['brand', 'vertical', 'writing_style', 'persona'];
    const missingTypes = expectedTypes.filter(type => !availableTypes.includes(type));
    
    if (missingTypes.length > 0) {
      console.log(`\n⚠️  Missing guide types: ${missingTypes.join(', ')}`);
    } else {
      console.log('\n✅ All expected guide types present');
    }
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Error querying style guides:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the check
checkStyleGuides()
  .then((hasGuides) => {
    if (hasGuides) {
      console.log('\n✨ Style guides check completed!');
      console.log('\n💡 Next steps:');
      console.log('   • Test style guides in the AI interface');
      console.log('   • Check that they appear in the UI dropdown');
      console.log('   • Verify context generation works correctly');
    } else {
      console.log('\n💡 To get started with style guides:');
      console.log('   npm run style-guides:populate');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error.message);
    process.exit(1);
  });