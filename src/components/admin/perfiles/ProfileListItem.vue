<script setup>
import { computed } from 'vue';

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select', 'edit']);

const profileName = computed(() => {
  return props.profile?.name || 'Perfil sin nombre';
});

const profileDescription = computed(() => {
  if (props.profile?.description) {
    return props.profile.description;
  }

  return props.profile?.platform === 'app'
    ? 'Perfil de acceso para aplicación móvil'
    : 'Perfil de acceso para plataforma web';
});

const profileInitials = computed(() => {
  return profileName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
});

const platformLabel = computed(() => {
  const labels = {
    web: 'Web',
    app: 'App',
    both: 'Web/App',
  };

  return labels[props.profile?.platform] || props.profile?.platform || 'N/A';
});

const platformIcon = computed(() => {
  if (props.profile?.platform === 'app') {
    return 'fa fa-mobile-screen-button';
  }

  if (props.profile?.platform === 'both') {
    return 'fa fa-layer-group';
  }

  return 'fa fa-globe';
});

const platformClass = computed(() => {
  if (props.profile?.platform === 'app') {
    return 'bg-primary-lt';
  }

  if (props.profile?.platform === 'both') {
    return 'bg-info-lt';
  }

  return 'bg-info-lt';
});

const isActive = computed(() => {
  return props.profile?.state === 'active'
    || props.profile?.state === true
    || props.profile?.state === 1
    || props.profile?.state === '1';
});

const stateLabel = computed(() => {
  return isActive.value ? 'Activo' : 'Inactivo';
});

const stateClass = computed(() => {
  return isActive.value ? 'bg-success-lt' : 'bg-danger-lt';
});

const avatarClass = computed(() => {
  if (props.selected) {
    return 'profile-avatar-selected';
  }

  return props.profile?.platform === 'app'
    ? 'profile-avatar-app'
    : 'profile-avatar-web';
});

function handleSelect() {
  emit('select', props.profile);
}

function handleEdit(event) {
  event.stopPropagation();
  emit('edit', props.profile);
}
</script>

<template>
  <article
    class="profile-card"
    :class="{
      'profile-card-selected': selected,
      'profile-card-inactive': !isActive,
    }"
    role="button"
    tabindex="0"
    @click="handleSelect"
    @keydown.enter.prevent="handleSelect"
    @keydown.space.prevent="handleSelect"
  >
    <div class="profile-selected-bar"></div>

    <div class="profile-avatar" :class="avatarClass">
      <span>{{ profileInitials }}</span>
    </div>

    <div class="profile-content">
      <div class="profile-main-row">
        <div class="profile-title-wrap">
          <div class="profile-title">
            {{ profileName }}
          </div>

          <div class="profile-subtitle">
            #{{ profile.id }} · {{ profileDescription }}
          </div>
        </div>

        <button
          type="button"
          class="profile-edit-btn"
          title="Editar perfil"
          @click="handleEdit"
        >
          <i class="fa fa-pencil-alt"></i>
        </button>
      </div>

      <div class="profile-footer-row">
        <div class="profile-badges">
          <span class="badge" :class="platformClass">
            <i :class="platformIcon" class="me-1"></i>
            {{ platformLabel }}
          </span>

          <span class="badge" :class="stateClass">
            <i
              class="me-1"
              :class="isActive ? 'fa fa-check-circle' : 'fa fa-ban'"
            ></i>
            {{ stateLabel }}
          </span>

          <span v-if="selected" class="badge bg-selected-lt">
            <i class="fa fa-circle-dot me-1"></i>
            Seleccionado
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.profile-card {
  --profile-card-bg: var(--bs-body-bg);
  --profile-card-border: var(--bs-border-color);
  --profile-card-color: var(--bs-body-color);
  --profile-muted-color: var(--bs-secondary-color);
  --profile-hover-bg: rgba(var(--bs-primary-rgb), 0.045);
  --profile-selected-bg: rgba(var(--bs-primary-rgb), 0.10);
  --profile-selected-border: rgba(var(--bs-primary-rgb), 0.65);

  position: relative;
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--profile-card-border);
  border-radius: 0.95rem;
  background: var(--profile-card-bg);
  color: var(--profile-card-color);
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease,
    opacity 0.15s ease;
}

.profile-card:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.35);
  background: var(--profile-hover-bg);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.profile-card-selected {
  border-color: var(--profile-selected-border);
  background: var(--profile-selected-bg);
  box-shadow:
    0 6px 16px rgba(var(--bs-primary-rgb), 0.12),
    inset 4px 0 0 rgba(var(--bs-primary-rgb), 0.95);
}

.profile-card-inactive {
  opacity: 0.68;
}

.profile-card-selected.profile-card-inactive {
  opacity: 0.9;
}

.profile-selected-bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  background: var(--bs-primary);
  transition: width 0.15s ease;
}

.profile-card-selected .profile-selected-bar {
  width: 4px;
}

.profile-avatar {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  background: rgba(var(--bs-secondary-rgb), 0.14);
  color: var(--profile-muted-color);
}

.profile-avatar-web {
  background: rgba(var(--bs-info-rgb), 0.14);
  color: var(--bs-info);
}

.profile-avatar-app {
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.profile-avatar-selected {
  background: rgba(var(--bs-primary-rgb), 0.18);
  color: var(--bs-primary);
  box-shadow: inset 0 0 0 1px rgba(var(--bs-primary-rgb), 0.25);
}

.profile-content {
  min-width: 0;
}

.profile-main-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.profile-title-wrap {
  min-width: 0;
}

.profile-title {
  font-weight: 800;
  color: var(--profile-card-color);
  line-height: 1.15;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-subtitle {
  margin-top: 0.15rem;
  color: var(--profile-muted-color);
  font-size: 0.74rem;
  line-height: 1.25;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-footer-row {
  margin-top: 0.55rem;
}

.profile-badges {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.profile-edit-btn {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border: 0;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bs-secondary-rgb), 0.12);
  color: var(--profile-muted-color);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.profile-edit-btn:hover {
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
  transform: scale(1.04);
}

.badge {
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.28rem 0.5rem;
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

.bg-info-lt {
  background-color: rgba(var(--bs-info-rgb), 0.16);
  color: var(--bs-info);
}

.bg-selected-lt {
  background-color: rgba(var(--bs-primary-rgb), 0.16);
  color: var(--bs-primary);
}

@media (max-width: 767.98px) {
  .profile-card {
    grid-template-columns: 38px 1fr;
    gap: 0.6rem;
  }

  .profile-avatar {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }

  .profile-main-row {
    gap: 0.5rem;
  }

  .profile-title {
    max-width: 190px;
  }

  .profile-subtitle {
    max-width: 220px;
  }
}

:global(.dark-mode #page-container .profile-card) {
  background: var(--tuval-surface) !important;
  color: var(--tuval-text) !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(.dark-mode #page-container .profile-card:hover) {
  background: var(--tuval-surface-muted) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
}

:global(.dark-mode #page-container .profile-card-selected) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.75) !important;
}

:global(.dark-mode #page-container .profile-title) {
  color: var(--tuval-text) !important;
}

:global(.dark-mode #page-container .profile-subtitle) {
  color: rgba(255, 255, 255, 0.58) !important;
}

:global(.dark-mode #page-container .profile-avatar) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.70) !important;
}

:global(.dark-mode #page-container .profile-avatar-selected),
:global(.dark-mode #page-container .profile-avatar-app) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  color: var(--bs-primary) !important;
}

:global(.dark-mode #page-container .profile-avatar-web) {
  background: rgba(var(--bs-info-rgb), 0.18) !important;
  color: var(--bs-info) !important;
}

:global(.dark-mode #page-container .profile-edit-btn) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.70) !important;
}

:global(.dark-mode #page-container .profile-edit-btn:hover) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  color: var(--bs-primary) !important;
}
</style>