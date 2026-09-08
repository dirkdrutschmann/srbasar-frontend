<template>
  <ul class="referee-assignments" :class="'referee-assignments--' + layout" aria-label="Schiedsrichter-Vereine">
    <li
      v-for="assignment in assignments"
      :key="assignment.role"
      class="referee-assignment"
      :class="'referee-assignment--' + assignment.status"
    >
      <span class="referee-meta">
        <span class="referee-role">{{ assignment.role }}</span>
        <span class="referee-status">
          <font-awesome-icon :icon="assignment.statusIcon" aria-hidden="true" />
          {{ assignment.statusLabel }}
        </span>
      </span>
      <strong class="referee-club">{{ assignment.club }}</strong>
    </li>
  </ul>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  assignments: { type: Array, default: () => [] },
  layout: { type: String, default: 'cards', validator: (value) => ['cards', 'table', 'detail'].includes(value) }
})
</script>

<style scoped>
.referee-assignments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
  gap: 0.5rem 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.referee-assignment {
  --referee-color: var(--mvp-text-soft);
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 0.22rem;
  padding: 0.4rem 0.55rem;
  border-left: 2px solid color-mix(in srgb, var(--referee-color) 45%, transparent);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--referee-color) 5%, transparent);
  color: var(--referee-color);
}

.referee-assignment--open { --referee-color: var(--mvp-brand-dark); }
.referee-assignment--filled { --referee-color: var(--mvp-assigned); }

.referee-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem 0.4rem;
}

.referee-role {
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
  font-weight: 650;
  line-height: 1.4;
}

.referee-club {
  min-width: 0;
  color: var(--referee-color);
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.referee-status {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  color: var(--referee-color);
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.4;
}

.referee-status svg {
  flex: 0 0 auto;
  font-size: 0.6rem;
}

.referee-assignments--table {
  gap: 0.35rem var(--table-column-gap, 0.8rem);
}

.referee-assignments--table .referee-assignment {
  gap: 0.08rem;
  padding: 0.25rem 0.45rem;
}

.referee-assignments--table .referee-meta {
  justify-content: space-between;
}

.referee-assignments--table .referee-club {
  font-size: 0.68rem;
}

.referee-assignments--table .referee-role,
.referee-assignments--table .referee-status { font-size: 0.6rem; }

.referee-assignments--detail {
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--mvp-surface-muted);
}
</style>
