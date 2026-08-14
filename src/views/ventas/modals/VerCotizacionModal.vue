<template>
  <BaseBlock title="Detalle de cotización" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm">
        <div class="table-responsive">
          <table class="table table-striped table-sm table-vcenter">
            <tbody>
              <tr>
                <th class="fs-sm">Cotizacion</th>
                <td class="fs-sm">{{ vercotizacion.cotizacion }}</td>
                <th class="fs-sm">RUC</th>
                <td class="fs-sm">{{ vercotizacion.CLI_RUC }}</td>
                <th class="fs-sm">Razón Social</th>
                <td class="fs-sm">{{ vercotizacion.CLI_RAZON_SOCIAL }}</td>
              </tr>
              <tr>
                <th class="fs-sm">P. de venta</th>
                <td class="fs-sm">{{ vercotizacion.PTO_VTA_DESCRIPCION }}</td>

                <th class="fs-sm">Cond. Pago</th>
                <td class="fs-sm">
                  <a class="text-danger" v-if="
                    vercotizacion.COND_ID != vercotizacion.COND_ID_ORIGINAL
                  " @click="verdiferenciacondicion(vercotizacion)" href="javascript:void(0);">{{
                    vercotizacion.COND_ID }}</a>
                  <span v-else>{{ vercotizacion.COND_ID }}</span>
                </td>
                <th class="fs-sm">Forma de pago</th>
                <td class="fs-sm">
                  {{ vercotizacion.DESC_FORMA_PAGO_TIPO_CREDITO }}
                </td>
              </tr>
              <tr>
                <th class="fs-sm">Bodega</th>
                <td class="fs-sm">
                  {{ vercotizacion.BOD_BODEGA }}
                </td>
                <th class="fs-sm">% Descuento</th>
                <td class="fs-sm">
                  <a class="text-danger" v-if="
                    vercotizacion.porcentage_descuento !=
                    vercotizacion.porcentage_descuentooriginal
                  " @click="verdiferenciaporcentaje(vercotizacion)" href="javascript:void(0);">{{
                    vercotizacion.porcentage_descuento }}</a>
                  <span v-else>{{ vercotizacion.porcentage_descuento }}</span>
                </td>

                <th class="fs-sm">Fecha/hora</th>
                <td class="fs-sm">
                  {{ vercotizacion.created_at }}
                </td>
              </tr>
              <tr v-if="vercotizacion.despacho == 'Despacho en ruta'">
                <th>Dirección entrega</th>
                <td colspan="5">
                  {{ vercotizacion.direccion_entrega.CLI_SUC_DIRECCION }} -
                  {{ vercotizacion.direccion_entrega.CLI_SUC_CIUDAD }}
                </td>
              </tr>
              <tr>
                <th class="fs-sm">Usuario</th>
                <td class="fs-sm" colspan="5">{{ vercotizacion.USERID }}</td>
              </tr>
              <tr v-if="segmentocliente && segmentocliente.data &&
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
                <th class="fs-sm">Proyecto</th>
                <td class="fs-sm">
                  {{ proyecto }}
                </td>

              <!-- <td>{{ segmentocliente }}</td> -->
            </tbody>
          </table>
          <div v-if="detallecotizacion.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <table v-if="detallecotizacion.data.length && !detallecotizacion.loading"
            class="table table-hover table-sm table-vcenter mt-4">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Código</th>
                <th scope="col">Descripción</th>
                <th scope="col">CTL</th>
                <th scope="col">UDM</th>
                <th scope="col" class="text-end">Cantidad</th>
                <th scope="col" class="text-end">Precio</th>
                <th scope="col" class="text-end">Descuento</th>
                <th scope="col" class="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(articulo, index) in detallecotizacion.data" :key="index">
                <tr>
                  <td class="fs-sm">{{ index + 1 }}</td>
                  <td class="fs-sm">
                    {{ articulo.ART_CODIGO }}
                  </td>
                  <td class="fs-sm">
                    <a class="text-danger" v-if="
                      articulo.ART_DESCRIPCION !==
                      articulo.ART_DESCRIPCION_ORIGINAL &&
                      articulo.ART_TIPO_COMPRA !== 'L'
                    " @click="verdiferenciadescripcion(articulo)" href="javascript:void(0);">{{
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
                    <a class="text-danger" v-if="
                      articulo.ART_VALOR != articulo.ART_VALOR_ORIGINAL &&
                      articulo.ART_TIPO_COMPRA != 'L'
                    " @click="verdiferenciavalor(articulo)" href="javascript:void(0);">{{
                      format4(parseFloat(articulo.ART_VALOR)) }}</a>
                    <span v-else>{{
                      format4(parseFloat(articulo.ART_VALOR))
                    }}</span>
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format4(parseFloat(articulo.ART_DESCUENTO)) }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{
                      format(
                        (articulo.ART_VALOR - articulo.ART_DESCUENTO) *
                        articulo.ART_CANTIDAD
                      )
                    }}
                  </td>
                </tr>
                <tr v-if="articulo.proveedores.length">
                  <td colspan="10" style="background: #efefef">
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
                        <td class="text-end text-danger">
                          ${{ proveedor.margen }}
                        </td>
                        <td class="text-end">{{ proveedor.MARGEN }}%</td>
                        <td class="text-end">
                          ${{ proveedor.COSTO_UNITARIO }}
                        </td>
                        <td class="text-end">
                          ${{ format4(parseFloat(proveedor.TOTAL)) }}
                        </td>
                        <td class="text-end">
                          ${{ format4(parseFloat(proveedor.IMPUESTO)) }}
                        </td>
                        <td class="text-end">
                          ${{ format(parseFloat(proveedor.TOTALCONIMPUESTO)) }}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </template>
              <tr>
                <th colspan="8" class="fs-sm text-end">Subtotal</th>
                <th class="fs-sm text-end">
                  ${{ format(parseFloat(vercotizacion.subtotal)) }}
                </th>
              </tr>
              <tr>
                <th colspan="8" class="fs-sm text-end">Descuento</th>
                <th class="fs-sm text-end">
                  ${{ format(parseFloat(vercotizacion.descuento)) }}
                </th>
              </tr>
              <tr>
                <th colspan="8" class="fs-sm text-end">Subtotal - descuento</th>
                <th class="fs-sm text-end">
                  ${{
                    format(parseFloat(vercotizacion.subtotalmenosdescuento))
                  }}
                </th>
              </tr>
              <tr>
                <th colspan="8" class="fs-sm text-end">IVA</th>
                <th class="fs-sm text-end">
                  ${{ format(parseFloat(vercotizacion.iva)) }}
                </th>
              </tr>
              <tr>
                <th colspan="8" class="fs-sm text-end">Total</th>
                <th class="fs-sm text-end">
                  ${{ format(parseFloat(vercotizacion.total)) }}
                </th>
              </tr>
            </tbody>
          </table>
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
              <input v-model="vercotizacion.orden_de_compra" type="text" id="orden-de-compra" class="form-control"
                :maxlength="max_length" @change="guardarOrdenDeCompra(vercotizacion)" />
              <span v-if="vercotizacion.orden_de_compra" class="input-group-text">{{ max_length -
                vercotizacion.orden_de_compra.length }}</span>
            </div>
          </div>
        </div>
        <div class="row">
          <label for="nota-interna" class="col-sm-3 col-form-label text-end">Nota interna:</label>
          <div class="col-sm-9">
            <input v-model="vercotizacion.nota_interna" type="text" id="orden-de-compra" class="form-control"
              @change="guardarOrdenDeCompra(vercotizacion)" />
          </div>
        </div>
      </div>
      <div class="col-sm-3 text-end space-y-2">
        <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal">
          Cerrar
        </button>
      </div>

    </div>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
} from "vue";
import { useStore } from "vuex";
import { formatPrice, format, format4 } from "@/functions";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

const { vercotizacion, indexCotizacion, tipo } = defineProps({
  vercotizacion: Object,
  indexCotizacion: Number,
  tipo: String,
});
const store = useStore();
const detallecotizacion = computed(() => store.state.detallecotizacion);
const segmentocliente = computed(() => store.state.segmentocliente);
const proyecto = computed(() => store.state.proyecto);
const max_length = ref(20);

let errorMsg = ref("");

function verdiferenciacondicion(pedido) {
  let msg = "simon";
  swalInfo(
    "Cambio condición de pago",
    "de <b>" + pedido.COND_ID_ORIGINAL + "</b> a <b>" + pedido.COND_ID + "</b>"
  );
}

function verdiferenciaporcentaje(pedido) {
  let msg = "simon";
  swalInfo(
    "Cambio porcentaje de descuento",
    "de <b>" +
    pedido.porcentage_descuentooriginal +
    "%</b> a <b>" +
    pedido.porcentage_descuento +
    "%</b>"
  );
}

function verdiferenciadescripcion(articulo) {
  let msg = "simon";
  swalInfo(
    "Cambio de descripción de artículo",
    "de <br><b>" +
    articulo.ART_DESCRIPCION_ORIGINAL +
    "</b><br> a <br><b>" +
    articulo.ART_DESCRIPCION +
    "</b>"
  );
}

function verdiferenciavalor(articulo) {
  let msg = "simon";
  swalInfo(
    "Cambio de precio de artículo",
    "de <b>$" +
    articulo.ART_VALOR_ORIGINAL +
    "</b> a <b>$" +
    articulo.ART_VALOR +
    "</b>"
  );
}

function guardarOrdenDeCompra(cotizacion) {
  store.dispatch("guardarOrdenDeCompra", cotizacion);
}



onMounted(() => { });
onBeforeUnmount(() => { });
</script>
