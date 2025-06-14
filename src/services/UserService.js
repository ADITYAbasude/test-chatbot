import { supabase } from '../utils/context.js';
import jwt from 'jsonwebtoken';

export class UserService {
  // Get user by ID
  static async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Create or update user
  static async upsertUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Get user preferences
  static async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Create JWT token for user
  static createJWT(user) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
  }

  // Verify JWT token
  static verifyJWT(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error('Error verifying JWT:', error);
      return null;
    }
  }

  // Get user activity stats
  static async getUserStats(userId) {
    try {
      // Get conversation count
      const { count: conversationCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get session count
      const { count: sessionCount } = await supabase
        .from('conversation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('conversations')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        conversationCount: conversationCount || 0,
        sessionCount: sessionCount || 0,
        lastActivity: lastActivity?.[0]?.created_at || null
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        conversationCount: 0,
        sessionCount: 0,
        lastActivity: null
      };
    }
  }

  // Get user profile with enhanced data
  static async getUserProfile(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Get user stats
      const stats = await this.getUserStats(userId);
      
      // Get preferences
      const preferences = await this.getUserPreferences(userId);

      return {
        ...user,
        stats,
        preferences
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user preferences with enhanced input
  static async updateUserPreferences(input) {
    try {
      const { userId, preferences, categories, priceRange, notifications } = input;

      const preferenceData = {
        user_id: userId,
        preferences: preferences || {},
        categories: categories || [],
        price_range: priceRange || null,
        notifications: notifications || {},
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Track user activity
  static async trackActivity(input) {
    try {
      const { userId, action, metadata } = input;

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          action,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  }

  // Get user activity history
  static async getUserActivity(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  // Create user session
  static async createUserSession(userId, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  // Update user session
  static async updateUserSession(sessionId, metadata) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user session:', error);
      throw error;
    }
  }
}
