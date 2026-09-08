<template>
  <span
    class="game-risk-badge"
    :class="{ 'game-risk-badge--ribbon': variant === 'ribbon' }"
    title="Beide SR-Vereine suchen: Die erste und zweite SR-Position werden offen angeboten."
  >
    <font-awesome-icon :icon="['fas', 'triangle-exclamation']" aria-hidden="true" />
    <span>Ausfall bedroht</span>
  </span>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  variant: { type: String, default: 'badge', validator: (value) => ['badge', 'ribbon'].includes(value) }
})
</script>

<style scoped>
.game-risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
  padding: 0.22rem 0.45rem;
  border-radius: 6px;
  background: var(--mvp-danger-soft);
  color: var(--mvp-danger);
  font-size: 0.62rem;
  font-weight: 650;
  line-height: 1.4;
}

.game-risk-badge svg { flex: 0 0 auto; }

.game-risk-badge--ribbon {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  width: 100%;
  box-sizing: border-box;
  padding: 0.3rem 0.75rem;
  border-block: 1px solid var(--mvp-danger-border);
  border-radius: 0;
  text-align: center;
  letter-spacing: 0.03em;
}

.game-risk-badge--ribbon svg { justify-self: end; }
</style>
