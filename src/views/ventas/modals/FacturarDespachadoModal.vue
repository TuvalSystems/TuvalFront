<template>
  <BaseBlock title="Facturar Despachado" class="mb-0">
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
      <div class="block-content fs-sm mb-4 space-y-2">
        <p class="alert alert-danger text-center"><b>Se creará y facturará otro pedido con el siguiente detalle</b></p>
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
                    <th class="fs-sm">P. de venta</th>
                    <td class="fs-sm">
                      {{verpedido.PTO_VTA_DESCRIPCION}}
                    </td>
                    
                    <th class="fs-sm">Cond. Pago</th>
                    <td class="fs-sm">
                      <a class="text-danger" v-if="verpedido.COND_ID != verpedido.COND_ID_ORIGINAL" @click="verdiferenciacondicion(verpedido)" href="javascript:void(0);">{{ verpedido.COND_ID }}</a>
                      <span v-else>{{ verpedido.COND_ID }}</span>
                    </td>
                    <th class="fs-sm">Usuario</th>
                    <td class="fs-sm">{{verpedido.USERID}}</td>
                    
                </tr>
                <tr>
                  <th class="fs-sm">Bodega</th>
                  <td class="fs-sm">
                    {{ verpedido.BOD_BODEGA }}
                  </td>
                  <th class="fs-sm">% Descuento</th>
                  <td class="fs-sm">
                    <a class="text-danger" v-if="verpedido.porcentage_descuento != verpedido.porcentage_descuentooriginal" @click="verdiferenciaporcentaje(verpedido)" href="javascript:void(0);">{{ verpedido.porcentage_descuento }}</a>
                    <span v-else>{{ verpedido.porcentage_descuento }}</span>
                  </td>
              
                  <th class="fs-sm">Fecha/hora</th>
                  <td class="fs-sm">
                    {{ verpedido.created_at }}
                  </td>
                </tr>
              </tbody>
            </table>
           
            <table v-if="facturar_despachado.detalle" class="table table-hover table-sm table-vcenter mt-4">
              <thead>
                <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>CTL</th>
                    <th>UDM</th>
                    <th class="text-end">Cantidad</th>
                    <th class="text-end">Precio</th>
                    <th class="text-end">%Mod.</th>
                    <th class="text-end">Descuento</th>
                    <th class="text-end">Total</th>
                    
                </tr>
              </thead>
              <tbody>
                <template v-for="(articulo, index) in facturar_despachado.detalle" :key="index">
                  <tr>
                    <td class="fs-sm">{{index+1}}</td>
                    <td class="fs-sm">
                      {{ articulo.ART_CODIGO }}
                      
                    </td>
                    <td class="fs-sm">
                      <a class="text-danger" v-if="articulo.ART_DESCRIPCION !== articulo.ART_DESCRIPCION_ORIGINAL && articulo.ART_TIPO_COMPRA !== 'L'" @click="verdiferenciadescripcion(articulo)" href="javascript:void(0);">{{ articulo.ART_DESCRIPCION }}</a>
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
                      <a class="text-danger" v-if="articulo.ART_VALOR != articulo.ART_VALOR_ORIGINAL" @click="verdiferenciavalor(articulo)" href="javascript:void(0);">
                        ${{ articulo.ART_VALOR }}
                      </a>
                      <span v-else>${{ articulo.ART_VALOR }}</span>
                    </td>
                    <td class="fs-sm text-end">
                        <span v-if="!articulo.proveedores.length">{{ articulo.modificador }}</span>
                    </td>
                    <td class="fs-sm text-end">
                        ${{ formatPrice(articulo.ART_DESCUENTO) }}
                    </td>
                    <td class="fs-sm text-end">
                      ${{ formatPrice((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD)  }}
                    </td>
                  </tr>
                  <tr v-if="articulo.proveedores.length">
                    <td colspan="10" style="background:#EFEFEF">
                      <table class="table-sm table-vcenter">
                        <tr>
                          <th>Descripción L</th>
                          <th>Orden compra</th>
                          <th>Recibo compra</th>
                          <th class="text-end">Cantidad</th>
                          <th class="text-end"></th>
                          
                        </tr>
                        <tr v-for="(proveedor, indice) in articulo.proveedores" :key="indice">
                          <td>{{ proveedor.DESCRIPCION_ARTICULO }}</td>
                          <td>
                            <template v-for="(orden, index) in proveedor.orden_detalle" :key="index">
                              {{ orden.ORDEN_COMPRA_DOCUMENTO }}
                            </template>
                          </td>
                          <td>
                            <template v-for="(orden, index) in proveedor.orden_detalle" :key="index">
                              {{ orden.ORDEN_COMPRA_RECIBO }}
                            </template>
                          </td>
                          <td class="text-end">{{ proveedor.CANTIDAD }}</td>
                          <td></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </template>
                <tr>
                  <th colspan="9" class="fs-sm text-end">Subtotal</th>
                  <th class="fs-sm text-end">${{ formatPrice(facturar_despachado.pedido.subtotal) }}</th>
                </tr>
                <tr>
                  <th colspan="9" class="fs-sm text-end">Descuento</th>
                  <th class="fs-sm text-end">${{ formatPrice(facturar_despachado.pedido.descuento) }}</th>
                </tr>
                <tr>
                  <th colspan="9" class="fs-sm text-end">Subtotal - descuento</th>
                  <th class="fs-sm text-end">${{ formatPrice(facturar_despachado.pedido.subtotalmenosdescuento) }}</th>
                </tr>
                <tr>
                  <th colspan="9" class="fs-sm text-end">IVA</th>
                  <th class="fs-sm text-end">${{ formatPrice(facturar_despachado.pedido.iva) }}</th>
                </tr>
                <tr>
                  <th colspan="9" class="fs-sm text-end">Total</th>
                  <th class="fs-sm text-end">${{ formatPrice(facturar_despachado.pedido.total) }}</th>
                </tr>
              </tbody>
            </table>
          </div>  
      </div>
      
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button v-if="facturar_despachado.pedido && facturar_despachado.pedido.total > 0" type="button" class="btn btn-warning btn-sm mx-1"  @click="confirmFacturarDespachado(verpedido)">Facturar</button>
    <button type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal"> Cancelar</button>
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { formatPrice } from "@/functions";
import { swalInfo, swalSuccess, swalError, toast } from "@/functions/swal-alert.js";


defineProps({
  verpedido: Object,
  indexPedido: Number,
  tipo: String,
});

const store = useStore();
const facturar_despachado = computed(() => store.state.facturar_despachado);

const emit = defineEmits(["cerrarFacturarDespachado"]);

function confirmFacturarDespachado(pedido) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De modificar y facturar el pedido "+pedido.pedido,
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, facturar",
      cancelButtonText: "Cancelar",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        facturarDespachado();
      }
    });
}

function facturarDespachado(){
  
  store.dispatch('facturarDespachado', facturar_despachado.value).then((res)=> {
    if(res.success){
      swalSuccess(res.message);
    }else{
      swalError(res.message);
    }
  }).catch(err => {
    swalError(err.response.data.error);
  });
  emit('cerrarFacturarDespachado');
}




function verdiferenciacondicion(pedido){

  swalInfo('Cambio condición de pago', 'de <b>'+ pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

function verdiferenciaporcentaje(pedido){

  swalInfo('Cambio porcentaje de descuento', 'de <b>'+ pedido.porcentage_descuentooriginal + '%</b> a <b>' + pedido.porcentage_descuento + '%</b>');
}

function verdiferenciadescripcion(articulo){

  swalInfo('Cambio de descripción de artículo', 'de <br><b>'+ articulo.ART_DESCRIPCION_ORIGINAL + '</b><br> a <br><b>' + articulo.ART_DESCRIPCION + '</b>');
}

function verdiferenciavalor(articulo){

  swalInfo('Cambio de precio de artículo', 'de <b>$'+ articulo.ART_VALOR_ORIGINAL + '</b> a <b>$' + articulo.ART_VALOR + '</b>');
}

onMounted(() => {
  
});
onBeforeUnmount(() => {
});
</script>
