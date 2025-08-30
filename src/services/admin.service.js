import apiClient from './api-client'

class AdminService {
  
  /**
   * Alle Benutzer abrufen
   */
  async getAllUsers() {
    try {
      const response = await apiClient.get('/admin/users')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Neuen Benutzer erstellen
   * @param {Object} userData - { username, email, name, role }
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/admin/users', userData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Benutzer löschen
   * @param {number} userId - ID des zu löschenden Benutzers
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Benutzerrolle aktualisieren
   * @param {number} userId - ID des Benutzers
   * @param {string} role - Neue Rolle ('user' oder 'admin')
   */
  async updateUserRole(userId, role) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, { role })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new AdminService()