import { apiClient } from './api-client';
import { getRefUrl, getUpdateUrl } from '@/config/env';

class GamesService {
  async get() {
    try {
      const response = await apiClient.get(getRefUrl(''))
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Spiele:', error)
      return []
    }
  }

  async all() {
    try {
      const response = await apiClient.get(getRefUrl('all'))
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden aller Spiele:', error)
      return []
    }
  }

  async basar() {
    try {
        console.log("BASAR")
      const response = await apiClient.get(getRefUrl('basar'))
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Basar-Spiele:', error)
      return []
    }
  }

  async uebernehmen(match, payload) {
    try {
      const response = await apiClient.post(getRefUrl(match), payload)
      return response.data;
    } catch (error) {
      console.error('Fehler beim Übernehmen des Spiels:', error)
      return false
    }
  }

  async update(id, sr) {
    try {
      const response = await apiClient.post(getUpdateUrl(id), sr)
      return response.data;
    } catch (error) {
      console.error('Fehler beim Update des Spiels:', error)
      return false
    }
  }

  async vereine() {
    try {
      const response = await apiClient.get(getRefUrl('vereine'))
      return response.data
    } catch (error) {
      console.error('Fehler beim Laden der Vereine:', error)
      return []
    }
  }

  // Neue Methoden für bessere Organisation
  async getAllGames() {
    return this.all()
  }

  async getBasarGames() {
    return this.basar()
  }

  async getHistoryGames() {
    return this.get()
  }
}

export default new GamesService();
