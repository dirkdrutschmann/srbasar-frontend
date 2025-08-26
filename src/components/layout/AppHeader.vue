<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <!-- Toggler Button für mobile - nur wenn angemeldet -->
      <button 
        v-if="isAuthenticated"
        class="navbar-toggler bg-white" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <!-- Logo zentriert - außerhalb des Collapse-Containers -->
      <router-link class="navbar-brand navbar-brand-center" to="/">
        <img src="@/assets/whistle-icon.svg?data" width="24" alt="whistle"/> 
        {{ appTitle }}
      </router-link>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Navigation nur für eingeloggte Benutzer -->
        <ul v-if="isAuthenticated" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/basar">
              <font-awesome-icon icon="fa-solid fa-basketball" class="me-1" />
              Basar
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/vereine">
              <font-awesome-icon icon="fa-solid fa-users" class="me-1" />
              Vereine
            </router-link>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <router-link class="nav-link" to="/admin/users">
              <font-awesome-icon icon="fa-solid fa-users-cog" class="me-1" />
              Admin
            </router-link>
          </li>
        </ul>
        
        <!-- Benutzer-Dropdown nur für eingeloggte Benutzer -->
        <ul v-if="isAuthenticated" class="navbar-nav">
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <font-awesome-icon icon="fa-solid fa-user" class="me-1" />
              {{ currentUser?.username || 'Benutzer' }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <font-awesome-icon icon="fa-solid fa-user-cog" class="me-2" />
                  Profil
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <font-awesome-icon icon="fa-solid fa-sign-out-alt" class="me-2" />
                  Abmelden
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.getIsAuthenticated())
const currentUser = computed(() => authStore.getCurrentUser())
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const appTitle = import.meta.env.VITE_APP_TITLE || 'SR Basar'

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-dark));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 0;
  flex-shrink: 0;
  position: relative;
  min-height: 80px;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.25rem;
  color: white !important;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Logo zentrieren auf großen Bildschirmen */
.navbar-brand-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

/* Für kleine Bildschirme: Logo fest positioniert */
@media (max-width: 991.98px) {
  .navbar-brand-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 1rem;
    z-index: 1001;
  }
  
  .navbar {
    padding: 1rem 0;
    min-height: 70px;
  }
  
  /* Platz für das Logo im Collapse-Container */
  .navbar-collapse {
    margin-top: 3rem;
  }
}

.navbar-brand:hover {
  color: var(--bs-light) !important;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem !important;
  border-radius: 0.375rem;
  margin: 0 0.25rem;
}

.nav-link:hover {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.2);
  text-decoration: none !important;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  background-color: white;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  color: var(--bs-light);
}

.dropdown-item:hover {
  background-color: var(--bs-light);
  color: var(--bs-primary);
}

@media (max-width: 991.98px) {
  .navbar-nav {
    margin-top: 1rem;
  }
  
  .nav-link {
    margin: 0.25rem 0;
  }
}
</style> 