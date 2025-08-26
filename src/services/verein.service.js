import { apiClient } from './api-client';

class VereinService {
  async getVereine(params = {}) {
    try {
      const response = await apiClient.get('/vereine', { params })
      return response.data?.data?.vereine || []
    } catch (error) {
      console.error('Fehler beim Laden der Vereine:', error)
      return []
    }
  }

  async updateHideLink(vereinId, hideLink) {
    try {
      const response = await apiClient.patch(`/vereine/${vereinId}/hideLink`, {
        hideLink: hideLink
      })
      return response.data
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Vereins:', error)
      throw error
    }
  }
}

export default new VereinService();
