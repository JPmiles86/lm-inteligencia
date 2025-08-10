-- Add multi-industry support to existing schema
-- This extends the current blog-focused system to support multi-industry websites

-- Industry configurations for each tenant
CREATE TABLE IF NOT EXISTS industry_configs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, industry)
);

-- Industry-specific content
CREATE TABLE IF NOT EXISTS industry_content (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'services', 'team', etc.
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, industry, section_type)
);

-- Multi-industry websites (client sites)
CREATE TABLE IF NOT EXISTS client_sites (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  site_name VARCHAR(100) NOT NULL,
  primary_domain VARCHAR(100) NOT NULL,
  industries JSONB NOT NULL DEFAULT '[]',
  config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated images tracking (AI image generation)
CREATE TABLE IF NOT EXISTS generated_images (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50),
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  openai_image_id VARCHAR(100),
  usage_context VARCHAR(100), -- 'hero', 'service', 'team', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Platform analytics for JP's admin dashboard
CREATE TABLE IF NOT EXISTS platform_analytics (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- CSV import logs for content management
CREATE TABLE IF NOT EXISTS csv_import_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  total_rows INTEGER,
  processed_rows INTEGER,
  errors_count INTEGER,
  errors JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Content templates for the platform system
CREATE TABLE IF NOT EXISTS content_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL,
  industry VARCHAR(50),
  section_type VARCHAR(50) NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_industry_configs_tenant_industry ON industry_configs(tenant_id, industry);
CREATE INDEX IF NOT EXISTS idx_industry_content_tenant_industry ON industry_content(tenant_id, industry);
CREATE INDEX IF NOT EXISTS idx_client_sites_tenant ON client_sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_tenant_industry ON generated_images(tenant_id, industry);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_tenant_event ON platform_analytics(tenant_id, event_type);
CREATE INDEX IF NOT EXISTS idx_csv_import_logs_tenant ON csv_import_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_industry ON content_templates(industry, section_type);