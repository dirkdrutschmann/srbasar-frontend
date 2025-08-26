import { apiClient } from './api-client';

class GamesService {
  async getSpiele(params = {}) {
    try {
      const response = await apiClient.get('/spiele', { params })
      return response.data
    } catch (error) {
      console.error('Fehler beim Laden der Spiele:', error)
      return []
    }
  }
}

export default new GamesService();
