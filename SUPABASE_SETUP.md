# FixAligner - Supabase Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login (it's free!)
3. Click "New Project"
4. Choose organization and fill in:
   - **Name**: fixaligner
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you

### 2. Get Your API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJh...`)

### 3. Update Environment Variables

Open `.env.local` and replace with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**

### 5. Enable pg_cron (Optional - for auto-cleanup)

1. In Supabase Dashboard, go to **Database** → **Extensions**
2. Search for `pg_cron` and enable it
3. Go to **SQL Editor** and run:

```sql
SELECT cron.schedule(
    'delete-old-assessed-patients',
    '0 2 * * *', -- Run at 2 AM daily
    'SELECT delete_old_assessed_patients();'
);
```

## 📊 Database Schema

### `patients` Table

- `id` (UUID) - Primary key
- `name` (TEXT) - Patient name
- `email` (TEXT, nullable) - Patient email
- `phone` (TEXT, nullable) - Patient phone
- `expo_token` (TEXT, nullable) - For push notifications
- `video_url` (TEXT, nullable) - Link to patient video
- `is_eligible` (BOOLEAN) - Eligibility status (default: true)
- `estimated_steps` (INTEGER, nullable) - Number of aligner steps
- `notes` (TEXT, nullable) - Assessment notes
- `assessed_at` (TIMESTAMP, nullable) - When assessment was completed
- `created_at` (TIMESTAMP) - Auto-generated
- `updated_at` (TIMESTAMP) - Auto-updated

## 📁 Video Storage Setup

### Option 1: Supabase Storage (Recommended)

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket called `patient-videos`
3. Set bucket to **Public** or **Private** based on your needs
4. Upload videos and get the public URL

### Option 2: External Storage (Cloudflare R2, AWS S3, etc.)

- Upload videos to your preferred storage
- Store the public URL in the `video_url` field

## 🔄 Auto-Cleanup Cron Job

The database includes a function that automatically deletes patient records where:

- `assessed_at` is not null
- Assessment was completed more than 7 days ago

This runs daily at 2 AM (once you enable pg_cron as shown above).

## 🧪 Test Your Setup

1. Start your Next.js app:

```bash
npm run dev
```

2. Create a test patient using the API:

```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "1234567890",
    "video_url": "https://example.com/video.mp4"
  }'
```

3. Visit: `http://localhost:3000/assessment/[patient-id]`

## 📋 API Endpoints

- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient by ID
- `PATCH /api/patients/[id]` - Update patient assessment
- `DELETE /api/patients/[id]` - Delete patient

## 🔒 Security Notes

- Currently, RLS (Row Level Security) allows all operations
- When you're ready to add authentication, update the RLS policies in the schema
- Never commit `.env.local` to version control (it's already in .gitignore)

## ❓ Troubleshooting

**"Failed to fetch patients"**

- Check if your Supabase credentials in `.env.local` are correct
- Verify the database schema was created successfully

**"Patient not found"**

- Make sure you've created at least one patient record in the database
- Check that the patient ID in the URL matches a record in your database

**Videos not loading**

- Verify the `video_url` is a valid, publicly accessible URL
- Check browser console for CORS errors
