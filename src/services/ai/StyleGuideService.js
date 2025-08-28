// Style Guide Management Service
// Handles CRUD operations for style guides, versions, and activation

import { db } from '../../db/index.ts';
import { styleGuides } from '../../db/schema.ts';
import { eq, and, or, desc, count, isNull } from 'drizzle-orm';

export class StyleGuideService {
  
  // Get style guides with optional filters
  async getStyleGuides(filters = {}) {
    const { type, vertical, activeOnly } = filters;
    
    let query = db.select().from(styleGuides);
    const conditions = [];
    
    if (type) {
      conditions.push(eq(styleGuides.type, type));
    }
    
    if (vertical) {
      conditions.push(eq(styleGuides.vertical, vertical));
    }
    
    if (activeOnly) {
      conditions.push(eq(styleGuides.active, true));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(styleGuides.createdAt));
    return results;
  }
  
  // Get active style guides for context generation
  async getActiveGuides(filters = {}) {
    const { vertical } = filters;
    
    let query = db.select().from(styleGuides).where(eq(styleGuides.active, true));
    
    if (vertical) {
      query = query.where(and(
        eq(styleGuides.active, true),
        or(
          eq(styleGuides.vertical, vertical),
          isNull(styleGuides.vertical) // Include brand guides (no vertical)
        )
      ));
    }
    
    const results = await query.orderBy(styleGuides.type, desc(styleGuides.createdAt));
    return results;
  }
  
  // Get specific guide with all versions
  async getGuideWithVersions(guideId) {
    const guide = await db.select()
      .from(styleGuides)
      .where(eq(styleGuides.id, guideId))
      .limit(1);
      
    if (!guide[0]) {
      throw new Error('Style guide not found');
    }
    
    // Get all versions (including parent if this is a version)
    const versions = await db.select()
      .from(styleGuides)
      .where(or(
        eq(styleGuides.parentId, guide[0].id),
        eq(styleGuides.id, guide[0].parentId || guide[0].id)
      ))
      .orderBy(desc(styleGuides.version));
    
    return {
      ...guide[0],
      versions
    };
  }
  
  // Create combined context string from active guides
  async getActiveGuidesContextString(filters = {}) {
    const { vertical, types } = filters;
    
    let query = db.select().from(styleGuides).where(eq(styleGuides.active, true));
    const conditions = [eq(styleGuides.active, true)];
    
    if (vertical) {
      conditions.push(or(
        eq(styleGuides.vertical, vertical),
        isNull(styleGuides.vertical) // Include brand guides
      ));
    }
    
    if (types && types.length > 0) {
      conditions.push(or(...types.map(type => eq(styleGuides.type, type))));
    }
    
    query = query.where(and(...conditions));
    const guides = await query.orderBy(styleGuides.type, desc(styleGuides.createdAt));
    
    // Build context string
    let contextString = '';
    const guidesByType = guides.reduce((acc, guide) => {
      if (!acc[guide.type]) acc[guide.type] = [];
      acc[guide.type].push(guide);
      return acc;
    }, {});
    
    // Order by type hierarchy: brand -> vertical -> writing_style -> persona
    const typeOrder = ['brand', 'vertical', 'writing_style', 'persona'];
    
    for (const type of typeOrder) {
      if (guidesByType[type]) {
        contextString += `\n# ${type.toUpperCase()} GUIDELINES\n\n`;
        for (const guide of guidesByType[type]) {
          contextString += `## ${guide.name}\n`;
          if (guide.description) {
            contextString += `${guide.description}\n\n`;
          }
          contextString += `${guide.content}\n\n---\n\n`;
        }
      }
    }
    
    return contextString.trim();
  }
  
  // Get type counts for UI
  async getTypeCounts() {
    const results = await db.select({
      type: styleGuides.type,
      count: count()
    })
    .from(styleGuides)
    .where(eq(styleGuides.active, true))
    .groupBy(styleGuides.type);
    
    return results.reduce((acc, row) => {
      acc[row.type] = row.count;
      return acc;
    }, {});
  }
  
  // Create new style guide
  async createGuide(guideData) {
    const newGuide = await db.insert(styleGuides)
      .values({
        type: guideData.type,
        name: guideData.name,
        vertical: guideData.vertical || null,
        content: guideData.content,
        description: guideData.description || null,
        perspective: guideData.perspective || null,
        voiceCharacteristics: guideData.voiceCharacteristics || [],
        active: guideData.active !== undefined ? guideData.active : true,
        isDefault: guideData.isDefault || false,
        version: 1
      })
      .returning();
    
    return newGuide[0];
  }
  
  // Update style guide
  async updateGuide(guideId, updateData) {
    const updated = await db.update(styleGuides)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(styleGuides.id, guideId))
      .returning();
      
    return updated[0];
  }
  
  // Create new version of existing guide
  async createGuideVersion(parentId, versionData) {
    const parent = await db.select()
      .from(styleGuides)
      .where(eq(styleGuides.id, parentId))
      .limit(1);
      
    if (!parent[0]) {
      throw new Error('Parent guide not found');
    }
    
    // Get next version number
    const versions = await db.select()
      .from(styleGuides)
      .where(or(
        eq(styleGuides.parentId, parentId),
        eq(styleGuides.id, parentId)
      ));
    
    const nextVersion = Math.max(...versions.map(v => v.version)) + 1;
    
    const newVersion = await db.insert(styleGuides)
      .values({
        ...parent[0],
        id: undefined, // Let DB generate new UUID
        parentId: parentId,
        version: nextVersion,
        content: versionData.content || parent[0].content,
        description: versionData.description || parent[0].description,
        active: false, // New versions start inactive
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newVersion[0];
  }
  
  // Activate a guide (deactivates others of same type/vertical)
  async activateGuide(guideId) {
    const guide = await db.select()
      .from(styleGuides)
      .where(eq(styleGuides.id, guideId))
      .limit(1);
      
    if (!guide[0]) {
      throw new Error('Guide not found');
    }
    
    // Deactivate other guides of same type/vertical
    await db.update(styleGuides)
      .set({ active: false })
      .where(and(
        eq(styleGuides.type, guide[0].type),
        guide[0].vertical 
          ? eq(styleGuides.vertical, guide[0].vertical)
          : isNull(styleGuides.vertical)
      ));
    
    // Activate the target guide
    await db.update(styleGuides)
      .set({ active: true })
      .where(eq(styleGuides.id, guideId));
    
    return true;
  }
  
  // Deactivate a guide
  async deactivateGuide(guideId) {
    await db.update(styleGuides)
      .set({ active: false })
      .where(eq(styleGuides.id, guideId));
    
    return true;
  }
  
  // Set multiple guides as active (replaces all active guides)
  async setActiveGuides(guideIds) {
    // First deactivate all guides
    await db.update(styleGuides)
      .set({ active: false });
    
    // Then activate selected guides
    if (guideIds.length > 0) {
      await db.update(styleGuides)
        .set({ active: true })
        .where(or(...guideIds.map(id => eq(styleGuides.id, id))));
    }
    
    return true;
  }
  
  // Soft delete guide
  async softDeleteGuide(guideId) {
    await db.update(styleGuides)
      .set({ 
        active: false,
        name: `[DELETED] ${Date.now()}`
      })
      .where(eq(styleGuides.id, guideId));
    
    return true;
  }
  
  // Hard delete guide and all versions
  async hardDeleteGuide(guideId) {
    // Delete all versions
    await db.delete(styleGuides)
      .where(eq(styleGuides.parentId, guideId));
    
    // Delete the guide itself
    await db.delete(styleGuides)
      .where(eq(styleGuides.id, guideId));
    
    return true;
  }
  
  // Bulk create guides from content
  async createGuidesFromContent(guidesData) {
    const results = [];
    
    for (const guideData of guidesData) {
      try {
        const guide = await this.createGuide(guideData);
        results.push(guide);
      } catch (error) {
        console.error(`Failed to create guide ${guideData.name}:`, error);
        results.push({ error: error.message, data: guideData });
      }
    }
    
    return results;
  }
}