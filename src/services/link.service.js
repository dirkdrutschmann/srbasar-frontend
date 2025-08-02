import { apiClient } from './api-client';
import { getLinkUrl } from '@/config/env';

class LinkService {
   async get(onlyShow) {
    try {
      const response = await apiClient.post(getLinkUrl(''), {onlyShow: onlyShow})
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Links:', error)
      return []
    }
  }

  async getGames(link) {
    try {
      const response = await apiClient.post(getLinkUrl('get/' + link), {})
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Spiele für Link:', error)
      return false
    }
  }

  async getAnswers(link) {
    try {
      const response = await apiClient.get(getLinkUrl('getAnswer/' + link))
      return response.data.answers;
    } catch (error) {
      console.error('Fehler beim Laden der Antworten:', error)
      return false
    }
  }

  async answer(payload) {
    try {
      const response = await apiClient.post(getLinkUrl('answer'), payload)
      return response.data;
    } catch (error) {
      console.error('Fehler beim Antworten:', error)
      return false
    }
  }

  async add(payload) {
    try {
      const response = await apiClient.post(getLinkUrl('add'), payload)
      return response.data;
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Links:', error)
      return false
    }
  }

  async remove(id) {
    try {
      const response = await apiClient.delete(getLinkUrl('remove/' + id))
      return response.data;
    } catch (error) {
      console.error('Fehler beim Löschen des Links:', error)
      return false
    }
  }

  async removeAnswer(id) {
    try {
      const response = await apiClient.delete(getLinkUrl('removeAnswer/' + id))
      return response.data;
    } catch (error) {
      console.error('Fehler beim Löschen der Antwort:', error)
      return false
    }
  }

  async vereine() {
    try {
      const response = await apiClient.get(getLinkUrl('vereine'))
      return response.data
    } catch (error) {
      console.error('Fehler beim Laden der Vereine:', error)
      return []
    }
  }
}

export default new LinkService();
