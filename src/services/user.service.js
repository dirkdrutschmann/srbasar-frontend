import { apiClient } from './api-client';

class UserService {
  async getProfile() {
    try {
      const response = await apiClient.get('/users/profile')
      return response.data?.data?.user || {}
    } catch (error) {
      throw error
    }
  }

  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/users/profile', userData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/users/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new UserService();

