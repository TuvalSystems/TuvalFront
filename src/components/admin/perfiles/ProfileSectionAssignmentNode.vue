<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  homeSectionId: {
    type: [Number, String, null],
    default: null,
  },
  depth: {
    type: Number,
    default: 1,
  },
  expandSignal: {
    type: Number,
    default: 0,
  },
  collapseSignal: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['toggle', 'set-home']);

const isOpen = ref(true);

const children = computed(() => {
  return props.section.children ?? [];
});

const hasChildren = computed(() => {
  return children.value.length > 0;
});

const selectedIdSet = computed(() => {
  return new Set(props.selectedIds.map(Number));
});

const isChecked = computed(() => {
  return selectedIdSet.value.has(Number(props.section.id));
});

const isActive = computed(() => {
  return props.section.status === true ||
    props.section.status === 1 ||
    props.section.status === '1' ||
    props.section.is_active === true ||
    props.section.is_active === 1 ||
    props.section.state === 'active';
});

const hasRoute = computed(() => {
  return Boolean(props.section.url || props.section.route_name);
});

const isGroup = computed(() => {
  return hasChildren.value || !hasRoute.value;
});

const platformLabel = computed(() => {
  const labels = {
    web: 'Web',
    app: 'App',
    both: 'Web/App',
  };

  return labels[props.section.platform] || props.section.platform || 'N/A';
});

const iconClass = computed(() => {
  const icon = String(props.section.icon || '').trim();

  if (!icon) {
    return isGroup.value ? 'fa fa-folder-tree' : 'fa fa-file-lines';
  }

  if (
    icon.includes('fa-') ||
    icon.startsWith('fa ') ||
    icon.startsWith('far ') ||
    icon.startsWith('fab ') ||
    icon.startsWith('si ')
  ) {
    return icon;
  }

  return isGroup.value ? 'fa fa-layer-group' : 'fa fa-mobile-screen-button';
});

function toggleOpen() {
  if (!hasChildren.value) return;

  isOpen.value = !isOpen.value;
}

function handleCheck(event) {
  emit('toggle', props.section, event.target.checked);
}

watch(
  () => props.expandSignal,
  () => {
    isOpen.value = true;
  }
);

watch(
  () => props.collapseSignal,
  () => {
    isOpen.value = false;
  }
);


const isHome = computed(() => {
  return Number(props.homeSectionId) === Number(props.section.id);
});

const canBeHome = computed(() => {
  return isChecked.value && hasRoute.value;
});

function handleSetHome(event) {
  event.stopPropagation();

  if (!canBeHome.value) {
    return;
  }

  emit('set-home', props.section);
}

const nodeDepthStyle = computed(() => {
  return {
    '--node-depth-offset': `${Math.min(props.depth - 1, 4) * 0.25}rem`,
  };
});

const homeTitle = computed(() => {
  if (!isChecked.value) {
    return 'Primero asigna esta sección al perfil';
  }

  if (!hasRoute.value) {
    return 'Solo una pantalla con ruta puede ser Home';
  }

  return isHome.value
    ? 'Pantalla inicial actual'
    : 'Definir como pantalla inicial';
});

const routeSummary = computed(() => {
  if (props.section.route_name) {
    return props.section.route_name;
  }

  if (props.section.url) {
    return props.section.url;
  }

  return null;
});
</script>

<template>
  <li class="profile-section-node">
    <div class="section-node-card" :style="nodeDepthStyle" :class="{
      'section-node-selected': isChecked,
      'section-node-home': isHome,
      'section-node-inactive': !isActive,
    }">
      <button type="button" class="section-toggle-btn" :class="{ 'section-toggle-empty': !hasChildren }"
        :disabled="!hasChildren" @click.stop="toggleOpen">
        <i v-if="hasChildren" class="fa" :class="isOpen ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      </button>

      <label class="section-content-label">
        <input class="form-check-input section-check" type="checkbox" :checked="isChecked" @change="handleCheck">

        <div class="section-content-body">
          <div class="section-main-row">
            <div class="section-title-wrap">
              <span class="section-icon">
                <i :class="iconClass"></i>
              </span>

              <span class="section-text-wrap">
                <span class="section-title">
                  {{ section.name }}
                </span>

                <span class="section-meta">
                  #{{ section.id }}

                  <span v-if="section.sort_order !== null && section.sort_order !== undefined">
                    · Orden {{ section.sort_order }}
                  </span>
                </span>
              </span>
            </div>

            <div class="section-badges">
              <label class="home-radio" :class="{
                disabled: !canBeHome,
                active: isHome,
              }" :title="homeTitle" @click.stop>
                <input type="radio" name="profile-home-section" :checked="isHome" :disabled="!canBeHome"
                  @change="handleSetHome">

                <i class="fa fa-home"></i>

                <span>
                  {{ isHome ? 'Home' : 'Inicio' }}
                </span>
              </label>
              <span v-if="isChecked" class="badge bg-selected-lt">
                Asignada
              </span>

              <span class="badge" :class="isGroup ? 'bg-info-lt' : 'bg-secondary-lt'">
                {{ isGroup ? 'Grupo' : 'Pantalla' }}
              </span>

              <span class="badge bg-primary-lt">
                {{ platformLabel }}
              </span>

              <span class="badge" :class="isActive ? 'bg-success-lt' : 'bg-danger-lt'">
                {{ isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>

          <div v-if="section.url || section.route_name" class="section-route-box">
            <div class="section-route-header">
              <i class="fa fa-link"></i>
              <span>{{ routeSummary }}</span>
            </div>

            <div v-if="section.url" class="section-route-line">
              <span class="section-route-label">URL</span>
              <code>{{ section.url }}</code>
            </div>

            <div v-if="section.route_name" class="section-route-line">
              <span class="section-route-label">Ruta</span>
              <code>{{ section.route_name }}</code>
            </div>
          </div>
        </div>
      </label>
    </div>

    <ul v-if="hasChildren && isOpen" class="list-unstyled section-children">
      <ProfileSectionAssignmentNode v-for="child in children" :key="child.id" :section="child"
        :selected-ids="selectedIds" :home-section-id="homeSectionId" :depth="depth + 1" :expand-signal="expandSignal"
        :collapse-signal="collapseSignal" @toggle="(section, checked) => $emit('toggle', section, checked)"
        @set-home="(section) => $emit('set-home', section)" />
    </ul>
  </li>
</template>

<style scoped>
.profile-section-node {
  margin-bottom: 0.45rem;

  --section-card-bg: var(--bs-body-bg);
  --section-card-border: var(--bs-border-color);
  --section-card-color: var(--bs-body-color);
  --section-muted-color: var(--bs-secondary-color);
  --section-route-bg: var(--bs-tertiary-bg);
  --section-route-border: var(--bs-border-color);
  --section-hover-bg: rgba(var(--bs-primary-rgb), 0.045);
  --section-selected-bg: rgba(var(--bs-primary-rgb), 0.10);
  --section-selected-border: rgba(var(--bs-primary-rgb), 0.65);
}

.section-node-card {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 0.45rem;
  align-items: stretch;
  padding: 0.45rem;
  border: 1px solid var(--section-card-border);
  border-radius: 0.85rem;
  background: var(--section-card-bg);
  color: var(--section-card-color);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.section-node-card:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.35);
  background: var(--section-hover-bg);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.section-node-selected {
  border-color: var(--section-selected-border);
  background: var(--section-selected-bg);
  box-shadow:
    inset 4px 0 0 rgba(var(--bs-primary-rgb), 0.95),
    0 6px 16px rgba(var(--bs-primary-rgb), 0.12);
}

.section-node-inactive {
  opacity: 0.68;
}

.section-toggle-btn {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  background: rgba(var(--bs-secondary-rgb), 0.12);
  color: var(--section-muted-color);
}

.section-toggle-btn:hover:not(:disabled) {
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.section-toggle-empty {
  background: transparent;
  cursor: default;
}

.section-content-label {
  width: 100%;
  display: flex;
  gap: 0.7rem;
  margin: 0;
  cursor: pointer;
  min-width: 0;
}

.section-check {
  margin-top: 0.45rem;
  flex-shrink: 0;
}

.section-main-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  min-width: 0;
}

.section-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  min-width: 0;
}

.section-icon {
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

.section-text-wrap {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-weight: 700;
  color: var(--section-card-color);
  line-height: 1.1;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-meta {
  margin-top: 0.15rem;
  color: var(--section-muted-color);
  font-size: 0.72rem;
  line-height: 1.2;
}

.section-badges {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.section-route-box {
  margin-top: 0.5rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.65rem;
  background: var(--section-route-bg);
  border: 1px dashed var(--section-route-border);
}

.section-route-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.72rem;
}

.section-route-line+.section-route-line {
  margin-top: 0.2rem;
}

.section-route-label {
  width: 38px;
  min-width: 38px;
  font-weight: 700;
  color: var(--section-muted-color);
  text-transform: uppercase;
  font-size: 0.62rem;
}

.section-route-line code {
  color: var(--section-card-color);
  background: transparent;
  padding: 0;
  white-space: normal;
  word-break: break-word;
}

.section-children {
  position: relative;
  margin-left: 1.35rem;
  margin-top: 0.45rem;
  padding-left: 1rem;
  border-left: 1px dashed rgba(var(--bs-primary-rgb), 0.35);
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

.bg-secondary-lt {
  background-color: rgba(var(--bs-secondary-rgb), 0.16);
  color: var(--section-muted-color);
}

.badge {
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.28rem 0.48rem;
}

:global(.dark-mode #page-container .section-node-card) {
  background: var(--tuval-surface) !important;
  color: var(--tuval-text) !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(.dark-mode #page-container .section-node-card:hover) {
  background: var(--tuval-surface-muted) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
}

:global(.dark-mode #page-container .section-node-selected) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.75) !important;
}

:global(.dark-mode #page-container .section-title) {
  color: var(--tuval-text) !important;
}

:global(.dark-mode #page-container .section-meta) {
  color: rgba(255, 255, 255, 0.58) !important;
}

:global(.dark-mode #page-container .section-route-box) {
  background: var(--tuval-bg) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

.home-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.22rem 0.45rem;
  border-radius: 999px;
  background: rgba(var(--bs-warning-rgb), 0.14);
  color: var(--bs-warning);
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
}

.home-radio input {
  width: 0.75rem;
  height: 0.75rem;
  margin: 0;
}

.home-radio.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.section-content-body {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.section-route-box {
  width: 100%;
}
.section-node-card {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 0.45rem;
  align-items: stretch;
  padding: 0.55rem;
  margin-left: var(--node-depth-offset, 0);
  border: 1px solid var(--section-card-border);
  border-radius: 0.95rem;
  background: var(--section-card-bg);
  color: var(--section-card-color);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.section-node-card:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.35);
  background: var(--section-hover-bg);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.section-node-selected {
  border-color: var(--section-selected-border);
  background: var(--section-selected-bg);
  box-shadow:
    inset 4px 0 0 rgba(var(--bs-primary-rgb), 0.95),
    0 6px 16px rgba(var(--bs-primary-rgb), 0.12);
}

.section-node-home {
  box-shadow:
    inset 4px 0 0 rgba(var(--bs-warning-rgb), 0.95),
    0 6px 16px rgba(var(--bs-warning-rgb), 0.10);
}

.section-node-selected.section-node-home {
  border-color: rgba(var(--bs-warning-rgb), 0.75);
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.10),
      rgba(var(--bs-warning-rgb), 0.10)
    );
}

.section-check {
  margin-top: 0.55rem;
  flex-shrink: 0;
  cursor: pointer;
  width: 1rem;
  height: 1rem;
}

.section-title {
  font-weight: 800;
  color: var(--section-card-color);
  line-height: 1.1;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-icon {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 0.85rem;
  background: rgba(var(--bs-primary-rgb), 0.12);
  color: var(--bs-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.section-route-box {
  width: 100%;
  margin-top: 0.55rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.75rem;
  background: var(--section-route-bg);
  border: 1px dashed var(--section-route-border);
}

.section-route-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--section-muted-color);
}

.section-route-header span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bg-selected-lt {
  background-color: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.home-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.24rem 0.5rem;
  border-radius: 999px;
  background: rgba(var(--bs-warning-rgb), 0.14);
  color: var(--bs-warning);
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.home-radio input {
  width: 0.75rem;
  height: 0.75rem;
  margin: 0;
}

.home-radio.active {
  background: rgba(var(--bs-warning-rgb), 0.24);
  color: var(--bs-warning);
  box-shadow: inset 0 0 0 1px rgba(var(--bs-warning-rgb), 0.35);
}

.home-radio.disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.home-radio.disabled input {
  cursor: not-allowed;
}

.section-children {
  position: relative;
  margin-left: 1.15rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 1px dashed rgba(var(--bs-primary-rgb), 0.35);
}

.section-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: -1px;
  width: 1px;
  height: 1.25rem;
  background: rgba(var(--bs-primary-rgb), 0.55);
}

@media (max-width: 768px) {
  .section-node-card {
    grid-template-columns: 30px 1fr;
    gap: 0.35rem;
    margin-left: 0;
  }

  .section-main-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-badges {
    justify-content: flex-start;
  }

  .section-title {
    max-width: 210px;
  }

  .section-children {
    margin-left: 0.75rem;
    padding-left: 0.75rem;
  }
}
:global(.dark-mode #page-container .section-node-home) {
  border-color: rgba(var(--bs-warning-rgb), 0.65) !important;
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.15),
      rgba(var(--bs-warning-rgb), 0.12)
    ) !important;
}

:global(.dark-mode #page-container .section-route-header) {
  color: rgba(255, 255, 255, 0.72) !important;
}

:global(.dark-mode #page-container .home-radio.active) {
  background: rgba(var(--bs-warning-rgb), 0.24) !important;
  box-shadow: inset 0 0 0 1px rgba(var(--bs-warning-rgb), 0.38) !important;
}

:global(.dark-mode #page-container .bg-selected-lt) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  color: var(--bs-primary) !important;
}
</style>