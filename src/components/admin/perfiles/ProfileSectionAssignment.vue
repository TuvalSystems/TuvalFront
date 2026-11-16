<script setup>
import BaseBlock from '@/components/BaseBlock.vue';
import ProfileSectionAssignmentNode from '@/components/admin/perfiles/ProfileSectionAssignmentNode.vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  sections: {
    type: Array,
    default: () => [],
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  homeSectionId: {
    type: [Number, String, null],
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  'toggle',
  'set-home',
  'mark-all',
  'clear-all',
  'save',
]);

const search = ref('');
const expandSignal = ref(0);
const collapseSignal = ref(0);

const hasProfile = computed(() => {
  return Boolean(props.profile?.id);
});

const platformLabel = computed(() => {
  return props.profile?.platform === 'app' ? 'App' : 'Web';
});

const platformBadgeClass = computed(() => {
  return props.profile?.platform === 'app'
    ? 'bg-primary-light text-primary'
    : 'bg-info-light text-info';
});

const selectedCount = computed(() => {
  return props.selectedIds.length;
});

const filteredSections = computed(() => {
  const value = search.value.trim().toLowerCase();

  if (!value) {
    return props.sections;
  }

  function filterTree(items) {
    return items
      .map((item) => {
        const children = filterTree(item.children ?? []);

        const text = [
          item.name,
          item.url,
          item.route_name,
          item.icon,
        ].filter(Boolean).join(' ').toLowerCase();

        if (text.includes(value) || children.length > 0) {
          return {
            ...item,
            children,
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  return filterTree(props.sections);
});

function expandAll() {
  expandSignal.value++;
}

function collapseAll() {
  collapseSignal.value++;
}

const filteredCount = computed(() => {
  function countTree(items) {
    return items.reduce((total, item) => {
      return total + 1 + countTree(item.children ?? []);
    }, 0);
  }

  return countTree(filteredSections.value);
});

const totalSections = computed(() => {
  function countTree(items) {
    return items.reduce((total, item) => {
      return total + 1 + countTree(item.children ?? []);
    }, 0);
  }

  return countTree(props.sections);
});

const selectedPercent = computed(() => {
  if (totalSections.value === 0) {
    return 0;
  }

  return Math.round((selectedCount.value / totalSections.value) * 100);
});

const homeSectionName = computed(() => {
  if (!props.homeSectionId) {
    return null;
  }

  function findSection(items) {
    for (const item of items) {
      if (Number(item.id) === Number(props.homeSectionId)) {
        return item.name;
      }

      const found = findSection(item.children ?? []);

      if (found) {
        return found;
      }
    }

    return null;
  }

  return findSection(props.sections);
});

const hasSearch = computed(() => {
  return search.value.trim().length > 0;
});

watch(
  () => props.profile?.id,
  () => {
    search.value = '';
  }
);
</script>

<template>
  <BaseBlock title="Accesos del perfil" class="mb-2">
    <template #options>
      <span v-if="hasProfile" class="badge" :class="platformBadgeClass">
        {{ platformLabel }}
      </span>
    </template>

    <div v-if="!hasProfile" class="permission-empty">
      <i class="fa fa-user-shield me-1"></i>
      Selecciona un perfil para administrar sus accesos.
    </div>

    <template v-else>
      <p class="fs-sm text-muted mb-3">
        Secciones habilitadas para el perfil seleccionado.
      </p>

      <div class="profile-access-panel mb-4">
        <div class="profile-access-main">
          <div class="profile-access-icon">
            <i class="fa fa-user-shield"></i>
          </div>

          <div class="profile-access-info">
            <div class="profile-access-title">
              {{ profile.name }}
            </div>

            <div class="profile-access-subtitle">
              Plataforma {{ platformLabel }}
              <span v-if="homeSectionName">
                · Home: {{ homeSectionName }}
              </span>
              <span v-else>
                · Sin Home definido
              </span>
            </div>
          </div>
        </div>

        <div class="profile-access-stats">
          <div class="profile-stat-card">
            <div class="profile-stat-value">
              {{ selectedCount }}
            </div>
            <div class="profile-stat-label">
              Marcadas
            </div>
          </div>

          <div class="profile-stat-card">
            <div class="profile-stat-value">
              {{ totalSections }}
            </div>
            <div class="profile-stat-label">
              Disponibles
            </div>
          </div>

          <div class="profile-stat-card">
            <div class="profile-stat-value">
              {{ selectedPercent }}%
            </div>
            <div class="profile-stat-label">
              Cobertura
            </div>
          </div>

          <div v-if="hasSearch" class="profile-stat-card profile-stat-search">
            <div class="profile-stat-value">
              {{ filteredCount }}
            </div>
            <div class="profile-stat-label">
              Coincidencias
            </div>
          </div>
        </div>
      </div>
      <div class="permission-toolbar mb-3">
        <div class="input-group input-group-sm permission-search">
          <span class="input-group-text">
            <i class="fa fa-search"></i>
          </span>

          <input v-model="search" type="text" class="form-control" placeholder="Buscar sección, ruta o ícono...">

          <button v-if="search" type="button" class="btn btn-alt-secondary" title="Limpiar búsqueda"
            @click="search = ''">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="permission-actions">
          <button type="button" class="btn btn-sm btn-alt-primary" :disabled="loading || saving"
            @click="$emit('mark-all')">
            <i class="fa fa-check me-1"></i>
            Marcar todo
          </button>

          <button type="button" class="btn btn-sm btn-alt-secondary" :disabled="loading || saving"
            @click="$emit('clear-all')">
            <i class="fa fa-times me-1"></i>
            Limpiar
          </button>

          <button type="button" class="btn btn-sm btn-alt-secondary" :disabled="loading" @click="expandAll">
            <i class="fa fa-expand me-1"></i>
            Expandir
          </button>

          <button type="button" class="btn btn-sm btn-alt-secondary" :disabled="loading" @click="collapseAll">
            <i class="fa fa-compress me-1"></i>
            Contraer
          </button>
        </div>
      </div>

      <div v-if="loading" class="permission-empty">
        <i class="fa fa-spinner fa-spin me-1"></i>
        Cargando secciones...
      </div>

      <div v-else-if="filteredSections.length === 0" class="permission-empty">
        <i class="fa fa-info-circle me-1"></i>
        No se encontraron secciones.
      </div>

      <div v-else class="permission-tree-scroll">
        <div class="permission-tree-summary">
          <span>
            <i class="fa fa-layer-group me-1"></i>
            Mostrando {{ filteredCount }} de {{ totalSections }} secciones
          </span>

          <span v-if="homeSectionName" class="permission-home-chip">
            <i class="fa fa-home me-1"></i>
            Home: {{ homeSectionName }}
          </span>

          <span v-else class="permission-home-chip warning">
            <i class="fa fa-triangle-exclamation me-1"></i>
            Home no definido
          </span>
        </div>
        <ul class="list-unstyled mb-0">
          <ProfileSectionAssignmentNode v-for="section in filteredSections" :key="section.id" :section="section"
            :selected-ids="selectedIds" :home-section-id="homeSectionId" :expand-signal="expandSignal"
            :collapse-signal="collapseSignal" @toggle="(section, checked) => $emit('toggle', section, checked)"
            @set-home="(section) => $emit('set-home', section)" />
        </ul>
      </div>

      <div class="permission-save-bar mt-3 mb-2">
        <button type="button" class="btn btn-primary" :disabled="saving || loading" @click="$emit('save')">
          <i class="me-1" :class="saving ? 'fa fa-spinner fa-spin' : 'fa fa-save'"></i>
          {{ saving ? 'Guardando accesos...' : 'Guardar accesos' }}
        </button>
      </div>
    </template>
  </BaseBlock>
</template>

<style scoped>
.permission-search {
  width: 240px;
}

.permission-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--bs-secondary-color);
  border: 1px dashed var(--bs-border-color);
  border-radius: 0.85rem;
  background: var(--bs-tertiary-bg);
}

.permission-tree-scroll {
  max-height: min(620px, calc(100vh - 280px));
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.3rem;
}

.permission-tree-scroll::-webkit-scrollbar {
  width: 7px;
}

.permission-tree-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.permission-tree-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--bs-secondary-rgb), 0.35);
  border-radius: 999px;
}

.permission-tree-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--bs-primary-rgb), 0.55);
}

@media (max-width: 767.98px) {
  .permission-search {
    width: 100%;
  }
}

:global(.dark-mode #page-container .permission-empty) {
  background: rgba(0, 0, 0, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.62) !important;
}

:global(.dark-mode #page-container .permission-tree-scroll::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.18) !important;
}

:global(.dark-mode #page-container .permission-tree-scroll::-webkit-scrollbar-thumb:hover) {
  background: rgba(var(--bs-primary-rgb), 0.70) !important;
}

.profile-access-panel {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
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

.profile-access-main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.profile-access-icon {
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

.profile-access-info {
  min-width: 0;
}

.profile-access-title {
  font-weight: 800;
  color: var(--bs-body-color);
  line-height: 1.15;
}

.profile-access-subtitle {
  margin-top: 0.2rem;
  color: var(--bs-secondary-color);
  font-size: 0.78rem;
}

.profile-access-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.profile-stat-card {
  min-width: 82px;
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

.profile-stat-label {
  margin-top: 0.25rem;
  font-size: 0.67rem;
  font-weight: 700;
  color: var(--bs-secondary-color);
  text-transform: uppercase;
}

.profile-stat-search .profile-stat-value {
  color: var(--bs-info);
}

.permission-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.permission-search {
  width: min(360px, 100%);
}

.permission-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: flex-end;
}

.permission-tree-summary {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.85rem;
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  color: var(--bs-secondary-color);
  font-size: 0.78rem;
  font-weight: 600;
}

.permission-home-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(var(--bs-success-rgb), 0.14);
  color: var(--bs-success);
  font-size: 0.7rem;
  font-weight: 800;
}

.permission-home-chip.warning {
  background: rgba(var(--bs-warning-rgb), 0.14);
  color: var(--bs-warning);
}

.permission-save-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.85rem;
  border-top: 1px solid var(--bs-border-color);
}

.permission-save-bar .btn {
  min-width: 170px;
}

@media (max-width: 767.98px) {
  .profile-access-panel {
    flex-direction: column;
  }

  .profile-access-stats {
    justify-content: flex-start;
  }

  .permission-toolbar {
    align-items: stretch;
  }

  .permission-search {
    width: 100%;
  }

  .permission-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .permission-save-bar .btn {
    width: 100%;
  }
}

:global(.dark-mode #page-container .profile-access-panel) {
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.16),
      rgba(0, 0, 0, 0.18)
    ) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:global(.dark-mode #page-container .profile-stat-card),
:global(.dark-mode #page-container .permission-tree-summary) {
  background: rgba(0, 0, 0, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:global(.dark-mode #page-container .profile-access-title) {
  color: #f4f7fb !important;
}

:global(.dark-mode #page-container .profile-access-subtitle),
:global(.dark-mode #page-container .profile-stat-label),
:global(.dark-mode #page-container .permission-tree-summary) {
  color: rgba(255, 255, 255, 0.62) !important;
}

:global(.dark-mode #page-container .permission-save-bar) {
  border-top-color: rgba(255, 255, 255, 0.12) !important;
}
</style>
