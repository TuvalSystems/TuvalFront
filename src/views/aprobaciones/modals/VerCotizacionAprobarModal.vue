<template>
  <div class="quotation-approval">
  <BaseBlock title="Cotización por Aprobar" class="mb-0" transparent>
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Cerrar cotización">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm m-0 mb-2">
        <section class="quotation-section" aria-label="Información de la cotización">
          <dl class="quotation-details">
            <div><dt>Cotización</dt><dd>{{ vercotizacion.cotizacion || '—' }}</dd></div>
            <div><dt>RUC</dt><dd>{{ vercotizacion.CLI_RUC || '—' }}</dd></div>
            <div><dt>Razón social</dt><dd>{{ vercotizacion.CLI_RAZON_SOCIAL || '—' }}</dd></div>
            <div><dt>Punto de venta</dt><dd>{{ vercotizacion.PTO_VTA_DESCRIPCION || '—' }}</dd></div>
            <div><dt>Condición de pago</dt><dd>
              <button v-if="vercotizacion.COND_ID != vercotizacion.COND_ID_ORIGINAL" type="button" class="quotation-change" @click="verdiferenciacondicion(vercotizacion)">
                {{ vercotizacion.COND_ID_ORIGINAL }} → {{ vercotizacion.COND_ID }} <i class="fa fa-circle-info" aria-hidden="true"></i>
              </button>
              <span v-else>{{ vercotizacion.COND_ID || '—' }}</span>
            </dd></div>
            <div><dt>Forma de pago</dt><dd>{{ vercotizacion.DESC_FORMA_PAGO_TIPO_CREDITO || '—' }}</dd></div>
            <div><dt>Fecha y hora</dt><dd>{{ vercotizacion.created_at || '—' }}</dd></div>
            <div><dt>Descuento general</dt><dd>
              <button v-if="vercotizacion.porcentage_descuento != vercotizacion.porcentage_descuentooriginal" type="button" class="quotation-change" @click="verdiferenciaporcentaje(vercotizacion)">
                {{ vercotizacion.porcentage_descuento }}% <i class="fa fa-circle-info" aria-hidden="true"></i>
              </button>
              <span v-else>{{ vercotizacion.porcentage_descuento }}%</span>
            </dd></div>
            <div><dt>Usuario</dt><dd>{{ vercotizacion.USERID || '—' }}</dd></div>
            <div v-if="!detallecotizacion.loading"><dt>Tipo de despacho</dt><dd>{{ despachoCotizacion.tipo_despacho || 'Sin tipo de despacho' }}</dd></div>
            <div><dt>Nivel de precio</dt><dd>{{ nivelPrecioCotizacion || '—' }}</dd></div>
            <div class="quotation-segmentation">
              <dt>Segmentación:</dt>
              <dd v-if="segmentocliente?.data?.segmento || segmentocliente?.data?.subsegmento" class="d-flex flex-wrap gap-1">
                <span v-if="segmentocliente.data.segmento" class="badge rounded-pill bg-info text-light border border-info">{{ segmentocliente.data.segmento }}</span>
                <span v-if="segmentocliente.data.subsegmento" class="badge rounded-pill bg-primary text-light border border-primary">{{ segmentocliente.data.subsegmento }}</span>
              </dd>
              <dd v-else class="text-muted fst-italic"><i class="fa fa-ban me-1" aria-hidden="true"></i>Sin segmentación asignada</dd>
            </div>
          </dl>
        </section>
        <div v-if="!detallecotizacion.loading && despachoCotizacion.requiere_aprobacion_flete" class="alert alert-warning quotation-notice quotation-freight" role="status">
          <i class="fa fa-truck" aria-hidden="true"></i>
          <div class="quotation-freight-content">
            <strong>Pendiente de autorización de flete</strong>
            <span v-if="despachoCotizacion.motivo_aprobacion_flete">{{ despachoCotizacion.motivo_aprobacion_flete }}</span>
            <strong class="quotation-freight-amount">Flete: ${{ format(Number(despachoCotizacion.fle_valor ?? 0)) }}</strong>
          </div>
        </div>
        <div v-if="vercotizacion.nota_interna" class="alert alert-danger py-2 quotation-notice">
          <i class="fa fa-note-sticky" aria-hidden="true"></i><div><strong>Nota interna</strong><div class="quotation-note">{{ vercotizacion.nota_interna }}</div></div>
        </div>
        <div class="quotation-tables">
          <p v-if="vercotizacion.msg_registro_copia && vercotizacion.msg_registro_copia.startsWith('Cotización desde')"
            class="alert alert-danger">{{ vercotizacion.msg_registro_copia }}</p>
          <div v-if="estadodecuenta.data && !estadodecuenta.loading && estadodecuenta.data.cupoDisponible"
            class="quotation-credit" aria-label="Cupo del cliente">
            <span>Cupo asignado: <strong>${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoAsignado)) }}</strong></span>
            <span>Cupo disponible GP:
              <button v-if="estadodecuenta.data.cupoDisponible.cupoDisponibleGp < vercotizacion.total"
                type="button" class="quotation-change fw-semibold"
                @click="swalInfo('El total de la cotización supera el cupo disponible')">
                ${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}
              </button>
              <strong v-else>${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}</strong>
            </span>
          </div>
          <div v-if="detallecotizacion.loading" class="text-center py-5" role="status" aria-live="polite">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Cargando artículos...</span>
            </div>
          </div>
          <div class="quotation-section-heading"><h3>Detalle de artículos</h3><span v-if="!detallecotizacion.loading" class="text-muted">{{ detallecotizacion.data.length }} artículos</span></div>
          <p v-if="!detallecotizacion.loading && !detallecotizacion.data.length" class="text-muted text-center py-4">No hay artículos para mostrar.</p>
          <div class="table-responsive quotation-items">
          <table v-if="detallecotizacion.data.length && !detallecotizacion.loading"
            class="table table-sm table-borderless align-middle mb-0">
            <thead class="table-head-sticky">
              <tr>
                <th>#</th>
                <th>Código</th>
                <th class="quotation-description">Descripción</th>
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
                    <button v-if="hasChangePorcentil(articulo)"
                      @click="verPorcentajesDeCambio(articulo)" type="button" class="quotation-change">{{ articulo.ART_CODIGO }}</button>
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
                      v-if="articulo.ART_TIPO_COMPRA != 'L' && articulo.precio_sin_flete != articulo.ART_VALOR_ORIGINAL"
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
                <tr v-if="articulo.proveedores?.length">
                  <td colspan="11" class="provider-row">
                    <table class="table table-sm table-borderless align-middle mb-0">
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
            </tbody>
            <tfoot>
              <tr><td colspan="10" class="fw-semibold text-end text-uppercase py-1">Subtotal</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(vercotizacion.subtotal)) }}</td></tr>
              <tr><td colspan="10" class="fw-semibold text-end text-uppercase py-1">Descuento</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(vercotizacion.descuento)) }}</td></tr>
              <tr><td colspan="10" class="fw-semibold text-end text-uppercase py-1">Sub - desc</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(vercotizacion.subtotalmenosdescuento)) }}</td></tr>
              <tr><td colspan="10" class="fw-semibold text-end text-uppercase py-1">IVA</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(vercotizacion.iva)) }}</td></tr>
              <tr><td colspan="10" class="fw-semibold text-end text-uppercase py-1">Total</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(vercotizacion.total)) }}</td></tr>
            </tfoot>
          </table>
          </div>

        </div>

      </div>
    </template>
  </BaseBlock>
  <div class="quotation-footer bg-body border-top">
    <div class="row g-2 align-items-center">
      <label for="cotizacion-aprobacion-mensaje" class="col-sm-2 col-form-label text-sm-end fw-semibold">Mensaje:</label>
      <div class="col-sm-7">
        <input v-model="editable_aprobado_comercial_mensaje" type="text" id="cotizacion-aprobacion-mensaje" class="form-control form-control-sm"
          placeholder="Motivo de rechazo" @change="guardarMensaje(vercotizacion)" />
      </div>
      <div class="col-sm-3 text-sm-end quotation-actions">
        <button type="button" class="btn btn-success btn-sm" @click="emit('aprobar')"><i class="fa fa-check me-1" aria-hidden="true"></i> Aprobar</button>
        <button type="button" class="btn btn-danger btn-sm" @click="emit('rechazar')"><i class="fa fa-times me-1" aria-hidden="true"></i> Rechazar</button>
      </div>
    </div>
  </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore } from 'vuex'
import { swalInfo } from "@/functions/swal-alert.js";
import { format, format4 } from "@/functions";

const props = defineProps({
  vercotizacion: Object,
  indexCotizacion: Number,
  tipo: String,
});

const store = useStore();
const detallecotizacion = computed(() => store.state.detallecotizacion);
const estadodecuenta = computed(() => store.state.estadodecuenta);
const despachoCotizacion = computed(() => store.state.despachoCotizacion);
const segmentocliente = computed(() => store.state.segmentocliente);
const nivelPrecioCotizacion = computed(() => store.state.nivelPrecioCotizacion);

function guardarMensaje(pedido) {
  store.dispatch('guardarMensajeCotizacion', pedido)
}




const emit = defineEmits(["update:vercotizacion", "aprobar", "rechazar"]);

function escapeAlert(value) {
  return String(value ?? 'Sin dato').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function alertRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid rgba(128,128,128,.18);"><span>${escapeAlert(label)}</span><strong style="text-align:right;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">${escapeAlert(value)}</strong></div>`;
}

function comparisonAlert(title, original, actual, note = '') {
  return `<div style="text-align:left;font-size:14px;line-height:1.5;">
    <div style="padding:16px;border-radius:10px;background:rgba(54,185,220,.09);border:1px solid rgba(54,185,220,.3);">
      <div style="font-size:12px;font-weight:600;letter-spacing:.04em;">${escapeAlert(title)}</div>
      <div style="margin-top:14px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:12px;align-items:center;">
        <div><div style="font-size:12px;opacity:.7;margin-bottom:5px;">Original</div><strong style="overflow-wrap:anywhere;">${escapeAlert(original)}</strong></div>
        <span aria-label="cambia a" style="opacity:.55;font-size:22px;">→</span>
        <div><div style="font-size:12px;opacity:.7;margin-bottom:5px;">Actual</div><strong style="overflow-wrap:anywhere;">${escapeAlert(actual)}</strong></div>
      </div>
    </div>
    ${note ? `<p style="margin:12px 0 0;font-size:13px;">${escapeAlert(note)}</p>` : ''}
  </div>`;
}

function verdiferenciacondicion(cotizacion) {
  swalInfo('Cambio de condición de pago', comparisonAlert('CONDICIÓN DE PAGO', cotizacion.COND_ID_ORIGINAL, cotizacion.COND_ID));
}

function verdiferenciaporcentaje(cotizacion) {
  const original = Number(cotizacion.porcentage_descuentooriginal ?? 0);
  const actual = Number(cotizacion.porcentage_descuento ?? 0);
  const diferencia = actual - original;
  swalInfo('Cambio de descuento general', comparisonAlert('DESCUENTO GENERAL', `${original.toFixed(2)}%`, `${actual.toFixed(2)}%`, `Variación: ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)} puntos porcentuales.`));
}

function verdiferenciadescripcion(articulo) {
  swalInfo('Cambio de descripción', comparisonAlert('DESCRIPCIÓN DEL ARTÍCULO', articulo.ART_DESCRIPCION_ORIGINAL, articulo.ART_DESCRIPCION));
}

function verdiferenciavalor(articulo) {
  const precioOriginal = Number(articulo.ART_VALOR_ORIGINAL ?? 0);
  const precioSinFlete = Number(articulo.precio_sin_flete ?? 0);
  const precioConFlete = Number(articulo.ART_VALOR ?? 0);
  const diferencia = precioSinFlete - precioOriginal;
  const signo = diferencia > 0 ? '+' : diferencia < 0 ? '−' : '';
  const porcentaje = precioOriginal !== 0 ? `${signo}${Math.abs(diferencia / precioOriginal * 100).toFixed(2)}%` : 'No aplica';
  const estado = diferencia > 0 ? 'Aumento' : diferencia < 0 ? 'Reducción' : 'Sin cambio';
  const html = `
    <div style="text-align:left;font-size:14px;line-height:1.5;">
      <div style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid rgba(128,128,128,.2);">
        <span>Precio original</span>
        <strong style="font-variant-numeric:tabular-nums;white-space:nowrap;">$${format4(precioOriginal)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid rgba(128,128,128,.2);">
        <span>Precio sin flete</span>
        <strong style="font-variant-numeric:tabular-nums;white-space:nowrap;">$${format4(precioSinFlete)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;">
        <span>Precio con flete</span>
        <strong style="font-variant-numeric:tabular-nums;white-space:nowrap;">$${format4(precioConFlete)}</strong>
      </div>
      <div style="margin-top:16px;padding:16px;border-radius:10px;background:rgba(54,185,220,.09);border:1px solid rgba(54,185,220,.3);">
        <div style="font-size:12px;font-weight:600;letter-spacing:.04em;">CAMBIO DEL PRECIO SIN FLETE</div>
        <div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px;margin:14px 0;font-size:21px;font-weight:700;font-variant-numeric:tabular-nums;">
          <span>$${format4(precioOriginal)}</span>
          <span aria-label="cambia a" style="opacity:.55;">→</span>
          <span>$${format4(precioSinFlete)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid rgba(54,185,220,.2);padding-top:12px;">
          <span>${estado} <strong style="white-space:nowrap;">${signo}$${format4(Math.abs(diferencia))}</strong></span>
          <strong style="padding:3px 10px;border-radius:20px;background:rgba(54,185,220,.14);">${porcentaje}</strong>
        </div>
      </div>
      <p style="margin:10px 0 0;font-size:12px;opacity:.75;">La variación compara el precio original con el precio sin flete.</p>
    </div>
  `;
  swalInfo('Cambio de precio', html);
}
function verdiferenciadescuento(articulo) {
  const original = Number(articulo.descuento_original ?? 0);
  const actual = Number(articulo.descuento ?? 0);
  const diferencia = actual - original;
  swalInfo('Cambio de descuento del artículo', comparisonAlert('DESCUENTO DEL ARTÍCULO', `${original.toFixed(2)}%`, `${actual.toFixed(2)}%`, `Variación: ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)} puntos porcentuales.`));
}

const hasChangePorcentil = (articulo) => {
 const pChange = Number.parseFloat(articulo.priceChange) || 0;
  const dChange = Number.parseFloat(articulo.discountChange) || 0;

  return Math.abs(pChange) > 0.01 || Math.abs(dChange) > 0.01;
};
function verPorcentajesDeCambio(articulo) {
  const discount = Number(articulo.discountChange ?? 0);
  const price = Number(articulo.priceChange ?? 0);
  const reglas = articulo.reglasAprobacion || {};
  const reglaDescuento = reglas.regla_descuento || { min: 0, max: 0 };
  const reglaPrecio = reglas.regla_precio || { min: 0, max: 0 };
  const variationCard = (label, value, regla) => {
    const fuera = value < Number(regla.min) || value > Number(regla.max);
    const tint = fuera ? '220,120,65' : '54,185,220';
    return `<div style="padding:14px;border-radius:10px;background:rgba(${tint},.09);border:1px solid rgba(${tint},.3);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><strong>${label}</strong><strong style="font-size:22px;font-variant-numeric:tabular-nums;">${value > 0 ? '+' : ''}${value.toFixed(2)}%</strong></div>
      <div style="font-size:12px;margin-top:8px;">Límite permitido: <strong>${escapeAlert(regla.min)}% a ${escapeAlert(regla.max)}%</strong></div>
      <div style="font-size:12px;margin-top:5px;font-weight:600;">${fuera ? 'Fuera de tu rango permitido' : 'Dentro de tu rango permitido'}</div>
    </div>`;
  };
  const html = `<div style="text-align:left;font-size:14px;line-height:1.5;">
    <div style="font-size:12px;font-weight:600;letter-spacing:.04em;margin-bottom:4px;">PRECIOS Y DESCUENTO</div>
    ${alertRow('Precio original', '$' + format4(Number(articulo.ART_VALOR_ORIGINAL ?? 0)))}
    ${alertRow('Precio sin flete', '$' + format4(Number(articulo.precio_sin_flete ?? 0)))}
    ${alertRow('Precio con flete', '$' + format4(Number(articulo.ART_VALOR ?? 0)))}
    ${alertRow('Descuento aplicado', Number(articulo.descuento ?? 0).toFixed(2) + '%')}
    <div style="font-size:12px;font-weight:600;letter-spacing:.04em;margin:18px 0 10px;">VARIACIONES Y TUS LÍMITES</div>
    <div style="display:grid;gap:10px;">
      ${variationCard('Precio sin flete', price, reglaPrecio)}
      ${variationCard('Descuento', discount, reglaDescuento)}
    </div>
    <p style="margin:10px 0 0;font-size:12px;opacity:.75;">La variación de precio compara el precio original con el precio sin flete.</p>
  </div>`;
  swalInfo('Análisis de aprobación', html);
}

onMounted(() => {
});
onBeforeUnmount(() => {
});
const editable_aprobado_comercial_mensaje = computed({
  get: () => props.vercotizacion.aprobado_comercial_mensaje,
  set: (value) => emit("update:vercotizacion", { aprobado_comercial_mensaje: value }),
});
</script>
<style scoped>
.quotation-approval { display: flex; flex-direction: column; max-height: calc(100dvh - 3.5rem); overflow: hidden; }
.quotation-approval :deep(.block) { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.quotation-approval :deep(.block-header) { flex-shrink: 0; }
.quotation-approval :deep(.block-content) { min-height: 0; overflow-y: auto; padding-top: .65rem; }
.quotation-section { margin-bottom: .5rem; }
.quotation-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .3rem .75rem; margin: 0; }
.quotation-details > div:not(.quotation-segmentation) { display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
.quotation-details dt { flex-shrink: 0; display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6c757d; margin-bottom: 0; line-height: 1.3; }
.quotation-details dd { margin: 0; font-weight: 600; font-size: .8rem; line-height: 1.3; overflow-wrap: anywhere; min-width: 0; }
.quotation-segmentation { grid-column: 1 / -1; display: flex; align-items: center; flex-wrap: wrap; gap: .35rem; padding-top: .15rem; }
.quotation-segmentation dt { margin: 0; }
.quotation-segmentation .badge { font-size: 12px; white-space: normal; text-align: left; }
.quotation-change { background: transparent; border: 0; padding: 0; color: var(--bs-danger, #dc3545); text-decoration: underline dotted; text-underline-offset: 3px; text-align: inherit; font: inherit; cursor: pointer; }
.quotation-notice { display: flex; align-items: baseline; gap: .5rem; padding: .4rem .65rem; margin-bottom: .5rem; font-size: .8rem; }
.quotation-freight-content { display: flex; align-items: baseline; flex-wrap: wrap; gap: .2rem .65rem; flex: 1; min-width: 0; overflow-wrap: anywhere; }
.quotation-freight-amount { margin-left: auto; white-space: nowrap; }
.quotation-note { white-space: pre-wrap; overflow-wrap: anywhere; }
.quotation-credit { display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem 1.5rem; margin-bottom: .65rem; padding: .4rem .65rem; background: var(--tuval-surface-muted, #f8f9fa); border-radius: .25rem; font-size: .8rem; font-variant-numeric: tabular-nums; }
.quotation-credit > span { white-space: nowrap; }
.quotation-section-heading { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: .5rem; }
.quotation-section-heading h3 { font-size: .875rem; margin: 0; }
.quotation-items > table { min-width: 980px; }
.quotation-items .table-head-sticky th { position: sticky; top: 0; background: var(--tuval-surface, #fff); z-index: 1; }
.quotation-items th { white-space: nowrap; text-transform: uppercase; }
.quotation-items .quotation-description { min-width: 230px; }
.quotation-items .text-end { font-variant-numeric: tabular-nums; white-space: nowrap; }
.quotation-items td.text-end { font-weight: 600; }
.quotation-items > table > tbody > tr > td:nth-child(2) { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace; }
.provider-row { background: var(--tuval-surface-muted, #f8f9fa); border-radius: .5rem; padding: .5rem !important; }
.quotation-footer { flex-shrink: 0; padding: 1rem 1.25rem; }
.quotation-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .25rem; }
@media (min-width: 992px) {
  .quotation-items .table.table-sm > :not(caption) > * > * { padding-top: .35rem; padding-bottom: .35rem; }
}
@media (max-width: 767.98px) {
  .quotation-approval { max-height: calc(100dvh - 1rem); }
  .quotation-details { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .quotation-approval :deep(.block-content) { padding: .75rem; }
  .quotation-footer { padding: .75rem; }
}
@media (max-width: 575.98px) {
  .quotation-actions { justify-content: flex-start; }
  .quotation-freight-amount { margin-left: 0; }
}
</style>
