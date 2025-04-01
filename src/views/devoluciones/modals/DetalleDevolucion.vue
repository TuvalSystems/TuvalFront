<template>
  <BaseBlock title="Detalle de devolución" class="mb-0">
    <template #options>
      <button
          type="button"
          class="btn-block-option"
          data-bs-dismiss="modal"
          aria-label="Close"
      >
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm ">
        <CabeceraDevolucion :verdevolucion="verdevolucion"></CabeceraDevolucion>
        <DetalleDevolucion></DetalleDevolucion>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full bg-body">
    <div class="row">
      <div class="col-sm-12 text-end">
        <button v-if="verdevolucion.estado === 'procesado'" type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirDevolucion(verdevolucion)"><i class="fa fa-print"></i> Imprimir</button>
        <button  type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal"> Cerrar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import CabeceraDevolucion from "@/components/CabeceraDevolucion.vue";
import DetalleDevolucion from "@/components/DetalleDevolucion.vue";

import {useStore} from "vuex";

const store = useStore();
const { verdevolucion } = defineProps({
  verdevolucion: Object,
})
async function imprimirDevolucion(devolucion){
  store.dispatch('imprimir', '/devoluciones/imprimirdevolucion/'+devolucion.id)
      .then((response) => {
        if(response.status == 200){
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'nota-de-credito-'+devolucion.devolucion+'.pdf');
          document.body.appendChild(link);
          link.click();
        }
      });
}
</script>