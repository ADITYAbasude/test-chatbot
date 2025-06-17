import { supabase, openai, azureOpenAI } from '../utils/context.js';

export class AIService {  // Generate embedding for text using Azure OpenAI (embeddings work!)
  static async generateEmbedding(text) {
    try {
      const response = await azureOpenAI.embeddings.create({
        model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "text-embedding-3-large",
        input: text,
      });
      
      console.log('✅ Using Azure OpenAI embeddings');
      return response.data[0].embedding;
      
    } catch (error) {
      console.error('Error generating Azure OpenAI embedding:', error);
      
      // Fallback to simple embedding if Azure OpenAI fails
      console.warn('Using fallback embedding due to Azure API error');
      const words = text.toLowerCase().split(' ');
      const embedding = new Array(1536).fill(0);
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
          const charCode = word.charCodeAt(j);
          embedding[charCode % 1536] += 1;
        }
      }
      
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    }
  }
  // Process user message and generate AI response
  static async processUserMessage(message, userId) {
    try {
      // Generate embedding for the message
      const messageEmbedding = await this.generateEmbedding(message);
      
      // Search for relevant products
      const { data: products, error: productError } = await supabase.rpc('search_products', {
        query_embedding: messageEmbedding,
        match_threshold: 0.6,
        match_count: 5
      });

      if (productError) {
        console.error('Error searching products:', productError);
      }

      // Ensure products is an array
      const productsList = Array.isArray(products) ? products : [];

      // Get conversation context
      const { data: conversationHistory, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (convError) {
        console.error('Error getting conversation context:', convError);
      }

      // Prepare context for AI
      const context = {
        userMessage: message,
        products: productsList,
        conversationHistory: conversationHistory || []
      };      // Generate AI response using regular OpenAI (more reliable for chat)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use regular OpenAI model
        messages: [
          {
            role: "system",
            content: `You are a helpful shopping assistant. You help users find products and answer questions about them. 
                     Be friendly, helpful, and provide accurate information about the products.
                     If relevant products are found, mention them in your response.
                     Always provide helpful suggestions for the user.`
          },
          {
            role: "user",
            content: `User message: ${message}
                     
                     Available products: ${JSON.stringify(productsList.slice(0, 3))}
                     
                     Please provide a helpful response and suggest relevant actions.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at the moment.";

      // Save conversation to database - handle missing conversation_id column
      try {
        await supabase.from('conversations').insert({
          user_id: userId,
          conversation_id: 'default',
          user_message: message,
          ai_response: aiResponse,
          products_mentioned: productsList.map(p => p.id) || []
        });
      } catch (insertError) {
        // If conversation_id column doesn't exist, insert without it
        if (insertError.code === 'PGRST204' || insertError.message?.includes('conversation_id')) {
          console.warn('conversation_id column not found, inserting without it');
          await supabase.from('conversations').insert({
            user_id: userId,
            user_message: message,
            ai_response: aiResponse,
            products_mentioned: productsList.map(p => p.id) || []
          });
        } else {
          throw insertError;
        }
      }

      // Generate suggestions
      const suggestions = this.generateSuggestions(message, productsList);

      return {
        message: aiResponse,
        products: productsList,
        suggestions
      };
    } catch (error) {
      console.error('Error processing user message:', error);
      throw error;
    }
  }

  // Generate conversation suggestions
  static generateSuggestions(userMessage, products) {
    const suggestions = [];
    
    if (products && products.length > 0) {
      suggestions.push("Tell me more about these products");
      suggestions.push("Show me similar items");
    }
    
    suggestions.push("What are your best deals today?");
    suggestions.push("Help me find something specific");
    
    return suggestions;
  }

  // Get chat completion stream for real-time responses
  static async getChatCompletionStream(messages) {
    try {      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
        max_tokens: 300,
        temperature: 0.7
      });

      return stream;
    } catch (error) {
      console.error('Error getting chat completion stream:', error);
      throw error;
    }
  }
  // Process message with additional context and metadata
  static async processMessage(message, userId, options = {}) {
    try {
      const { conversationId, metadata } = options;
      
      // Get enhanced conversation context
      const conversationHistory = await this.getConversationContext(userId, conversationId);
      
      // Analyze message intent and entities
      const analysis = await this.analyzeMessage(message);      // Generate AI response with context using regular OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful shopping assistant. You help users find products and answer questions about them. 
                     Be friendly, helpful, and provide accurate information about the products.
                     Consider the conversation history and user's intent when responding.
                     Always provide helpful suggestions for the user.`
          },
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at the moment.";

      return {
        text: aiResponse,
        confidence: analysis.confidence,
        intent: analysis.intent,
        entities: analysis.entities,
        sentiment: analysis.sentiment,
        conversationId,
        metadata
      };
    } catch (error) {
      console.error('Error processing message with context:', error);
      throw error;
    }
  }  // Get conversation context for AI processing
  static async getConversationContext(userId, conversationId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('user_message, ai_response')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting conversation context:', error);
        return [];
      }

      // Format for OpenAI conversation format
      const context = [];
      (data || []).reverse().forEach(conv => {
        context.push({ role: 'user', content: conv.user_message });
        context.push({ role: 'assistant', content: conv.ai_response });
      });

      return context;
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return [];
    }
  }

  // Analyze message for intent, entities, and sentiment
  static async analyzeMessage(message) {
    try {      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the following message and return a JSON object with:
                     - intent: the main intent (search, question, greeting, complaint, etc.)
                     - entities: array of important entities mentioned (product names, categories, etc.)
                     - sentiment: positive, negative, or neutral
                     - confidence: confidence score from 0-1`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });        try {
          const analysis = JSON.parse(completion.choices[0].message.content);
          return {
            intent: analysis.intent || 'general',
            entities: analysis.entities || [],
            sentiment: this.formatSentiment(analysis.sentiment, analysis.confidence),
            confidence: analysis.confidence || 0.5
          };
        } catch (parseError) {
          console.warn('Failed to parse AI analysis, using defaults');
          return {
            intent: 'general',
            entities: [],
            sentiment: this.formatSentiment('neutral', 0.5),
            confidence: 0.5
          };
        }    } catch (error) {
      console.error('Error analyzing message:', error);
      return {
        intent: 'general',
        entities: [],
        sentiment: this.formatSentiment('neutral', 0.5),
        confidence: 0.5
      };
    }
  }

  // Format sentiment to match GraphQL schema
  static formatSentiment(sentimentLabel, confidence = 0.5) {
    // Convert sentiment label to score and ensure proper format
    let score;
    let label;
    
    if (typeof sentimentLabel === 'object' && sentimentLabel.score !== undefined) {
      // Already in correct format
      score = sentimentLabel.score;
      label = sentimentLabel.label || 'neutral';
    } else {
      // Convert string sentiment to score
      switch (sentimentLabel?.toLowerCase()) {
        case 'positive':
          score = 0.7;
          label = 'positive';
          break;
        case 'negative':
          score = -0.7;
          label = 'negative';
          break;
        case 'neutral':
        default:
          score = 0.0;
          label = 'neutral';
          break;
      }
    }
    
    // Ensure score is a valid number
    if (typeof score !== 'number' || isNaN(score)) {
      score = 0.0;
    }
    
    return {
      score: score,
      label: label || 'neutral'
    };
  }

  // Generate embeddings for multiple texts
  static async generateEmbeddings(texts) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: texts,
      });
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}
