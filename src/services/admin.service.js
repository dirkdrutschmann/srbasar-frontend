import apiClient from './api-client'

class AdminService {
  
  /**
   * Alle Benutzer abrufen
   */
  async getAllUsers() {
    const response = await apiClient.get('/admin/users')
    return response.data
  }

  /**
   * Neuen Benutzer erstellen
   * @param {Object} userData - { username, email, name, role }
   */
  async createUser(userData) {
    const response = await apiClient.post('/admin/users', userData)
    return response.data
  }

  /**
   * Benutzer löschen
   * @param {number} userId - ID des zu löschenden Benutzers
   */
  async deleteUser(userId) {
    const response = await apiClient.delete(`/admin/users/${userId}`)
    return response.data
  }

  /**
   * Benutzerrolle aktualisieren
   * @param {number} userId - ID des Benutzers
   * @param {string} role - Neue Rolle ('user' oder 'admin')
   */
  async updateUserRole(userId, role) {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role })
    return response.data
  }
}

export default new AdminService()
