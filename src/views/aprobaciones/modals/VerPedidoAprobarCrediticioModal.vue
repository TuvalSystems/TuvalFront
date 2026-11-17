<template>
  <BaseBlock title="Pedido por aprobar" class="mb-0">
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
        <div class="table-responsive">
          <table class="table table-striped table-sm table-vcenter">
            <tbody>
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
                    <a class="text-danger" v-if="verpedido.COND_ID != verpedido.COND_ID_ORIGINAL" @click="verdiferenciacondicion(verpedido)" href="javascript:void(0);">
                      de {{ verpedido.COND_ID_ORIGINAL }} a {{ verpedido.COND_ID }}
                    </a>
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
                <tr v-if="segmentocliente &&  segmentocliente.data &&
                Object.keys(segmentocliente.data).length">
                <th>Segmento</th>
                <td>{{ segmentocliente.data.segmento }}</td>
                <th>Subsegmento</th>
                <td colspan="3">{{ segmentocliente.data.subsegmento }}</td>
              </tr>
              <tr v-else>
                <td colspan="6" class="text-muted">
                  Sin segmento para este cliente
                </td>
              </tr>
              <tr>
                <th v-if="verpedido.nota_interna" class="fs-sm text-danger">Nota interna</th>
                <td v-if="verpedido.nota_interna" class="fs-sm text-danger" colspan="5">{{verpedido.nota_interna}}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="detallepedido.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
          </div>
          <table v-if="detallepedido.data.length && !detallepedido.loading" class="table table-hover table-sm table-vcenter mt-4">      
            <thead>
              <tr>
                  <th>#</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>CTL</th>
                  <th>UDM</th>
                  <th class="text-end">Cantidad</th>
                  <th class="text-end">Precio</th>
                  <th class="text-end">Desc.</th>
                  <th class="text-end">%Desc.</th>
                  <th class="text-end">Total</th>
                  
              </tr>
            </thead>
            <tbody>
              <template v-for="(articulo, index) in detallepedido.data" :key="index">
                <tr>
                  <td class="fs-sm">{{index+1}}</td>
                  <td class="fs-sm">
                    {{ articulo.ART_CODIGO }}
                    
                  </td>
                  <td class="fs-sm">
                    <a class="text-danger" v-if="articulo.ART_TIPO_COMPRA != 'L' && articulo.ART_DESCRIPCION != articulo.ART_DESCRIPCION_ORIGINAL" @click="verdiferenciadescripcion(articulo)" href="javascript:void(0);">{{ articulo.ART_DESCRIPCION }}</a>
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
                    <a class="text-danger" v-if="articulo.ART_TIPO_COMPRA != 'L' && articulo.ART_VALOR != articulo.ART_VALOR_ORIGINAL" @click="verdiferenciavalor(articulo)" href="javascript:void(0);">{{ articulo.ART_VALOR }}</a>
                    <span v-else>${{ articulo.ART_VALOR }}</span>
                  </td>
                  <td class="fs-sm text-end">
                      ${{ format4(parseFloat(articulo.ART_DESCUENTO)) }}
                  </td>
                  <td class="fs-sm text-end">
                    <a class="text-danger" v-if="articulo.ART_TIPO_COMPRA != 'L' && articulo.descuento != articulo.descuento_original" @click="verdiferenciadescuento(articulo)" href="javascript:void(0);">{{ articulo.descuento }}%</a>
                    <span v-else>{{ format(parseFloat(articulo.descuento)) }}%</span>
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format(parseFloat((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD))  }}
                  </td>
                </tr>
                <tr v-if="articulo.proveedores.length">
                  <td colspan="10" style="background:var(--tuval-surface-muted)">
                    <table class="table table-sm table-vcenter">
                      <tr>
                        <th>Descripción L</th>
                        <th class="text-end">Cantidad</th>
                        <th class="text-end">Precio de venta mínimo</th>
                        <th class="text-end">Margen</th>
                        <th class="text-end">Costo unitario</th>
                        <th class="text-end">Subtotal</th>
                        <th class="text-end">Impuesto</th>
                        <th class="text-end">Total</th>
                      </tr>
                      <tr v-for="(proveedor, indice) in articulo.proveedores" :key="indice">
                        <td>{{ proveedor.DESCRIPCION_ARTICULO }}</td>
                        <td class="text-end">{{ proveedor.CANTIDAD }}</td>
                        <td class="text-end">${{ proveedor.margen }}</td>
                        <td class="text-end">{{ proveedor.MARGEN }}%</td>
                        <td class="text-end">${{ proveedor.COSTO_UNITARIO }}</td>
                        <td class="text-end">${{ proveedor.TOTAL }}</td>
                        <td class="text-end">${{ proveedor.IMPUESTO }}</td>
                        <td class="text-end">${{ proveedor.TOTALCONIMPUESTO }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </template>
              <tr>
                <th colspan="9" class="fs-sm text-end">Subtotal</th>
                <th class="fs-sm text-end">${{ format(parseFloat(verpedido.subtotal)) }}</th>
              </tr>
              <tr>
                <th colspan="9" class="fs-sm text-end">Descuento</th>
                <th class="fs-sm text-end">${{ format(parseFloat(verpedido.descuento)) }}</th>
              </tr>
              <tr>
                <th colspan="9" class="fs-sm text-end">Subtotal - descuento</th>
                 <th class="fs-sm text-end">${{ format(parseFloat(verpedido.subtotalmenosdescuento)) }}</th>
              </tr>
              <tr>
                <th colspan="9" class="fs-sm text-end">IVA</th>
                 <th class="fs-sm text-end">${{ format(parseFloat(verpedido.iva)) }}</th>
              </tr>
              <tr>
                <th colspan="9" class="fs-sm text-end">Total</th>
                 <th class="fs-sm text-end">${{ format(parseFloat(verpedido.total)) }}</th>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <div class="row">
      
      <label for="orden-de-compra" class="col-sm-2 col-form-label text-right">Mensaje:</label>
      <div class="col-sm-7">
        <input v-model="editable_aprobado_crediticio_mensaje" type="text"
          id="orden-de-compra" class="form-control" 
          placeholder="Motivo de rechazo"
          @change="guardarMensaje(verpedido)"
          />
      </div>
      <div class="col-sm-3 text-end">
        <button  type="button" class="btn btn-success btn-sm" @click="emit('aprobar')"><i class="fa fa-check"></i> Aprobar</button>
        <button  type="button" class="btn btn-danger btn-sm mx-2" @click="emit('rechazar')"><i class="fa fa-times"></i> Rechazar</button>
      </div>
    </div>
    
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { swalInfo } from "@/functions/swal-alert.js";
import {format, format4} from "@/functions";

const props = defineProps({
  verpedido: Object,
  indexPedido: Number,
  tipo: String,
});

const store = useStore();
const detallepedido = computed(() => store.state.detallepedido);

const segmentocliente = computed(() => store.state.segmentocliente);



function guardarMensaje(pedido){
  store.dispatch('guardarMensajePedido', pedido)
}




const emit = defineEmits(["update:verpedido", "aprobar", "rechazar"]);

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
function verdiferenciadescuento(articulo){
  swalInfo('Cambio de porcentaje de descuento', 'de <b>'+ articulo.descuento_original + '%</b> a <b>' + articulo.descuento + '%</b>');
}
onMounted(() => {
});
onBeforeUnmount(() => {
});
const editable_aprobado_crediticio_mensaje = computed({
  get: () => props.verpedido.aprobado_crediticio_mensaje,
  set: (value) => emit("update:verpedido", { aprobado_crediticio_mensaje: value }),
});
</script>
