import { gql } from 'apollo-server-express';

export const userTypeDefs = gql`
  extend type Query {
    getUserProfile(userId: String!): UserProfile
    getUserPreferences(userId: String!): UserPreferences
  }

  extend type Mutation {
    updateUserPreferences(input: UpdateUserPreferencesInput!): UserPreferences!
    trackUserActivity(input: UserActivityInput!): Boolean!
  }

  input UpdateUserPreferencesInput {
    userId: String!
    categories: [String!]
    priceRange: PriceRangeInput
    brands: [String!]
    notifications: NotificationPreferencesInput
  }

  input NotificationPreferencesInput {
    email: Boolean
    push: Boolean
    sms: Boolean
    deals: Boolean
    recommendations: Boolean
  }

  input UserActivityInput {
    userId: String!
    action: UserActionType!
    productId: String
    metadata: JSON
    timestamp: String
  }

  enum UserActionType {
    VIEW_PRODUCT
    SEARCH
    ADD_TO_CART
    PURCHASE
    LIKE
    SHARE
    CHAT_MESSAGE
  }

  type UserProfile {
    id: ID!
    userId: String!
    name: String
    email: String
    preferences: UserPreferences
    activitySummary: UserActivitySummary!
    createdAt: String!
    lastActive: String!
  }

  type UserPreferences {
    id: ID!
    userId: String!
    categories: [String!]!
    priceRange: PriceRange
    brands: [String!]!
    notifications: NotificationPreferences!
    updatedAt: String!
  }

  type NotificationPreferences {
    email: Boolean!
    push: Boolean!
    sms: Boolean!
    deals: Boolean!
    recommendations: Boolean!
  }

  type UserActivitySummary {
    totalSearches: Int!
    totalViews: Int!
    totalPurchases: Int!
    favoriteCategories: [String!]!
    lastSearches: [String!]!
  }
`;
