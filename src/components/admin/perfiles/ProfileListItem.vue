<script setup>
import { computed } from 'vue';
const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  selectId: {
    type: [Number, String, null],
    default: null,
  }
});
onMounted(() => { });
</script>

<template>
  <div>
  </div>
</template>

<style scoped>
.profile-list-node {
  margin-bottom: 0.45rem;

  --profile-card-bg: var(--bs-body-bg);
  --profile-card-border: var(--bs-border-color);
  --profile-card-color: var(--bs-body-color);
  --profile-muted-color: var(--bs-secondary-color);
  --profile-hover-bg: rgba(var(--bs-primary-rgb), 0.045);
  --profile-selected-bg: rgba(var(--bs-primary-rgb), 0.10);
  --profile-selected-border: rgba(var(--bs-primary-rgb), 0.65);
}

.profile-node-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.45rem;
  align-items: stretch;
  padding: 0.45rem;
  border: 1px solid var(--profile-card-border);
  border-radius: 0.85rem;
  background: var(--profile-card-bg);
  color: var(--profile-card-color);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.profile-node-card:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.35);
  background: var(--profile-hover-bg);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.profile-node-selected {
  border-color: var(--profile-selected-border);
  background: var(--profile-selected-bg);
  box-shadow:
    inset 4px 0 0 rgba(var(--bs-primary-rgb), 0.95),
    0 6px 16px rgba(var(--bs-primary-rgb), 0.12);
}

.profile-node-inactive {
  opacity: 0.68;
}

.profile-node-selected.profile-node-inactive {
  opacity: 0.9;
}

.profile-content-btn {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 0;
  min-width: 0;
  color: inherit;
}

.profile-main-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.profile-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  min-width: 0;
}

.profile-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 0.75rem;
  background: rgba(var(--bs-primary-rgb), 0.12);
  color: var(--bs-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-text-wrap {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.profile-title {
  font-weight: 700;
  color: var(--profile-card-color);
  line-height: 1.1;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-meta {
  margin-top: 0.15rem;
  color: var(--profile-muted-color);
  font-size: 0.72rem;
  line-height: 1.2;
}

.profile-badges {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.profile-action-btn {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 0.65rem;
  background: rgba(var(--bs-secondary-rgb), 0.12);
  color: var(--profile-muted-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.profile-action-btn:hover {
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.bg-primary-lt {
  background-color: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.bg-success-lt {
  background-color: rgba(var(--bs-success-rgb), 0.14);
  color: var(--bs-success);
}

.bg-danger-lt {
  background-color: rgba(var(--bs-danger-rgb), 0.14);
  color: var(--bs-danger);
}

.badge {
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.28rem 0.48rem;
}

@media (max-width: 768px) {
  .profile-node-card {
    grid-template-columns: 1fr;
  }

  .profile-main-row {
    flex-direction: column;
    gap: 0.45rem;
  }

  .profile-badges {
    justify-content: flex-start;
  }

  .profile-title {
    max-width: 190px;
  }

  .profile-actions {
    justify-content: flex-end;
  }
}

:global(#page-container.dark-mode .profile-node-card) {
  background: #243447 !important;
  color: #e5ecf5 !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .profile-node-card:hover) {
  background: #2a3b50 !important;
  border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
}

:global(#page-container.dark-mode .profile-node-selected) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.75) !important;
}

:global(#page-container.dark-mode .profile-title) {
  color: #f4f7fb !important;
}

:global(#page-container.dark-mode .profile-meta) {
  color: rgba(255, 255, 255, 0.58) !important;
}

:global(#page-container.dark-mode .profile-icon) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  color: var(--bs-primary) !important;
}

:global(#page-container.dark-mode .profile-action-btn) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.70) !important;
}
</style>
