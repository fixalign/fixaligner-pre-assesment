-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    expo_token TEXT,
    video_url TEXT,
    is_eligible BOOLEAN DEFAULT true,
    estimated_steps INTEGER,
    notes TEXT,
    assessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on assessed_at for the cleanup cron job
CREATE INDEX IF NOT EXISTS idx_patients_assessed_at ON patients(assessed_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - but allow all operations since no auth
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no auth required)
DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
CREATE POLICY "Allow all operations on patients" ON patients
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to delete old assessed videos (run via cron)
CREATE OR REPLACE FUNCTION delete_old_assessed_patients()
RETURNS void AS $$
BEGIN
    DELETE FROM patients
    WHERE assessed_at IS NOT NULL
    AND assessed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STORAGE BUCKET SETUP
-- ==========================================
-- Create storage bucket for patient videos
-- Run this in Supabase Dashboard > Storage or via SQL

INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-videos', 'patient-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view videos (adjust based on your security needs)
CREATE POLICY "Public Access for Patient Videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-videos');

-- Allow anyone to upload videos (adjust based on your security needs)
CREATE POLICY "Allow Upload Patient Videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-videos');

-- Allow delete for cleanup
CREATE POLICY "Allow Delete Patient Videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'patient-videos');

-- ==========================================
-- CRON JOB SETUP (Optional)
-- ==========================================
-- Note: To set up the cron job, you'll need to enable pg_cron extension in Supabase
-- Then run:
-- SELECT cron.schedule(
--     'delete-old-assessed-patients',
--     '0 2 * * *', -- Run at 2 AM daily
--     'SELECT delete_old_assessed_patients();'
-- );
