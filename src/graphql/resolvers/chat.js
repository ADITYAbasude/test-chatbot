import { PubSub } from 'graphql-subscriptions';
import { ChatService } from '../../services/ChatService.js';
import { AIService } from '../../services/AIService.js';
import { ProductService } from '../../services/ProductService.js';

const pubsub = new PubSub();
const MESSAGE_ADDED = 'MESSAGE_ADDED';
const TYPING_INDICATOR = 'TYPING_INDICATOR';

export const chatResolvers = {
  Query: {
    hello: () => {
      return 'Hello from Advanced ChatBot GraphQL Server! 🤖✨';
    },    health: async () => {
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
          supabase: !!process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url_here',
          gemini: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
          redis: false // TODO: Implement Redis check
        },
        version: '1.0.0'
      };
    },

    getConversationHistory: async (_, { userId, limit }, context) => {
      try {
        return await ChatService.getConversationHistory(userId, limit);
      } catch (error) {
        console.error('Error fetching conversation history:', error);
        throw new Error('Failed to fetch conversation history');
      }
    },

    getChatSuggestions: async (_, { context }) => {
      try {
        return await ChatService.generateSuggestions(context);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        return [
          "Tell me more about this product",
          "Show me similar items",
          "What are your best deals?",
          "Help me find something specific"
        ];
      }
    }
  },

  Mutation: {
    sendMessage: async (_, { input }, context) => {
      try {
        const { message, userId, conversationId, metadata } = input;
        
        console.log(`Processing message from ${userId}: ${message}`);        // Process the message with AI
        const aiResponse = await AIService.processMessage(message, userId, {
          conversationId,
          metadata
        });

        // Search for relevant products
        const productsResult = await ProductService.searchProductsByText(message);
        const products = Array.isArray(productsResult) ? productsResult : [];

        // Generate suggestions
        const suggestions = await ChatService.generateSuggestions(message, products);

        // Save conversation
        const conversation = await ChatService.saveConversation({
          userId,
          userMessage: message,
          aiResponse: aiResponse.text,
          products: products.slice(0, 3),
          conversationId,
          metadata
        });

        // Publish to subscriptions
        const chatMessage = {
          id: conversation.id,
          userId,
          message: aiResponse.text,
          isBot: true,
          timestamp: new Date().toISOString(),
          metadata
        };

        pubsub.publish(MESSAGE_ADDED, { 
          messageAdded: chatMessage,
          userId 
        });

        const response = {
          success: true,
          message: 'Message processed successfully',
          conversationId: conversation.id,
          aiResponse,
          products: products.slice(0, 5),
          suggestions,
          timestamp: new Date().toISOString()
        };

        return response;      } catch (error) {
        console.error('Error processing message:', error);
        
        return {
          success: false,
          message: 'Failed to process message',
          conversationId: input.conversationId || '',
          aiResponse: {
            text: "I'm sorry, I encountered an error. Please try again.",
            confidence: 0.0,
            intent: 'error',
            entities: [],
            sentiment: {
              score: 0.0,
              label: 'neutral'
            }
          },
          products: [],
          suggestions: [
            "Try rephrasing your question",
            "Ask about specific products",            "Check our categories"
          ],
          timestamp: new Date().toISOString()
        };
      }
    },

    clearConversationHistory: async (_, { userId }, context) => {
      try {
        await ChatService.clearConversationHistory(userId);
        return true;
      } catch (error) {
        console.error('Error clearing conversation history:', error);
        return false;
      }
    }
  },

  Subscription: {
    messageAdded: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([MESSAGE_ADDED]);
      },
      resolve: (payload) => {
        if (payload.userId === payload.messageAdded.userId) {
          return payload.messageAdded;
        }
        return null;
      }
    },

    typingIndicator: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([TYPING_INDICATOR]);
      },
      resolve: (payload) => {
        if (payload.userId === payload.typingIndicator.userId) {
          return payload.typingIndicator;
        }
        return null;
      }
    }
  }
};
