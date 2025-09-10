<script setup>
import { computed, reactive } from 'vue';
import { useFetchQuotationWitDetail } from '@/composables/aprobaciones/reservas/useFetchQuotationWitDetail';
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import {
    swalSuccess,
    swalError,
} from "@/functions/swal-alert.js";
const props = defineProps({
    'infoCotizacion': Object

});

const { dataSendApproval,loadingApproval, fetchApprovalApplicationReservedQuotationById } = useFetchQuotationWitDetail();
const infoCotizacion = computed(() => props.infoCotizacion.cotizacion);
const infoSegmento = computed(() => props.infoCotizacion.segmento);

const flatPickrState = reactive({
    fecha: {
        minDate: Date.now(),
        locale: Spanish,
    },
});
// Formateadores (USD y cantidades)
const nf2 = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf4 = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const money = (n) => `$${nf2.format(n ?? 0)}`;
const num2 = (n) => nf2.format(n ?? 0);
const num4 = (n) => nf4.format(n ?? 0);


function aprobarReserva() {
    try {
        dataSendApproval.id = infoCotizacion.value.id;
        const response = fetchApprovalApplicationReservedQuotationById();
        if (response) {
            swalSuccess("Cotización aprobada");
        }
    } catch (error) {
        swalError(error.response.data.error);
    }

}



</script>

<template>

    <BaseBlock title="Cotización" class="mb-0" transparent themed>
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
                            <div class="fw-semibold">{{ infoCotizacion.cotizacion }}</div>
                        </div>
                    </div>

                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">RUC</small>
                            <div class="fw-semibold">{{ infoCotizacion.CLI_RUC }}</div>
                        </div>
                    </div>

                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Razón Social</small>
                            <div class="fw-semibold text-truncate" :title="infoCotizacion.CLI_RAZON_SOCIAL">{{
                                infoCotizacion.CLI_RAZON_SOCIAL
                                }}</div>
                        </div>
                    </div>

                    <div class="col-12 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">P. Venta</small>
                            <div class="fw-semibold text-truncate" :title="infoCotizacion.PTO_VTA_DESCRIPCION">{{
                                infoCotizacion.PTO_VTA_DESCRIPCION }}</div>
                        </div>
                    </div>

                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Bodega</small>
                            <div class="fw-semibold text-truncate" :title="infoCotizacion.BOD_BODEGA">{{
                                infoCotizacion.BOD_BODEGA }}</div>
                        </div>
                    </div>

                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Cond. Pago</small>
                            <div class="fw-semibold">{{ infoCotizacion.COND_ID }}</div>
                        </div>
                    </div>

                    <div class="col-12 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Usuario</small>
                            <div class="fw-semibold">{{ infoCotizacion.USERID }}</div>
                        </div>
                    </div>

                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Fecha/Hora</small>
                            <div class="fw-semibold">{{ infoCotizacion.created_at }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Fecha Solicitud Reserva</small>
                            <div class="fw-semibold">
                                <div class="fw-semibold">{{ infoCotizacion.fe_solResInv }}</div>
                            </div>
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

                <div class="table-responsive mb-0">
                    <table class="table table-striped table-sm table-vcenter align-middle">
                        <thead>
                            <tr>
                                <th class="fs-sm" style="font-size: 10px">Código</th>
                                <th class="fs-sm" style="font-size: 10px">descripcion</th>
                                <th class="fs-sm" style="font-size: 10px">CTL</th>
                                <th class="fs-sm" style="font-size: 10px">Bodega</th>
                                <th class="fs-sm" style="font-size: 10px">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody v-for="item in infoCotizacion.detallecotizacion" :key="item.id">
                            <tr v-for="item2 in item.stock" :key="item2.id">
                                <td class="fs-sm text-sm">{{ item.ART_CODIGO }}</td>
                                <td class="fs-sm text-sm">{{ item.ART_DESCRIPCION }}</td>
                                <td class="fs-sm text-sm">{{ item.ART_CODIGO_TRES_LETRAS }}</td>
                                <td class="fs-sm text-sm">{{ item2.STO_ART_BODEGA }}</td>
                                <td class="fs-sm text-sm">{{ item2.seleccionado }}</td>
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
                            v-model="dataSendApproval.fe_autSolResInv" :config="flatPickrState.fecha" />
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-7">
                <div class="kv">
                    <label for="fechaReserva" class="form-label text-muted fs-sm">Observación</label>
                    <div class="fw-semibold">
                        <textarea id="obs" rows="3" class="form-control form-control-sm" maxlength="400"
                            v-model="dataSendApproval.tx_obsAutSolResInv"
                            placeholder="Detalles adicionales (opcional)"></textarea>
                    </div>
                    <div class="text-end text-muted fs-xs">{{ (dataSendApproval.tx_obsAutSolResInv || '').length
                    }}/400
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="content text-end mb-4 space-x-2">
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal" :disabled="actionLoading">
            Cerrar
        </button>
        <button type="button" class="btn btn-sm btn-danger">
            <span v-if="loadingApproval" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <i v-else class="fa fa-times me-1"></i>
            Rechazar
        </button>
        <button type="button" class="btn btn-sm btn-primary"  @click="aprobarReserva">
            <span v-if="loadingApproval" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <i v-else class="fa fa-check me-1"></i>
            Aprobar
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
</style>