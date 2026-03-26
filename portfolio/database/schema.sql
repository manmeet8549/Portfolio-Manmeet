-- =============================================
-- Supabase Schema for Portfolio Website
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous users to INSERT (form submissions)
CREATE POLICY "Allow public insert" ON contacts
    FOR INSERT
    WITH CHECK (true);

-- 4. Restrict SELECT to authenticated users only (admin)
CREATE POLICY "Allow authenticated select" ON contacts
    FOR SELECT
    USING (auth.role() = 'authenticated');
