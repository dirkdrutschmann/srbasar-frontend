// Environment Configuration
export const config = {
  // API URLs
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1',
  },

  github: {
    frontend: import.meta.env.VITE_GITHUB_FRONTEND_URL,
    backend: import.meta.env.VITE_GITHUB_BACKEND_URL
  },
  
  // App Configuration
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'SR Basar',
    version: import.meta.env.VITE_APP_VERSION || '2.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Schiedsrichter Basar System'
  }
}

// Helper functions
export const getApiUrl = (endpoint = '') => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl
}

export default config