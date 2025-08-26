// AI Content Generation Repository
// Handles all database operations for the AI generation system

import { desc, eq, and, isNull, inArray, sql, gte, lte, count } from 'drizzle-orm';
import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { 
  StyleGuide, 
  NewStyleGuide,
  GenerationNode,
  NewGenerationNode,
  ProviderSettings,
  NewProviderSettings,
  ReferenceImage,
  NewReferenceImage,
  Character,
  NewCharacter,
  ContextTemplate,
  NewContextTemplate,
  GenerationAnalytics,
  NewGenerationAnalytics,
  ImagePrompt,
  NewImagePrompt,
  UsageLog,
  NewUsageLog,
  GenerationNodeWithChildren,
  StyleGuideWithVersions
} from '../db/schema';

export class AIRepository {
  // ================================
  // STYLE GUIDES MANAGEMENT
  // ================================

  async createStyleGuide(data: NewStyleGuide): Promise<StyleGuide> {
    const result = await db
      .insert(schema.styleGuides)
      .values(data)
      .returning();
    return (result as StyleGuide[])[0];
  }

  async getStyleGuides(options: {
    type?: 'brand' | 'vertical' | 'writing_style' | 'persona';
    vertical?: string;
    activeOnly?: boolean;
  } = {}): Promise<StyleGuide[]> {
    const conditions = [];
    
    if (options.type) {
      conditions.push(eq(schema.styleGuides.type, options.type));
    }
    
    if (options.vertical) {
      conditions.push(eq(schema.styleGuides.vertical, options.vertical as any));
    }
    
    if (options.activeOnly) {
      conditions.push(eq(schema.styleGuides.active, true));
    }

    return db
      .select()
      .from(schema.styleGuides)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.styleGuides.createdAt));
  }

  async getStyleGuideWithVersions(id: string): Promise<StyleGuideWithVersions | null> {
    const [styleGuide] = await db
      .select()
      .from(schema.styleGuides)
      .where(eq(schema.styleGuides.id, id));
    
    if (!styleGuide) return null;

    const versions = await db
      .select()
      .from(schema.styleGuides)
      .where(eq(schema.styleGuides.parentId, id))
      .orderBy(desc(schema.styleGuides.version));

    return {
      ...styleGuide,
      versions
    };
  }

  async updateStyleGuide(id: string, data: Partial<StyleGuide>): Promise<StyleGuide | null> {
    const [updated] = await db
      .update(schema.styleGuides)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.styleGuides.id, id))
      .returning();
    
    return updated || null;
  }

  async setActiveStyleGuides(guideIds: string[]): Promise<void> {
    // Deactivate all guides first
    await db
      .update(schema.styleGuides)
      .set({ active: false });

    // Activate selected guides
    if (guideIds.length > 0) {
      await db
        .update(schema.styleGuides)
        .set({ active: true })
        .where(inArray(schema.styleGuides.id, guideIds));
    }
  }

  // ================================
  // GENERATION NODES MANAGEMENT
  // ================================

  async createGenerationNode(data: NewGenerationNode): Promise<GenerationNode> {
    const result = await db
      .insert(schema.generationNodes)
      .values(data)
      .returning();
    return (result as GenerationNode[])[0];
  }

  async getGenerationNode(id: string): Promise<GenerationNodeWithChildren | null> {
    const [node] = await db
      .select()
      .from(schema.generationNodes)
      .where(eq(schema.generationNodes.id, id));
    
    if (!node) return null;

    // Get children
    const children = await db
      .select()
      .from(schema.generationNodes)
      .where(eq(schema.generationNodes.parentId, id))
      .orderBy(schema.generationNodes.createdAt);

    // Get parent
    const [parent] = node.parentId ? await db
      .select()
      .from(schema.generationNodes)
      .where(eq(schema.generationNodes.id, node.parentId)) : [null];

    // Get alternatives (same parent, same type)
    const alternatives = node.parentId ? await db
      .select()
      .from(schema.generationNodes)
      .where(and(
        eq(schema.generationNodes.parentId, node.parentId),
        eq(schema.generationNodes.type, node.type),
        sql`${schema.generationNodes.id} != ${node.id}`
      ))
      .orderBy(schema.generationNodes.createdAt) : [];

    // Get image prompts
    const imagePrompts = await db
      .select()
      .from(schema.imagePrompts)
      .where(eq(schema.imagePrompts.generationNodeId, id))
      .orderBy(schema.imagePrompts.position);

    return {
      ...node,
      children,
      parent: parent || undefined,
      alternatives,
      imagePrompts
    };
  }

  async getGenerationTree(rootId: string): Promise<GenerationNode[]> {
    return db
      .select()
      .from(schema.generationNodes)
      .where(eq(schema.generationNodes.rootId, rootId))
      .orderBy(schema.generationNodes.createdAt);
  }

  async updateGenerationNode(id: string, data: Partial<GenerationNode>): Promise<GenerationNode | null> {
    const [updated] = await db
      .update(schema.generationNodes)
      .set(data)
      .where(eq(schema.generationNodes.id, id))
      .returning();
    
    return updated || null;
  }

  async softDeleteGenerationNode(id: string): Promise<void> {
    await db
      .update(schema.generationNodes)
      .set({ deleted: true })
      .where(eq(schema.generationNodes.id, id));
  }

  async setSelectedNode(nodeId: string, rootId: string): Promise<void> {
    // Deselect all nodes in the tree
    await db
      .update(schema.generationNodes)
      .set({ selected: false })
      .where(eq(schema.generationNodes.rootId, rootId));

    // Select the specified node
    await db
      .update(schema.generationNodes)
      .set({ selected: true })
      .where(eq(schema.generationNodes.id, nodeId));
  }

  async getRecentGenerations(limit: number = 10): Promise<GenerationNode[]> {
    return db
      .select()
      .from(schema.generationNodes)
      .where(eq(schema.generationNodes.deleted, false))
      .orderBy(desc(schema.generationNodes.createdAt))
      .limit(limit);
  }

  // ================================
  // PROVIDER SETTINGS MANAGEMENT
  // ================================

  async createProviderSettings(data: NewProviderSettings): Promise<ProviderSettings> {
    const [settings] = await db
      .insert(schema.providerSettings)
      .values(data)
      .returning();
    return settings;
  }

  async getProviderSettings(provider?: string): Promise<ProviderSettings[]> {
    return db
      .select()
      .from(schema.providerSettings)
      .where(provider ? eq(schema.providerSettings.provider, provider as any) : undefined)
      .orderBy(schema.providerSettings.provider);
  }

  async updateProviderSettings(provider: string, data: Partial<ProviderSettings>): Promise<ProviderSettings | null> {
    const [updated] = await db
      .update(schema.providerSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.providerSettings.provider, provider as any))
      .returning();
    
    return updated || null;
  }

  async incrementProviderUsage(provider: string, cost: number): Promise<void> {
    await db
      .update(schema.providerSettings)
      .set({
        currentUsage: sql`${schema.providerSettings.currentUsage} + ${cost}`,
        updatedAt: new Date()
      })
      .where(eq(schema.providerSettings.provider, provider as any));
  }

  async resetMonthlyUsage(): Promise<void> {
    await db
      .update(schema.providerSettings)
      .set({
        currentUsage: '0',
        lastResetDate: new Date()
      });
  }

  async deleteProviderSettings(provider: string): Promise<void> {
    await db
      .delete(schema.providerSettings)
      .where(eq(schema.providerSettings.provider, provider as any));
  }

  async getProviderUsage(provider: string, timeframe: 'day' | 'week' | 'month'): Promise<{ cost: number; usage: number }> {
    const [result] = await db
      .select({
        cost: schema.providerSettings.currentUsage,
        usage: schema.providerSettings.currentUsage
      })
      .from(schema.providerSettings)
      .where(eq(schema.providerSettings.provider, provider as any));
    
    return result ? { cost: parseFloat(result.cost || '0'), usage: parseFloat(result.usage || '0') } : { cost: 0, usage: 0 };
  }

  // ================================
  // REFERENCE IMAGES MANAGEMENT
  // ================================

  async createReferenceImage(data: NewReferenceImage): Promise<ReferenceImage> {
    const [image] = await db
      .insert(schema.referenceImages)
      .values(data)
      .returning();
    return image;
  }

  async getReferenceImages(options: {
    type?: 'style' | 'logo' | 'persona';
    vertical?: string;
  } = {}): Promise<ReferenceImage[]> {
    const conditions = [];
    
    if (options.type) {
      conditions.push(eq(schema.referenceImages.type, options.type));
    }
    
    if (options.vertical) {
      conditions.push(eq(schema.referenceImages.vertical, options.vertical as any));
    }

    return db
      .select()
      .from(schema.referenceImages)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.referenceImages.lastUsed));
  }

  async incrementImageUsage(id: string): Promise<void> {
    await db
      .update(schema.referenceImages)
      .set({
        usageCount: sql`${schema.referenceImages.usageCount} + 1`,
        lastUsed: new Date()
      })
      .where(eq(schema.referenceImages.id, id));
  }

  // ================================
  // CHARACTERS MANAGEMENT
  // ================================

  async createCharacter(data: NewCharacter): Promise<Character> {
    const [character] = await db
      .insert(schema.characters)
      .values(data)
      .returning();
    return character;
  }

  async getCharacters(activeOnly: boolean = true): Promise<Character[]> {
    return db
      .select()
      .from(schema.characters)
      .where(activeOnly ? eq(schema.characters.active, true) : undefined)
      .orderBy(desc(schema.characters.lastUsed));
  }

  async updateCharacter(id: string, data: Partial<Character>): Promise<Character | null> {
    const [updated] = await db
      .update(schema.characters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.characters.id, id))
      .returning();
    
    return updated || null;
  }

  async incrementCharacterUsage(id: string): Promise<void> {
    await db
      .update(schema.characters)
      .set({
        usageCount: sql`${schema.characters.usageCount} + 1`,
        lastUsed: new Date()
      })
      .where(eq(schema.characters.id, id));
  }

  // ================================
  // CONTEXT TEMPLATES MANAGEMENT
  // ================================

  async createContextTemplate(data: NewContextTemplate): Promise<ContextTemplate> {
    const [template] = await db
      .insert(schema.contextTemplates)
      .values(data)
      .returning();
    return template;
  }

  async getContextTemplates(): Promise<ContextTemplate[]> {
    return db
      .select()
      .from(schema.contextTemplates)
      .orderBy(desc(schema.contextTemplates.lastUsed));
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(schema.contextTemplates)
      .set({
        usageCount: sql`${schema.contextTemplates.usageCount} + 1`,
        lastUsed: new Date()
      })
      .where(eq(schema.contextTemplates.id, id));
  }

  // ================================
  // IMAGE PROMPTS MANAGEMENT
  // ================================

  async createImagePrompts(prompts: NewImagePrompt[]): Promise<ImagePrompt[]> {
    if (prompts.length === 0) return [];
    
    return db
      .insert(schema.imagePrompts)
      .values(prompts)
      .returning();
  }

  async getImagePrompts(generationNodeId: string): Promise<ImagePrompt[]> {
    return db
      .select()
      .from(schema.imagePrompts)
      .where(eq(schema.imagePrompts.generationNodeId, generationNodeId))
      .orderBy(schema.imagePrompts.position);
  }

  async updateImagePrompt(id: string, data: Partial<ImagePrompt>): Promise<ImagePrompt | null> {
    const [updated] = await db
      .update(schema.imagePrompts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.imagePrompts.id, id))
      .returning();
    
    return updated || null;
  }

  // ================================
  // ANALYTICS AND LOGGING
  // ================================

  async logUsage(data: NewUsageLog): Promise<UsageLog> {
    const [log] = await db
      .insert(schema.usageLogs)
      .values(data)
      .returning();
    return log;
  }

  async createOrUpdateAnalytics(data: NewGenerationAnalytics): Promise<void> {
    // Try to update existing record for the same date/vertical/provider/model
    const existing = await db
      .select()
      .from(schema.generationAnalytics)
      .where(and(
        eq(schema.generationAnalytics.date, data.date!),
        data.vertical ? eq(schema.generationAnalytics.vertical, data.vertical) : isNull(schema.generationAnalytics.vertical),
        data.provider ? eq(schema.generationAnalytics.provider, data.provider) : isNull(schema.generationAnalytics.provider),
        data.model ? eq(schema.generationAnalytics.model, data.model) : isNull(schema.generationAnalytics.model)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(schema.generationAnalytics)
        .set({
          totalGenerations: sql`${schema.generationAnalytics.totalGenerations} + ${data.totalGenerations || 0}`,
          successfulGenerations: sql`${schema.generationAnalytics.successfulGenerations} + ${data.successfulGenerations || 0}`,
          failedGenerations: sql`${schema.generationAnalytics.failedGenerations} + ${data.failedGenerations || 0}`,
          totalTokensInput: sql`${schema.generationAnalytics.totalTokensInput} + ${data.totalTokensInput || 0}`,
          totalTokensOutput: sql`${schema.generationAnalytics.totalTokensOutput} + ${data.totalTokensOutput || 0}`,
          totalCost: sql`${schema.generationAnalytics.totalCost} + ${data.totalCost || '0'}`,
          totalContentLength: sql`${schema.generationAnalytics.totalContentLength} + ${data.totalContentLength || 0}`,
          updatedAt: new Date()
        })
        .where(eq(schema.generationAnalytics.id, existing[0].id));
    } else {
      // Insert new record
      await db
        .insert(schema.generationAnalytics)
        .values(data);
    }
  }

  async getAnalytics(options: {
    startDate?: Date;
    endDate?: Date;
    vertical?: string;
    provider?: string;
  } = {}): Promise<GenerationAnalytics[]> {
    const conditions = [];
    
    if (options.startDate) {
      conditions.push(gte(schema.generationAnalytics.date, options.startDate));
    }
    
    if (options.endDate) {
      conditions.push(lte(schema.generationAnalytics.date, options.endDate));
    }
    
    if (options.vertical) {
      conditions.push(eq(schema.generationAnalytics.vertical, options.vertical as any));
    }
    
    if (options.provider) {
      conditions.push(eq(schema.generationAnalytics.provider, options.provider as any));
    }

    return db
      .select()
      .from(schema.generationAnalytics)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.generationAnalytics.date));
  }

  async getUsageStats(timeframe: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalGenerations: number;
    totalCost: string;
    averageDuration: number;
    successRate: number;
  }> {
    const startDate = new Date();
    switch (timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const [result] = await db
      .select({
        totalGenerations: sql<number>`COALESCE(SUM(${schema.generationAnalytics.totalGenerations}), 0)`,
        successfulGenerations: sql<number>`COALESCE(SUM(${schema.generationAnalytics.successfulGenerations}), 0)`,
        totalCost: sql<string>`COALESCE(SUM(${schema.generationAnalytics.totalCost}), 0)`,
        averageDuration: sql<number>`COALESCE(AVG(${schema.generationAnalytics.averageDuration}), 0)`
      })
      .from(schema.generationAnalytics)
      .where(gte(schema.generationAnalytics.date, startDate));

    const successRate = result.totalGenerations > 0 
      ? (result.successfulGenerations / result.totalGenerations) * 100 
      : 0;

    return {
      totalGenerations: result.totalGenerations,
      totalCost: result.totalCost,
      averageDuration: Math.round(result.averageDuration),
      successRate: Math.round(successRate * 100) / 100
    };
  }

  // ================================
  // CLEANUP AND MAINTENANCE
  // ================================

  async cleanupOldLogs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await db
      .delete(schema.usageLogs)
      .where(lte(schema.usageLogs.requestedAt, cutoffDate));

    return result.rowCount || 0;
  }

  async getGenerationCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(schema.generationNodes)
      .where(eq(schema.generationNodes.deleted, false));

    return result.count;
  }
}

// Export singleton instance
export const aiRepository = new AIRepository();