<script setup>
import { ref } from 'vue';

const loading = ref(false);

const tryToRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
};
</script>

<template>
  <div class="hero-static d-flex align-items-center">
    <div class="content">
      <div class="row justify-content-center push">
        <div class="col-md-8 col-lg-6 col-xl-4">
          <!-- Usamos BaseBlock -->
          <BaseBlock title="Mantenimiento en Curso" class="mb-0 border-top border-warning border-3">
            <template #options>
                <!-- Engranaje girando suavemente para indicar trabajo activo -->
                <i class="fa fa-cog fa-spin text-warning"></i>
            </template>

            <div class="p-sm-3 px-lg-4 px-xxl-5 py-lg-5 text-center">
              
              <!-- Icono de Construcción (Casco) en lugar del 503 -->
              <div class="mb-4">
                 <div class="text-warning">
                    <!-- Si usas FontAwesome 6: fa-helmet-safety. Si es 5: fa-hard-hat -->
                    <i class="fa-solid fa-helmet-safety fa-4x opacity-75"></i>
                 </div>
              </div>

              <h2 class="h4 fw-bold mb-2">
                ¡Estamos construyendo para ti!
              </h2>

              <p class="fw-medium text-muted mb-4">
                El sistema se encuentra actualmente en obras. Estamos aplicando mejoras y actualizaciones importantes.
                <br><br>
                <small>Agradecemos tu paciencia.</small>
              </p>

              <!-- Botón con estilo "Warning" para combinar con la construcción -->
              <div class="row justify-content-center">
                <div class="col-sm-12">
                  <button 
                    @click="tryToRefresh" 
                    class="btn w-100 btn-alt-warning" 
                    :disabled="loading"
                  >
                    <i :class="loading ? 'fa fa-spin fa-circle-notch' : 'fa fa-sync-alt'" class="me-1 opacity-50"></i> 
                    {{ loading ? 'Verificando disponibilidad...' : 'Comprobar Estado' }}
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
/* Espaciado consistente */
.mb-4 {
    margin-bottom: 1.5rem !important;
}

/* Opcional: Animación suave para el icono del casco si deseas */
.fa-helmet-safety {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}
</style>