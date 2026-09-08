import axios from 'axios'
import { getApiUrl } from '@/config/env'

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export { apiClient }
export default apiClient
