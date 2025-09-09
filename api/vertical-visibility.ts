/**
 * Vertical Visibility Settings API endpoint
 * Handles CRUD operations for vertical visibility settings
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, inArray } from 'drizzle-orm';
import { pgTable, serial, varchar, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

// Inline schema to avoid import issues
const verticalEnum = pgEnum('vertical', ['hospitality', 'healthcare', 'tech', 'athletics']);

const verticalVisibilitySettings = pgTable('vertical_visibility_settings', {
  id: serial('id').primaryKey(),
  vertical: verticalEnum('vertical').notNull().unique(),
  
  // Section visibility flags
  showStaffSection: boolean('show_staff_section').default(true),
  showBlog: boolean('show_blog').default(true),
  showTestimonials: boolean('show_testimonials').default(true),
  showCaseStudies: boolean('show_case_studies').default(true),
  showOptionalAddOns: boolean('show_optional_add_ons').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  verticalIdx: uniqueIndex('vertical_visibility_settings_vertical_idx').on(table.vertical),
}));

// Default settings for each vertical
const defaultSettings = {
  hospitality: {
    showStaffSection: false, // Hidden for hospitality
    showBlog: false, // Hidden for hospitality
    showTestimonials: true,
    showCaseStudies: true,
    showOptionalAddOns: true,
  },
  healthcare: {
    showStaffSection: false, // Hidden for healthcare
    showBlog: false, // Hidden for healthcare
    showTestimonials: false, // Hidden for healthcare
    showCaseStudies: false, // Hidden for healthcare
    showOptionalAddOns: false, // Hidden for healthcare
  },
  tech: {
    showStaffSection: true,
    showBlog: true,
    showTestimonials: true,
    showCaseStudies: true,
    showOptionalAddOns: true,
  },
  athletics: {
    showStaffSection: true,
    showBlog: true,
    showTestimonials: true,
    showCaseStudies: true,
    showOptionalAddOns: true,
  },
};

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let sql: any;
  let db: any;

  try {
    // Initialize database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not configured');
    }

    sql = postgres(connectionString, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    db = drizzle(sql);

    // Check for authentication on write operations
    const requiresAuth = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '');
    
    if (requiresAuth) {
      // Check for admin authentication
      const authHeader = req.headers.authorization;
      
      // Simple token-based auth - in production, use proper JWT or session auth
      const adminToken = process.env.ADMIN_API_TOKEN || 'inteligencia-admin-2025';
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await sql?.end();
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (token !== adminToken) {
        await sql?.end();
        return res.status(403).json({ error: 'Invalid authentication token' });
      }
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET': {
        // Parse query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const vertical = url.searchParams.get('vertical');

        if (vertical) {
          // Get settings for specific vertical
          const settings = await db
            .select()
            .from(verticalVisibilitySettings)
            .where(eq(verticalVisibilitySettings.vertical, vertical))
            .limit(1);

          if (settings.length === 0) {
            // Return default settings if none exist in database
            const defaultSetting = defaultSettings[vertical as keyof typeof defaultSettings];
            if (defaultSetting) {
              await sql.end();
              return res.status(200).json({
                data: {
                  vertical,
                  ...defaultSetting,
                  isDefault: true
                }
              });
            } else {
              await sql.end();
              return res.status(404).json({ error: 'Invalid vertical' });
            }
          }

          await sql.end();
          return res.status(200).json({ data: settings[0] });
        } else {
          // Get settings for all verticals
          const allSettings = await db.select().from(verticalVisibilitySettings);
          
          // Create a map of existing settings
          const existingSettings: Record<string, any> = {};
          allSettings.forEach(setting => {
            existingSettings[setting.vertical] = setting;
          });

          // Build complete settings object with defaults
          const completeSettings: Record<string, any> = {};
          Object.keys(defaultSettings).forEach(verticalKey => {
            if (existingSettings[verticalKey]) {
              completeSettings[verticalKey] = existingSettings[verticalKey];
            } else {
              completeSettings[verticalKey] = {
                vertical: verticalKey,
                ...defaultSettings[verticalKey as keyof typeof defaultSettings],
                isDefault: true
              };
            }
          });

          await sql.end();
          return res.status(200).json({ data: completeSettings });
        }
      }

      case 'POST':
      case 'PUT':
      case 'PATCH': {
        // Create or update vertical settings
        const { vertical, ...settingsData } = req.body;
        
        if (!vertical) {
          await sql.end();
          return res.status(400).json({ error: 'Vertical is required' });
        }

        if (!Object.keys(defaultSettings).includes(vertical)) {
          await sql.end();
          return res.status(400).json({ error: 'Invalid vertical' });
        }

        // Prepare settings object
        const settingsToSave = {
          vertical,
          showStaffSection: settingsData.showStaffSection ?? defaultSettings[vertical as keyof typeof defaultSettings].showStaffSection,
          showBlog: settingsData.showBlog ?? defaultSettings[vertical as keyof typeof defaultSettings].showBlog,
          showTestimonials: settingsData.showTestimonials ?? defaultSettings[vertical as keyof typeof defaultSettings].showTestimonials,
          showCaseStudies: settingsData.showCaseStudies ?? defaultSettings[vertical as keyof typeof defaultSettings].showCaseStudies,
          showOptionalAddOns: settingsData.showOptionalAddOns ?? defaultSettings[vertical as keyof typeof defaultSettings].showOptionalAddOns,
          updatedAt: new Date(),
        };

        // Check if settings already exist
        const existing = await db
          .select()
          .from(verticalVisibilitySettings)
          .where(eq(verticalVisibilitySettings.vertical, vertical))
          .limit(1);

        let result;
        if (existing.length > 0) {
          // Update existing settings
          [result] = await db
            .update(verticalVisibilitySettings)
            .set(settingsToSave)
            .where(eq(verticalVisibilitySettings.vertical, vertical))
            .returning();
        } else {
          // Create new settings
          [result] = await db
            .insert(verticalVisibilitySettings)
            .values(settingsToSave)
            .returning();
        }

        await sql.end();
        return res.status(200).json({ data: result });
      }

      case 'PATCH': {
        // Update multiple verticals at once
        const updates = req.body.updates || [];
        
        if (!Array.isArray(updates) || updates.length === 0) {
          await sql.end();
          return res.status(400).json({ error: 'Updates array is required' });
        }

        const results = [];
        
        for (const update of updates) {
          const { vertical, ...settingsData } = update;
          
          if (!vertical || !Object.keys(defaultSettings).includes(vertical)) {
            continue; // Skip invalid entries
          }

          const settingsToSave = {
            vertical,
            showStaffSection: settingsData.showStaffSection ?? defaultSettings[vertical as keyof typeof defaultSettings].showStaffSection,
            showBlog: settingsData.showBlog ?? defaultSettings[vertical as keyof typeof defaultSettings].showBlog,
            showTestimonials: settingsData.showTestimonials ?? defaultSettings[vertical as keyof typeof defaultSettings].showTestimonials,
            showCaseStudies: settingsData.showCaseStudies ?? defaultSettings[vertical as keyof typeof defaultSettings].showCaseStudies,
            showOptionalAddOns: settingsData.showOptionalAddOns ?? defaultSettings[vertical as keyof typeof defaultSettings].showOptionalAddOns,
            updatedAt: new Date(),
          };

          // Check if settings already exist
          const existing = await db
            .select()
            .from(verticalVisibilitySettings)
            .where(eq(verticalVisibilitySettings.vertical, vertical))
            .limit(1);

          let result;
          if (existing.length > 0) {
            // Update existing settings
            [result] = await db
              .update(verticalVisibilitySettings)
              .set(settingsToSave)
              .where(eq(verticalVisibilitySettings.vertical, vertical))
              .returning();
          } else {
            // Create new settings
            [result] = await db
              .insert(verticalVisibilitySettings)
              .values(settingsToSave)
              .returning();
          }
          
          results.push(result);
        }

        await sql.end();
        return res.status(200).json({ data: results });
      }

      default:
        await sql.end();
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Vertical Visibility API error:', error);
    
    // Close database connection on error
    if (sql) {
      try {
        await sql.end();
      } catch {}
    }

    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}