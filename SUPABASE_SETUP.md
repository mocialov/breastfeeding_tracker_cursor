# Supabase Setup Guide for Breastfeeding Tracker

This guide will walk you through setting up Supabase as the backend for your breastfeeding tracking application.

## 🚀 Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, Google, or email
4. Verify your email address

## 🏗️ Step 2: Create a New Project

1. Click "New Project" from your dashboard
2. Choose your organization (or create one)
3. Fill in the project details:
   - **Name**: `breastfeeding-tracker` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
4. Click "Create new project"
5. Wait for the project to be set up (this takes a few minutes)

## 🔑 Step 3: Get Your API Keys

1. Once your project is ready, go to the project dashboard
2. Navigate to **Settings** → **API** in the left sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 🗄️ Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click **Run** to execute the script
5. You should see success messages for all the table creations

## 🔐 Step 5: Configure Authentication

1. Go to **Authentication** → **Settings** in the left sidebar
2. Under **Site URL**, add your local development URL:
   - For development: `http://localhost:3000`
   - For production: your actual domain
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**` (for development)
   - `https://yourdomain.com/**` (for production)
4. Click **Save**

## 🌐 Step 6: Configure Environment Variables

1. In your project root, create a `.env.local` file:
   ```bash
   touch .env.local
   ```

2. Add your Supabase credentials:
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Never commit `.env.local` to version control!

## 🧪 Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. You should see the authentication page
4. Try creating a new account
5. Check your email for verification (check spam folder if needed)

## 🔍 Step 8: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see two tables:
   - `feeding_sessions`
   - `user_profiles`

3. Go to **Authentication** → **Users** to see registered users

## 🚨 Troubleshooting

### Common Issues

#### "Invalid API key" error
- Double-check your environment variables
- Make sure you're using the **anon key**, not the service role key
- Restart your development server after changing environment variables

#### "Table doesn't exist" error
- Make sure you ran the `supabase-setup.sql` script completely
- Check the SQL Editor for any error messages
- Verify the tables exist in **Table Editor**

#### Authentication not working
- Check your Site URL and Redirect URLs in Authentication settings
- Make sure your `.env.local` file is in the project root
- Verify the environment variable names start with `REACT_APP_`

#### Database connection issues
- Check your project status in Supabase dashboard
- Verify your database password is correct
- Check if your project is paused (free tier projects auto-pause after inactivity)

### Getting Help

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Stack Overflow**: Tag questions with `supabase`

## 🔒 Security Features

Your Supabase setup includes:

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic backups**: Daily backups with point-in-time recovery
- **Encrypted storage**: All data is encrypted at rest
- **User authentication**: Secure signup/login with email verification
- **API rate limiting**: Built-in protection against abuse

## 📊 Database Schema

### feeding_sessions
- `id`: Unique identifier (UUID)
- `user_id`: References the authenticated user
- `start_time`: When the feeding session started
- `end_time`: When the feeding session ended (optional)
- `duration`: Session duration in minutes
- `breast_type`: Left, right, both, or bottle
- `bottle_volume`: Volume in ml (for bottle feeding)
- `notes`: Session notes (minimum 500 characters if provided)
- `is_active`: Whether the session is currently active
- `created_at`: When the record was created
- `updated_at`: When the record was last updated

### user_profiles
- `id`: References the authenticated user
- `email`: User's email address
- `full_name`: User's full name (optional)
- `baby_name`: Baby's name (optional)
- `baby_birth_date`: Baby's birth date (optional)
- `created_at`: When the profile was created
- `updated_at`: When the profile was last updated

## 🚀 Next Steps

Once your Supabase setup is complete:

1. **Test the application** thoroughly
2. **Deploy to production** when ready
3. **Monitor usage** in your Supabase dashboard
4. **Set up alerts** for database usage (free tier limits)
5. **Consider upgrading** to paid plans for production use

## 💰 Pricing

- **Free Tier**: 
  - 2 projects
  - 500MB database
  - 50MB file storage
  - 2GB bandwidth
  - Auto-pause after 7 days of inactivity

- **Pro Plan**: $25/month
  - Unlimited projects
  - 8GB database
  - 100GB file storage
  - 250GB bandwidth
  - No auto-pause

## 🎉 You're All Set!

Your breastfeeding tracking application now has:
- ✅ Cloud data storage
- ✅ User authentication
- ✅ Data privacy and security
- ✅ Automatic backups
- ✅ Scalable infrastructure

Start tracking those feeding sessions! 👶🍼

