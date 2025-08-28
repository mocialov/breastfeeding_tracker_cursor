-- Supabase Database Setup for Breastfeeding Tracker
-- Run this script in your Supabase SQL editor

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS public.feeding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create feeding_sessions table
CREATE TABLE IF NOT EXISTS public.feeding_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER CHECK (duration > 0 AND duration <= 480), -- Max 8 hours in minutes
    breast_type TEXT CHECK (breast_type IN ('left', 'right', 'both', 'bottle')) NOT NULL,
    bottle_volume INTEGER CHECK (bottle_volume > 0 AND bottle_volume <= 500), -- Max 500ml
    notes TEXT CHECK (LENGTH(notes) >= 500 OR notes IS NULL), -- Min 500 chars if provided
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    baby_name TEXT,
    baby_birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feeding_sessions_user_id ON public.feeding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_sessions_start_time ON public.feeding_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_feeding_sessions_breast_type ON public.feeding_sessions(breast_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Create RLS policies for feeding_sessions
CREATE POLICY "Users can view their own feeding sessions" ON public.feeding_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feeding sessions" ON public.feeding_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeding sessions" ON public.feeding_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeding sessions" ON public.feeding_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_feeding_sessions_updated_at 
    BEFORE UPDATE ON public.feeding_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO public.user_profiles (id, email, full_name, baby_name, baby_birth_date)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     'test@example.com',
--     'Test User',
--     'Baby Test',
--     '2024-01-01'
-- );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.feeding_sessions TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

