<script setup>
import { ref } from 'vue';

const loading = ref(false);

const tryToRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    window.location.href = '/';
  }, 500);
};
</script>

<template>
  <div class="hero-static d-flex align-items-center">
    <div class="content">
      <div class="row justify-content-center push">
        <div class="col-md-8 col-lg-6 col-xl-4">
          <!-- Usamos BaseBlock con el mismo estilo que tu formulario -->
          <BaseBlock title="Sitio en Mantenimiento" class="mb-0">
            <template #options>
              <!-- Opcional: Icono en la cabecera del bloque -->
              <i class="fa fa-tools opacity-50"></i>
            </template>

            <div class="p-sm-3 px-lg-4 px-xxl-5 py-lg-5 text-center">

              <!-- Icono grande o indicador visual -->
              <div class="mb-4">
                <div class="display-1 fw-bold text-warning">
                  503
                </div>
              </div>

              <h2 class="h4 fw-bold mb-2">
                ¡Estamos mejorando!
              </h2>

              <p class="fw-medium text-muted mb-4">
                Disculpa las molestias, estamos realizando tareas de mantenimiento en la plataforma.
                Por favor intenta reconectar en unos minutos.
              </p>

              <!-- Botón con el estilo del formulario -->
              <div class="row justify-content-center">
                <div class="col-sm-12">
                  <button @click="tryToRefresh" class="btn w-100 btn-alt-primary" :disabled="loading">
                    <i :class="loading ? 'fa fa-spin fa-spinner' : 'fa fa-sync-alt'" class="me-1 opacity-50"></i>
                    {{ loading ? 'Reconectando...' : 'Intentar Reconectar' }}
                  </button>
                </div>
              </div>

            </div>
          </BaseBlock>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Espaciado consistente similar al de tu formulario */
.mb-4 {
  margin-bottom: 1.5rem !important;
}
</style>
