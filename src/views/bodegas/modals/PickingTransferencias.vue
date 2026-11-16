<template>
  <BaseBlock v-if="currentBodega.bodega && currentBodega.bodega != ''" :title="'Destino: ' + currentBodega.bodega" class="mb-0">
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
    <div v-if="picking.loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div class="table-responsive">
      
      <table v-if="!picking.loading && picking.data.reporte && picking.data.reporte.length" class="table table-striped table-sm table-vcenter mt-4">      
        <thead>
          <tr>
            <th>Compartimiento / Existencia</th>
            <th>CTL</th>
            <th>Descripción</th>
            <th>UDM</th>
            <th class="text-end">Cantidad</th>
            <th class="text-end">Peso</th>
          </tr>
        </thead>
        <tbody>
          
          <tr v-for="(articulo, index) in picking.data.reporte" :key="index">
            <td class="fs-sm">
              <table style="width:100%">
                <tbody>
                  <tr v-for="(compartimiento, indexC) in articulo.compartimento" :key="indexC">
                    <td class="fs-sm" style="width:50%"><code>{{ compartimiento.STO_ART_COMPART_COMPARTIMIENTO }}</code></td>
                    <td class="fs-sm"><code>{{ compartimiento.STO_ART_COMPART_STOCK_DISPONIBLE }}</code></td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="fs-sm">
                {{ articulo.ART_CODIGO_TRES_LETRAS }}
            </td>
            <td class="fs-sm">
              {{ articulo.ART_DESCRIPCION }}
            </td>
            <td class="fs-sm">
                {{ articulo.ART_PLAN_UMEDIDA }}
            </td>
            <td class="fs-sm text-end">
                {{ articulo.seleccionado }}
            </td>
            <td class="fs-sm text-end">
              {{ format(articulo.seleccionado * articulo.ART_PESO) }}
            </td>
          </tr>
          
          <tr>
            <th colspan="6">&nbsp;</th>
          </tr>
          <tr>
            <th colspan="5" class="fs-sm text-end">Peso total del despacho</th>
            <th class="fs-sm text-end">{{ format(picking.data.peso_total) }}</th>
           
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button  type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cerrar</button>
    <button  type="button" class="btn btn-success btn-sm mx-2" @click="imprimirPicking(picking.data.reporte)"><i class="fa fa-print"></i> Imprimir</button>
    
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useStore} from 'vuex'

const store = useStore();
const picking = computed(() => store.state.picking);
const emit = defineEmits(["regrescarLista"]);
const props = defineProps({
  currentBodega: Object,
});

const format = (num) => num.toLocaleString('en-US', {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
});

async function imprimirPicking(traslados){

  store.dispatch('imprimirpost',traslados)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'picking-'+props.currentBodega.bodega+'.pdf');
        document.body.appendChild(link);
        link.click();
        emit("regrescarLista");
    }
  });
}

</script>
