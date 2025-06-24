-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  time_tokens INTEGER DEFAULT 0,
  reputation DECIMAL(3,2) DEFAULT 5.0,
  total_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  tokens_earned INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_posts table
CREATE TABLE IF NOT EXISTS marketplace_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offer', 'request')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  tokens_required INTEGER NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES marketplace_posts(id) ON DELETE CASCADE,
  tokens_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES marketplace_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availabilities table
CREATE TABLE IF NOT EXISTS availabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES marketplace_posts(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all marketplace posts" ON marketplace_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON marketplace_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON marketplace_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view ratings for their transactions" ON ratings FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can insert ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their appointments" ON appointments FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can schedule appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view availabilities" ON availabilities FOR SELECT USING (true);
CREATE POLICY "Users can manage own availabilities" ON availabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own availabilities" ON availabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own availabilities" ON availabilities FOR DELETE USING (auth.uid() = user_id);

                -- para desarrollo, actualizaciones script en sql editor de supabase
--  -- POLÍTICAS para "profiles"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view all profiles" ON profiles;
-- EXCEPTION WHEN OTHERS THEN
--   -- Ignore if doesn't exist
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can update own profile" ON profiles;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can insert own profile" ON profiles;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- -- POLÍTICAS para "activities"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view own activities" ON activities;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can insert own activities" ON activities;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -- POLÍTICAS para "marketplace_posts"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view all marketplace posts" ON marketplace_posts;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can insert own posts" ON marketplace_posts;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can update own posts" ON marketplace_posts;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view all marketplace posts" ON marketplace_posts FOR SELECT USING (true);
-- CREATE POLICY "Users can insert own posts" ON marketplace_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own posts" ON marketplace_posts FOR UPDATE USING (auth.uid() = user_id);

-- -- POLÍTICAS para "transactions"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view own transactions" ON transactions;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can insert transactions" ON transactions;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
-- CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- -- POLÍTICAS para "ratings"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view ratings for their transactions" ON ratings;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can insert ratings" ON ratings;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view ratings for their transactions" ON ratings FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
-- CREATE POLICY "Users can insert ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- -- POLÍTICAS para "messages"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view their messages" ON messages;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can send messages" ON messages;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
-- CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- -- POLÍTICAS para "appointments"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view their appointments" ON appointments;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can schedule appointments" ON appointments;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view their appointments" ON appointments FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
-- CREATE POLICY "Users can schedule appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- POLÍTICAS para "availabilities"
-- DO $$
-- BEGIN
--   DROP POLICY "Users can view availabilities" ON availabilities;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can insert availabilities" ON availabilities;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can update availabilities" ON availabilities;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- DO $$
-- BEGIN
--   DROP POLICY "Users can delete availabilities" ON availabilities;
-- EXCEPTION WHEN OTHERS THEN
-- END
-- $$;

-- CREATE POLICY "Users can view availabilities" ON availabilities FOR SELECT USING (true);
-- CREATE POLICY "Users can insert availabilities" ON availabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update availabilities" ON availabilities FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete availabilities" ON availabilities FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_posts_status ON marketplace_posts(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_posts_type ON marketplace_posts(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_posts_category ON marketplace_posts(category);
CREATE INDEX IF NOT EXISTS idx_transactions_users ON transactions(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_users ON appointments(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_availabilities_user ON availabilities(user_id);

-- Function to increment total_time_minutes for a profile
CREATE OR REPLACE FUNCTION increment_total_time(user_id UUID, minutes INTEGER)
RETURNS VOID
SET search_path = public
 AS $$
  UPDATE profiles
  SET total_time_minutes = COALESCE(total_time_minutes, 0) + minutes,
      updated_at = NOW()
  WHERE id = user_id;
$$ LANGUAGE SQL;