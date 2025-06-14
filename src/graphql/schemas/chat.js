import { gql } from 'apollo-server-express';

export const chatTypeDefs = gql`
  extend type Query {
    getConversationHistory(userId: String!, limit: Int = 20): [Conversation!]!
    getChatSuggestions(context: String): [String!]!
  }

  extend type Mutation {
    sendMessage(input: SendMessageInput!): ChatResponse!
    clearConversationHistory(userId: String!): Boolean!
  }

  extend type Subscription {
    messageAdded(userId: String!): ChatMessage!
    typingIndicator(userId: String!): TypingStatus!
  }

  input SendMessageInput {
    message: String!
    userId: String!
    conversationId: String
    metadata: JSON
  }

  type ChatResponse {
    success: Boolean!
    message: String!
    conversationId: String!
    aiResponse: AIResponse!
    products: [Product!]!
    suggestions: [String!]!
    timestamp: String!
  }

  type AIResponse {
    text: String!
    confidence: Float
    intent: String
    entities: [Entity!]!
    sentiment: Sentiment
  }

  type Entity {
    type: String!
    value: String!
    confidence: Float
  }

  type Sentiment {
    score: Float!
    label: String!
  }

  type ChatMessage {
    id: ID!
    userId: String!
    message: String!
    isBot: Boolean!
    timestamp: String!
    metadata: JSON
  }

  type Conversation {
    id: ID!
    userId: String!
    userMessage: String!
    aiResponse: String!
    products: [Product!]!
    timestamp: String!
    metadata: JSON
  }

  type TypingStatus {
    userId: String!
    isTyping: Boolean!
    timestamp: String!
  }
`;
