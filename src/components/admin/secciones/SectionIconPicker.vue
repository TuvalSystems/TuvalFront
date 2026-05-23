<script setup>
import {  computed, ref } from 'vue';
import iconsList from '@/data/icons';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const search = ref('')
const activePack = ref('solid');

const packs = [
    {
        key: 'solid',
        label: 'Solid',
        prefix: 'fa',
        cssPrefix: 'fa',
        icons: iconsList.solid,
    },
    {
        key: 'regular',
        label: 'Regular',
        prefix: 'far',
        cssPrefix: 'fa',
        icons: iconsList.regular,
    },
    {
        key: 'brands',
        label: 'Brands',
        prefix: 'fab',
        cssPrefix: 'fa',
        icons: iconsList.brands,
    },
    {
        key: 'simpleline',
        label: 'Simple Line',
        prefix: 'si',
        cssPrefix: 'si',
        icons: iconsList.simpleline,
    },
];


const currentPack = computed(() => {
    return packs.find((pack) => pack.key === activePack.value) || pack[0];
});

const normalizedSearch = computed(() => {
  return search.value.trim().toLowerCase();
});

const filteredIcons = computed(() => {
    const pack = currentPack.value;

    let icons = pack.icons.map((icon) => {
        const className =
            pack.key === 'simpleline'
                ? `si si-${icon}`
                : `${pack.prefix} fa-${icon}`;


        return {
            icon,
            label: icon,
            className,
            value: className,
        };
    });

    if (normalizedSearch.value) {
        icons = icons.filter((item) => {
            return item.icon.toLowerCase().includes(normalizedSearch.value)
                || item.value.toLowerCase().includes(normalizedSearch.value);
        });
    }
    return icons.slice(0, 120);
});

const selectedIconClass = computed(() => {
  return props.modelValue || 'fa fa-icons';
});

const hasCustomValue = computed(() => {
  const value = String(props.modelValue || '').trim();

  if (!value) {
    return false;
  }

  return !value.includes('fa-') && !value.startsWith('fa ') && !value.startsWith('far ') && !value.startsWith('fab ') && !value.startsWith('si ');
});

function selectIcon(icon) {
  emit('update:modelValue', icon.value);
}

function clearIcon() {
  emit('update:modelValue', '');
}

function useCustomValue() {
  const value = search.value.trim();

  if (!value) {
    return;
  }

  emit('update:modelValue', value);
}
</script>

<template>
  <div class="icon-picker">
    <!-- Ícono actual -->
    <div class="icon-picker-current">
      <div class="icon-preview">
        <i
          v-if="!hasCustomValue"
          :class="selectedIconClass"
        ></i>

        <i
          v-else
          class="fa fa-mobile-screen-button"
        ></i>
      </div>

      <div class="icon-current-info">
        <div class="d-flex align-items-center gap-2">
          <span class="fw-semibold">Ícono seleccionado</span>

          <span
            v-if="hasCustomValue"
            class="badge bg-warning-lt"
          >
            Custom / App
          </span>

          <span
            v-else-if="modelValue"
            class="badge bg-primary-lt"
          >
            Web
          </span>
        </div>

        <code v-if="modelValue" class="icon-current-code">
          {{ modelValue }}
        </code>

        <span v-else class="text-muted fs-sm">
          Sin ícono seleccionado
        </span>
      </div>

      <button
        v-if="modelValue"
        type="button"
        class="btn btn-sm btn-alt-danger icon-clear-btn"
        title="Limpiar ícono"
        @click="clearIcon"
      >
        <i class="fa fa-times"></i>
      </button>
    </div>

    <!-- Buscador -->
    <div class="icon-search-box mt-3">
      <div class="input-group input-group-sm">
        <span class="input-group-text">
          <i class="fa fa-search"></i>
        </span>

        <input
          v-model="search"
          type="text"
          class="form-control"
          placeholder="Buscar: user, folder, gear, mobile, dashboard..."
        />

        <button
          type="button"
          class="btn btn-alt-secondary"
          :disabled="!search.trim()"
          @click="useCustomValue"
        >
          <i class="fa fa-keyboard me-1"></i>
          Usar texto
        </button>
      </div>

      <div class="icon-search-help">
        Puedes buscar íconos web o escribir una clave personalizada para Flutter.
      </div>
    </div>

    <!-- Packs -->
    <div class="icon-pack-tabs mt-3">
      <button
        v-for="pack in packs"
        :key="pack.key"
        type="button"
        class="icon-pack-btn"
        :class="{ 'icon-pack-btn-active': activePack === pack.key }"
        @click="activePack = pack.key"
      >
        <span>{{ pack.label }}</span>
        <small>{{ pack.icons.length }}</small>
      </button>
    </div>

    <!-- Resumen -->
    <div class="icon-grid-header mt-3">
      <div>
        <span class="fw-semibold">
          Resultados
        </span>
        <span class="text-muted fs-sm">
          {{ filteredIcons.length }} visibles
        </span>
      </div>

      <span class="text-muted fs-sm">
        Clic para seleccionar
      </span>
    </div>

    <!-- Grid -->
    <div class="icon-grid mt-2">
      <button
        v-for="item in filteredIcons"
        :key="item.value"
        type="button"
        class="icon-option"
        :class="{ 'icon-option-selected': modelValue === item.value }"
        :title="item.value"
        @click="selectIcon(item)"
      >
        <span class="icon-option-preview">
          <i :class="item.className"></i>
        </span>

        <span class="icon-option-label">
          {{ item.label }}
        </span>

        <code class="icon-option-code">
          {{ item.value }}
        </code>
      </button>
    </div>

    <!-- Empty -->
    <div
      v-if="filteredIcons.length === 0"
      class="icon-empty mt-3"
    >
      <i class="fa fa-triangle-exclamation"></i>
      <div>
        <div class="fw-semibold">No se encontraron íconos</div>
        <small class="text-muted">
          Prueba con otro término o usa el texto escrito como clave personalizada.
        </small>
      </div>
    </div>

    <!-- Nota -->
    <div class="icon-note mt-3">
      <i class="fa fa-circle-info"></i>
      <div>
        Para Web se recomienda guardar clases como
        <code>fa fa-cogs</code>, <code>far fa-calendar</code> o <code>si si-settings</code>.
        Para App puedes guardar claves como <code>dashboard</code> o
        <code>precision_manufacturing</code>.
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-picker {
  --icon-card-bg: var(--bs-body-bg);
  --icon-card-color: var(--bs-body-color);
  --icon-border: var(--bs-border-color);
  --icon-muted: var(--bs-secondary-color);
  --icon-soft-bg: var(--bs-tertiary-bg);
}

/* Contenedor actual */
.icon-picker-current {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border: 1px solid var(--icon-border);
  border-radius: 1rem;
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.08),
      rgba(var(--bs-primary-rgb), 0.015)
    );
}

.icon-preview {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
  font-size: 1.45rem;
  border: 1px solid rgba(var(--bs-primary-rgb), 0.18);
}

.icon-current-info {
  flex: 1;
  min-width: 0;
}

.icon-current-code {
  display: inline-block;
  margin-top: 0.25rem;
  color: var(--icon-card-color);
  background: rgba(var(--bs-dark-rgb), 0.045);
  border: 1px solid rgba(var(--bs-dark-rgb), 0.06);
  border-radius: 0.5rem;
  padding: 0.18rem 0.45rem;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
}

.icon-clear-btn {
  width: 34px;
  height: 34px;
  min-width: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Buscador */
.icon-search-box {
  padding: 0.75rem;
  border: 1px solid var(--icon-border);
  border-radius: 0.9rem;
  background: var(--icon-soft-bg);
}

.icon-search-help {
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: var(--icon-muted);
}

/* Packs */
.icon-pack-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
}

.icon-pack-btn {
  border: 1px solid var(--icon-border);
  background: var(--icon-card-bg);
  color: var(--icon-card-color);
  border-radius: 0.8rem;
  padding: 0.6rem 0.55rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.icon-pack-btn:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.45);
  background: rgba(var(--bs-primary-rgb), 0.06);
}

.icon-pack-btn-active {
  border-color: rgba(var(--bs-primary-rgb), 0.75);
  background: rgba(var(--bs-primary-rgb), 0.13);
  color: var(--bs-primary);
  font-weight: 700;
}

.icon-pack-btn small {
  font-size: 0.68rem;
  color: inherit;
  opacity: 0.75;
}

/* Header grid */
.icon-grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

/* Grid */
.icon-grid {
  max-height: 320px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 0.55rem;
  padding: 0.25rem 0.2rem 0.25rem 0.05rem;
}

.icon-option {
  border: 1px solid var(--icon-border);
  background: var(--icon-card-bg);
  color: var(--icon-card-color);
  border-radius: 0.85rem;
  padding: 0.7rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-height: 100px;
  position: relative;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.icon-option:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.45);
  background: rgba(var(--bs-primary-rgb), 0.06);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.055);
}

.icon-option-preview {
  width: 38px;
  height: 38px;
  border-radius: 0.85rem;
  background: rgba(var(--bs-primary-rgb), 0.10);
  color: var(--bs-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-option-preview i {
  font-size: 1.25rem;
}

.icon-option-label {
  font-size: 0.76rem;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-option-code {
  width: 100%;
  color: var(--icon-muted);
  background: transparent;
  font-size: 0.62rem;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-option-selected {
  border-color: rgba(var(--bs-primary-rgb), 0.85);
  background: rgba(var(--bs-primary-rgb), 0.13);
  color: var(--bs-primary);
  font-weight: 700;
  box-shadow:
    inset 0 0 0 1px rgba(var(--bs-primary-rgb), 0.2),
    0 6px 16px rgba(var(--bs-primary-rgb), 0.10);
}

.icon-option-selected::after {
  content: "✓";
  position: absolute;
  top: 0.4rem;
  right: 0.45rem;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--bs-primary);
  color: #fff;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty */
.icon-empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 0.85rem;
  border: 1px dashed rgba(var(--bs-warning-rgb), 0.45);
  background: rgba(var(--bs-warning-rgb), 0.10);
  color: var(--bs-warning);
}

.icon-empty i {
  font-size: 1.2rem;
}

/* Nota */
.icon-note {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.75rem;
  border-radius: 0.85rem;
  background: rgba(var(--bs-info-rgb), 0.08);
  border: 1px solid rgba(var(--bs-info-rgb), 0.18);
  color: var(--icon-muted);
  font-size: 0.76rem;
  line-height: 1.45;
}

.icon-note i {
  color: var(--bs-info);
  margin-top: 0.15rem;
}

.bg-primary-lt {
  background-color: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.bg-warning-lt {
  background-color: rgba(var(--bs-warning-rgb), 0.16);
  color: var(--bs-warning);
}

/* Dark mode OneUIX */
:global(#page-container.dark-mode .icon-picker-current) {
  background:
    linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.18),
      rgba(255, 255, 255, 0.04)
    ) !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .icon-search-box) {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .icon-current-code) {
  background: rgba(0, 0, 0, 0.22) !important;
  color: #e5ecf5 !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .icon-pack-btn),
:global(#page-container.dark-mode .icon-option) {
  background: #243447 !important;
  color: #e5ecf5 !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .icon-pack-btn:hover),
:global(#page-container.dark-mode .icon-option:hover) {
  background: #2a3b50 !important;
  border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
}

:global(#page-container.dark-mode .icon-pack-btn-active),
:global(#page-container.dark-mode .icon-option-selected) {
  background: rgba(var(--bs-primary-rgb), 0.20) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.75) !important;
  color: #f4f7fb !important;
}

:global(#page-container.dark-mode .icon-option-code),
:global(#page-container.dark-mode .icon-search-help),
:global(#page-container.dark-mode .icon-note) {
  color: rgba(255, 255, 255, 0.64) !important;
}

:global(#page-container.dark-mode .icon-note) {
  background: rgba(var(--bs-info-rgb), 0.10) !important;
  border-color: rgba(var(--bs-info-rgb), 0.24) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .icon-pack-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .icon-picker-current {
    align-items: flex-start;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    max-height: 280px;
  }
}
</style>