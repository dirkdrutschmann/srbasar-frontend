<template>
  <div id="app" :class="{ 'app--design-mvp': isDesignMvp }">
    <template v-if="isDesignMvp">
      <router-view />
    </template>

    <template v-else>
      <main class="main-content">
        <div class="container-fluid">
          <router-view />
        </div>
      </main>

      <AppFooter />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/layout/AppFooter.vue'

const route = useRoute()
const isDesignMvp = computed(() => route.meta.layout === 'design-mvp')
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app.app--design-mvp {
  display: block;
}

.main-content {
  flex: 1;
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-dark));
  display: flex;
  flex-direction: column;
}
</style>
