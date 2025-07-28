-- Enable necessary extensions
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
    test_type TEXT CHECK (test_type IN ('Image', 'PDF', 'Document')),
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create password_reset_codes table
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for password_reset_codes
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON public.password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at);

-- Create storage bucket for medical images (skip if already exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-images', 'medical-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for medical_tests
CREATE POLICY "Users can view own medical tests" ON public.medical_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical tests" ON public.medical_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical tests" ON public.medical_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical tests" ON public.medical_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for password_reset_codes
CREATE POLICY "Allow insert reset codes" ON public.password_reset_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own reset codes" ON public.password_reset_codes
    FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Allow update own reset codes" ON public.password_reset_codes
    FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- Storage policies for medical images
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

-- Function to automatically update updated_at column
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

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to clean expired reset codes (run periodically)
CREATE OR REPLACE FUNCTION public.clean_expired_reset_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.password_reset_codes
    WHERE expires_at < timezone('utc'::text, now()) OR used = true;
END;
$$ language 'plpgsql' security definer; 