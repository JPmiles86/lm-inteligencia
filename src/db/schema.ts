// Database schema for Inteligencia blog system using Drizzle ORM
// Enhanced with SEO, scheduling, and revision support

import { pgTable, serial, varchar, text, boolean, timestamp, integer, json, pgEnum } from 'drizzle-orm/pg-core';

// Enum for post status
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published']);

// Enum for change type in revisions
export const changeTypeEnum = pgEnum('change_type', ['auto', 'manual', 'publish']);

// Enhanced blog posts table with SEO, scheduling, and autosave
export const blogPosts = pgTable('blog_posts', {
  // Core fields
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: varchar('featured_image', { length: 500 }),
  category: varchar('category', { length: 100 }).notNull(),
  tags: json('tags').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  
  // Publishing fields
  published: boolean('published').default(false),
  publishedDate: varchar('published_date', { length: 50 }), // Store as string to match existing format
  status: varchar('status', { length: 20 }).default('draft'),
  scheduledPublishDate: timestamp('scheduled_publish_date'),
  timezone: varchar('timezone', { length: 50 }).default('America/New_York'),
  
  // SEO fields
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: varchar('meta_description', { length: 260 }),
  keywords: json('keywords').$type<string[]>().default([]),
  ogImage: varchar('og_image', { length: 500 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  
  // Autosave fields
  draftContent: text('draft_content'),
  lastAutosave: timestamp('last_autosave'),
  autosaveVersion: integer('autosave_version').default(0),
  
  // Author fields
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorTitle: varchar('author_title', { length: 150 }),
  authorImage: varchar('author_image', { length: 500 }),
  readTime: integer('read_time').default(5),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Blog revisions table for version history
export const blogRevisions = pgTable('blog_revisions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  metaData: json('meta_data').$type<{
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
    };
    scheduling?: {
      scheduledPublishDate?: string;
      timezone?: string;
    };
  }>(),
  changeType: varchar('change_type', { length: 20 }).notNull(),
  changeSummary: text('change_summary'),
  authorName: varchar('author_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow()
});

// Type exports
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogRevision = typeof blogRevisions.$inferSelect;
export type NewBlogRevision = typeof blogRevisions.$inferInsert;

// Extended types for frontend use
export interface BlogPostWithRevisions extends BlogPost {
  revisions?: BlogRevision[];
}

export interface BlogPostFormData {
  // Core fields
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  
  // Publishing
  published?: boolean;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledPublishDate?: Date | string;
  timezone?: string;
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  
  // Author
  author?: {
    name: string;
    title?: string;
    image?: string;
  };
}