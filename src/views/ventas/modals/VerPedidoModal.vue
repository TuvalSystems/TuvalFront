<template>
  <BaseBlock title="Detalle de pedido" class="mb-0">
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
      <ul class="nav nav-tabs nav-tabs-alt" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link active"
            id="btabs-alt-static-detalle-tab"
            data-bs-toggle="tab"
            data-bs-target="#btabs-alt-static-detalle"
            role="tab"
            aria-controls="btabs-alt-static-detalle"
            aria-selected="true"
            >
            Detalle 
          </button>
        </li>
        <li v-if="verrecibodecompral && verrecibodecompral.length" class="nav-item">
          <button
            class="nav-link"
            id="btabs-alt-static-ordendecompra-tab"
            data-bs-toggle="tab"
            data-bs-target="#btabs-alt-static-ordendecompra"
            role="tab"
            aria-controls="btabs-alt-static-ordendecompra"
            aria-selected="false"
          >
            Orden de compra 
          </button>
        </li>
        <li v-if="traslados && traslados.length" class="nav-item">
          <button
            class="nav-link"
            id="btabs-alt-static-traslados-tab"
            data-bs-toggle="tab"
            data-bs-target="#btabs-alt-static-traslados"
            role="tab"
            aria-controls="btabs-alt-static-traslados"
            aria-selected="false"
          >
            Traslados
          </button>
        </li>
        
        <li v-if="orden_despacho" class="nav-item">
          <button
            class="nav-link"
            id="btabs-alt-static-orden_despacho-tab"
            data-bs-toggle="tab"
            data-bs-target="#btabs-alt-static-orden_despacho"
            role="tab"
            aria-controls="btabs-alt-static-orden_despacho"
            aria-selected="false">
            Orden de despacho
          </button>
        </li>
        <li v-if="guias_remision && guias_remision.length" class="nav-item">
          <button
            class="nav-link"
            id="btabs-alt-static-guias_remision-tab"
            data-bs-toggle="tab"
            data-bs-target="#btabs-alt-static-guias_remision"
            role="tab"
            aria-controls="btabs-alt-static-guias_remision"
            aria-selected="false"
            >
            Guia Remisión
          </button>
        </li>
        <li v-if="devoluciones && devoluciones.length" class="nav-item">
          <button
            class="nav-link"
            id="btabs-alt-static-devoluciones-tab"
            data-bs-toggle="tab"
            data-bs-target="#btabs-alt-static-devoluciones"
            role="tab"
            aria-controls="btabs-alt-static-devoluciones"
            aria-selected="false"
            >
            Notas de crédito
          </button>
        </li>
      </ul>

      <div class="block-content tab-content fs-sm">
        <div
          class="tab-pane active"
          id="btabs-alt-static-detalle"
          role="tabpanel"
          aria-labelledby="btabs-alt-static-detalle-tab"
          >
          <CabeceraPedido :verpedido="verpedido" :segmento="segmentocliente"></CabeceraPedido>
          <div class="table-responsive">
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
                    <th class="text-end">%Mod.</th>
                    <th class="text-end">Descuento</th>
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
                      <a class="text-danger" v-if="articulo.ART_TIPO_COMPRA !== 'L' && articulo.ART_DESCRIPCION != articulo.ART_DESCRIPCION_ORIGINAL" @click="verdiferenciadescripcion(articulo)" href="javascript:void(0);">{{ articulo.ART_DESCRIPCION }}</a>
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
                      <a class="text-danger" v-if="articulo.ART_TIPO_COMPRA !== 'L' && articulo.ART_VALOR != articulo.ART_VALOR_ORIGINAL" @click="verdiferenciavalor(articulo)" href="javascript:void(0);">
                        ${{ format4(parseFloat(articulo.ART_VALOR)) }}
                      </a>
                      <span v-else>${{ format4(parseFloat(articulo.ART_VALOR)) }}</span>
                    </td>
                    <td class="fs-sm text-end">
                        <span v-if="!articulo.proveedores.length">{{ formatPrice(articulo.modificador) }}</span>
                    </td>
                    <td class="fs-sm text-end">
                        ${{ format4(parseFloat(articulo.ART_DESCUENTO)) }}
                    </td>
                    <td class="fs-sm text-end">
                     ${{ format(calcularTotalLinea(articulo)) }}
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
        <div
          v-if="verrecibodecompral && verrecibodecompral.length"
          class="tab-pane"
          id="btabs-alt-static-ordendecompra"
          role="tabpanel"
          aria-labelledby="btabs-alt-static-ordendecompra-tab"
          >
          <ReciboDeCompraL></ReciboDeCompraL>
        </div>
        <div
          v-if="traslados.length"
          class="tab-pane"
          id="btabs-alt-static-traslados"
          role="tabpanel"
          aria-labelledby="btabs-alt-static-traslados-tab"
          >
          <Traslados></Traslados>
        </div>
        <div
          v-if="orden_despacho"
          class="tab-pane"
          id="btabs-alt-static-orden_despacho"
          role="tabpanel"
          aria-labelledby="btabs-alt-static-orden_despacho-tab"
          >
          <OrdenDespacho></OrdenDespacho>
        </div>
        <div
          v-if="guias_remision.length"
          class="tab-pane"
          id="btabs-alt-static-guias_remision"
          role="tabpanel"
          aria-labelledby="btabs-alt-static-guias_remision-tab">
          <GuiasRemision></GuiasRemision>
        </div>
        <div
            v-if="devoluciones.length"
            class="tab-pane"
            id="btabs-alt-static-devoluciones"
            role="tabpanel"
            aria-labelledby="btabs-alt-static-devoluciones-tab">
          <Devoluciones></Devoluciones>
        </div>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full bg-body">
    <div class="row">
      <div class="col-sm-9">
        <div class="row mb-2">
          <label for="orden-de-compra" class="col-sm-3 col-form-label text-right">Orden de compra:</label>
          <div class="col-sm-9">
            <div class="input-group">
              <input v-model="verpedido.orden_de_compra" type="text"
                     id="orden-de-compra" class="form-control"
                     :disabled="verpedido.estado == 'facturado' || verpedido.estado == 'eliminado' || verpedido.estado == 'anulada'"
                     :maxlength="max_length"
                     @change="guardarOrdenDeCompra(verpedido)"
              />
              <span
                  v-if="verpedido.orden_de_compra"
                  class="input-group-text"
              >{{max_length - verpedido.orden_de_compra.length}}</span>
            </div>

          </div>
        </div>
        <div class="row">
          <label for="nota-interna" class="col-sm-3 col-form-label text-right">Nota interna:</label>
          <div class="col-sm-9">
            <input v-model="verpedido.nota_interna" type="text" 
              id="orden-de-compra" class="form-control" 
              :disabled="verpedido.estado == 'facturado' || verpedido.estado == 'eliminado' || verpedido.estado == 'anulada'"
              @change="guardarOrdenDeCompra(verpedido)"
              />
          </div>
        </div>
      </div>
      <div class="col-sm-3 text-end">
        <div class="row">
          <div class="col-sm-12">
            <button
                v-if="
                  pendientes
                  && existentes
                  && verpedido.estado !== 'facturado'
                  && verpedido.estado !== 'eliminado'
                  && verpedido.estado !== 'espera'
                  && verpedido.estado !== 'rechazado'
                  && verpedido.estado !== 'anulada'

                "
                type="button" class="btn btn-warning btn-sm mx-1 mb-2"  @click="emit('consultarExistente')">Facturar lo existente</button>
<!--            <button-->
<!--                v-if="-->
<!--                  verpedido.factura_posterior_despacho && verpedido.factura_a_demanda-->
<!--                  && verpedido.estado !== 'facturado'-->
<!--                  && verpedido.estado !== 'eliminado'-->
<!--                  && verpedido.estado !== 'rechazado'-->
<!--                  && !verpedido.despacho_en_proceso-->
<!--                  && !verpedido.transferencia_en_proceso-->
<!--                "-->
<!--                type="button" class="btn btn-info btn-sm mx-1 mb-2"  @click="emit('consultarDespachado')">Facturar despachado</button>-->
            <button
                type="button" class="btn btn-primary btn-sm mx-1 mb-2" data-bs-dismiss="modal"> Cerrar</button>
          </div>
          <div v-if="detallepedido.data.length && !detallepedido.loading" class="col-sm-12 mt-2">
            <button
                v-if="
                      verpedido.estado !== 'facturado'
                      && verpedido.estado !== 'eliminado'
                      && verpedido.estado !== 'orden_de_compra'
                      && verpedido.estado !== 'rechazado'
                      && verpedido.estado !== 'anulada'
                      && !verpedido.despacho_en_proceso
                      && !verpedido.transferencia_en_proceso
                      && !verpedido.despachado 
                      && verpedido.imprimir === 'yes'
                      && !verpedido.item_l_recibido
                      && !verpedido.check_traslado_venta
                      && !has_guide_dispatched
                    "
                type="button" class="btn btn-danger btn-sm mx-1 mb-2"
                @click="confirmcancelarPedido(verpedido)"><i class="fa fa-xmark"></i> Cancelar Pedido</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import {formatPrice, format, format4} from "@/functions";
import ReciboDeCompraL from "./tabs/ReciboDeCompraL.vue"
import Traslados from "./tabs/Traslados.vue"
import OrdenDespacho from "./tabs/OrdenDespacho.vue"
import GuiasRemision from "./tabs/GuiasRemision.vue"
import Devoluciones from "./tabs/Devoluciones.vue";
import CabeceraPedido from "@/components/CabeceraPedido.vue";

const { verpedido, indexPedido, tipo } = defineProps({
  verpedido: Object,
  indexPedido: Number,
  tipo: String,
});

const store = useStore();
const detallepedido = computed(() => store.state.detallepedido);
const verrecibodecompral = computed(() => store.state.ordendecompra);
const traslados = computed(() => store.state.traslados);
const orden_despacho = computed(() => store.state.orden_despacho);
const guias_remision = computed(() => store.state.guias_remision);
const devoluciones = computed(() => store.state.devoluciones_pedido);
const pendientes = computed(() => store.state.pendientes);
const existentes = computed(() => store.state.existentes);
const segmentocliente = computed(() => store.state.segmentocliente);
const has_guide_dispatched = computed(() => store.state.has_guide_dispatched);
const max_length = ref(20);
const emit = defineEmits(["consultarExistente", "cancelarPedido", "consultarDespachado"]);

let errorMsg = ref('');

function verdiferenciacondicion(pedido){
  let msg = 'simon';
  swalInfo('Cambio condición de pago', 'de <b>'+ pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

function verdiferenciaporcentaje(pedido){
  let msg = 'simon';
  swalInfo('Cambio porcentaje de descuento', 'de <b>'+ pedido.porcentage_descuentooriginal + '%</b> a <b>' + pedido.porcentage_descuento + '%</b>');
}

function verdiferenciadescripcion(articulo){
  let msg = 'simon';
  swalInfo('Cambio de descripción de artículo', 'de <br><b>'+ articulo.ART_DESCRIPCION_ORIGINAL + '</b><br> a <br><b>' + articulo.ART_DESCRIPCION + '</b>');
}

function verdiferenciavalor(articulo){
  let msg = 'simon';
  swalInfo('Cambio de precio de artículo', 'de <b>$'+ articulo.ART_VALOR_ORIGINAL + '</b> a <b>$' + articulo.ART_VALOR + '</b>');
}

function guardarOrdenDeCompra(pedido){
  store.dispatch('guardarOrdenDeCompraPedido', pedido)
}

function confirmcancelarPedido(pedido) {
  toast
      .fire({
        title: "Estás seguro?",
        text: "De cancelar el pedido "+pedido.pedido,
        icon: "question",
        showCancelButton: true,
        customClass: {
          confirmButton: "btn btn-danger m-1",
          cancelButton: "btn btn-secondary m-1",
        },
        confirmButtonText: "Si, cancelarlo",
        cancelButtonText: "No cancelarlo",
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
          cancelarPedido(pedido)
        }
      });
}

const calcularTotalLinea = (articulo) => {
  const valor = parseFloat(articulo.ART_VALOR) || 0;
  const descuento = parseFloat(articulo.ART_DESCUENTO) || 0;
  const cantidad = parseFloat(articulo.ART_CANTIDAD) || 0;

  // Aplicamos la misma lógica "antibugs" que en el backend
  const totalRaw = ((valor - descuento) * cantidad) + 0.000001;
  
  return totalRaw; // El 'format' del template se encargará de redondearlo visualmente
};
function cancelarPedido(pedido){
  store.dispatch("cancelarPedido", pedido).then( (res) => {
    emit('cancelarPedido');
  })
}

onMounted(() => {
  
});
onBeforeUnmount(() => {
});
</script>