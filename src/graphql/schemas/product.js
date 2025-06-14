import { gql } from 'apollo-server-express';

export const productTypeDefs = gql`
  extend type Query {
    searchProducts(input: ProductSearchInput!): ProductSearchResult!
    getProduct(id: ID!): Product
    getProductRecommendations(input: RecommendationInput!): [Product!]!
    getProductCategories: [Category!]!
    getFeaturedProducts(limit: Int = 10): [Product!]!
  }

  extend type Mutation {
    addProduct(input: AddProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }

  input ProductSearchInput {
    query: String!
    category: String
    priceRange: PriceRangeInput
    filters: ProductFiltersInput
    limit: Int = 10
    offset: Int = 0
    sortBy: ProductSortBy = RELEVANCE
  }

  input PriceRangeInput {
    min: Float
    max: Float
  }

  input ProductFiltersInput {
    inStock: Boolean
    featured: Boolean
    tags: [String!]
  }

  input RecommendationInput {
    userId: String!
    productId: String
    category: String
    limit: Int = 5
  }

  input AddProductInput {
    name: String!
    description: String!
    price: Float!
    category: String!
    imageUrl: String
    tags: [String!]
    metadata: JSON
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    category: String
    imageUrl: String
    tags: [String!]
    metadata: JSON
  }

  enum ProductSortBy {
    RELEVANCE
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
    NEWEST
    POPULAR
    RATING
  }

  type ProductSearchResult {
    products: [Product!]!
    total: Int!
    hasMore: Boolean!
    filters: AppliedFilters!
  }

  type AppliedFilters {
    query: String
    category: String
    priceRange: PriceRange
    sortBy: ProductSortBy!
  }

  type PriceRange {
    min: Float!
    max: Float!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    imageUrl: String
    tags: [String!]!
    rating: Float
    reviewCount: Int
    inStock: Boolean!
    featured: Boolean!
    similarity: Float
    metadata: JSON
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    productCount: Int!
    imageUrl: String
  }
`;
