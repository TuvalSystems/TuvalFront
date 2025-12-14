<script setup>
import { computed, reactive, watch } from 'vue';
import { useQuotationReserveApproval } from '@/composables/aprobaciones/reservas/useQuotationReserveApproval';
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { swalSuccess, swalError } from "@/functions/swal-alert.js";
const props = defineProps({
    'reserva': Object
});
const emit = defineEmits(['closeModalAprobacionReserva']);

const flatPickrState = reactive({
    fecha: {
        minDate: Date.now(),
        locale: Spanish,
    },
});
const { dataSendApproval, loadingApproval, approveReservation, loadingDeny, denyReservation, resetForm, ptoVtaReservation } = useQuotationReserveApproval();
const infoResponse = computed(() => props.reserva);

const infoReserva = infoResponse.value.reserva;
const rows = infoResponse.value.rows;
const infoSegmento = infoResponse.value.segmento;



async function aprobarReserva() {
    const resp = await approveReservation();
    if (!resp?.ok) {
        await swalError(resp?.message);
        return;
    }
    emit('closeModalAprobacionReserva', true);
    await swalSuccess(resp?.message || "Reserva aprobada exitosamente.");

}

async function rechazarReserva() {
    const resp = await denyReservation();
    if (!resp?.ok) {
        swalError(resp?.message);
        return;
    }
    emit('closeModalAprobacionReserva', true);
    swalSuccess(resp?.message || "Reserva rechazada");
}

function hydrateApprovalForm(row) {
    if (!row) return resetForm();
    dataSendApproval.id = row.id ?? null;
    dataSendApproval.fe_autorizacion_reserva = row.fe_autorizacion_reserva ?? null;
}

watch(
    infoReserva,
    (row) => hydrateApprovalForm(row),
    { immediate: true }
);

watch(
    () => infoReserva,
    (newVal) => {
        if (newVal) {
            ptoVtaReservation.value = newVal.cotizacion.PTO_VTA_ID;
            // Aquí puedes manejar los cambios en ptoVtaReservation si es necesario
            // console.log('Punto de Venta para Reserva actualizado:', ptoVtaReservation);
        }
    },
    { immediate: true }
);


</script>

<template>

    <BaseBlock title="Aprobar Reserva de Cotización" class="mb-0" transparent themed>
        <template #options>
            <div class="block-options-item">
                <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                    <i class="fa fa-fw fa-times"></i>
                </button>
            </div>
        </template>

        <template #content>
            <div class="content  m-2">
                <div class="row g-2 mb-3">
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
                            <div class="fw-semibold text-truncate" :title="infoReserva.cotizacion.PTO_VTA_DESCRIPCION">
                                {{
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
                            <div class="fw-semibold">{{ infoReserva.usuario_ingreso.USERID }}</div>
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
                            <small class="text-muted">Fecha Solicitud</small>
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
                    <!-- espacio para que se coloque la observación en la siguiente fila -->
                    <div class="col-6 col-lg-4"></div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Observación Solicitud</small>
                            <span class="badge bg-dark text-white text-wrap text-start mt-1">{{
                                infoReserva.obs_solicitud_reserva
                                }}</span>
                        </div>
                    </div>
                    <div class="col-12" v-if="infoSegmento.segmento || infoSegmento.subsegmento">
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            <span class="text-muted me-1">Segmentación:</span>
                            <span v-if="infoSegmento.segmento" class="badge bg-info">{{ infoSegmento.segmento }}</span>
                            <span v-if="infoSegmento.subsegmento" class="badge bg-primary">{{ infoSegmento.subsegmento
                            }}</span>
                        </div>
                    </div>
                </div>
                <div class="table-responsive mb-2">
                    <table class="table table-sm table-borderless align-middle mb-0">
                        <thead style="position: sticky; top: 0; z-index: 1;">
                            <tr>
                                <th></th>
                                <th class="fs-sm" style="font-size: 10px">Código</th>
                                <th class="fs-sm" style="font-size: 10px">descripcion</th>
                                <th class="fs-sm" style="font-size: 10px">CTL</th>
                                <th class="fs-sm" style="font-size: 10px">Bodega</th>
                                <th class="fs-sm" style="font-size: 10px">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in rows" :key="index">
                                <td>{{ index + 1 }}</td>
                                <td class="code">{{ item.ART_CODIGO }}</td>
                                <td>
                                    <div class="text-truncate" :title="item.ART_DESCRIPCION" style="max-width: 420px;">
                                        {{ item.ART_DESCRIPCION }}
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-secondary">{{ item.ART_CODIGO_TRES_LETRAS }}</span>
                                </td>
                                <td class="fs-sm text-sm">{{ item.STO_ART_BODEGA }}</td>
                                <td class="fs-sm text-sm">{{ item.ART_CANTIDAD }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>

    </BaseBlock>
    <div class="block-content">
        <div class="row g-1 align-items-start">
            <div class="col-6 col-md-5">
                <div class="kv ">
                    <label for="fechaReserva" class="form-label text-muted fs-sm">Fecha Aprobación</label>
                    <div class="fw-semibold">
                        <flat-pickr id="fechaReserva" class="form-control form-control-sm"
                            v-model="dataSendApproval.fe_autorizacion_reserva" :config="flatPickrState.fecha" />
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-7">
                <div class="kv">
                    <label for="fechaReserva" class="form-label text-muted fs-sm">Observación</label>
                    <div class="fw-semibold">
                        <textarea id="obs" rows="3" class="form-control form-control-sm" maxlength="400"
                            v-model="dataSendApproval.obs_autorizacion_reserva"
                            placeholder="Detalles adicionales (opcional)"></textarea>
                    </div>
                    <div class="text-end text-muted fs-xs">{{ (dataSendApproval.obs_autorizacion_reserva || '').length
                        }}/400
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="content text-end mb-4 space-x-2">
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal">
            Cerrar
        </button>
        <button type="button" class="btn btn-sm btn-danger" @click="rechazarReserva" :disabled="loadingDeny">
            <span v-if="loadingDeny" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <!-- <i v-else class="fa fa-times me-1"></i> -->
            Rechazar
        </button>
        <button type="button" class="btn btn-sm btn-primary" @click="aprobarReserva" :disabled="loadingApproval">
            <span v-if="loadingApproval" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <!-- <i v-else class="fa fa-check me-1"></i> -->
            Aprobar
        </button>
    </div>


</template>

<style scoped>
.kv small {
    display: block;
    line-height: 1;
}

.kv .badge {
    white-space: normal;
    /* CLAVE: Permite que el texto haga salto de línea */
    text-align: left;
    /* Alinea el texto a la izquierda para leer mejor párrafos */
    display: block;
    /* Hace que ocupe el ancho disponible de la columna */
    line-height: 1.4;
    /* Da un poco de aire entre las líneas de texto */
    font-weight: 12px;
    /* Opcional: quita la negrita si el texto es muy largo */
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

.nums {
    font-variant-numeric: tabular-nums;
}

/* columnas numéricas alineadas */
.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}
</style>