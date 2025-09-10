-- Create enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE vertical AS ENUM ('hospitality', 'healthcare', 'tech', 'athletics');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- Insert default settings for each vertical (if they don't exist)
INSERT INTO vertical_visibility_settings (vertical, show_staff_section, show_blog, show_testimonials, show_case_studies, show_optional_add_ons)
VALUES 
    ('hospitality', false, false, true, true, true),
    ('healthcare', false, false, false, false, false),
    ('tech', true, true, true, true, true),
    ('athletics', true, true, true, true, true)
ON CONFLICT (vertical) DO NOTHING;