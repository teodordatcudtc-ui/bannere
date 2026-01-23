-- Add TikTok metadata column to scheduled_posts table
-- This stores TikTok-specific metadata required by TikTok UX Guidelines
-- Run this migration if the table already exists

-- Check if column exists before adding (PostgreSQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN in older versions)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'scheduled_posts' 
    AND column_name = 'tiktok_metadata'
  ) THEN
    ALTER TABLE public.scheduled_posts
    ADD COLUMN tiktok_metadata JSONB;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN public.scheduled_posts.tiktok_metadata IS 'TikTok-specific metadata including privacy_status, interaction settings, and commercial content disclosure';
  END IF;
END $$;
