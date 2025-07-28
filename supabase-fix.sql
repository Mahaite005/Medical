-- =================================
-- Supabase Fix Script - Medical AI App
-- =================================
-- This script handles existing policies and tables safely

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own medical tests" ON public.medical_tests;
DROP POLICY IF EXISTS "Users can insert own medical tests" ON public.medical_tests;
DROP POLICY IF EXISTS "Users can update own medical tests" ON public.medical_tests;
DROP POLICY IF EXISTS "Users can delete own medical tests" ON public.medical_tests;
DROP POLICY IF EXISTS "Users can upload medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own medical images" ON storage.objects;

-- Create or recreate profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create or recreate medical_tests table
CREATE TABLE IF NOT EXISTS public.medical_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    test_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_tests ENABLE ROW LEVEL SECURITY;

-- Create new policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create new policies for medical_tests table
CREATE POLICY "Users can view own medical tests" ON public.medical_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical tests" ON public.medical_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical tests" ON public.medical_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical tests" ON public.medical_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Create new storage policies for medical images
CREATE POLICY "Users can upload medical images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'medical-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own medical images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'medical-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own medical images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'medical-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own medical images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'medical-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.medical_tests;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function to handle updated_at automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.medical_tests
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Recreate function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-images', 'medical-images', true)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message; 