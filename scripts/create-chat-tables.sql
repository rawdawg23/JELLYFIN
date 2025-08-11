-- Create users table for tracking online presence
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user presence table for tracking online status
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Create policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT 
USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- Create policies for conversation participants
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in their conversations" ON messages FOR INSERT 
WITH CHECK (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- Create policies for user presence
CREATE POLICY "Users can view all user presence" ON user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update their own presence" ON user_presence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own presence" ON user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
