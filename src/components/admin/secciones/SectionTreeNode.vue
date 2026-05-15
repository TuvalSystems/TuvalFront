<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  selectedId: {
    type: [Number, String, null],
    default: null,
  },
  depth: {
    type: Number,
    default: 1,
  },
  maxDepth: {
    type: Number,
    default: 3,
  },
});

const emit = defineEmits(['select', 'create-child']);

const isOpen = ref(true);

const children = computed(() => {
  return props.section.children || [];
});

const hasChildren = computed(() => {
  return children.value.length > 0;
});

const canCreateChild = computed(() => {
  return props.depth < props.maxDepth;
});

const isSelected = computed(() => {
  return Number(props.selectedId) === Number(props.section.id);
});

const isActive = computed(() => {
  return props.section.status === true ||
    props.section.status === 1 ||
    props.section.status === '1';
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

const statusLabel = computed(() => {
  return isActive.value ? 'Activo' : 'Inactivo';
});

const nodeTypeLabel = computed(() => {
  return isGroup.value ? 'Grupo' : 'Pantalla';
});

const iconClass = computed(() => {
  const icon = String(props.section.icon || '').trim();

  if (!icon) {
    return isGroup.value ? 'fa fa-folder-tree' : 'fa fa-file-lines';
  }

  /**
   * Si viene algo como:
   * fa fa-home
   * fa-solid fa-users
   * fa fa-cog
   * lo usamos directo.
   */
  if (
    icon.includes('fa-') ||
    icon.startsWith('fa ') ||
    icon.startsWith('far ') ||
    icon.startsWith('fab ') ||
    icon.startsWith('si ')
  ) {
    return icon;
  }

  /**
   * Si viene algo para Flutter como:
   * dashboard
   * precision_manufacturing
   * inventory_2
   * no existe como clase CSS web.
   * Entonces mostramos un ícono genérico.
   */
  return isGroup.value ? 'fa fa-layer-group' : 'fa fa-mobile-screen-button';
});

const iconKeyLabel = computed(() => {
  const icon = String(props.section.icon || '').trim();

  if (!icon) {
    return '';
  }

  if (icon.includes('fa-') || icon.startsWith('fa ')) {
    return '';
  }

  return icon;
});

function toggleNode() {
  if (!hasChildren.value) {
    return;
  }

  isOpen.value = !isOpen.value;
}

function selectNode() {
  emit('select', props.section);
}

function createChild() {
  emit('create-child', props.section);
}


</script>

<template>
  <li class="section-tree-node">
    <div class="section-node-card" :class="{
      'section-node-selected': isSelected,
      'section-node-inactive': !isActive,
    }">
      <button type="button" class="section-toggle-btn" :class="{ 'section-toggle-empty': !hasChildren }"
        :disabled="!hasChildren" @click.stop="toggleNode">
        <i v-if="hasChildren" class="fa" :class="isOpen ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      </button>

      <button type="button" class="section-content-btn" @click="selectNode">
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

                <span v-if="iconKeyLabel">
                  · Icon: {{ iconKeyLabel }}
                </span>
              </span>
            </span>
          </div>

          <div class="section-badges">
            <span class="badge" :class="isGroup ? 'bg-info-lt' : 'bg-secondary-lt'">
              {{ nodeTypeLabel }}
            </span>

            <span class="badge bg-primary-lt">
              {{ platformLabel }}
            </span>

            <span class="badge" :class="isActive ? 'bg-success-lt' : 'bg-danger-lt'">
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <div v-if="section.url || section.route_name" class="section-route-box">
          <div v-if="section.url" class="section-route-line">
            <span class="section-route-label">URL</span>
            <code>{{ section.url }}</code>
          </div>

          <div v-if="section.route_name" class="section-route-line">
            <span class="section-route-label">Ruta</span>
            <code>{{ section.route_name }}</code>
          </div>
        </div>
      </button>

      <button v-if="canCreateChild" type="button" class="section-add-btn" title="Crear sección hija"
        @click.stop="createChild">
        <i class="fa fa-plus"></i>
      </button>
    </div>

    <ul v-if="hasChildren && isOpen" class="list-unstyled section-children">
      <SectionTreeNode v-for="child in children" :key="child.id" :section="child" :selected-id="selectedId"
        :depth="depth + 1" :max-depth="maxDepth" @select="$emit('select', $event)"
        @create-child="$emit('create-child', $event)" />
    </ul>
  </li>
</template>

<style scoped>
.section-tree-node {
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
  grid-template-columns: 34px 1fr 34px;
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

.section-node-selected.section-node-inactive {
  opacity: 0.9;
}

.section-toggle-btn,
.section-add-btn {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.section-toggle-btn {
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

.section-add-btn {
  background: rgba(var(--bs-success-rgb), 0.14);
  color: var(--bs-success);
}

.section-add-btn:hover {
  background: rgba(var(--bs-success-rgb), 0.22);
  color: var(--bs-success);
}

.section-content-btn {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 0;
  min-width: 0;
  color: inherit;
}

.section-main-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
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
  max-width: 260px;
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

@media (max-width: 768px) {
  .section-node-card {
    grid-template-columns: 30px 1fr 30px;
    gap: 0.35rem;
  }

  .section-main-row {
    flex-direction: column;
    gap: 0.45rem;
  }

  .section-badges {
    justify-content: flex-start;
  }

  .section-title {
    max-width: 190px;
  }

  .section-children {
    margin-left: 0.95rem;
    padding-left: 0.75rem;
  }
}

:global(#page-container.dark-mode .section-node-card) {
  background: #243447 !important;
  color: #e5ecf5 !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .section-node-card:hover) {
  background: #2a3b50 !important;
  border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
}

:global(#page-container.dark-mode .section-node-selected) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.75) !important;
}

:global(#page-container.dark-mode .section-title) {
  color: #f4f7fb !important;
}

:global(#page-container.dark-mode .section-meta) {
  color: rgba(255, 255, 255, 0.58) !important;
}

:global(#page-container.dark-mode .section-route-box) {
  background: rgba(0, 0, 0, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:global(#page-container.dark-mode .section-route-label) {
  color: rgba(255, 255, 255, 0.65) !important;
}

:global(#page-container.dark-mode .section-route-line code) {
  color: rgba(255, 255, 255, 0.86) !important;
}

:global(#page-container.dark-mode .section-toggle-btn) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.70) !important;
}

:global(#page-container.dark-mode .section-icon) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  color: var(--bs-primary) !important;
}

:global(#page-container.dark-mode .section-add-btn) {
  background: rgba(var(--bs-success-rgb), 0.18) !important;
  color: var(--bs-success) !important;
}

:global(#page-container.dark-mode .section-children) {
  border-left-color: rgba(var(--bs-primary-rgb), 0.45) !important;
}
</style>