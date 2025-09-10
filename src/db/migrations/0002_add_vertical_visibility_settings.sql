-- Migration: Add vertical visibility settings table
-- Created: 2025-01-09
-- Purpose: Add database storage for vertical visibility settings to replace localStorage

-- Create vertical visibility settings table
CREATE TABLE IF NOT EXISTS vertical_visibility_settings (
    id SERIAL PRIMARY KEY,
    vertical vertical NOT NULL UNIQUE,
    
    -- Section visibility flags
    show_staff_section BOOLEAN DEFAULT true,
    show_blog BOOLEAN DEFAULT true,
    show_testimonials BOOLEAN DEFAULT true,
    show_case_studies BOOLEAN DEFAULT true,
    show_optional_add_ons BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index on vertical
CREATE UNIQUE INDEX IF NOT EXISTS vertical_visibility_settings_vertical_idx 
ON vertical_visibility_settings(vertical);

-- Insert default settings for each vertical
INSERT INTO vertical_visibility_settings (vertical, show_staff_section, show_blog, show_testimonials, show_case_studies, show_optional_add_ons)
VALUES 
    ('hospitality', false, false, true, true, true),
    ('healthcare', false, false, false, false, false),
    ('tech', true, true, true, true, true),
    ('athletics', true, true, true, true, true)
ON CONFLICT (vertical) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE vertical_visibility_settings IS 'Controls which sections are visible for each industry vertical on the public website';
COMMENT ON COLUMN vertical_visibility_settings.vertical IS 'The industry vertical this setting applies to';
COMMENT ON COLUMN vertical_visibility_settings.show_staff_section IS 'Whether to show the staff/team section on About page';
COMMENT ON COLUMN vertical_visibility_settings.show_blog IS 'Whether to show blog pages and navigation links';
COMMENT ON COLUMN vertical_visibility_settings.show_testimonials IS 'Whether to show client testimonials section';
COMMENT ON COLUMN vertical_visibility_settings.show_case_studies IS 'Whether to show case studies page and navigation';
COMMENT ON COLUMN vertical_visibility_settings.show_optional_add_ons IS 'Whether to show optional add-ons section on pricing page';