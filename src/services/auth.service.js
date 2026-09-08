import { apiClient } from './api-client';

class AuthService {
  async login(user) {
    const response = await apiClient.post('/users/login', {
      username: user.username || user.email, // Unterstützt sowohl username als auch email
      password: user.password
    })
    return response.data
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
    } catch {
      return false
    }
  }

  async validateResetToken(token) {
    const response = await apiClient.post('/users/validate-reset-token', {
      token: token
    })
    return response.data
  }

  async resetPassword(token, password) {
    const response = await apiClient.post('/users/reset-password', {
      resetToken: token,
      newPassword: password
    })
    return response.data
  }
}

export default new AuthService();
