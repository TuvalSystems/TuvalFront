<script setup>
import { computed } from "vue";
import { toInt } from "@/functions";
import {
  swalWarning,
  swalError,
  swalSuccess
} from "@/functions/swal-alert.js";
import { useReservationProcessor } from "@/composables/venta/cotizaciones/reservas/useReservationProcessor";
import { useRouter } from "vue-router";
const props = defineProps({
  reserva: {
    type: Object,
    required: true
  }
});
const router = useRouter();
const emit = defineEmits(['closeModalUsoReserva']);
const infoResponse = computed(() => props.reserva);
const infoReserva = infoResponse.value.reserva;
const infoSegmento = infoResponse.value.segmento;
const listaContizaciones = infoResponse.value.quoteList;
const { getPendingBase, updateReleaseReserved, updateInvoiceReserved, getAuthorized, loadingReservedProcess, processReservation, selectAllRelease,
  selectAllInvoice, applySelectAllRelease, applySelectAllInvoice } = useReservationProcessor(infoReserva);





function validateToProcess() {
  const detalles = infoReserva.cotizacion.detallecotizacion ?? [];
  let anySelected = false;

  for (const detalle of detalles) {
    const stocks = detalle.stock ?? [];
    for (const st of stocks) {
      st.a_cancelar = toInt(st.a_cancelar ?? 0);
      st.a_cotizar = toInt(st.a_cotizar ?? 0);

      //validar negativos
      if (st.a_cancelar < 0 || st.a_cotizar < 0) {
        swalError('No puede ingresar cantidades negativas');
        return false;
      }

      //clamp por pendiete base : a facturar + a_cancelar <= pendienteBase
      const base = getPendingBase(st);
      const totalNow = st.a_cancelar + st.a_cotizar;
      if (totalNow > base) {
        st.a_cancelar = Math.max(0, base - st.a_cotizar);
      }
      if ((st.a_cancelar > 0 || st.a_cotizar > 0) && st.cantidad_reservada > 0) {
        anySelected = true;
      }
    }
  }
  if (!anySelected) {
    swalError("Debe seleccionar al menos una cantidad a liberar o a facturar.");
    return false;
  }
  return true;
}


async function procesar() {

  if (infoReserva.cotizacion.reserva_disabled === true) {
    swalWarning("No hay cantidades pendientes para liberar o facturar.");
    return;
  }
  if (!validateToProcess()) return;
  const resp = await processReservation(infoReserva);
  if (!resp?.ok) {
    swalError(resp?.message || "Error al procesar la reserva.");
    return;
  }
  swalSuccess(resp?.message);
  emit('closeModalUsoReserva', true);
  if (Object.keys(resp?.data || {}).length > 0) {
    router.push({
      name: 'ventas-cotizaciones'
    })
  }


}

</script>
<template>
  <BaseBlock title="Uso de la Reserva" transparent>
    <template #options>
      <div class="block-options-item">
        <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
          <i class="fa fa-fw fa-times"></i>
        </button>
      </div>
    </template>
    <template #content>
      <div class="content">
        <div class="row g-2 mb-2">
          <div class="col-12 col-lg-4">
            <div class="kv">
              <small class="text-muted">Cotización</small>
              <div class="fw-semibold">{{ infoReserva.cotizacion.cotizacion }}</div>
            </div>
          </div>

          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">RUC</small>
              <div class="fw-semibold">{{ infoReserva.cotizacion.CLI_RUC }}</div>
            </div>
          </div>

          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Razón Social</small>
              <div class="fw-semibold text-truncate" :title="infoReserva.cotizacion.CLI_RAZON_SOCIAL">{{
                infoReserva.cotizacion.CLI_RAZON_SOCIAL
              }}</div>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="kv">
              <small class="text-muted">P. Venta</small>
              <div class="fw-semibold text-truncate" :title="infoReserva.cotizacion.PTO_VTA_DESCRIPCION">{{
                infoReserva.cotizacion.PTO_VTA_DESCRIPCION }}</div>
            </div>
          </div>

          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Bodega</small>
              <div class="fw-semibold text-truncate" :title="infoReserva.cotizacion.BOD_BODEGA">{{
                infoReserva.cotizacion.BOD_BODEGA }}</div>
            </div>
          </div>

          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Cond. Pago</small>
              <div class="fw-semibold">{{ infoReserva.cotizacion.COND_ID }}</div>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="kv">
              <small class="text-muted">Usuario</small>
              <div class="fw-semibold">{{ infoReserva.cotizacion.USERID }}</div>
            </div>
          </div>

          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Fecha/Hora</small>
              <div class="fw-semibold">{{ infoReserva.cotizacion.created_at }}</div>
            </div>
          </div>
          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Fecha Solicitud Reserva</small>
              <div class="fw-semibold">
                <div class="fw-semibold">{{ infoReserva.fe_solicitud_reserva }}</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Traslado</small>
              <div class="fw-semibold">
                <div class="fw-semibold">{{ infoReserva.tipo_traslado.descripcion }}</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-4">
            <div class="kv">
              <small class="text-muted">Tipo Reserva</small>
              <div class="fw-semibold">
                <div class="fw-semibold">{{ infoReserva.tipo_reserva.descripcion }}</div>
              </div>
            </div>
          </div>
          <div class="col-12" v-if="infoSegmento.segmento || infoSegmento.subsegmento">
            <div class="kv">
              <small class="text-muted">Segmentación</small>
              <span v-if="infoSegmento.segmento" class="badge bg-info">{{ infoSegmento.segmento }}</span>
              <span v-if="infoSegmento.subsegmento" class="badge bg-primary">{{ infoSegmento.subsegmento
              }}</span>
            </div>
          </div>
          <div class="col-12 col-lg-12" v-if="listaContizaciones">
            <div class="kv">
              <small class="text-muted">Cotizaciones</small>
              <span v-for="c in listaContizaciones.split(',').map(s => s.trim()).filter(Boolean)" :key="c"
                class="badge bg-warning fs-xs me-1 mb-2">
                {{ c }}
              </span>
            </div>

          </div>
        </div>
        <div v-if="infoReserva.estado === 'traslado'">
          <p class="alert alert-danger">T: Unidades en traslado (tránsito entre bodegas). No disponibles para
            Liberar/Cotizar hasta completar el traslado.</p>
        </div>
        <!-- detalle de la cotizacion -->
        <div class="table-responsive mb-0">
          <table class="table table-sm table-borderless align-middle mb-0">
            <thead style="position: sticky; top: 0; z-index: 1;">
              <tr>
                <th class="fs-sm" style="font-size: 10px">Item</th>
                <th class="fs-sm" style="font-size: 10px">3L</th>
                <th class="fs-sm" style="font-size: 10px">Zafiro</th>
                <th class="fs-sm" style="font-size: 10px">Descripción</th>
                <th class="fs-sm" style="font-size: 10px;text-align: right " data-bs-placement="top"
                  title="Stock Disponible">STOCK</th>
                <th class="fs-sm" style="font-size: 10px;text-align: right ">Cant.</th>
                <th class="fs-sm" style="font-size: 10px">Bodega</th>
                <th class="fs-sm" style="font-size: 10px; text-align: right" data-bs-placement="top"
                  title="Cantidad Pendiente"> P.</th>
                <th class="fs-sm" style="font-size: 10px; text-align: right" data-bs-placement="top"
                  title="Cantidad Cotizada">C.</th>
                <th class="fs-sm" style="font-size: 10px; text-align: right" data-bs-placement="top"
                  title="Cantidad Traslado">T.</th>
                <th class="fs-sm" style="font-size: 10px; text-align: right" data-bs-placement="top"
                  title="Cantidad Facturada">F.</th>
                <th class="fs-sm" style="font-size: 10px; text-align: right" data-bs-placement="top"
                  title="Cantidad Liberada">L.</th>
                <th class="fs-sm" style="font-size: 10px; text-align: center">Cotizar
                  <input class="form-check-input" type="checkbox" value="" id="example-checkbox-default1"
                    name="example-checkbox-default1" :disabled="infoReserva.cotizacion.reserva_disabled"
                    v-model="selectAllInvoice" @change="applySelectAllInvoice" />
                </th>
                <th class="fs-sm" style="font-size: 10px; text-align: center">Liberar
                  <input class="form-check-input" type="checkbox" value="" id="example-checkbox-default1"
                    name="example-checkbox-default1" @change="applySelectAllRelease" v-model="selectAllRelease"
                    :disabled="infoReserva.cotizacion.reserva_disabled" />
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(item, i) in infoReserva.cotizacion.detallecotizacion" :key="item.id + i">
                <tr v-for="(item2, j) in item.stock" :key="`${item.id}-${(item2.id ?? j)}`">
                  <td class="code">{{ item.ART_CODIGO }}</td>
                  <td>
                    <span class="badge bg-secondary" style="font-size: 12px">{{ item.ART_CODIGO_TRES_LETRAS }}</span>
                  </td>
                  <td>
                    <span class="badge bg-secondary" style="font-size: 12px">{{ item.articulo.ART_CODIGO_ZAFIRO || 'N/A'
                    }}</span>
                  </td>
                  <td>
                    <div class="text-wrap" :title="item.ART_DESCRIPCION" style="max-width: 320px;font-size: 12px">
                      {{ item.ART_DESCRIPCION }}
                    </div>
                  </td>

                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">{{
                    toInt(item2.STO_ART_STOCK_DISPONIBLE) }}</td>
                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">{{ toInt(item2.pendiente) }}
                    <!-- pendiente es un atribudo del modelo -->
                  </td>
                  <td class="fs-sm text-sm">
                    <div style="font-size: 12px">{{ item2.STO_ART_BODEGA }}</div>
                  </td>
                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">{{ toInt(item2.pendiente) }}
                    <!-- pendiente es un atribudo del modelo -->
                  </td>
                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">{{ toInt(item2.cantidad_cotizada)
                  }}</td>
                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">
                    <span v-if="item2.cantidad_traslado > 0" class="badge bg-danger"> {{ toInt(item2.cantidad_traslado)
                    }}</span>
                    <span v-else> {{ toInt(item2.cantidad_traslado) }}</span>
                  </td>
                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">{{
                    toInt(item2.cantidad_facturada) }} </td>
                  <td class="fs-sm text-sm" style="font-size: 10px; text-align: right">{{
                    toInt(item2.cantidad_cancelada) }} </td>
                  <td> <input v-zero-decimals type="text" class="form-control form-control-sm text-end"
                      style="width: 100px" step="1" min="0" v-model.number="item2.a_cotizar" inputmode="numeric"
                      @change="updateInvoiceReserved($event, item2)"
                      :disabled="item2.disable_movimiento || item2.disable_traslado"
                      :max="Math.max(0, (getAuthorized(item2) - (item2.cantidad_facturada || 0) - (item2.cantidad_traslado || 0) - (item2.cantidad_cancelada || 0)))">
                  </td>
                  <td> <input v-zero-decimals type="text" class="form-control form-control-sm text-end"
                      style="width: 100px" step="1" min="0" v-model.number="item2.a_cancelar" inputmode="numeric"
                      @change="updateReleaseReserved($event, item2)"
                      :disabled="item2.disable_movimiento || (item2.disable_traslado && item2.picking)"
                      :max="Math.max(0, (getAuthorized(item2) - (item2.cantidad_facturada || 0) - (item2.cantidad_traslado || 0) - (item2.cantidad_cancelada || 0)))">
                  </td>

                </tr>
              </template>

            </tbody>
          </table>
        </div>
      </div>
    </template>
  </BaseBlock>

  <div v-if="infoReserva.cotizacion.reserva_disabled === false" class="content text-end mb-4 space-x-2">
    <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal">
      Cerrar
    </button>
    <button type="button" class="btn btn-sm btn-primary" @click="procesar" :disabled="loadingReservedProcess">
      <span v-if="loadingReservedProcess" class="spinner-border spinner-border-sm me-2" role="status"
        aria-hidden="true"></span>
      <!-- <i v-else class="fa fa-check me-1"></i> -->
      Procesar
    </button>
  </div>
  <div v-else class="content text-end mb-4 space-x-2">
    <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal">
      Cerrar
    </button>
  </div>
</template>

<style scoped>
.kv small {
  display: block;
  line-height: 1;
}

.kv .fw-semibold {
  line-height: 1.2;
}

.text-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .35rem;
  }
}


/* columnas numéricas alineadas */
.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 14px;
}
</style>