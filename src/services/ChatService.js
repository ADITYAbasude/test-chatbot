import { supabase } from '../utils/context.js';
import { AIService } from './AIService.js';

export class ChatService {
  // Send a message and get AI response
  static async sendMessage(message, userId) {
    try {
      // Process the message with AI service
      const chatResponse = await AIService.processUserMessage(message, userId);
      return chatResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "I'm sorry, I encountered an error. Please try again.",
        products: [],
        suggestions: [
          "Try rephrasing your question",
          "Ask about specific products",
          "Check our categories"
        ]
      };
    }
  }

  // Get conversation history for a user
  static async getConversationHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Create a new conversation
  static async createConversation(userId, title) {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .insert({
          user_id: userId,
          title: title || 'New Conversation',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Delete a conversation
  static async deleteConversation(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Get conversation sessions for a user
  static async getConversationSessions(userId) {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversation sessions:', error);
      return [];
    }
  }

  // Update conversation title
  static async updateConversationTitle(conversationId, userId, title) {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }

  // Generate suggestions based on context
  static async generateSuggestions(context, products = []) {
    const suggestions = [];
    
    if (typeof context === 'string') {
      // If context is a message string
      if (products && products.length > 0) {
        suggestions.push("Tell me more about these products");
        suggestions.push("Show me similar items");
      }
      
      suggestions.push("What are your best deals today?");
      suggestions.push("Help me find something specific");    } else {
      // If context is an object with more details
      suggestions.push("Continue the conversation");
      suggestions.push("Ask another question");
    }
    
    return suggestions;
  }

  // Save conversation with enhanced data
  static async saveConversation(conversationData) {
    try {
      const {
        userId,
        userMessage,
        aiResponse,
        products = [],
        conversationId,
        metadata = {}
      } = conversationData;

      // Save conversation without conversation_id column since it doesn't exist in your schema
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          user_message: userMessage,
          ai_response: aiResponse,
          products_mentioned: products.map(p => p.id || p)
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  // Clear conversation history for a user
  static async clearConversationHistory(userId) {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing conversation history:', error);
      throw error;
    }
  }

  // Get conversation by ID
  static async getConversationById(conversationId, userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversation by ID:', error);
      return [];
    }
  }

  // Update conversation metadata
  static async updateConversationMetadata(conversationId, userId, metadata) {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .update({ 
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating conversation metadata:', error);
      throw error;
    }
  }
}
