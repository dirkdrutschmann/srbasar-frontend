import { apiClient } from './api-client';
import { getAuthUrl } from '@/config/env';

class AuthService {
  async login(user) {
    try {
      console.log(user)
      const response = await apiClient.post(getAuthUrl('signin'), {
        email: user.email,
        password: user.password
      })
      return response.data
    } catch (error) {
      console.error('Login-Fehler:', error)
      throw error
    }
  }

  logout() {
    // localStorage wird von Pinia Store verwaltet
  }

  async register(user) {
    try {
      const response = await apiClient.post(getAuthUrl('signup'), {
        username: user.username,
        email: user.email,
        password: user.password
      })
      return response.data
    } catch (error) {
      console.error('Registrierungs-Fehler:', error)
      throw error
    }
  }

  async delete(user) {
    try {
      const response = await apiClient.post(getAuthUrl('user'), {
        id: user.id
      })
      return response.data
    } catch (error) {
      console.error('Lösch-Fehler:', error)
      return false
    }
  }

  async reset(email) {
    try {
      const response = await apiClient.post(getAuthUrl('reset'), {
        email: email
      })
      return response.data
    } catch (error) {
      console.error('Reset-Fehler:', error)
      return false
    }
  }

  async validateResetToken(token) {
    try {
      const response = await apiClient.post(getAuthUrl('validate-reset-token'), {
        token: token
      })
      return response.data
    } catch (error) {
      console.error('Token-Validierungs-Fehler:', error)
      throw error
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await apiClient.post(getAuthUrl('reset-password'), {
        token: token,
        password: password
      })
      return response.data
    } catch (error) {
      console.error('Reset-Password-Fehler:', error)
      throw error
    }
  }
}

export default new AuthService();
