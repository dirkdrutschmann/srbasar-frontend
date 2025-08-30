import { apiClient } from './api-client';

class AuthService {
  async login(user) {
    try {
      const response = await apiClient.post('/users/login', {
        username: user.username || user.email, // Unterstützt sowohl username als auch email
        password: user.password
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  logout() {
    // localStorage wird von Pinia Store verwaltet
  }

  async reset(email) {
    try {
      const response = await apiClient.post('/users/forgot-password', {
        email: email
      })
      return response.data
    } catch (error) {
      return false
    }
  }

  async validateResetToken(token) {
    try {
      const response = await apiClient.post('/users/validate-reset-token', {
        token: token
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await apiClient.post('/users/reset-password', {
        resetToken: token,
        newPassword: password
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new AuthService();
