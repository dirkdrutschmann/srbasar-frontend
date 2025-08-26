<template>
  <div id="app">
    <AppHeader />
    
    <main class="main-content">
      <div class="container-fluid">
        <router-view />
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 0 1 auto;
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-dark));
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 176px); /* Anpassung an Header (80px) + Footer (80px) */
}
</style>
