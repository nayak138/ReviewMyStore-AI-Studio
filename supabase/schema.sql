-- ==============================================================================
-- ReviewMyStore.AI — Production Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'growth' CHECK (plan IN ('starter', 'growth', 'agency')),
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Stores Table
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  category TEXT NOT NULL,
  industry TEXT DEFAULT 'retail' CHECK (industry IN ('cafe', 'salon', 'dental', 'automotive', 'gym', 'retail', 'services', 'other')),
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours TEXT,
  photo_url TEXT,
  logo_url TEXT,
  rating NUMERIC(2, 1) DEFAULT 4.9,
  user_ratings_total INTEGER DEFAULT 0,
  google_place_id TEXT,
  google_review_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  nfc_enabled BOOLEAN DEFAULT true,
  private_feedback_shield BOOLEAN DEFAULT true,
  auto_pilot JSONB DEFAULT '{"enabled": true, "minRating": 4, "tone": "Warm & Grateful", "ownerName": "Management"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Keywords Table (Per Store custom keywords)
CREATE TABLE IF NOT EXISTS public.store_keywords (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('experience', 'product', 'staff', 'general')),
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  selected_keywords TEXT[] DEFAULT '{}',
  sentiment TEXT DEFAULT 'positive' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  mentioned_entities TEXT[] DEFAULT '{}',
  ai_reply TEXT,
  reply_status TEXT DEFAULT 'pending' CHECK (reply_status IN ('pending', 'drafted', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  is_auto_pilot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Private Feedback Table (Shield for 1-3 star reviews)
CREATE TABLE IF NOT EXISTS public.private_feedbacks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  rating INTEGER NOT NULL,
  feedback_text TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Social Broadcasts Table (Bundle.social logs)
CREATE TABLE IF NOT EXISTS public.social_broadcasts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  review_id TEXT REFERENCES public.reviews(id) ON DELETE SET NULL,
  channels TEXT[] NOT NULL,
  caption TEXT NOT NULL,
  post_id TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'scheduled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_broadcasts ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Stores: Public can view store profiles (needed for QR scanning)
CREATE POLICY "Public can view stores" ON public.stores
  FOR SELECT USING (true);

-- Store owners can manage their stores
CREATE POLICY "Owners can insert/update their stores" ON public.stores
  FOR ALL USING (auth.uid() = owner_id);

-- Keywords: Public can read keywords for review selection
CREATE POLICY "Public can view keywords" ON public.store_keywords
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage store keywords" ON public.store_keywords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores WHERE stores.id = store_keywords.store_id AND stores.owner_id = auth.uid()
    )
  );

-- Reviews: Anyone can submit a review via the public QR portal
CREATE POLICY "Public can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Store owners can update reviews (AI replies)" ON public.reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stores WHERE stores.id = reviews.store_id AND stores.owner_id = auth.uid()
    )
  );

-- Private Feedback: Public can insert shield feedback, only store owners can read
CREATE POLICY "Public can insert private feedback" ON public.private_feedbacks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Store owners can view and manage private feedback" ON public.private_feedbacks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores WHERE stores.id = private_feedbacks.store_id AND stores.owner_id = auth.uid()
    )
  );

-- Profile creation trigger on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
