<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  traslados: {
    type: Array,
    required: true
  }
});

const expandedRows = ref(new Set());

const toggleRow = (index) => {
  if (expandedRows.value.has(index)) {
    expandedRows.value.delete(index);
  } else {
    expandedRows.value.add(index);
  }
};

onMounted(() => {});
</script>

<template>
  <div class="table-responsive mb-4 shadow-sm rounded border">
    <table class="table table-hover table-vcenter mb-0 align-middle">
      <!-- Usa bg-body-tertiary para que sea theme-aware (Bootstrap 5.3). 
           Si usas < 5.3, puedes volver a bg-light sin problema. -->
      <thead class="bg-body-tertiary">
        <tr class="text-secondary text-uppercase fs-xs">
          <th style="width: 40px;"></th>
          <th class="fw-bold">Código</th>
          <th class="fw-bold">Descripción</th>
          <th>Origen</th>
          <th>Destino</th>
          <th class="text-end">Cant.</th>
          <th class="text-end">Rsv.</th>
          <th class="text-end">Trasl.</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="(row, index) in traslados" :key="index">
          <tr
            @click="row.detalleguia.length ? toggleRow(index) : null"
            :class="{
              'cursor-pointer': row.detalleguia.length,
              'table-active': expandedRows.has(index)
            }"
          >
            <td class="text-center">
              <i
                v-if="row.detalleguia.length"
                class="bi bi-chevron-right transition-icon"
                :class="{ 'rotate-90': expandedRows.has(index) }"
              ></i>
            </td>
            <td class="fw-semibold text-primary">{{ row.art_code }}</td>
            <td>
              <div
                class="text-truncate"
                style="max-width: 200px;"
                :title="row.art_descripcion"
              >
                {{ row.art_descripcion }}
              </div>
            </td>
            <td>
              <span class="badge bg-label-secondary text-body border">
                {{ row.bodega_origen }}
              </span>
            </td>
            <td>
              <span class="badge bg-label-secondary text-body border">
                {{ row.bodega_destino }}
              </span>
            </td>
            <td class="text-end fw-bold">{{ row.cantidad }}</td>
            <td class="text-end text-warning">{{ row.reservado }}</td>
            <td class="text-end text-success">{{ row.trasladado }}</td>
          </tr>

          <tr v-if="expandedRows.has(index) && row.detalleguia.length">
            <td colspan="8" class="p-0 border-0">
              <!-- bg-body-tertiary también se adapta a light/dark -->
              <div class="bg-body-tertiary p-3 border-bottom shadow-inner-custom">
                <div class="d-flex align-items-center mb-2">
                  <small class="text-muted fw-bold text-uppercase ls-1">
                    Detalle de Guías
                  </small>
                  <hr class="flex-grow-1 ms-2 my-0 text-muted op-25">
                </div>

                <table class="table table-sm table-bordered mb-0 fs-sm align-middle">
                  <thead class="bg-body-tertiary">
                    <tr>
                      <th>No. Guía</th>
                      <th>Fecha</th>
                      <th>Transportista</th>
                      <th>Vehículo</th>
                      <th class="text-end">Cant.</th>
                      <th class="text-end">Recibido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(guia, gIndex) in row.detalleguia" :key="gIndex">
                      <td>
                        {{ guia.guia.numero_guia }}
                      </td>
                      <td>{{ guia.guia.fecha_salida }}</td>
                      <td>{{ guia.guia.razon_social_transportista }}</td>
                      <td>{{ guia.guia.placa }}</td>
                      <td class="text-end">{{ guia.cantidad }}</td>
                      <td class="text-end">{{ guia.recibido }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.fs-xs {
  font-size: 0.75rem;
}

.ls-1 {
  letter-spacing: 1px;
}

/* Flecha: usa variables de Bootstrap para que cambie con el tema */
.transition-icon {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 0.8rem;
  color: var(--bs-secondary-color, #aaa);
}

.rotate-90 {
  transform: rotate(90deg);
  color: var(--bs-emphasis-color, #333);
}

/* Sombra interior sutil, sin fijar fondo (para que lo controle bg-body-tertiary) */
.shadow-inner-custom {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* Badge “suave” que usa los colores del tema */
.bg-label-secondary {
  background-color: var(--bs-secondary-bg, #eef1f3);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
  border-color: var(--bs-border-color, rgba(0, 0, 0, 0.125));
}
</style>
