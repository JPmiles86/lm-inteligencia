-- Migration: Add Brainstorming System Tables
-- Date: 2025-09-25
-- Description: Add brainstorm_sessions and brainstorm_ideas tables for AI brainstorming functionality

-- Create brainstorm_sessions table for session metadata
CREATE TABLE "brainstorm_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL UNIQUE, -- Frontend-generated session ID
	"topic" varchar(500) NOT NULL,
	"count" integer DEFAULT 10,
	"vertical" varchar(100),
	"tone" varchar(100) DEFAULT 'professional',
	"content_types" json DEFAULT '[]'::json,
	"custom_context" text,
	"provider" varchar(50) DEFAULT 'openai',
	"model" varchar(100) DEFAULT 'gpt-4o',
	"metadata" json DEFAULT '{}'::json,
	"tokens_used" integer DEFAULT 0,
	"cost" numeric(10,6) DEFAULT '0',
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);

-- Create brainstorm_ideas table for individual brainstormed ideas
CREATE TABLE "brainstorm_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL REFERENCES "brainstorm_sessions"("id") ON DELETE CASCADE,
	"idea_id" varchar(255) NOT NULL, -- Frontend-generated idea ID
	"title" varchar(500) NOT NULL,
	"angle" text,
	"description" text,
	"tags" json DEFAULT '[]'::json,
	"difficulty" varchar(50) DEFAULT 'Intermediate',
	"estimated_word_count" integer DEFAULT 1000,
	"score" integer DEFAULT 50,
	"is_favorited" boolean DEFAULT false,
	"is_selected" boolean DEFAULT false,
	"converted_to_blog" boolean DEFAULT false,
	"blog_post_id" integer, -- Reference to blog_posts table if converted
	"position" integer DEFAULT 0, -- Order in the session
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);

-- Create indexes for performance
CREATE INDEX "brainstorm_sessions_session_id_idx" ON "brainstorm_sessions" ("session_id");
CREATE INDEX "brainstorm_sessions_topic_idx" ON "brainstorm_sessions" ("topic");
CREATE INDEX "brainstorm_sessions_vertical_idx" ON "brainstorm_sessions" ("vertical");
CREATE INDEX "brainstorm_sessions_created_at_idx" ON "brainstorm_sessions" ("created_at");
CREATE INDEX "brainstorm_sessions_deleted_at_idx" ON "brainstorm_sessions" ("deleted_at");

CREATE INDEX "brainstorm_ideas_session_id_idx" ON "brainstorm_ideas" ("session_id");
CREATE INDEX "brainstorm_ideas_idea_id_idx" ON "brainstorm_ideas" ("idea_id");
CREATE INDEX "brainstorm_ideas_title_idx" ON "brainstorm_ideas" ("title");
CREATE INDEX "brainstorm_ideas_is_favorited_idx" ON "brainstorm_ideas" ("is_favorited");
CREATE INDEX "brainstorm_ideas_is_selected_idx" ON "brainstorm_ideas" ("is_selected");
CREATE INDEX "brainstorm_ideas_converted_to_blog_idx" ON "brainstorm_ideas" ("converted_to_blog");
CREATE INDEX "brainstorm_ideas_created_at_idx" ON "brainstorm_ideas" ("created_at");
CREATE INDEX "brainstorm_ideas_deleted_at_idx" ON "brainstorm_ideas" ("deleted_at");

-- Add foreign key constraint to blog_posts if the blog_post_id is set
-- ALTER TABLE "brainstorm_ideas" ADD CONSTRAINT "brainstorm_ideas_blog_post_id_fkey"
-- FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id");