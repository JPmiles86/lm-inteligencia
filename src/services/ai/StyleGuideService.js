// Style Guide Management Service
// Handles CRUD operations for style guides, versions, and activation
// Using direct SQL queries for Vercel compatibility

import { Pool } from 'pg';

export class StyleGuideService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  // Get style guides with optional filters
  async getStyleGuides(filters = {}) {
    const { type, vertical, activeOnly } = filters;
    
    let query = 'SELECT * FROM style_guides WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (vertical) {
      query += ` AND vertical = $${paramIndex++}`;
      params.push(vertical);
    }
    
    if (activeOnly) {
      query += ` AND active = $${paramIndex++}`;
      params.push(true);
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching style guides:', error);
      throw error;
    }
  }
  
  // Get active style guides for context generation
  async getActiveGuides(filters = {}) {
    const { vertical } = filters;
    
    let query = 'SELECT * FROM style_guides WHERE active = true';
    const params = [];
    
    if (vertical) {
      query += ' AND (vertical = $1 OR vertical IS NULL)';
      params.push(vertical);
    }
    
    query += ' ORDER BY type, created_at DESC';
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching active guides:', error);
      throw error;
    }
  }
  
  // Get guide with versions
  async getGuideWithVersions(guideId) {
    try {
      // Get main guide
      const guideResult = await this.pool.query(
        'SELECT * FROM style_guides WHERE id = $1',
        [guideId]
      );
      
      if (guideResult.rows.length === 0) {
        throw new Error('Style guide not found');
      }
      
      const guide = guideResult.rows[0];
      
      // Get versions (child guides)
      const versionsResult = await this.pool.query(
        'SELECT * FROM style_guides WHERE parent_id = $1 ORDER BY version DESC',
        [guideId]
      );
      
      return {
        ...guide,
        versions: versionsResult.rows
      };
    } catch (error) {
      console.error('Error fetching guide with versions:', error);
      throw error;
    }
  }
  
  // Get combined context string from active guides
  async getActiveGuidesContextString(filters = {}) {
    const { vertical, types } = filters;
    
    let query = 'SELECT name, content FROM style_guides WHERE active = true';
    const params = [];
    let paramIndex = 1;
    
    if (vertical) {
      query += ` AND (vertical = $${paramIndex++} OR vertical IS NULL)`;
      params.push(vertical);
    }
    
    if (types && types.length > 0) {
      const placeholders = types.map(() => `$${paramIndex++}`).join(',');
      query += ` AND type IN (${placeholders})`;
      params.push(...types);
    }
    
    query += ' ORDER BY type, created_at DESC';
    
    try {
      const result = await this.pool.query(query, params);
      
      // Combine all content into context string
      const contextParts = result.rows.map(guide => 
        `[${guide.name}]\n${guide.content}`
      );
      
      return contextParts.join('\n\n---\n\n');
    } catch (error) {
      console.error('Error building context string:', error);
      throw error;
    }
  }
  
  // Get type counts
  async getTypeCounts() {
    try {
      const result = await this.pool.query(
        'SELECT type, COUNT(*) as count FROM style_guides GROUP BY type'
      );
      
      const counts = {};
      result.rows.forEach(row => {
        counts[row.type] = parseInt(row.count);
      });
      
      return counts;
    } catch (error) {
      console.error('Error fetching type counts:', error);
      throw error;
    }
  }
  
  // Create new style guide
  async createGuide(guideData) {
    const {
      type,
      name,
      vertical,
      content,
      description,
      perspective,
      voiceCharacteristics = [],
      active = true,
      isDefault = false
    } = guideData;
    
    try {
      const result = await this.pool.query(
        `INSERT INTO style_guides 
        (type, name, vertical, content, description, perspective, voice_characteristics, active, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [type, name, vertical, content, description, perspective, 
         JSON.stringify(voiceCharacteristics), active, isDefault]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating style guide:', error);
      throw error;
    }
  }
  
  // Update style guide
  async updateGuide(guideId, updates) {
    const {
      name,
      content,
      description,
      perspective,
      voiceCharacteristics,
      active,
      isDefault
    } = updates;
    
    const setClause = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      setClause.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    
    if (content !== undefined) {
      setClause.push(`content = $${paramIndex++}`);
      params.push(content);
    }
    
    if (description !== undefined) {
      setClause.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    
    if (perspective !== undefined) {
      setClause.push(`perspective = $${paramIndex++}`);
      params.push(perspective);
    }
    
    if (voiceCharacteristics !== undefined) {
      setClause.push(`voice_characteristics = $${paramIndex++}`);
      params.push(JSON.stringify(voiceCharacteristics));
    }
    
    if (active !== undefined) {
      setClause.push(`active = $${paramIndex++}`);
      params.push(active);
    }
    
    if (isDefault !== undefined) {
      setClause.push(`is_default = $${paramIndex++}`);
      params.push(isDefault);
    }
    
    if (setClause.length === 0) {
      throw new Error('No updates provided');
    }
    
    setClause.push(`updated_at = $${paramIndex++}`);
    params.push(new Date());
    
    params.push(guideId);
    
    try {
      const result = await this.pool.query(
        `UPDATE style_guides 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *`,
        params
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating style guide:', error);
      throw error;
    }
  }
  
  // Activate guide
  async activateGuide(guideId) {
    try {
      await this.pool.query(
        'UPDATE style_guides SET active = true WHERE id = $1',
        [guideId]
      );
    } catch (error) {
      console.error('Error activating guide:', error);
      throw error;
    }
  }
  
  // Deactivate guide
  async deactivateGuide(guideId) {
    try {
      await this.pool.query(
        'UPDATE style_guides SET active = false WHERE id = $1',
        [guideId]
      );
    } catch (error) {
      console.error('Error deactivating guide:', error);
      throw error;
    }
  }
  
  // Set active guides (activate specified, deactivate others of same type)
  async setActiveGuides(guideIds) {
    try {
      // Start transaction
      await this.pool.query('BEGIN');
      
      // Get types of guides being activated
      const result = await this.pool.query(
        'SELECT DISTINCT type FROM style_guides WHERE id = ANY($1)',
        [guideIds]
      );
      
      const types = result.rows.map(r => r.type);
      
      // Deactivate all guides of these types
      await this.pool.query(
        'UPDATE style_guides SET active = false WHERE type = ANY($1)',
        [types]
      );
      
      // Activate specified guides
      await this.pool.query(
        'UPDATE style_guides SET active = true WHERE id = ANY($1)',
        [guideIds]
      );
      
      await this.pool.query('COMMIT');
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.error('Error setting active guides:', error);
      throw error;
    }
  }
  
  // Create guide version
  async createGuideVersion(parentId, versionData) {
    const { changes, changeSummary } = versionData;
    
    try {
      // Get parent guide
      const parentResult = await this.pool.query(
        'SELECT * FROM style_guides WHERE id = $1',
        [parentId]
      );
      
      if (parentResult.rows.length === 0) {
        throw new Error('Parent guide not found');
      }
      
      const parent = parentResult.rows[0];
      
      // Get next version number
      const versionResult = await this.pool.query(
        'SELECT MAX(version) as max_version FROM style_guides WHERE parent_id = $1',
        [parentId]
      );
      
      const nextVersion = (versionResult.rows[0].max_version || parent.version || 1) + 1;
      
      // Create new version
      const result = await this.pool.query(
        `INSERT INTO style_guides 
        (type, name, vertical, content, description, perspective, voice_characteristics, 
         active, is_default, parent_id, version)
        VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, $8, $9)
        RETURNING *`,
        [parent.type, parent.name + ` (v${nextVersion})`, parent.vertical, 
         changes || parent.content, changeSummary || parent.description, 
         parent.perspective, parent.voice_characteristics,
         parentId, nextVersion]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating guide version:', error);
      throw error;
    }
  }
  
  // Soft delete guide
  async softDeleteGuide(guideId) {
    try {
      await this.pool.query(
        'UPDATE style_guides SET active = false WHERE id = $1',
        [guideId]
      );
    } catch (error) {
      console.error('Error soft deleting guide:', error);
      throw error;
    }
  }
  
  // Hard delete guide
  async hardDeleteGuide(guideId) {
    try {
      await this.pool.query(
        'DELETE FROM style_guides WHERE id = $1 OR parent_id = $1',
        [guideId]
      );
    } catch (error) {
      console.error('Error hard deleting guide:', error);
      throw error;
    }
  }
  
  // Create guide from blogs
  async createGuideFromBlogs({ blogIds, type, name, vertical, description }) {
    // This would analyze blog content to create a guide
    // For now, return a placeholder
    return this.createGuide({
      type,
      name,
      vertical,
      content: 'Style guide created from blog analysis',
      description
    });
  }
  
  // Create guide from conversation
  async createGuideFromConversation({ messages, type, name, vertical }) {
    // This would analyze conversation to create a guide
    // For now, return a placeholder
    return this.createGuide({
      type,
      name,
      vertical,
      content: 'Style guide created from conversation analysis',
      description: 'Generated from conversation'
    });
  }
  
  // Close connection pool when done
  async close() {
    await this.pool.end();
  }
}