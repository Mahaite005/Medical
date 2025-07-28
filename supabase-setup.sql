-- =================================
-- Supabase Setup for Medical AI App
-- =================================
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    age INTEGER,
    country TEXT,
    gender TEXT CHECK (gender IN ('ذكر', 'أنثى')),
    marital_status TEXT CHECK (marital_status IN ('متزوج', 'أعزب')),
    previous_medical_conditions TEXT,
    is_smoker BOOLEAN DEFAULT FALSE,
    current_diseases TEXT,
    surgeries TEXT,
    chronic_diseases TEXT,
    current_medications TEXT,
    has_drug_allergies BOOLEAN DEFAULT FALSE,
    drug_allergies_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create medical_tests table
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

-- Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for medical_tests table
CREATE POLICY "Users can view own medical tests" ON public.medical_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical tests" ON public.medical_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical tests" ON public.medical_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical tests" ON public.medical_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Function to handle updated_at automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.medical_tests
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =================================
-- Storage Setup (create bucket manually in Storage tab)
-- Bucket name: medical-images (make it public)
-- ================================= 