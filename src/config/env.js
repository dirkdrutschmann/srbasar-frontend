 // Environment Configuration
export const config = {
    // API URLs
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      auth: import.meta.env.VITE_API_AUTH_URL,
      ref: import.meta.env.VITE_API_REF_URL,
      update: import.meta.env.VITE_API_UPDATE_URL,
      link: import.meta.env.VITE_API_LINK_URL,
      user: import.meta.env.VITE_API_USER_URL
    },
  
    github: {
      frontend: import.meta.env.VITE_GITHUB_FRONTEND_URL,
      backend: import.meta.env.VITE_GITHUB_BACKEND_URL }
      ,
    // App Configuration
    app: {
      title: import.meta.env.VITE_APP_TITLE,
      version: import.meta.env.VITE_APP_VERSION,
      description: import.meta.env.VITE_APP_DESCRIPTION
    }
  }
  
  // Helper functions
  export const getApiUrl = (endpoint) => {
    console.log(config.api.baseUrl)
    return `${config.api.baseUrl}/${endpoint}`
  }
  
  export const getAuthUrl = (endpoint) => {
    return `${config.api.auth}/${endpoint}`
  }
  
  export const getRefUrl = (endpoint) => {
    return `${config.api.ref}/${endpoint}`
  }
  
  export const getUpdateUrl = (endpoint) => {
    return `${config.api.update}/${endpoint}`
  }
  
  export const getLinkUrl = (endpoint) => {
    return `${config.api.link}/${endpoint}`
  }
  
  export const getUserUrl = (endpoint) => {
    return `${config.api.user}/${endpoint}`
  }
  
  export default config