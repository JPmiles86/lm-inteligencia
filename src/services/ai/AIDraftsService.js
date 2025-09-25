/**
 * AI Drafts Service - Replace localStorage with database persistence for AI drafts
 */

export class AIDraftsService {
  constructor() {
    // Use the same logic as other services - check if we're in production or development
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBase = isDevelopment
      ? (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api')
      : '/api';
    this.baseUrl = `${apiBase}/ai-drafts`;
  }

  /**
   * Save a draft to database instead of localStorage
   * @param {Object} params - Draft parameters
   * @param {string} params.content - Draft content
   * @param {string} params.activeVertical - Current vertical
   * @param {string} params.provider - AI provider
   * @param {string} params.model - AI model
   * @param {string} params.draftType - Type of draft (e.g., 'generation_workspace', 'structured_workflow')
   * @param {string} params.draftId - Optional existing draft ID for updates
   */
  async saveDraft({
    content,
    activeVertical,
    provider = 'openai',
    model = 'gpt-4o',
    draftType = 'generation_workspace',
    draftId
  }) {
    try {
      console.log('[AIDraftsService] Saving draft to database:', {
        draftType,
        contentLength: content?.length,
        activeVertical,
        provider,
        model
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save-draft',
          content,
          activeVertical,
          provider,
          model,
          draftType,
          draftId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save draft');
      }

      return {
        success: true,
        draftId: data.draftId,
        message: data.message || 'Draft saved successfully'
      };

    } catch (error) {
      console.error('[AIDraftsService] Error saving draft:', error);

      // Fallback to localStorage if database fails
      try {
        const draftKey = `ai-draft-${draftType}`;
        localStorage.setItem(draftKey, JSON.stringify({
          content,
          timestamp: new Date().toISOString(),
          activeVertical,
          provider,
          model,
          draftType,
          fallback: true
        }));

        console.warn('[AIDraftsService] Fallback: Draft saved to localStorage');

        return {
          success: true,
          message: 'Draft saved to localStorage (database unavailable)',
          fallback: true
        };
      } catch (fallbackError) {
        console.error('[AIDraftsService] Fallback failed:', fallbackError);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }

  /**
   * Load the most recent draft from database
   * @param {string} draftType - Type of draft to load
   */
  async loadDraft(draftType = 'generation_workspace') {
    try {
      console.log('[AIDraftsService] Loading draft from database:', { draftType });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'load-draft',
          draftType
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.draft) {
        console.log('[AIDraftsService] Draft loaded from database');
        return {
          success: true,
          draft: data.draft
        };
      } else {
        // No draft found in database, check localStorage
        return await this.loadFromLocalStorageFallback(draftType);
      }

    } catch (error) {
      console.error('[AIDraftsService] Error loading draft:', error);

      // Fallback to localStorage
      return await this.loadFromLocalStorageFallback(draftType);
    }
  }

  /**
   * Fallback method to load from localStorage
   * @private
   */
  async loadFromLocalStorageFallback(draftType) {
    try {
      const draftKey = `ai-draft-${draftType}`;
      const saved = localStorage.getItem(draftKey);

      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[AIDraftsService] Draft loaded from localStorage fallback');

        return {
          success: true,
          draft: {
            content: parsed.content,
            timestamp: parsed.timestamp,
            activeVertical: parsed.activeVertical,
            provider: parsed.provider,
            model: parsed.model,
            fallback: true
          }
        };
      } else {
        // Check legacy localStorage key for backward compatibility
        const legacyKey = 'ai-generation-draft';
        const legacySaved = localStorage.getItem(legacyKey);

        if (legacySaved && draftType === 'generation_workspace') {
          const parsed = JSON.parse(legacySaved);
          console.log('[AIDraftsService] Draft loaded from legacy localStorage');

          return {
            success: true,
            draft: {
              content: parsed.content,
              timestamp: parsed.timestamp,
              activeVertical: parsed.activeVertical,
              provider: parsed.provider,
              model: parsed.model,
              legacy: true
            }
          };
        }
      }

      return {
        success: false,
        message: 'No draft found'
      };

    } catch (error) {
      console.error('[AIDraftsService] Error in localStorage fallback:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all drafts
   * @param {string} draftType - Optional filter by draft type
   * @param {number} limit - Maximum number of drafts to return
   */
  async getDrafts(draftType, limit = 20) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-drafts',
          draftType,
          limit
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get drafts');
      }

      return {
        success: true,
        drafts: data.drafts || []
      };

    } catch (error) {
      console.error('[AIDraftsService] Error getting drafts:', error);
      return {
        success: false,
        error: error.message,
        drafts: []
      };
    }
  }

  /**
   * Delete a draft
   * @param {string} draftId - Draft ID to delete
   */
  async deleteDraft(draftId) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-draft',
          draftId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete draft');
      }

      return {
        success: true,
        message: data.message || 'Draft deleted successfully'
      };

    } catch (error) {
      console.error('[AIDraftsService] Error deleting draft:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Migrate existing localStorage drafts to database
   * This method helps with the transition from localStorage to database
   */
  async migrateLocalStorageDrafts() {
    try {
      const migratedDrafts = [];
      const keysToCheck = [
        'ai-generation-draft', // Legacy key from GenerationWorkspace
        'structured-workflow-draft', // From StructuredWorkflow
        'ai-draft-generation_workspace',
        'ai-draft-structured_workflow'
      ];

      for (const key of keysToCheck) {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            const data = JSON.parse(saved);

            // Determine draft type from key
            let draftType = 'unknown';
            if (key.includes('generation') || key.includes('workspace')) {
              draftType = 'generation_workspace';
            } else if (key.includes('workflow')) {
              draftType = 'structured_workflow';
            }

            console.log(`[AIDraftsService] Migrating draft from key: ${key}`);

            // Save to database
            const result = await this.saveDraft({
              content: data.content || '',
              activeVertical: data.activeVertical || 'hospitality',
              provider: data.provider || 'openai',
              model: data.model || 'gpt-4o',
              draftType
            });

            if (result.success) {
              migratedDrafts.push({
                originalKey: key,
                draftType,
                draftId: result.draftId,
                migrated: true
              });

              // Remove from localStorage after successful migration
              localStorage.removeItem(key);
            }
          }
        } catch (parseError) {
          console.error(`[AIDraftsService] Error parsing localStorage data for key ${key}:`, parseError);
        }
      }

      if (migratedDrafts.length > 0) {
        console.log(`[AIDraftsService] Successfully migrated ${migratedDrafts.length} drafts from localStorage`);
      }

      return {
        success: true,
        migratedCount: migratedDrafts.length,
        drafts: migratedDrafts
      };

    } catch (error) {
      console.error('[AIDraftsService] Error migrating localStorage drafts:', error);
      return {
        success: false,
        error: error.message,
        migratedCount: 0
      };
    }
  }
}

// Export singleton instance
export const aiDraftsService = new AIDraftsService();