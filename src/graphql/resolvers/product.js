import { ProductService } from '../../services/ProductService.js';

export const productResolvers = {
  Query: {
    searchProducts: async (_, { input }, context) => {
      try {
        console.log('Searching products with input:', input);
        
        const result = await ProductService.searchProducts(input);
        
        return {
          products: result.products || [],
          total: result.total || 0,
          hasMore: result.hasMore || false,
          filters: {
            query: input.query,
            category: input.category,
            priceRange: input.priceRange,
            sortBy: input.sortBy || 'RELEVANCE'
          }
        };
      } catch (error) {
        console.error('Error searching products:', error);
        throw new Error('Failed to search products');
      }
    },

    getProduct: async (_, { id }, context) => {
      try {
        return await ProductService.getProductById(id);
      } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error('Failed to fetch product');
      }
    },

    getProductRecommendations: async (_, { input }, context) => {
      try {
        console.log('Getting recommendations for:', input);
        return await ProductService.getRecommendations(input);
      } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
      }
    },

    getProductCategories: async (_, args, context) => {
      try {
        return await ProductService.getCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },

    getFeaturedProducts: async (_, { limit = 10 }, context) => {
      try {
        return await ProductService.getFeaturedProducts(limit);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }
    }
  },

  Mutation: {
    addProduct: async (_, { input }, context) => {
      try {
        // TODO: Add authentication check
        return await ProductService.addProduct(input);
      } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('Failed to add product');
      }
    },

    updateProduct: async (_, { id, input }, context) => {
      try {
        // TODO: Add authentication check
        return await ProductService.updateProduct(id, input);
      } catch (error) {
        console.error('Error updating product:', error);
        throw new Error('Failed to update product');
      }
    },

    deleteProduct: async (_, { id }, context) => {
      try {
        // TODO: Add authentication check
        await ProductService.deleteProduct(id);
        return true;
      } catch (error) {
        console.error('Error deleting product:', error);
        return false;
      }
    }
  }
};
