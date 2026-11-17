<script setup>
import BaseBlock from '@/components/BaseBlock.vue';
import ProfileListItem from '@/components/admin/perfiles/ProfileListItem.vue';
import { computed } from 'vue';

const props = defineProps({
  profiles: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: [Number, String, null],
    default: null,
  },
  platform: {
    type: String,
    default: 'web',
  },
  status: {
    type: String,
    default: 'active',
  },
  search: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'create',
  'select',
  'edit',
  'update:platform',
  'update:status',
  'update:search',
  'change-platform',
  'change-status',
]);

const selectedProfile = computed(() => {
  return props.profiles.find(
    (profile) => String(profile.id) === String(props.selectedId)
  );
});

const activeCount = computed(() => {
  return props.profiles.filter((profile) => {
    return profile.state === 'active'
      || profile.state === true
      || profile.state === 1
      || profile.state === '1';
  }).length;
});

const inactiveCount = computed(() => {
  return props.profiles.length - activeCount.value;
});

const platformLabel = computed(() => {
  return props.platform === 'app' ? 'App' : 'Web';
});

const statusLabel = computed(() => {
  const labels = {
    active: 'Activos',
    inactive: 'Inactivos',
    '': 'Todos',
  };

  return labels[props.status] ?? 'Todos';
});

const hasSearch = computed(() => {
  return props.search.trim().length > 0;
});

function handlePlatformChange(event) {
  emit('update:platform', event.target.value);
  emit('change-platform');
}

function handleStatusChange(event) {
  emit('update:status', event.target.value);
  emit('change-status');
}

function handleSearchInput(event) {
  emit('update:search', event.target.value);
}

function clearSearch() {
  emit('update:search', '');
}
</script>

<template>
  <BaseBlock title="Perfiles de usuario" class="mb-2">
    <template #options>
      <button
        type="button"
        class="btn btn-success btn-sm"
        @click="$emit('create')"
      >
        <i class="fa fa-plus me-1"></i>
        Crear perfil
      </button>
    </template>

    <p class="fs-sm text-muted mb-3">
      Administra los perfiles de acceso por plataforma.
    </p>

    <div class="profile-list-panel mb-3">
      <div class="profile-list-main">
        <div class="profile-list-icon">
          <i class="fa fa-users-gear"></i>
        </div>

        <div class="profile-list-info">
          <div class="profile-list-title">
            Perfiles {{ platformLabel }}
          </div>

          <div class="profile-list-subtitle">
            Filtro actual: {{ statusLabel }}
            <span v-if="hasSearch">
              · Búsqueda: “{{ search }}”
            </span>
          </div>
        </div>
      </div>

      <div class="profile-list-stats">
        <div class="profile-stat-card">
          <div class="profile-stat-value">
            {{ profiles.length }}
          </div>
          <div class="profile-stat-label">
            Total
          </div>
        </div>

        <div class="profile-stat-card">
          <div class="profile-stat-value success">
            {{ activeCount }}
          </div>
          <div class="profile-stat-label">
            Activos
          </div>
        </div>

        <div class="profile-stat-card">
          <div class="profile-stat-value danger">
            {{ inactiveCount }}
          </div>
          <div class="profile-stat-label">
            Inactivos
          </div>
        </div>
      </div>
    </div>

    <div class="profile-filter-toolbar mb-3">
      <div class="profile-filter-group">
        <div class="form-floating profile-filter-control">
          <select
            id="filter-platform"
            class="form-select form-select-sm"
            :value="platform"
            @change="handlePlatformChange"
          >
            <option value="web">Web</option>
            <option value="app">App</option>
          </select>
          <label for="filter-platform">Plataforma</label>
        </div>

        <div class="form-floating profile-filter-control">
          <select
            id="filter-status"
            class="form-select form-select-sm"
            :value="status"
            @change="handleStatusChange"
          >
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <label for="filter-status">Estado</label>
        </div>
      </div>

      <div class="input-group input-group-sm profile-search">
        <span class="input-group-text">
          <i class="fa fa-search"></i>
        </span>

        <input
          id="filter-search"
          type="text"
          class="form-control"
          placeholder="Buscar perfil..."
          :value="search"
          @input="handleSearchInput"
        >

        <button
          v-if="hasSearch"
          type="button"
          class="btn btn-alt-secondary"
          title="Limpiar búsqueda"
          @click="clearSearch"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>

    <div v-if="selectedProfile" class="profile-selected-summary mb-3">
      <i class="fa fa-circle-dot me-1"></i>
      Perfil seleccionado:
      <strong>{{ selectedProfile.name }}</strong>
    </div>

    <div v-if="loading" class="profile-empty-state">
      <i class="fa fa-spinner fa-spin me-1"></i>
      Cargando perfiles...
    </div>

    <div v-else-if="profiles.length === 0" class="profile-empty-state">
      <i class="fa fa-info-circle me-1"></i>
      No se encontraron perfiles.
    </div>

    <div v-else class="profile-list-scroll">
      <div class="profile-list">
        <ProfileListItem
          v-for="profile in profiles"
          :key="profile.id"
          :profile="profile"
          :selected="String(selectedId) === String(profile.id)"
          @select="$emit('select', $event)"
          @edit="$emit('edit', $event)"
        />
      </div>
    </div>

    <div class="profile-list-footer">
      <span>
        Mostrando {{ profiles.length }} perfiles.
      </span>

      <span>
        {{ platformLabel }} · {{ statusLabel }}
      </span>
    </div>
  </BaseBlock>
</template>

<style scoped>
.profile-list-panel {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 1rem;
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.08),
      rgba(var(--bs-info-rgb), 0.05)
    );
}

.profile-list-main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.profile-list-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
  font-size: 1.1rem;
}

.profile-list-info {
  min-width: 0;
}

.profile-list-title {
  font-weight: 800;
  color: var(--bs-body-color);
  line-height: 1.15;
}

.profile-list-subtitle {
  margin-top: 0.2rem;
  color: var(--bs-secondary-color);
  font-size: 0.78rem;
}

.profile-list-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.profile-stat-card {
  min-width: 74px;
  padding: 0.55rem 0.7rem;
  border-radius: 0.85rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  text-align: center;
}

.profile-stat-value {
  font-weight: 900;
  font-size: 1rem;
  line-height: 1;
  color: var(--bs-primary);
}

.profile-stat-value.success {
  color: var(--bs-success);
}

.profile-stat-value.danger {
  color: var(--bs-danger);
}

.profile-stat-label {
  margin-top: 0.25rem;
  font-size: 0.67rem;
  font-weight: 700;
  color: var(--bs-secondary-color);
  text-transform: uppercase;
}

.profile-filter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.profile-filter-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.profile-filter-control {
  width: 150px;
}

.profile-search {
  width: min(320px, 100%);
}

.profile-selected-summary {
  padding: 0.65rem 0.75rem;
  border-radius: 0.85rem;
  background: rgba(var(--bs-primary-rgb), 0.10);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.22);
  color: var(--bs-primary);
  font-size: 0.78rem;
  font-weight: 700;
}

.profile-list-scroll {
  max-height: min(460px, calc(100vh - 360px));
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
  margin-right: -0.25rem;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.profile-empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--bs-secondary-color);
  border: 1px dashed var(--bs-border-color);
  border-radius: 0.85rem;
  background: var(--bs-tertiary-bg);
}

.profile-list-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--bs-border-color);
  color: var(--bs-secondary-color);
  font-size: 0.75rem;
  font-weight: 600;
}

.profile-list-scroll::-webkit-scrollbar {
  width: 7px;
}

.profile-list-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.profile-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--bs-secondary-rgb), 0.35);
  border-radius: 999px;
}

.profile-list-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--bs-primary-rgb), 0.55);
}

@media (max-width: 767.98px) {
  .profile-list-panel {
    flex-direction: column;
  }

  .profile-list-stats {
    justify-content: flex-start;
  }

  .profile-filter-toolbar {
    align-items: stretch;
  }

  .profile-filter-group {
    width: 100%;
  }

  .profile-filter-control {
    width: calc(50% - 0.25rem);
  }

  .profile-search {
    width: 100%;
  }

  .profile-list-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

:global(.dark-mode #page-container .profile-list-panel) {
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.16),
      var(--tuval-bg)
    ) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:global(.dark-mode #page-container .profile-stat-card) {
  background: var(--tuval-bg) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:global(.dark-mode #page-container .profile-list-title) {
  color: var(--tuval-text) !important;
}

:global(.dark-mode #page-container .profile-list-subtitle),
:global(.dark-mode #page-container .profile-stat-label),
:global(.dark-mode #page-container .profile-list-footer) {
  color: rgba(255, 255, 255, 0.62) !important;
}

:global(.dark-mode #page-container .profile-selected-summary) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.34) !important;
  color: var(--bs-primary) !important;
}

:global(.dark-mode #page-container .profile-empty-state) {
  background: var(--tuval-bg) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.62) !important;
}

:global(.dark-mode #page-container .profile-list-footer) {
  border-top-color: rgba(255, 255, 255, 0.12) !important;
}

:global(.dark-mode #page-container .profile-list-scroll::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.18) !important;
}

:global(.dark-mode #page-container .profile-list-scroll::-webkit-scrollbar-thumb:hover) {
  background: rgba(var(--bs-primary-rgb), 0.70) !important;
}
</style>