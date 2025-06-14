-- Add conversation_id column to existing conversations table
-- Run this in your Supabase SQL editor to update the existing table

-- Add the conversation_id column with default value
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS conversation_id text DEFAULT 'default';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_conversation 
ON conversations(user_id, conversation_id);

-- Update existing rows to have the default conversation_id if NULL
UPDATE conversations 
SET conversation_id = 'default' 
WHERE conversation_id IS NULL;
