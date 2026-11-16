<template>
  <template v-for="(verrecibodecompral, index) in recibosdecompral" :key="index">
    <div class="table-responsive">
      <table class="table table-striped table-sm table-vcenter">
        <tbody>
          <tr>
              <th class="fs-sm">Documento</th>
              <td class="fs-sm">{{verrecibodecompral.ORDEN_COMPRA_DOCUMENTO}}</td>
              <th class="fs-sm">Pedido Origen</th>
              <td class="fs-sm">{{verrecibodecompral.ORDEN_COMPRA_DOCU_ORIGEN}}</td>
              <th class="fs-sm">Proveedor</th>
              <td class="fs-sm">{{verrecibodecompral.PROV_RAZON_SOCIAL}}</td>
          </tr>
          <tr>
              <th class="fs-sm">RUC Proveedor</th>
              <td class="fs-sm">
                {{verrecibodecompral.ORDEN_COMPRA_ID_PROVEEDOR}}
              </td>
              
              <th class="fs-sm">Fecha de entrega</th>
              <td class="fs-sm">
                {{verrecibodecompral.ORDEN_COMPRA_FECHA_ENTREGA}}
              </td>
              <th class="fs-sm">Estado</th>
              <td class="fs-sm">
                <span v-if="verrecibodecompral.estado == 'generado'">Pendiente</span>
                <span v-if="verrecibodecompral.estado == 'recibido'">Recibido</span>
              </td>
              
          </tr>
        </tbody>
      </table>
      <table class="table table-hover table-sm table-vcenter mt-4 fs-sm">      
        <thead>
          <tr>
              <th>#</th>
              <th>Artículo</th>
              <th>Descripción</th>
              <th>UDM</th>
              <th class="text-end">Cantidad</th>
              <th class="text-end">Precio</th>
              
              <th class="text-end">Total</th>
              <th class="text-end">Impuesto</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(articulo, index) in verrecibodecompral.detalle" :key="index">
            <tr>
              <td>{{index+1}}</td>
              <td>
                {{ articulo.ORDEN_COMPRA_DETALLE_ARTICULO }}
                
              </td>
              <td>
                {{ articulo.ORDEN_COMPRA_DETALLE_DESCRIPCION_ARTICULO }}
                
              </td>
              <td>
                  {{ articulo.ORDEN_COMPRA_DETALLE_UMEDIDA }}
              </td>
              <td class="text-end">
                  {{ articulo.ORDEN_COMPRA_DETALLE_CANTIDAD }}
              </td>
              <td class="text-end">
                ${{ format4(parseFloat(articulo.ORDEN_COMPRA_DETALLE_COSTO_UNITARIO)) }}
              </td>
              <td class="text-end">
                ${{ format4(parseFloat(articulo.ORDEN_COMPRA_DETALLE_TOTAL)) }}
              </td>
              <td class="text-end">
                ${{ format4(parseFloat(articulo.ORDEN_COMPRA_DETALLE_IMPUESTO)) }}
              </td>
            </tr>
          </template>
          <tr>
            <th colspan="7" class="fs-sm text-end">Subtotal</th>
            <th class="fs-sm text-end">${{ format(parseFloat(verrecibodecompral.subtotal)) }}</th>
          </tr>
          <tr>
            <th colspan="7" class="fs-sm text-end">IVA</th>
            <th class="fs-sm text-end">${{ format(parseFloat(verrecibodecompral.iva)) }}</th>
          </tr>
          <tr>
            <th colspan="7" class="fs-sm text-end">Total</th>
            <th class="fs-sm text-end">${{ format(parseFloat(verrecibodecompral.total)) }}</th>
          </tr>
        </tbody>
      </table>  
    </div>
    <div class="fs-sm text-end py-2"><button class="btn btn-sm btn-success" @click="imprimirOrdenDeCompra(verrecibodecompral)"><i class="fa fa-print"></i> Imprimir Orden de Compra</button></div>  
  </template>
</template>
<script setup>
import { computed } from "vue";
import { useStore} from 'vuex'
import {format, format4} from "@/functions";

const store = useStore();
const recibosdecompral = computed(() => store.state.ordendecompra);

async function imprimirOrdenDeCompra(verrecibodecompral){
  store.dispatch('imprimir', '/bodegas/recibosdecompra/imprimir/'+verrecibodecompral.id)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ordendecompra-'+verrecibodecompral.ORDEN_COMPRA_DOCUMENTO+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}
</script>
