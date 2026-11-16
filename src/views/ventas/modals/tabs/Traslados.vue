<template>
  <div class="table-responsive mb-4">
    <table class="table table-borderless table-sm fs-sm table-hover table-vcenter mb-0">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descripción</th>
          <th>Origen</th>
          <th>Destino</th>
          <th class="text-end">Cantidad</th>
          <th class="text-end">Reservado</th>
          <th class="text-end">Trasladado</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in traslados" :key="index">
          <tr
            :class="
              (row.reservado > 0 && row.reservado == row.cantidad
                ? 'table-success'
                : '') ||
              (row.reservado > 0 && row.pendiente == 0 ? 'table-success' : '') ||
              (row.reservado > 0 && row.pendiente > 0 ? 'table-warning' : '')
            "
          >
            <td>
              {{ row.ART_CODIGO }}
            </td>
            <td>
              {{ row.ART_DESCRIPCION }}
            </td>
            <td>
              {{ row.bodega_origen }}
            </td>
            <td>
              {{ row.bodega_destino }}
            </td>
            <td class="text-end">
              {{ row.cantidad }}
            </td>
            <td class="text-end">
              {{ row.reservado }}
            </td>
            <td class="text-end">
              {{ row.trasladado }}
            </td>
          </tr>
          <tr v-if="row.guias.length">
            <td colspan="11">
              <table class="table  table-bordered table-sm fs-sm">
                <thead>
                  <tr>
                    <th>No. de Guía</th>
                    <th>Fecha</th>
                    <th>Transportista</th>
                    <th>Vehículo</th>
                    <th class="text-end">Cantidad</th>
                    <th class="text-end">Recibido</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(guia, index) in row.guias" :key="index">
                    <td>{{ guia.GUI_REM_GUIA_REMISION }}</td>
                    <td>{{ guia.GUI_REM_FECHA_INICIO }}</td>
                    <td>{{ guia.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
                    <td>{{ guia.GUI_REM_PLACA }}</td>
                    <td class="text-end">
                      {{ guia.GUI_REM_CANTIDAD }}
                    </td>
                    <td class="text-end">
                      {{ guia.recibido }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useStore } from "vuex";


const store = useStore();
const traslados = computed(() => store.state.traslados);
</script>
