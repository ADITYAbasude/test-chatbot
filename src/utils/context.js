import { createClient } from "@supabase/supabase-js";
import { AzureOpenAI } from "openai";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Azure OpenAI client (for embeddings)
const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
});

// Initialize regular OpenAI client (for chat) - fallback if Azure chat not available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Create context for GraphQL resolvers
export const createContext = ({ req, connection }) => {
  // For subscriptions (WebSocket connections)
  if (connection) {
    return {
      supabase,
      openai: openai || azureOpenAI, // Prefer regular OpenAI for chat, fallback to Azure
      azureOpenAI, // Azure OpenAI specifically for embeddings
      user: connection.context.user,
      isSubscription: true,
    };
  }
  // For HTTP requests
  const context = {
    supabase,
    openai: openai || azureOpenAI, // Prefer regular OpenAI for chat, fallback to Azure
    azureOpenAI, // Azure OpenAI specifically for embeddings
    req,
    isSubscription: false,
  };

  // Extract user from JWT token if present
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      context.user = decoded;
    } catch (error) {
      console.warn("Invalid JWT token:", error.message);
    }
  }

  return context;
};

export { supabase, openai, azureOpenAI };
