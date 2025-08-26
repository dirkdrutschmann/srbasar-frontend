<template>
  <div class="login-container">
    <div class="card login-card">
      <div class="card-body">
        <div class="text-center mb-4">
          <h2 class="login-title">Anmelden</h2>
          <p class="text-muted">Melden Sie sich mit Ihren Zugangsdaten an</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Benutzername oder E-Mail</label>
            <input
              id="username"
              v-model="user.username"
              type="text"
              class="form-control"
              placeholder="Benutzername oder E-Mail-Adresse"
              required
              :class="{ 'is-invalid': errors.username }"
            />
            <div v-if="errors.username" class="invalid-feedback">
              {{ errors.username }}
            </div>
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label">Passwort</label>
            <input
              id="password"
              v-model="user.password"
              type="password"
              class="form-control"
              placeholder="Ihr Passwort"
              required
              :class="{ 'is-invalid': errors.password }"
            />
            <div v-if="errors.password" class="invalid-feedback">
              {{ errors.password }}
            </div>
          </div>
          
          <button
            type="submit"
            class="btn btn-primary btn-lg w-100"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Anmelden...' : 'Anmelden' }}
          </button>
        </form>
        
        <div v-if="message" class="alert alert-danger mt-3" role="alert">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="me-2" />
          {{ message }}
        </div>
        
        <div class="text-center mt-4">
          <router-link 
            :to="{name: 'reset'}" 
            class="text-decoration-none"
          >
            Passwort vergessen?
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

const router = useRouter()
const authStore = useAuthStore()

const user = ref({
  username: '',
  password: ''
})

const errors = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const message = ref('')

const loggedIn = computed(() => authStore.getIsAuthenticated())

onMounted(() => {
  if (loggedIn.value) {
    router.push('/profile')
  }
})

const validateForm = () => {
  errors.value.username = ''
  errors.value.password = ''
  
  if (!user.value.username) {
    errors.value.username = 'Benutzername oder E-Mail ist erforderlich'
    return false
  }
  
  if (!user.value.password) {
    errors.value.password = 'Passwort ist erforderlich'
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  message.value = ''
  loading.value = true

  try {
    const result = await authStore.login(user.value)
    
    if (result.success) {
      router.push('/profile')
    } else {
      message.value = result.error || 'Login fehlgeschlagen'
    }
  } catch (error) {
    message.value = 'Ein Fehler ist aufgetreten'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  max-width: 400px;
  width: 100%;
  background: var(--bs-dark);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.login-title {
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

.alert {
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
</style>