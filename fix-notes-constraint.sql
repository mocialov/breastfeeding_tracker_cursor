-- Fix the notes constraint in feeding_sessions table
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE public.feeding_sessions
DROP CONSTRAINT IF EXISTS feeding_sessions_notes_check;

-- Add the new constraint (minimum 1 character or NULL)
ALTER TABLE public.feeding_sessions
ADD CONSTRAINT feeding_sessions_notes_check
CHECK (LENGTH(notes) >= 1 OR notes IS NULL);
