-- Create provider_settings table for AI API key storage
-- This table stores encrypted API keys that users provide through the admin panel

CREATE TABLE IF NOT EXISTS provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL UNIQUE,
  api_key_encrypted TEXT,
  encryption_salt VARCHAR(255),
  default_model VARCHAR(100),
  fallback_model VARCHAR(100),
  task_defaults JSON,
  monthly_limit NUMERIC(10,2),
  current_usage NUMERIC(10,2) DEFAULT 0,
  last_reset_date TIMESTAMP DEFAULT NOW(),
  settings JSON,
  active BOOLEAN DEFAULT true,
  last_tested TIMESTAMP,
  test_success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_settings_provider ON provider_settings(provider);
CREATE INDEX IF NOT EXISTS idx_provider_settings_active ON provider_settings(active);

-- Add comment explaining the purpose
COMMENT ON TABLE provider_settings IS 'Stores user-provided API keys for AI providers (OpenAI, Anthropic, Google, Perplexity)';
COMMENT ON COLUMN provider_settings.api_key_encrypted IS 'Encrypted API key provided by the user through admin panel';
COMMENT ON COLUMN provider_settings.provider IS 'AI provider name: openai, anthropic, google, or perplexity';