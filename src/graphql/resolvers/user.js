import { UserService } from '../../services/UserService.js';

export const userResolvers = {
  Query: {
    getUserProfile: async (_, { userId }, context) => {
      try {
        return await UserService.getUserProfile(userId);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },

    getUserPreferences: async (_, { userId }, context) => {
      try {
        return await UserService.getUserPreferences(userId);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
    }
  },

  Mutation: {
    updateUserPreferences: async (_, { input }, context) => {
      try {
        return await UserService.updateUserPreferences(input);
      } catch (error) {
        console.error('Error updating user preferences:', error);
        throw new Error('Failed to update user preferences');
      }
    },

    trackUserActivity: async (_, { input }, context) => {
      try {
        await UserService.trackActivity(input);
        return true;
      } catch (error) {
        console.error('Error tracking user activity:', error);
        return false;
      }
    }
  }
};
