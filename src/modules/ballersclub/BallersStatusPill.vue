<template><span class="bc-status"><span v-if="dot" class="bc-status-dot" aria-hidden="true"></span>{{ spots }} {{ spots === 1 ? 'Spot frei' : 'Spots frei' }}</span></template>
<script setup>
defineProps({ spots: { type: Number, required: true }, dot: { type: Boolean, default: false } })
</script>
