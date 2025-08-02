import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import AuthService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State mit localStorage Persistierung
  const user = useStorage('user', {})
  const isAdmin = ref(false)

  // Token Validierung
  const isTokenValid = computed(() => {
    if (!user.value || !user.value.accessToken) return false
    
    // Prüfe expireDate falls vorhanden
    if (user.value.expireDate) {
      return Date.now() < user.value.expireDate
    }
    
    // Fallback: Prüfe ob Token vorhanden ist
    return !!user.value.accessToken
  })

  // Authentifizierungsstatus basierend auf Token-Gültigkeit
  const isAuthenticated = computed(() => {
    return isTokenValid.value && user.value !== null
  })

  // Admin-Status basierend auf User-Rollen
  const isUserAdmin = computed(() => {
    if (!user.value || !user.value.roles) return false
    return user.value.roles.includes('admin')
  })

  // Actions
  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials)
      if (response.accessToken) {
        user.value = response
        isAdmin.value = response.roles?.includes('admin') || false
        return { success: true, data: response }
      }
      return { success: false, error: 'Login fehlgeschlagen' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.response?.data?.message || 'Login fehlgeschlagen' }
    }
  }

  const logout = () => {
    user.value = null
    isAdmin.value = false
  }

  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData)
      return { success: true, data: response }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.response?.data?.message || 'Registrierung fehlgeschlagen' }
    }
  }

  const resetPassword = async (email) => {
    try {
      const response = await AuthService.reset(email)
      return { success: true, data: response }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.response?.data?.message || 'Passwort-Reset fehlgeschlagen' }
    }
  }

  const deleteUser = async (userData) => {
    try {
      const response = await AuthService.delete(userData)
      return { success: true, data: response }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: error.response?.data?.message || 'Benutzer-Löschung fehlgeschlagen' }
    }
  }

  const setToken = async (token) => {
    if (!user.value) user.value = {}
    user.value.accessToken = token
  }

  const setUser = async (userData) => {
    if (!user.value) user.value = {}
    user.value = { ...user.value, ...userData }
    isAdmin.value = userData.roles?.includes('admin') || false
  }

  // Getters
  const getCurrentUser = () => user.value
  const getIsAuthenticated = () => isAuthenticated.value
  const getIsAdmin = () => isUserAdmin.value
  const getUserName = () => {
    if (!user.value) return 'Benutzer'
    return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.username || 'Benutzer'
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin: isUserAdmin,
    
    // Actions
    login,
    logout,
    register,
    resetPassword,
    deleteUser,
    setToken,
    setUser,
    
    // Getters
    getCurrentUser,
    getIsAuthenticated,
    getIsAdmin,
    getUserName
  }}) 