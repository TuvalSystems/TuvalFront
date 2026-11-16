<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  }
});
</script>

<template>
  <div class="bg-body-light border-bottom shadow-sm">
    <div class="content py-2 py-sm-3"> <slot>
        <div
          v-if="title || $slots.extra"
          class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center"
        >
          <div class="flex-grow-1">
            <h1 class="fs-5 fw-bold mb-0 d-flex align-items-center">
              <i v-if="icon" :class="[icon, 'me-2 text-primary fs-5']"></i>
              <span>{{ title }}</span>
            </h1>
            
            <p v-if="subtitle" class="fs-sm text-muted mb-0 mt-1">
              {{ subtitle }}
            </p>
          </div>

          <div v-if="$slots.extra" class="flex-shrink-0 mt-2 mt-sm-0 ms-sm-3">
            <slot name="extra"></slot>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Ajuste opcional para que el contenido no sea tan ancho en pantallas grandes */
.content {
  max-width: 100%; 
}

:deep(.breadcrumb) {
  margin-bottom: 0;
  font-size: 0.75rem; /* fs-xs para móviles */
}

@media (min-width: 576px) {
  :deep(.breadcrumb) {
    font-size: 0.875rem; /* fs-sm para escritorio */
  }
}
</style>
