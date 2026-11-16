<template>
  <div class="table-responsive">
    <div v-if="detalledevolucion.loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <table v-if="detalledevolucion.data.length && !detalledevolucion.loading"
      class="table table-hover table-sm table-vcenter mt-4 ">
      <thead>
        <tr>
          <th class="">#</th>
          <th>Código</th>
          <th>Descripción</th>
          <th>CTL</th>
          <th>UDM</th>
          <th class="text-end">Cantidad</th>
          <th class="text-end">Precio</th>

          <th class="text-end">Descuento</th>
           <th class="text-end"></th>
          <th class="text-end">Solicitado</th>
          <th class="text-end">Devuelto</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(articulo, index) in detalledevolucion.data" :key="index">
          <tr>
            <td class="fs-sm">{{ index + 1 }}</td>
            <td class="fs-sm">
              {{ articulo.ART_CODIGO }}

            </td>
            <td class="fs-sm">
              <a class="text-danger"
                v-if="articulo.ART_DESCRIPCION !== articulo.ART_DESCRIPCION_ORIGINAL && articulo.ART_TIPO_COMPRA !== 'L'"
                @click="verdiferenciadescripcion(articulo)" href="javascript:void(0);">{{ articulo.ART_DESCRIPCION
                }}</a>
              <span v-else>{{ articulo.ART_DESCRIPCION }}</span>
            </td>
            <td class="fs-sm">
              {{ articulo.ART_CODIGO_TRES_LETRAS }}
            </td>
            <td class="fs-sm">
              {{ articulo.ART_PLAN_UMEDIDA }}
            </td>
            <td class="fs-sm text-end">
              {{ articulo.ART_CANTIDAD }}
            </td>

            <td class="fs-sm text-end">
              ${{ format4(parseFloat(articulo.ART_VALOR)) }}
            </td>
            <td class="fs-sm text-end">
              ${{ format4(parseFloat(articulo.ART_DESCUENTO)) }}
            </td>
            <td>
              <span v-if="articulo.despachado_parcial == 1"
                class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1"
                title="Despachado">
                <i class="fa fa-truck-fast"></i>
              </span>
            </td>
            <td class="fs-sm text-end">
              <b>{{ articulo.seleccionado }}</b>
            </td>
            <td class="fs-sm text-end">
              <b>{{ articulo.devuelto }}</b>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { format4 } from "@/functions";
import { useStore } from 'vuex'
const store = useStore();
const detalledevolucion = computed(() => store.state.detalledevolucion);
</script>
