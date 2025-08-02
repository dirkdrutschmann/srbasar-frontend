import { apiClient } from './api-client';
import { getUserUrl } from '@/config/env';

class UserService {
  async updatePassword(password) {
    try {
      const response = await apiClient.post(getUserUrl('update'), {password: password})
      return response.data
    } catch (error) {
      console.error('Fehler beim Passwort-Update:', error)
      return false
    }
  }

  async updateUser(object) {
    try {
      const response = await apiClient.post(getUserUrl('update'), object)
      return response.data
    } catch (error) {
      console.error('Fehler beim User-Update:', error)
      return false
    }
  }

  updateData(object) {
    return this.updateUser(object);
  }

  async list() {
    try {
      const response = await apiClient.get(getUserUrl('list'))
      return response.data
    } catch (error) {
      console.error('Fehler beim Laden der User-Liste:', error)
      return []
    }
  }
}

export default new UserService();
