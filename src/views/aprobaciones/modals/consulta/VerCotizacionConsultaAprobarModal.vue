<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore } from 'vuex'
import {  swalInfo } from "@/functions/swal-alert.js";
import {  format, format4 } from "@/functions";

defineProps({
  vercotizacion: Object,
  indexCotizacion: Number,
  tipo: String,
});

const store = useStore();
const detallecotizacion = computed(() => store.state.detallecotizacion);
const estadodecuenta = computed(() => store.state.estadodecuenta);
const segmentocliente = computed(() => store.state.segmentocliente);
const nivelPrecioCotizacion = computed(() => store.state.nivelPrecioCotizacion);



defineEmits(["aprobar", "rechazar"]);

function verdiferenciacondicion(cotizacion) {

  swalInfo('Cambio condición de pago', 'de <b>' + cotizacion.COND_ID_ORIGINAL + '</b> a <b>' + cotizacion.COND_ID + '</b>');
}

function verdiferenciaporcentaje(cotizacion) {

  swalInfo('Cambio porcentaje de descuento', 'de <b>' + cotizacion.porcentage_descuentooriginal + '%</b> a <b>' + cotizacion.porcentage_descuento + '%</b>');
}

function verdiferenciadescripcion(articulo) {

  swalInfo('Cambio de descripción de artículo', 'de <br><b>' + articulo.ART_DESCRIPCION_ORIGINAL + '</b><br> a <br><b>' + articulo.ART_DESCRIPCION + '</b>');
}

function verdiferenciavalor(articulo) {

  swalInfo('Cambio de precio de artículo', 'de <b>$' + articulo.ART_VALOR_ORIGINAL + '</b> a <b>$' + articulo.ART_VALOR + '</b>');
}
function verdiferenciadescuento(articulo) {

  swalInfo('Cambio de descuento de artículo', 'de <b>' + articulo.descuento_original + '%</b> a <b>$' + articulo.descuento + '%</b>');
}

const hasChangePorcentil = (articulo) => {
 const pChange = Number.parseFloat(articulo.priceChange) || 0;
  const dChange = Number.parseFloat(articulo.discountChange) || 0;

  return Math.abs(pChange) > 0.01 || Math.abs(dChange) > 0.01;
};
function verPorcentajesDeCambio(articulo) {
  const discount = Number(articulo.discountChange ?? 0);
  const price = Number(articulo.priceChange ?? 0);

  const discountLabel = `${discount.toFixed(2)}%`;
  const priceLabel = `${price.toFixed(2)}%`;

  const reglas = articulo.reglasAprobacion || {};
  const reglaDescuento = reglas.regla_descuento || { min: 0, max: 0 };
  const reglaPrecio = reglas.regla_precio || { min: 0, max: 0 };

  const html = `
    <div style="text-align: left; font-size: 15px;">
      <p class="mb-1"><b>Modificación del artículo:</b></p>
      <ul style="margin-bottom: 15px;">
        <li>Cambio en Descuento: <b>${discountLabel}</b></li>
        <li>Cambio en Precio: <b>${priceLabel}</b></li>
      </ul>
      
      <hr>
      
      <p class="mb-1"><b>Tus límites permitidos:</b></p>
      <ul>
        <li>Descuento: Desde <b class="text-primary">${reglaDescuento.min}%</b> hasta <b class="text-primary">${reglaDescuento.max}%</b></li>
        <li>Precio: Desde <b class="text-primary">${reglaPrecio.min}%</b> hasta <b class="text-primary">${reglaPrecio.max}%</b></li>
      </ul>
    </div>
  `;

  swalInfo(
    'Análisis de Aprobación',
    html
  );
}

onMounted(() => {
});
onBeforeUnmount(() => {
});
</script>
<template>
  <BaseBlock title="Cotizacion por aprobar" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm ">
        <div class="table-responsive">
          <table class="table table-striped table-sm table-vcenter">
            <tbody>
              <tr>
                <th class="fs-sm">Cotización</th>
                <td class="fs-sm">{{ vercotizacion.cotizacion }}</td>
                <th class="fs-sm">RUC</th>
                <td class="fs-sm">{{ vercotizacion.CLI_RUC }}</td>
                <th class="fs-sm">Razón Social</th>
                <td class="fs-sm">{{ vercotizacion.CLI_RAZON_SOCIAL }}</td>
              </tr>
              <tr>
                <th class="fs-sm">P. de venta</th>
                <td class="fs-sm">
                  {{ vercotizacion.PTO_VTA_DESCRIPCION }}
                </td>

                <th class="fs-sm">Cond. Pago</th>
                <td class="fs-sm">
                  <a class="text-danger" v-if="vercotizacion.COND_ID != vercotizacion.COND_ID_ORIGINAL"
                    @click="verdiferenciacondicion(vercotizacion)" href="javascript:void(0);">
                    de {{ vercotizacion.COND_ID_ORIGINAL }} a {{ vercotizacion.COND_ID }}
                  </a>
                  <span v-else>{{ vercotizacion.COND_ID }}</span>
                </td>
                <th class="fs-sm">Forma de pago</th>
                <td class="fs-sm">{{ vercotizacion.DESC_FORMA_PAGO_TIPO_CREDITO }}</td>
              </tr>
              <tr>
                <th class="fs-sm">Fecha/hora</th>
                <td class="fs-sm">
                  {{ vercotizacion.created_at }}
                </td>
                <th class="fs-sm">% Descuento</th>
                <td class="fs-sm">
                  <a class="text-danger"
                    v-if="vercotizacion.porcentage_descuento != vercotizacion.porcentage_descuentooriginal"
                    @click="verdiferenciaporcentaje(vercotizacion)" href="javascript:void(0);">{{
                      vercotizacion.porcentage_descuento }}</a>
                  <span v-else>{{ vercotizacion.porcentage_descuento }}</span>
                </td>

                <th class="fs-sm">Fecha/hora</th>
                <td class="fs-sm">
                  {{ vercotizacion.created_at }}
                </td>
              </tr>
              <tr>
                <th class="fs-sm">Usuario</th>
                <td class="fs-sm">{{ vercotizacion.USERID }}</td>
              </tr>
              <tr v-if="segmentocliente && segmentocliente.data && Object.keys(segmentocliente.data).length">
                <th>Segmento</th>
                <td>{{ segmentocliente.data.segmento }}</td>
                <th>Subsegmento</th>
                <td colspan="3">{{ segmentocliente.data.subsegmento }}</td>
              </tr>
              <tr v-else>
                <td colspan="6" class="text-muted">Sin segmento para este cliente</td>
              </tr>
              <tr>
                <td>Nivel de Precio</td>
                <td colspan="6">{{ nivelPrecioCotizacion }}</td>
              </tr>
              <tr>
                <th v-if="vercotizacion.nota_interna" class="fs-sm text-danger">Nota interna</th>
                <td v-if="vercotizacion.nota_interna" class="fs-sm text-danger" colspan="5">
                  {{ vercotizacion.nota_interna }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="vercotizacion.msg_registro_copia && vercotizacion.msg_registro_copia.startsWith('Cotización desde')"
            class="alert alert-danger">{{ vercotizacion.msg_registro_copia }}</p>
          <table v-if="estadodecuenta.data && !estadodecuenta.loading && estadodecuenta.data.cupoDisponible"
            class="table table-sm table-bordered">
            <thead>
              <tr class="table-success">
                <th colspan="2">Cupo disponible</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cupo Asignado</td>
                <td class="text-end">${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoAsignado)) }}</td>
              </tr>
              <tr>
                <td>Cupo Disponible GP</td>
                <td class="text-end">
                  <a v-if="estadodecuenta.data.cupoDisponible.cupoDisponibleGp < vercotizacion.total"
                    class="text-danger" href="javascript:void(0);"
                    @click="swalInfo('El total del pedido supera el cupo disponible')">
                    ${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}
                  </a>
                  <span v-else>
                    ${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}
                  </span>

                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="detallecotizacion.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <table v-if="detallecotizacion.data.length && !detallecotizacion.loading"
            class="table table-hover table-sm table-vcenter mt-4">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>CTL</th>
                <th class="text-center">Clas. Tuval</th>
                <th>UDM</th>
                <th class="text-end">Cantidad</th>
                <th class="text-end">Precio</th>
                <th class="text-end">%Mod.</th>
                <th class="text-end">%Descuento</th>
                <th class="text-end">Total</th>

              </tr>
            </thead>
            <tbody>
              <template v-for="(articulo, index) in detallecotizacion.data" :key="index">
                <tr>
                  <td class="fs-sm">{{ index + 1 }}</td>
                  <td class="fs-sm">
                    <span v-if="hasChangePorcentil(articulo)"
                      @click="verPorcentajesDeCambio(articulo)" class="text-danger">{{ articulo.ART_CODIGO }}</span>
                    <span v-else>{{ articulo.ART_CODIGO }}</span>

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
                  <td class="fs-sm text-center">
                    {{ articulo.clasificacion_tuval }}
                  </td>
                  <td class="fs-sm">
                    {{ articulo.ART_PLAN_UMEDIDA }}
                  </td>
                  <td class="fs-sm text-end">
                    {{ articulo.ART_CANTIDAD }}
                  </td>

                  <td class="fs-sm text-end">
                    <a class="text-danger"
                      v-if="articulo.ART_TIPO_COMPRA != 'L' && articulo.ART_VALOR != articulo.ART_VALOR_ORIGINAL"
                      @click="verdiferenciavalor(articulo)" href="javascript:void(0);">
                      ${{ format4(parseFloat(articulo.ART_VALOR)) }}
                    </a>
                    <span v-else>${{ format4(parseFloat(articulo.ART_VALOR)) }}</span>
                  </td>
                  <td class="fs-sm text-end" :class="articulo.modificador > 0 ? 'text-danger' : ''">
                    <span v-if="articulo.ART_TIPO_COMPRA != 'L'">
                      {{ format(parseFloat(articulo.modificador)) }}%
                    </span>
                  </td>
                  <td class="fs-sm text-end">
                    <a class="text-danger" v-if="articulo.descuento != articulo.descuento_original"
                      @click="verdiferenciadescuento(articulo)" href="javascript:void(0);">{{ articulo.descuento }}%</a>
                    <span v-else>{{ format(parseFloat(articulo.descuento)) }}%</span>

                  </td>
                  <td class="fs-sm text-end">
                    ${{ format(parseFloat((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD)) }}
                  </td>
                </tr>
                <tr v-if="articulo.proveedores.length">
                  <td colspan="11" style="background:var(--tuval-surface-muted)">
                    <table class="table table-sm table-vcenter">
                      <tr>
                        <th>Descripción L</th>
                        <th class="text-end">Cantidad</th>
                        <th class="text-end">Precio de venta mínimo</th>
                        <th class="text-end">Margen</th>
                        <th class="text-end">Costo unitario</th>
                        <th class="text-end">Proveedor</th>
                      </tr>
                      <tr v-for="(proveedor, indice) in articulo.proveedores" :key="indice">
                        <td>{{ proveedor.DESCRIPCION_ARTICULO }}</td>
                        <td class="text-end">{{ proveedor.CANTIDAD }}</td>
                        <td class="text-end text-danger">${{ proveedor.margen }}</td>
                        <td class="text-end">{{ proveedor.MARGEN }}%</td>
                        <td class="text-end">${{ proveedor.COSTO_UNITARIO }}</td>
                        <td class="text-end">{{ proveedor.PROV_RAZON_SOCIAL }}</td>

                      </tr>
                    </table>
                  </td>
                </tr>
              </template>
              <tr>
                <th colspan="10" class="fs-sm text-end">Subtotal</th>
                <th class="fs-sm text-end">${{ format(parseFloat(vercotizacion.subtotal)) }}</th>
              </tr>
              <tr>
                <th colspan="10" class="fs-sm text-end">Descuento</th>
                <th class="fs-sm text-end">${{ format(parseFloat(vercotizacion.descuento)) }}</th>
              </tr>
              <tr>
                <th colspan="10" class="fs-sm text-end">Subtotal - descuento</th>
                <th class="fs-sm text-end">${{ format(parseFloat(vercotizacion.subtotalmenosdescuento)) }}</th>
              </tr>
              <tr>
                <th colspan="10" class="fs-sm text-end">IVA</th>
                <th class="fs-sm text-end">${{ format(parseFloat(vercotizacion.iva)) }}</th>
              </tr>
              <tr>
                <th colspan="10" class="fs-sm text-end">Total</th>
                <th class="fs-sm text-end">${{ format(parseFloat(vercotizacion.total)) }}</th>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
  </div>
</template>
