import { apiClient } from './api-client';

class UserService {
  async getProfile() {
    const response = await apiClient.get('/users/profile')
    return response.data?.data?.user || {}
  }

  async updateProfile(userData) {
    const response = await apiClient.put('/users/profile', userData)
    return response.data
  }

  async changePassword(passwordData) {
    const response = await apiClient.put('/users/profile', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
    return response.data
  }
}

export default new UserService();
