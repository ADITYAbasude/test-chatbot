import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Gemini AI (using OpenAI SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

// Create context for GraphQL resolvers
export const createContext = ({ req, connection }) => {
  // For subscriptions (WebSocket connections)
  if (connection) {
    return {
      supabase,
      openai,
      user: connection.context.user,
      isSubscription: true
    };
  }

  // For HTTP requests
  const context = {
    supabase,
    openai,
    req,
    isSubscription: false
  };

  // Extract user from JWT token if present
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      context.user = decoded;
    } catch (error) {
      console.warn('Invalid JWT token:', error.message);
    }
  }

  return context;
};

export { supabase, openai };
