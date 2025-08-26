<template>
  <div class="reset-container">
    <div class="card reset-card">
      <div class="card-body">
        <div class="text-center mb-4" v-if="tokenValid">
          <h2 class="reset-title">Neues Passwort setzen</h2>
          <p class="text-muted">Geben Sie Ihr neues Passwort ein</p>
        </div>
        <div class="text-center mb-4" v-else>
          <h2 class="reset-title">Token ungültig</h2>
        </div>
        
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Lädt...</span>
          </div>
          <p class="mt-2">Überprüfe Reset-Token...</p>
        </div>
        
        <form v-else-if="tokenValid" @submit.prevent="handleResetPassword">
          <div class="mb-3">
            <label for="password" class="form-label">Neues Passwort</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Mindestens 6 Zeichen"
              required
              :class="{ 'is-invalid': error }"
            />
          </div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Passwort bestätigen</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Passwort wiederholen"
              required
              :class="{ 'is-invalid': error }"
            />
            <div v-if="error" class="invalid-feedback">
              {{ error }}
            </div>
          </div>
          
          <button
            type="submit"
            class="btn btn-primary btn-lg w-100"
            :disabled="submitting || !isValid"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            {{ submitting ? 'Wird gespeichert...' : 'Passwort ändern' }}
          </button>
        </form>
        
        <div v-if="!tokenValid && !loading" class="text-center">
          <div class="alert alert-danger" role="alert">
            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="me-2" />
            {{ tokenError }}
          </div>
          <router-link 
            :to="{name: 'reset'}" 
            class="btn btn-outline-light mt-3"
          >
            Neuen Reset-Link anfordern
          </router-link>
        </div>
        
        <div v-if="message" class="alert alert-success mt-3" role="alert">
          <font-awesome-icon icon="fa-solid fa-check-circle" class="me-2" />
          {{ message }}
        </div>
        
        <div class="text-center mt-4" v-if="tokenValid">
          <router-link 
            :to="{name: 'login'}" 
            class="text-decoration-none"
          >
            Zurück zur Anmeldung
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AuthService from "@/services/auth.service"

const router = useRouter()
const authStore = useAuthStore()

const password = ref("")
const confirmPassword = ref("")
const loading = ref(true)
const submitting = ref(false)
const message = ref('')
const error = ref('')
const tokenValid = ref(false)
const tokenError = ref('')

const isAuthenticated = computed(() => authStore.getIsAuthenticated())
const isValid = computed(() => {
  return password.value && confirmPassword.value && password.value === confirmPassword.value && password.value.length >= 6
})

const validateToken = async (token) => {
  try {
    const response = await AuthService.validateResetToken(token)
    if (response.data.isValid) {
      tokenValid.value = true
      tokenError.value = ''
    } else {
      tokenValid.value = false
      tokenError.value = response.message
    }
  } catch (err) {
    tokenValid.value = false
    tokenError.value = "Fehler bei der Token-Überprüfung"
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    router.push('/profile')
    return
  }
  
  const token = router.currentRoute.value.query.token
  if (!token) {
    tokenValid.value = false
    tokenError.value = "Ungültiger Reset-Link"
    loading.value = false
    return
  }
  
  await validateToken(token)
})

const handleResetPassword = async () => {
  if (!isValid.value) {
    error.value = "Passwörter stimmen nicht überein oder sind zu kurz (mindestens 6 Zeichen)"
    return
  }
  
  const token = router.currentRoute.value.query.token
  if (!token) {
    error.value = "Ungültiger Reset-Link"
    return
  }
  
  submitting.value = true
  error.value = ''
  
  try {
    const response = await AuthService.resetPassword(token, password.value)
    
    if (response.accessToken) {
      await authStore.setToken(response.accessToken)
      await authStore.setUser({
        id: response.id,
        email: response.email,
        roles: response.roles
      })
      
      message.value = "Passwort wurde erfolgreich geändert. Du wirst automatisch eingeloggt."
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } else {
      message.value = "Passwort wurde erfolgreich geändert. Du wirst zur Anmeldeseite weitergeleitet."
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Fehler beim Zurücksetzen des Passworts"
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.reset-card {
  max-width: 400px;
  width: 100%;
  background: var(--bs-dark);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.reset-title {
  color: white;
  font-weight: 600;
}

.form-label {
  color: white;
  font-weight: 500;
}

.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.btn-primary {
  background: var(--bs-primary);
  border: none;
  font-weight: 500;
}

.btn-primary:hover {
  background: var(--bs-primary);
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline-light {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}

.alert {
  background: rgba(25, 135, 84, 0.1);
  border: 1px solid rgba(25, 135, 84, 0.3);
  color: #d1e7dd;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #f8d7da;
}

.text-decoration-none {
  color: rgba(255, 255, 255, 0.8);
}

.text-decoration-none:hover {
  color: white;
}

.invalid-feedback {
  color: #f8d7da;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.is-invalid {
  border-color: rgba(220, 53, 69, 0.5) !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style> 