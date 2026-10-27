<template>
  <BaseBlock title="Detalle de pedido" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <ul class="nav nav-tabs nav-tabs-alt">
        <li class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'detalle' }"
            @click="tabActual = 'detalle'">
            Detalle
          </button>
        </li>
        <li v-if="verrecibodecompral && verrecibodecompral.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'recibocompra' }"
            @click="tabActual = 'recibocompra'">
            Orden de compra
          </button>
        </li>
        <li v-if="traslados && traslados.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'traslados' }"
            @click="tabActual = 'traslados'">
            Traslados
          </button>
        </li>

        <li v-if="orden_despacho" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'orden_despacho' }"
            @click="tabActual = 'orden_despacho'">
            Orden de despacho
          </button>
        </li>
        <li v-if="guias_remision && guias_remision.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'guia_remision' }"
            @click="tabActual = 'guia_remision'">
            Guia Remisión
          </button>
        </li>
        <li v-if="devoluciones && devoluciones.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'devoluciones' }"
            @click="tabActual = 'devoluciones'">
            Notas de crédito
          </button>
        </li>
        <li v-if="imagenesOperaciones && imagenesOperaciones.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'imagenes_operaciones' }"
            @click="tabActual = 'imagenes_operaciones'">
            Imagenes Operaciones
          </button>
        </li>
        <li v-if="documentosPdf && documentosPdf.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'documentos_pdf' }"
            @click="tabActual = 'documentos_pdf'">
            Documento(s)
          </button>
        </li>
      </ul>

      <div class="block-content tab-content fs-sm">
        <div class="tab-pane fade" :class="{ 'active show': tabActual === 'detalle' }">
          <CabeceraPedido :verpedido="verpedido" :segmento="segmentocliente" :proyecto="proyecto"></CabeceraPedido>
          <div class="table-responsive">
            <div v-if="detallepedido.loading" class="text-center">
              <div class="spinner-border text-primary mt-2"><span class="visually-hidden">Loading...</span></div>
            </div>
            <table v-if="detallepedido.data.length && !detallepedido.loading"
              class="table table-hover table-sm table-vcenter mt-2">
              <thead>
                <tr>
                  <th scope>#</th>
                  <th scope>Código</th>
                  <th scope>Descripción</th>
                  <th scope>CTL</th>
                  <th scope>UDM</th>
                  <th scope class="text-end">Cantidad</th>
                  <th scope class="text-end">Precio</th>
                  <th scope class="text-end">%Mod.</th>
                  <th scope class="text-end">Descuento</th>
                  <th scope class="text-end">Total</th>

                </tr>
              </thead>
              <tbody>
                <template v-for="(articulo, index) in detallepedido.data" :key="index">
                  <tr>
                    <td class="fs-sm">{{ index + 1 }}</td>
                    <td class="fs-sm">
                      {{ articulo.ART_CODIGO }}

                    </td>
                    <td class="fs-sm">
                      <a class="text-danger"
                        v-if="articulo.ART_TIPO_COMPRA !== 'L' && articulo.ART_DESCRIPCION != articulo.ART_DESCRIPCION_ORIGINAL"
                        @click="verdiferenciadescripcion(articulo)" href="javascript:void(0);">{{
                          articulo.ART_DESCRIPCION }}</a>
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
                      <a class="text-danger"
                        v-if="articulo.ART_TIPO_COMPRA !== 'L' && articulo.precio_sin_flete != articulo.ART_VALOR_ORIGINAL"
                        @click="verdiferenciavalor(articulo)" href="javascript:void(0);">
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
                    <td colspan="10" class="p-0">
                      <DetalleItemsL :proveedores="articulo.proveedores" mostrar-orden-compra />
                    </td>
                  </tr>
                </template>
                <tr>
                  <th scope colspan="9" class="fs-sm text-end">Subtotal</th>
                  <th scope class="fs-sm text-end">${{ format(parseFloat(verpedido.subtotal)) }}</th>
                </tr>
                <tr>
                  <th scope colspan="9" class="fs-sm text-end">Descuento</th>
                  <th scope class="fs-sm text-end">${{ format(parseFloat(verpedido.descuento)) }}</th>
                </tr>
                <tr>
                  <th scope colspan="9" class="fs-sm text-end">Subtotal - descuento</th>
                  <th scope class="fs-sm text-end">${{ format(parseFloat(verpedido.subtotalmenosdescuento)) }}</th>
                </tr>
                <tr>
                  <th scope colspan="9" class="fs-sm text-end">IVA</th>
                  <th scope class="fs-sm text-end">${{ format(parseFloat(verpedido.iva)) }}</th>
                </tr>
                <tr>
                  <th scope colspan="9" class="fs-sm text-end">Total</th>
                  <th scope class="fs-sm text-end">${{ format(parseFloat(verpedido.total)) }}</th>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
        <div v-if="verrecibodecompral && verrecibodecompral.length" class="tab-pane fade"
          :class="{ 'active show': tabActual === 'recibocompra' }">
          <ReciboDeCompraL></ReciboDeCompraL>
        </div>
        <div v-if="traslados.length" class="tab-pane fade" :class="{ 'active show': tabActual === 'traslados' }">
          <Traslados></Traslados>
        </div>
        <div v-if="orden_despacho" class="tab-pane fade" :class="{ 'active show': tabActual === 'orden_despacho' }">
          <OrdenDespacho></OrdenDespacho>
        </div>
        <div v-if="guias_remision.length" class="tab-pane fade"
          :class="{ 'active show': tabActual === 'guia_remision' }">
          <GuiasRemision></GuiasRemision>
        </div>
        <div v-if="devoluciones.length" class="tab-pane fade" :class="{ 'active show': tabActual === 'devoluciones' }">
          <Devoluciones></Devoluciones>
        </div>
        <div v-if="imagenesOperaciones && imagenesOperaciones.length" class="tab-pane fade p-3"
          :class="{ 'active show d-flex flex-wrap gap-2': tabActual === 'imagenes_operaciones' }">

          <div v-for="(img, index) in imagenesOperaciones" :key="img.id"
            class="border border-secondary border-opacity-25 rounded bg-body overflow-hidden shadow-sm"
            style="width: 100px; height: 100px; cursor: pointer; flex-shrink: 0;" @click="showGallery(index)">

            <img :src="img.url" class="img-fluid w-100 h-100 object-fit-cover" :alt="img.nombre"
              @error="handleImageError" title="Ver en pantalla completa">
          </div>

        </div>
        <div v-if="documentosPdf && documentosPdf.length" class="tab-pane fade"
          :class="{ 'active show': tabActual === 'documentos_pdf' }">
          <DocumentosPdf v-if="documentosPdf" :documentos="documentosPdf"></DocumentosPdf>
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
              <input v-model="verpedido.orden_de_compra" type="text" id="orden-de-compra" class="form-control"
                :disabled="verpedido.estado == 'facturado' || verpedido.estado == 'eliminado' || verpedido.estado == 'anulada'"
                :maxlength="max_length" @change="guardarOrdenDeCompra(verpedido)" />
              <span v-if="verpedido.orden_de_compra" class="input-group-text">{{ max_length -
                verpedido.orden_de_compra.length }}</span>
            </div>

          </div>
        </div>
        <div class="row">
          <label for="nota-interna" class="col-sm-3 col-form-label text-right">Nota interna:</label>
          <div class="col-sm-9">
            <input v-model="verpedido.nota_interna" type="text" id="nota-interna" class="form-control"
              :disabled="verpedido.estado == 'facturado' || verpedido.estado == 'eliminado' || verpedido.estado == 'anulada'"
              @change="guardarOrdenDeCompra(verpedido)" />
          </div>
        </div>
      </div>
      <div class="col-sm-3 text-end">
        <div class="row">
          <div class="col-sm-12">
            <button v-if="
              existentes
              && !['facturado', 'eliminado', 'espera', 'rechazado', 'anulada'].includes(verpedido.estado)"
              type="button" class="btn btn-warning btn-sm mx-1 mb-2" @click="emit('consultarExistente')">Facturar
              lo existente</button>
            <button type="button" class="btn btn-primary btn-sm mx-1 mb-2" data-bs-dismiss="modal"> Cerrar</button>
          </div>
          <div v-if="detallepedido.data.length && !detallepedido.loading" class="col-sm-12 mt-2">
            <button v-if="
              !['facturado', 'eliminado', 'orden_de_compra', 'rechazado', 'anulada'].includes(verpedido.estado)
              && !verpedido.despacho_en_proceso
              && verpedido.transferencia_en_proceso != 1
              && !verpedido.despachado
              && verpedido.imprimir === 'yes'
              && !verpedido.item_l_recibido
              && !verpedido.check_traslado_venta
              && !has_guide_dispatched
            " type="button" class="btn btn-danger btn-sm mx-1 mb-2" @click="confirmcancelarPedido(verpedido)"><i
                class="fa fa-xmark"></i> Cancelar Pedido</button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
</template>
<script setup>
import DetalleItemsL from "@/components/ventas/DetalleItemsL.vue";
import { ref, reactive, computed, onMounted,  onBeforeUnmount } from "vue";
import { useStore } from 'vuex'
import {  swalInfo, toast } from "@/functions/swal-alert.js";
import { formatPrice, format, format4 } from "@/functions";
import ReciboDeCompraL from "./tabs/ReciboDeCompraL.vue"
import Traslados from "./tabs/Traslados.vue"
import OrdenDespacho from "./tabs/OrdenDespacho.vue"
import GuiasRemision from "./tabs/GuiasRemision.vue"
import Devoluciones from "./tabs/Devoluciones.vue";
import DocumentosPdf from "./tabs/DocumentosPdf.vue";
import CabeceraPedido from "@/components/CabeceraPedido.vue";
import VueEasyLightbox from "vue-easy-lightbox";
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
const imagenesOperaciones = computed(() => store.state.imagenesOperaciones);
const documentosPdf = computed(() => store.state.documentosPdf);
const proyecto = computed(() => store.state.proyecto);

const max_length = ref(20);
const emit = defineEmits(["consultarExistente", "cancelarPedido", "consultarDespachado"]);

const tabActual = ref('detalle');
let errorMsg = ref('');

function verdiferenciacondicion(pedido) {
  let msg = 'simon';
  swalInfo('Cambio condición de pago', 'de <b>' + pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

function verdiferenciaporcentaje(pedido) {
  let msg = 'simon';
  swalInfo('Cambio porcentaje de descuento', 'de <b>' + pedido.porcentage_descuentooriginal + '%</b> a <b>' + pedido.porcentage_descuento + '%</b>');
}

function verdiferenciadescripcion(articulo) {
  let msg = 'simon';
  swalInfo('Cambio de descripción de artículo', 'de <br><b>' + articulo.ART_DESCRIPCION_ORIGINAL + '</b><br> a <br><b>' + articulo.ART_DESCRIPCION + '</b>');
}

function verdiferenciavalor(articulo) {
  let msg = 'simon';
  swalInfo('Cambio de precio de artículo', 'de <b>$' + articulo.ART_VALOR_ORIGINAL + '</b> a <b>$' + articulo.precio_sin_flete + '</b>');
}

function guardarOrdenDeCompra(pedido) {
  store.dispatch('guardarOrdenDeCompraPedido', pedido)
}

function confirmcancelarPedido(pedido) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De cancelar el pedido " + pedido.pedido,
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
function cancelarPedido(order) {
  emit("cancelarPedido", order);
 
}

const gallery = reactive({
  visible: false,
  index: 0,
  photos: []
});

const showGallery = (index) => {
  gallery.photos = imagenesOperaciones.value.map(img => img.url);
  gallery.index = index;
  gallery.visible = true;
}

const handleHide = () => {
  gallery.visible = false;
};
const handleImageError = (e) => {
  const placeholder = 'https://via.placeholder.com/100?text=No+Image';
  if (e.target.src !== placeholder) {
    e.target.src = placeholder;
  }
};

onMounted(() => {

});
onBeforeUnmount(() => {
});
</script>
