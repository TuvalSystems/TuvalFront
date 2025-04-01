<template>
  <BaseBlock title="Detalle de picking" class="mb-0">
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
    <div class="table-responsive">
      <table class="table table-striped table-sm table-vcenter">
        <tbody>
          <tr v-if="verpedido.factura != ''">
              <th class="fs-sm">Factura</th>
              <td class="fs-sm">{{verpedido.factura}}</td>
              <th v-if="verpedido.cotizacion" class="fs-sm">Cotización Origen</th>
              <td v-if="verpedido.cotizacion" class="fs-sm" colspan="3">{{verpedido.cotizacion}}</td>
              <td v-if="!verpedido.cotizacion" class="fs-sm" colspan="4"></td>
          </tr>
          <tr>
              <th class="fs-sm">Pedido</th>
              <td class="fs-sm">{{verpedido.pedido}}</td>
              <th class="fs-sm">RUC</th>
              <td class="fs-sm">{{verpedido.CLI_RUC}}</td>
              <th class="fs-sm">Razón Social</th>
              <td class="fs-sm">{{verpedido.CLI_RAZON_SOCIAL}}</td>
          </tr>
          <tr>
            <th class="fs-sm">Bodega</th>
            <td class="fs-sm">
              {{ verpedido.BOD_BODEGA }}
            </td>
            <th class="fs-sm">Fecha/hora</th>
            <td class="fs-sm">
              {{ verpedido.created_at }}
            </td>
              <th class="fs-sm">Usuario</th>
              <td class="fs-sm">{{verpedido.USERID}}</td>
          </tr>
        </tbody>
      </table>
    </div>
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
              {{ articulo.ART_DESCRIPCION_ORIGINAL }}
            </td>
            <td class="fs-sm">
                {{ articulo.ART_PLAN_UMEDIDA }}
            </td>
            <td class="fs-sm text-end">
                {{ articulo.pendiente }}
            </td>
            <td class="fs-sm text-end">
              {{ formatPrice(articulo.pendiente * articulo.ART_PESO) }}
            </td>
          </tr>
          
          <tr>
            <th colspan="6">&nbsp;</th>
          </tr>
          <tr>
            <th colspan="5" class="fs-sm text-end">Peso total del despacho</th>
            <th class="fs-sm text-end">{{ formatPrice(picking.data.peso_total) }}</th>
           
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button  type="button" class="btn btn-success btn-sm mx-2" @click="imprimirPicking(verpedido)"><i class="fa fa-print"></i> Imprimir</button>
    <button  type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cerrar</button>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useStore} from 'vuex'
import { formatPrice, formatPrice4 } from "@/functions";

const store = useStore();
const picking = computed(() => store.state.picking);

const { verpedido } = defineProps({
  verpedido: Object,
});

async function imprimirPicking(pedido){
  store.dispatch('imprimir', '/despachos/imprimirpicking/'+pedido.id)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'picking-'+pedido.pedido+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}

</script>