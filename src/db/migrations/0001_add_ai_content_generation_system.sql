-- Migration: Add AI Content Generation System
-- Date: 2025-08-25
-- Description: Complete AI generation system with style guides, generation trees, provider management, and analytics

-- Create enums for AI system
CREATE TYPE "public"."style_guide_type" AS ENUM('brand', 'vertical', 'writing_style', 'persona');
CREATE TYPE "public"."generation_node_type" AS ENUM('idea', 'title', 'synopsis', 'outline', 'blog', 'social', 'image_prompt', 'analysis');
CREATE TYPE "public"."generation_mode" AS ENUM('structured', 'direct', 'batch', 'multi_vertical', 'edit_existing');
CREATE TYPE "public"."vertical" AS ENUM('hospitality', 'healthcare', 'tech', 'athletics');
CREATE TYPE "public"."provider" AS ENUM('openai', 'anthropic', 'google', 'perplexity');
CREATE TYPE "public"."image_reference_type" AS ENUM('style', 'logo', 'persona');
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Add new fields to existing blog_posts table for AI integration
ALTER TABLE "blog_posts" 
ADD COLUMN "status" varchar(20) DEFAULT 'draft',
ADD COLUMN "scheduled_publish_date" timestamp,
ADD COLUMN "timezone" varchar(50) DEFAULT 'America/New_York',
ADD COLUMN "meta_title" varchar(160),
ADD COLUMN "meta_description" varchar(260),
ADD COLUMN "keywords" json DEFAULT '[]'::json,
ADD COLUMN "og_image" varchar(500),
ADD COLUMN "canonical_url" varchar(500),
ADD COLUMN "draft_content" text,
ADD COLUMN "last_autosave" timestamp,
ADD COLUMN "autosave_version" integer DEFAULT 0;

-- Create style guides table
CREATE TABLE "style_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "style_guide_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"vertical" "vertical",
	"content" text NOT NULL,
	"description" text,
	"version" integer DEFAULT 1,
	"parent_id" uuid,
	"active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"perspective" varchar(255),
	"voice_characteristics" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create generation nodes table (core AI generation tree)
CREATE TABLE "generation_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "generation_node_type" NOT NULL,
	"mode" "generation_mode",
	"content" text,
	"structured_content" json,
	"parent_id" uuid,
	"root_id" uuid,
	"selected" boolean DEFAULT false,
	"visible" boolean DEFAULT true,
	"deleted" boolean DEFAULT false,
	"vertical" "vertical",
	"provider" "provider" NOT NULL,
	"model" varchar(100) NOT NULL,
	"prompt" text,
	"context_data" json,
	"tokens_input" integer DEFAULT 0,
	"tokens_output" integer DEFAULT 0,
	"cost" numeric(10,6) DEFAULT '0',
	"duration_ms" integer,
	"status" "generation_status" DEFAULT 'pending',
	"error_message" text,
	"published_blog_id" integer,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);

-- Create provider settings table
CREATE TABLE "provider_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL UNIQUE,
	"api_key_encrypted" text NOT NULL,
	"encryption_salt" varchar(255),
	"default_model" varchar(100),
	"fallback_model" varchar(100),
	"task_defaults" json,
	"monthly_limit" numeric(10,2),
	"current_usage" numeric(10,2) DEFAULT '0',
	"last_reset_date" timestamp DEFAULT now(),
	"settings" json,
	"active" boolean DEFAULT true,
	"last_tested" timestamp,
	"test_success" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create reference images table
CREATE TABLE "reference_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "image_reference_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"tags" json DEFAULT '[]'::json,
	"vertical" "vertical",
	"file_size" integer,
	"mime_type" varchar(100),
	"width" integer,
	"height" integer,
	"usage_count" integer DEFAULT 0,
	"last_used" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create characters table
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"physical_description" text,
	"personality" text,
	"role" varchar(100),
	"reference_image_ids" json DEFAULT '[]'::json,
	"generated_image_urls" json DEFAULT '[]'::json,
	"embedding" text,
	"usage_count" integer DEFAULT 0,
	"last_used" timestamp,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create context templates table
CREATE TABLE "context_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"config" json NOT NULL,
	"usage_count" integer DEFAULT 0,
	"last_used" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create generation analytics table
CREATE TABLE "generation_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"vertical" "vertical",
	"provider" "provider",
	"model" varchar(100),
	"total_generations" integer DEFAULT 0,
	"successful_generations" integer DEFAULT 0,
	"failed_generations" integer DEFAULT 0,
	"total_tokens_input" integer DEFAULT 0,
	"total_tokens_output" integer DEFAULT 0,
	"total_cost" numeric(10,6) DEFAULT '0',
	"average_cost" numeric(10,6) DEFAULT '0',
	"average_duration_ms" integer DEFAULT 0,
	"min_duration_ms" integer,
	"max_duration_ms" integer,
	"average_content_length" integer DEFAULT 0,
	"total_content_length" integer DEFAULT 0,
	"task_breakdown" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create image prompts table
CREATE TABLE "image_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_node_id" uuid NOT NULL,
	"original_text" text NOT NULL,
	"edited_text" text,
	"final_text" text,
	"position" integer NOT NULL,
	"type" varchar(50) DEFAULT 'section',
	"character_ids" json DEFAULT '[]'::json,
	"style_reference_ids" json DEFAULT '[]'::json,
	"generated_images" json DEFAULT '[]'::json,
	"generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create usage logs table
CREATE TABLE "usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"model" varchar(100) NOT NULL,
	"task_type" varchar(100),
	"vertical" "vertical",
	"requested_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration_ms" integer,
	"tokens_input" integer DEFAULT 0,
	"tokens_output" integer DEFAULT 0,
	"cost" numeric(10,6) DEFAULT '0',
	"request_data" json,
	"response_data" json,
	"error_data" json,
	"success" boolean DEFAULT true,
	"error_message" text,
	"generation_node_id" uuid,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "style_guides" ADD CONSTRAINT "style_guides_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "style_guides"("id");
ALTER TABLE "generation_nodes" ADD CONSTRAINT "generation_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "generation_nodes"("id");
ALTER TABLE "generation_nodes" ADD CONSTRAINT "generation_nodes_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "generation_nodes"("id");
ALTER TABLE "generation_nodes" ADD CONSTRAINT "generation_nodes_published_blog_id_fkey" FOREIGN KEY ("published_blog_id") REFERENCES "blog_posts"("id");
ALTER TABLE "image_prompts" ADD CONSTRAINT "image_prompts_generation_node_id_fkey" FOREIGN KEY ("generation_node_id") REFERENCES "generation_nodes"("id") ON DELETE CASCADE;
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_generation_node_id_fkey" FOREIGN KEY ("generation_node_id") REFERENCES "generation_nodes"("id");

-- Create indexes for performance
CREATE INDEX "style_guides_type_idx" ON "style_guides" ("type");
CREATE INDEX "style_guides_vertical_idx" ON "style_guides" ("vertical");
CREATE INDEX "style_guides_active_idx" ON "style_guides" ("active");

CREATE INDEX "generation_nodes_type_idx" ON "generation_nodes" ("type");
CREATE INDEX "generation_nodes_parent_idx" ON "generation_nodes" ("parent_id");
CREATE INDEX "generation_nodes_root_idx" ON "generation_nodes" ("root_id");
CREATE INDEX "generation_nodes_vertical_idx" ON "generation_nodes" ("vertical");
CREATE INDEX "generation_nodes_status_idx" ON "generation_nodes" ("status");
CREATE INDEX "generation_nodes_created_at_idx" ON "generation_nodes" ("created_at");
CREATE INDEX "generation_nodes_published_blog_idx" ON "generation_nodes" ("published_blog_id");

CREATE UNIQUE INDEX "provider_settings_provider_idx" ON "provider_settings" ("provider");

CREATE INDEX "reference_images_type_idx" ON "reference_images" ("type");
CREATE INDEX "reference_images_vertical_idx" ON "reference_images" ("vertical");
CREATE INDEX "reference_images_last_used_idx" ON "reference_images" ("last_used");

CREATE INDEX "characters_name_idx" ON "characters" ("name");
CREATE INDEX "characters_active_idx" ON "characters" ("active");
CREATE INDEX "characters_last_used_idx" ON "characters" ("last_used");

CREATE INDEX "context_templates_name_idx" ON "context_templates" ("name");
CREATE INDEX "context_templates_last_used_idx" ON "context_templates" ("last_used");

CREATE INDEX "generation_analytics_date_idx" ON "generation_analytics" ("date");
CREATE INDEX "generation_analytics_vertical_idx" ON "generation_analytics" ("vertical");
CREATE INDEX "generation_analytics_provider_idx" ON "generation_analytics" ("provider");
CREATE UNIQUE INDEX "generation_analytics_unique_idx" ON "generation_analytics" ("date", "vertical", "provider", "model");

CREATE INDEX "image_prompts_generation_node_idx" ON "image_prompts" ("generation_node_id");
CREATE INDEX "image_prompts_position_idx" ON "image_prompts" ("position");
CREATE INDEX "image_prompts_generated_idx" ON "image_prompts" ("generated");

CREATE INDEX "usage_logs_provider_idx" ON "usage_logs" ("provider");
CREATE INDEX "usage_logs_requested_at_idx" ON "usage_logs" ("requested_at");
CREATE INDEX "usage_logs_success_idx" ON "usage_logs" ("success");
CREATE INDEX "usage_logs_generation_node_idx" ON "usage_logs" ("generation_node_id");