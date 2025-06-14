import { supabase } from '../utils/context.js';
import { AIService } from './AIService.js';

export class ProductService {
  // Search products using vector similarity
  static async searchProducts(query) {
    try {
      // Generate embedding for search query
      const embedding = await AIService.generateEmbedding(query);
      
      // Perform vector search in Supabase
      const { data, error } = await supabase.rpc('search_products', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Search products with advanced input parameters
  static async searchProducts(input) {
    try {
      const { query, category, priceRange, sortBy, limit = 10, offset = 0 } = input;
      
      let searchResults = [];
      
      if (query) {
        // Generate embedding for search query
        const embedding = await AIService.generateEmbedding(query);
        
        // Perform vector search in Supabase
        const { data, error } = await supabase.rpc('search_products', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: limit
        });

        if (error) throw error;
        searchResults = data || [];
      } else {
        // Regular search without vector similarity
        let query_builder = supabase.from('products').select('*');
        
        if (category) {
          query_builder = query_builder.eq('category', category);
        }
        
        if (priceRange) {
          if (priceRange.min !== undefined) {
            query_builder = query_builder.gte('price', priceRange.min);
          }
          if (priceRange.max !== undefined) {
            query_builder = query_builder.lte('price', priceRange.max);
          }
        }
        
        // Apply sorting
        if (sortBy === 'PRICE_LOW_TO_HIGH') {
          query_builder = query_builder.order('price', { ascending: true });
        } else if (sortBy === 'PRICE_HIGH_TO_LOW') {
          query_builder = query_builder.order('price', { ascending: false });
        } else if (sortBy === 'POPULARITY') {
          query_builder = query_builder.order('popularity', { ascending: false });
        } else {
          query_builder = query_builder.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query_builder.range(offset, offset + limit - 1);
        
        if (error) throw error;
        searchResults = data || [];
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      return {
        products: searchResults,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      };
    } catch (error) {
      console.error('Error in advanced search:', error);
      return {
        products: [],
        total: 0,
        hasMore: false
      };
    }
  }

  // Get product recommendations for a user
  static async getProductRecommendations(userId) {
    try {
      if (userId) {
        // Get user's purchase history and preferences
        const { data: userPreferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (userPreferences) {
          // Use user preferences for recommendations
          const { data, error } = await supabase.rpc('get_recommendations', {
            user_preferences: userPreferences.preferences,
            match_count: 5
          });

          if (error) throw error;
          return data || [];
        }
      }

      // Fallback to popular products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Get product recommendations with advanced input
  static async getRecommendations(input) {
    try {
      const { userId, productId, category, limit = 5 } = input;
      
      if (userId) {
        return await this.getProductRecommendations(userId);
      } else if (productId) {
        // Get similar products based on product ID
        const product = await this.getProductById(productId);
        if (product && product.category) {
          return await this.getProductsByCategory(product.category, limit);
        }
      } else if (category) {
        return await this.getProductsByCategory(category, limit);
      }
      
      // Fallback to popular products
      return await this.getAllProducts(0, limit);
    } catch (error) {
      console.error('Error getting advanced recommendations:', error);
      return [];
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  // Get products by category
  static async getProductsByCategory(category, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  // Get all products with pagination
  static async getAllProducts(offset = 0, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  // Add new product
  static async addProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Update existing product
  static async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Search products by text (for chat integration)
  static async searchProductsByText(query, limit = 5) {
    try {
      return await this.searchProducts({ query, limit });
    } catch (error) {
      console.error('Error searching products by text:', error);
      return [];
    }
  }
}
