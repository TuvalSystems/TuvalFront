<template>
  <div class="quotation-approval">
  <BaseBlock title="Pedido por Aprobar" class="mb-0" transparent>
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Cerrar pedido">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm m-0 mb-2">
        <section class="quotation-section" aria-label="Información del pedido">
          <dl class="quotation-details">
            <div><dt>Pedido</dt><dd>{{ verpedido.pedido || '—' }}</dd></div>
            <div><dt>RUC</dt><dd>{{ verpedido.CLI_RUC || '—' }}</dd></div>
            <div><dt>Razón social</dt><dd>{{ verpedido.CLI_RAZON_SOCIAL || '—' }}</dd></div>
            <div><dt>Punto de venta</dt><dd>{{ verpedido.PTO_VTA_DESCRIPCION || '—' }}</dd></div>
            <div><dt>Condición de pago</dt><dd>
              <button v-if="verpedido.COND_ID != verpedido.COND_ID_ORIGINAL" type="button" class="quotation-change" @click="verdiferenciacondicion(verpedido)">
                {{ verpedido.COND_ID_ORIGINAL }} → {{ verpedido.COND_ID }} <i class="fa fa-circle-info" aria-hidden="true"></i>
              </button>
              <span v-else>{{ verpedido.COND_ID || '—' }}</span>
            </dd></div>
            <div><dt>Forma de pago</dt><dd>{{ verpedido.DESC_FORMA_PAGO_TIPO_CREDITO || '—' }}</dd></div>
            <div><dt>Fecha y hora</dt><dd>{{ verpedido.created_at || '—' }}</dd></div>
            <div><dt>Descuento general</dt><dd>
              <button v-if="verpedido.porcentage_descuento != verpedido.porcentage_descuentooriginal" type="button" class="quotation-change" @click="verdiferenciaporcentaje(verpedido)">
                {{ verpedido.porcentage_descuento }}% <i class="fa fa-circle-info" aria-hidden="true"></i>
              </button>
              <span v-else>{{ verpedido.porcentage_descuento }}%</span>
            </dd></div>
            <div><dt>Usuario</dt><dd>{{ verpedido.USERID || '—' }}</dd></div>
            <div v-if="!detallepedido.loading"><dt>Tipo de despacho</dt><dd>{{ despachoPedido.tipo_despacho || 'Sin tipo de despacho' }}</dd></div>
            <div><dt>Bodega</dt><dd>{{ verpedido.BOD_BODEGA || '—' }}</dd></div>
            <div><dt>Nivel de precio</dt><dd>{{ nivelPrecioCliente || '—' }}</dd></div>
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
        <div v-if="!detallepedido.loading && despachoPedido.requiere_aprobacion_flete" class="alert alert-warning quotation-notice quotation-freight" role="status">
          <i class="fa fa-truck" aria-hidden="true"></i>
          <div class="quotation-freight-content">
            <strong>Pendiente de autorización de flete</strong>
            <span v-if="despachoPedido.motivo_aprobacion_flete">{{ despachoPedido.motivo_aprobacion_flete }}</span>
            <strong class="quotation-freight-amount">Flete: ${{ format(Number(despachoPedido.fle_valor ?? 0)) }}</strong>
          </div>
        </div>
        <div v-if="verpedido.nota_interna" class="alert alert-danger py-2 quotation-notice">
          <i class="fa fa-note-sticky" aria-hidden="true"></i><div><strong>Nota interna</strong><div class="quotation-note">{{ verpedido.nota_interna }}</div></div>
        </div>
        <div class="quotation-tables">
          <p v-if="verpedido.msg_registro_copia && verpedido.msg_registro_copia.startsWith('Requiere aprobación')"
            class="alert alert-danger">{{ verpedido.msg_registro_copia }}</p>
          <div v-if="estadodecuenta.data && !estadodecuenta.loading && estadodecuenta.data.cupoDisponible"
            class="quotation-credit" aria-label="Cupo del cliente">
            <span>Cupo asignado: <strong>${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoAsignado)) }}</strong></span>
            <span>Cupo disponible GP:
              <button v-if="estadodecuenta.data.cupoDisponible.cupoDisponibleGp < verpedido.total"
                type="button" class="quotation-change fw-semibold"
                @click="swalInfo('El total del pedido supera el cupo disponible')">
                ${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}
              </button>
              <strong v-else>${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}</strong>
            </span>
          </div>
          <div v-if="detallepedido.loading" class="text-center py-5" role="status" aria-live="polite">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Cargando artículos...</span>
            </div>
          </div>

          <div class="quotation-section-heading"><h3>Detalle de artículos</h3><span v-if="!detallepedido.loading" class="text-muted">{{ detallepedido.data.length }} artículos</span></div>
          <p v-if="!detallepedido.loading && !detallepedido.data.length" class="text-muted text-center py-4">No hay artículos para mostrar.</p>
          <div class="table-responsive quotation-items">
          <table v-if="detallepedido.data.length && !detallepedido.loading"
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
                <th class="text-end">% Desc.</th>
                <th class="text-end">Descuento</th>
                <th class="text-end">Total</th>

              </tr>
            </thead>
            <tbody v-for="(articulo, index) in detallepedido.data" :key="index"
              class="article-group" :class="{ 'article-group-l': articulo.ART_TIPO_COMPRA === 'L' || articulo.proveedores?.length }">
                <tr class="article-main">
                  <td class="fs-sm">{{ index + 1 }}</td>
                  <td class="fs-sm">
                    <button v-if="hasChangePorcentil(articulo)" @click="verPorcentajesDeCambio(articulo)"
                      type="button" class="quotation-change">{{ articulo.ART_CODIGO }}</button>
                    <span v-else>{{ articulo.ART_CODIGO }}</span>
                    <span v-if="articulo.ART_TIPO_COMPRA === 'L'" class="article-l-badge">L</span>

                  </td>
                  <td class="fs-sm">
                    <a class="text-danger"
                      v-if="articulo.approval_descripcion === true && articulo.ART_TIPO_COMPRA !== 'L'"
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
                    <a class="text-danger" v-if="articulo.ART_TIPO_COMPRA != 'L' && hasPriceChangeWithoutFreight(articulo)"
                      @click="verdiferenciavalor(articulo)" href="javascript:void(0);">
                      ${{ articulo.ART_VALOR }}
                    </a>
                    <span v-else>${{ articulo.ART_VALOR }}</span>
                  </td>
                  <td class="fs-sm text-end" :class="articulo.approval_modificador === true ? 'text-danger' : ''">
                    <span v-if="articulo.ART_TIPO_COMPRA != 'L'">
                      {{ format(parseFloat(articulo.modificador)) }}%
                    </span>
                  </td>
                  <td class="fs-sm text-end">
                    <a class="text-danger"
                      v-if="articulo.ART_TIPO_COMPRA != 'L' && articulo.approval_descuento === true"
                      @click="verdiferenciadescuento(articulo)" href="javascript:void(0);">
                      {{ articulo.descuento }}%
                    </a>
                    <span v-else>{{ articulo.descuento }}%</span>
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format4(parseFloat(articulo.ART_DESCUENTO)) }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format(parseFloat((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD)) }}
                  </td>
                </tr>
                <tr v-if="articulo.proveedores?.length">
                  <td colspan="12" class="provider-row">
                    <div class="provider-details" aria-label="Detalle de proveedores del artículo">
                      <div v-for="(proveedor, indice) in articulo.proveedores" :key="indice" class="provider-entry">
                        <div class="provider-description"><span class="provider-label">Descripción L</span><span>{{ proveedor.DESCRIPCION_ARTICULO }}</span></div>
                        <dl class="provider-metrics">
                          <div><dt>Cant.</dt><dd>{{ proveedor.CANTIDAD }}</dd></div>
                          <div><dt>Venta mín.</dt><dd>${{ proveedor.margen }}</dd></div>
                          <div><dt>Margen</dt><dd>{{ proveedor.MARGEN }}%</dd></div>
                          <div><dt>Costo unit.</dt><dd>${{ proveedor.COSTO_UNITARIO }}</dd></div>
                        </dl>
                        <div class="provider-name"><span class="provider-label">Proveedor</span><span>{{ proveedor.PROV_RAZON_SOCIAL }}</span></div>
                      </div>
                    </div>
                  </td>
                </tr>
            </tbody>
            <tfoot>
              <tr><td colspan="11" class="fw-semibold text-end text-uppercase py-1">Subtotal</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(verpedido.subtotal)) }}</td></tr>
              <tr><td colspan="11" class="fw-semibold text-end text-uppercase py-1">Descuento</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(verpedido.descuento)) }}</td></tr>
              <tr><td colspan="11" class="fw-semibold text-end text-uppercase py-1">Sub - desc</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(verpedido.subtotalmenosdescuento)) }}</td></tr>
              <tr><td colspan="11" class="fw-semibold text-end text-uppercase py-1">IVA</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(verpedido.iva)) }}</td></tr>
              <tr><td colspan="11" class="fw-semibold text-end text-uppercase py-1">Total</td><td class="fw-semibold text-end nums py-1">${{ format(parseFloat(verpedido.total)) }}</td></tr>
            </tfoot>
          </table>
          </div>
        </div>

      </div>
    </template>
  </BaseBlock>
  <div class="quotation-footer bg-body border-top">
    <div class="row g-2 align-items-center">
      <label for="pedido-aprobacion-mensaje" class="col-sm-2 col-form-label text-sm-end fw-semibold">Mensaje:</label>
      <div class="col-sm-7">
        <input v-model="editable_aprobado_comercial_mensaje" type="text" id="pedido-aprobacion-mensaje" class="form-control form-control-sm"
          placeholder="Motivo de rechazo" @change="guardarMensaje(verpedido)" />
      </div>
      <div class="col-sm-3 text-sm-end quotation-actions">
        <button type="button" class="btn btn-success btn-sm" @click="approveOrder"><i class="fa fa-check me-1" aria-hidden="true"></i> Aprobar</button>
        <button type="button" class="btn btn-danger btn-sm" @click="rejectedOrder"><i class="fa fa-times me-1" aria-hidden="true"></i> Rechazar</button>
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
  verpedido: Object,
  indexPedido: Number,
  tipo: String,
});

const store = useStore();
const detallepedido = computed(() => store.state.detallepedido);
const despachoPedido = computed(() => {
  const detalle = store.state.despachoPedido || {};
  return {
    tipo_despacho: detalle.tipo_despacho ?? props.verpedido.tipo_despacho,
    requiere_aprobacion_flete: detalle.requiere_aprobacion_flete ?? props.verpedido.requiere_aprobacion_flete,
    motivo_aprobacion_flete: detalle.motivo_aprobacion_flete ?? props.verpedido.motivo_aprobacion_flete,
    fle_valor: detalle.fle_valor ?? props.verpedido.fle_valor,
  };
});
const estadodecuenta = computed(() => store.state.estadodecuenta);
const segmentocliente = computed(() => store.state.segmentocliente);
const nivelPrecioCliente = computed(() => store.state.nivelPrecioClienteDetalle);


function guardarMensaje(pedido) {
  store.dispatch('guardarMensajePedido', pedido)
}




const emit = defineEmits(["update:verpedido", "aprobar", "rechazar"]);

function approveOrder() {
  emit("aprobar", {
    id: props.verpedido?.id,
    message: props.verpedido?.aprobado_comercial_mensaje,
  });
}

function rejectedOrder() {
  emit("rechazar", {
    id: props.verpedido?.id,
    message: props.verpedido?.aprobado_comercial_mensaje,
  });
}

function verdiferenciacondicion(pedido) {

  swalInfo('Cambio condición de pago', 'de <b>' + pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

function verdiferenciaporcentaje(pedido) {

  swalInfo('Cambio porcentaje de descuento', 'de <b>' + pedido.porcentage_descuentooriginal + '%</b> a <b>' + pedido.porcentage_descuento + '%</b>');
}

function verdiferenciadescripcion(articulo) {

  swalInfo('Cambio de descripción de artículo', 'de <br><b>' + articulo.ART_DESCRIPCION_ORIGINAL + '</b><br> a <br><b>' + articulo.ART_DESCRIPCION + '</b>');
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

  swalInfo('Cambio de porcentaje de descuento', 'de <b>' + articulo.descuento_original + '%</b> a <b>' + articulo.descuento + '%</b>');
}


function escapeAlert(value) {
  return String(value ?? 'Sin dato').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function alertRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid rgba(128,128,128,.18);"><span>${escapeAlert(label)}</span><strong style="text-align:right;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">${escapeAlert(value)}</strong></div>`;
}

function priceChangeWithoutFreight(articulo) {
  const original = Number(articulo.ART_VALOR_ORIGINAL);
  const actual = Number(articulo.precio_sin_flete);
  if (articulo.ART_VALOR_ORIGINAL == null || articulo.precio_sin_flete == null
    || !Number.isFinite(original) || !Number.isFinite(actual) || original === 0) return 0;
  return (actual - original) / original * 100;
}

function hasPriceChangeWithoutFreight(articulo) {
  return articulo.precio_sin_flete != null && articulo.ART_VALOR_ORIGINAL != null
    && Number(articulo.precio_sin_flete) !== Number(articulo.ART_VALOR_ORIGINAL);
}

const hasChangePorcentil = (articulo) => {
  const pChange = priceChangeWithoutFreight(articulo);
  const dChange = Number.parseFloat(articulo.discountChange) || 0;

  return Math.abs(pChange) > 0.01 || Math.abs(dChange) > 0.01;
};
function verPorcentajesDeCambio(articulo) {
  const discount = Number(articulo.discountChange ?? 0);
  const price = priceChangeWithoutFreight(articulo);
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
  get: () => props.verpedido.aprobado_comercial_mensaje,
  set: (value) => emit("update:verpedido", { aprobado_comercial_mensaje: value }),
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
.quotation-details dt { flex-shrink: 0; display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--tuval-text-muted); margin-bottom: 0; line-height: 1.3; }
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
.quotation-items > table > tbody > tr > td:nth-child(2) { white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace; }
.article-group .article-main > td { border-top: 1px solid var(--bs-border-color, #e4e7ed); }
.article-group-l .article-main > td { background: var(--tuval-surface-muted, #f8f9fa); }
.article-group-l .article-main > td:first-child { border-left: 3px solid var(--bs-info, #36b9dc); }
.article-l-badge { display: inline-block; margin-left: .25rem; padding: 0 .25rem; border-radius: .2rem; background: rgba(var(--bs-info-rgb), .14); color: var(--bs-info, #1686a2); font: 700 10px/1.5 sans-serif; }
.quotation-items .provider-row { padding: 0 0 .4rem !important; }
.provider-details { border-left: 3px solid var(--bs-info, #36b9dc); background: var(--tuval-surface-muted, #f8f9fa); padding: 0 .65rem .4rem; }
.provider-entry { display: grid; grid-template-columns: minmax(180px, 1.2fr) auto minmax(180px, 1fr); align-items: start; gap: .65rem; padding: .35rem 0; border-top: 1px dashed var(--bs-border-color, #d8dee6); font-size: 12px; line-height: 1.3; }
.provider-description, .provider-name { display: flex; flex-direction: column; gap: .15rem; min-width: 0; overflow-wrap: anywhere; }
.provider-label, .provider-metrics dt { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--tuval-text-muted); }
.provider-metrics { display: flex; gap: .85rem; margin: 0; }
.provider-metrics > div { text-align: right; }
.provider-metrics dt { white-space: nowrap; }
.provider-metrics dd { margin: .15rem 0 0; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
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
  .quotation-freight-amount { margin-left: 0; }
  .quotation-actions { justify-content: flex-start; }
}
</style>
