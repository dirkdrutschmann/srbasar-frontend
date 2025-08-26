<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="footer-links">
            <a :href="githubFrontendUrl" target="_blank" class="footer-link">
              <font-awesome-icon icon="fa-brands fa-github" class="me-2" />
              Frontend
            </a>
            <a :href="githubBackendUrl" target="_blank" class="footer-link">
              <font-awesome-icon icon="fa-brands fa-github" class="me-2" />
              Backend
            </a>
            <a href="mailto:problems@srbasar.de" class="footer-link">
              <font-awesome-icon icon="fa-solid fa-envelope" class="me-2" />
              Probleme melden
            </a>
            <!-- Verwaltung Button - nur für nicht authentifizierte Benutzer -->
            <router-link v-if="!isAuthenticated" to="/login" class="footer-link">
              <font-awesome-icon icon="fa-solid fa-cog" class="me-1" />
              Verwaltung
            </router-link>
            <span class="footer-copyright">
              © 2025 Dirk Drutschmann
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.getIsAuthenticated())

const githubFrontendUrl = import.meta.env.VITE_GITHUB_FRONTEND_URL || 'https://github.com/drutschmann/spielebasar-frontend'
const githubBackendUrl = import.meta.env.VITE_GITHUB_BACKEND_URL || 'https://github.com/drutschmann/spielebasar-backend'
</script>

<style scoped>
.footer {
  background: var(--bs-dark);
  color: white;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.footer-links {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.footer-link:hover {
  color: white;
  text-decoration: none;
}

.footer-copyright {
  margin-left: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}


@media (max-width: 991.98px) {
  .footer-links {
    justify-content: flex-start;
    margin-top: 1rem;
  }
}

@media (max-width: 576px) {
  .footer {
    padding: 1.5rem 0;
  }
}
</style> 