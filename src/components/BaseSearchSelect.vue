<script setup>
import VueSelect from "vue-select";

defineProps({
  modelValue: { type: [String, Number, Object], default: null },
  options: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: "Seleccione una opción" },
});
defineEmits(["update:modelValue"]);

const normalize = (value) =>
  String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
const filterOption = (option, label, search) =>
  normalize(label).includes(normalize(search));
</script>

<template>
  <VueSelect
    class="tuval-search-select"
    :model-value="modelValue"
    :options="options"
    :reduce="(option) => option.value"
    :filter-by="filterOption"
    :clearable="false"
    :loading="loading"
    :disabled="disabled || loading"
    :placeholder="loading ? 'Cargando opciones...' : placeholder"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #no-options>
      {{ loading ? "Cargando opciones..." : "No se encontraron resultados" }}
    </template>
  </VueSelect>
</template>

<style scoped>
.tuval-search-select {
  min-width: 0;
  font-size: 0.875rem;
}
.tuval-search-select :deep(.vs__dropdown-toggle) {
  min-height: calc(1.5em + 0.5rem + 2px);
  padding: 0 0.375rem 0 0;
  border: 1px solid var(--tuval-border);
  border-radius: 0.25rem;
  background: var(--tuval-surface);
}
.tuval-search-select.vs--open :deep(.vs__dropdown-toggle),
.tuval-search-select:focus-within :deep(.vs__dropdown-toggle) {
  border-color: var(--tuval-primary);
  box-shadow: 0 0 0 0.2rem var(--tuval-primary-soft);
}
.tuval-search-select :deep(.vs__selected-options) {
  min-width: 0;
}
.tuval-search-select :deep(.vs__selected),
.tuval-search-select :deep(.vs__search) {
  margin-top: 0;
  color: var(--tuval-text);
  background: transparent;
  border-color: transparent;
  font-size: inherit;
  line-height: 1.5;
}
.tuval-search-select :deep(.vs__selected) {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
.tuval-search-select :deep(.vs__search::placeholder) {
  color: var(--tuval-text-muted);
}
.tuval-search-select :deep(.vs__actions) { padding-top: 0; }
.tuval-search-select :deep(.vs__open-indicator) { fill: var(--tuval-text-muted); }
.tuval-search-select :deep(.vs__dropdown-menu) {
  min-width: 100%;
  background: var(--tuval-surface);
  color: var(--tuval-text);
  border-color: var(--tuval-border);
  font-size: inherit;
}
.tuval-search-select :deep(.vs__dropdown-option) {
  color: var(--tuval-text);
  white-space: normal;
  overflow-wrap: anywhere;
  padding: 0.375rem 0.75rem;
}
.tuval-search-select :deep(.vs__dropdown-option--selected) {
  background: var(--tuval-primary-soft);
  opacity: 1;
}
.tuval-search-select :deep(.vs__dropdown-option--highlight) {
  background: var(--tuval-primary);
  color: var(--tuval-on-accent);
}
.tuval-search-select.vs--disabled :deep(.vs__dropdown-toggle),
.tuval-search-select.vs--disabled :deep(.vs__search),
.tuval-search-select.vs--disabled :deep(.vs__open-indicator) {
  background: var(--tuval-surface-muted);
  cursor: not-allowed;
}
.input-group > .tuval-search-select { flex: 1 1 0%; }
.input-group > .tuval-search-select :deep(.vs__dropdown-toggle) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  height: 100%;
}
</style>
