// Database schema for Inteligencia blog system using Drizzle ORM

import { pgTable, serial, varchar, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: varchar('featured_image', { length: 500 }),
  category: varchar('category', { length: 100 }).notNull(),
  tags: json('tags').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  published: boolean('published').default(false),
  publishedDate: varchar('published_date', { length: 50 }), // Store as string to match existing format
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorTitle: varchar('author_title', { length: 150 }),
  authorImage: varchar('author_image', { length: 500 }),
  readTime: integer('read_time').default(5),
  editorType: varchar('editor_type', { length: 20 }).default('rich') // 'rich' or 'block'
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;