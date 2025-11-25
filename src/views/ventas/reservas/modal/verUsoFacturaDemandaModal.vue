<script setup>
import { computed, ref, watch, reactive, onMounted } from 'vue';
import { formatPriceJm, formatJm, toInt } from "@/functions";
import { swalSuccess, swalError } from "@/functions/swal-alert.js";
import { useReservationProcessor } from "@/composables/venta/cotizaciones/reservas/useReservationProcessor";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useRouter } from "vue-router";

const props = defineProps({
    reserva: {
        type: Object,
        required: true
    },
});
const { loadingFacturaDemanda, procesarReservaFacturaDemanda } = useReservationProcessor();
const emit = defineEmits(['closeModalUsoFacturaDemanda']);
const flatPickrState = reactive({
    fecha: {
        minDate: Date.now(),
        locale: Spanish,
    },
});

const infoResponse = computed(() => props.reserva);
const infoReserva = infoResponse.value.reserva;
const segmento = infoResponse.value.segmento;
const router = useRouter();

// Formateadores (USD y cantidades)
const nf2 = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf4 = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const money = (n) => `$${nf2.format(n ?? 0)}`;
const num2 = (n) => nf2.format(n ?? 0);
const num4 = (n) => nf4.format(n ?? 0);

const maxlengthOc = ref(20);
const maxlengthNc = ref(300);


async function procesar() {

    const resp = await procesarReservaFacturaDemanda(infoReserva);
    if (!resp?.ok) {
        swalError(resp?.message || "Error al procesar la reserva.");
        return;
    }
    let ord = resp?.data
    emit('closeModalUsoFacturaDemanda', true);
    swalSuccess(resp?.message);
    if (ord.requiere_aprobacion_comercial === "yes") {
        router.push({
            name: 'aprobaciones-comerciales'
        });
    }
    if (ord.requiere_aprobacion_crediticia === "yes") {
        router.push({
            name: 'aprobaciones-crediticias'
        });
    }

};
</script>

<template>
    <BaseBlock title="Cotización" class="mb-0" transparent>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>

        <template #content>
            <div class="block-content fs-sm m-2">
                <!-- cabecera -->
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
                            <small class="text-muted">% Descuento</small>
                            <div class="fw-semibold">
                                <span class="badge bg-warning text-white" style="font-size:12px">{{
                                    num2(infoReserva.cotizacion.porcentage_descuento)
                                    }}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Fecha Solicitud</small>
                            <div class="fw-semibold">{{ infoReserva.fe_solicitud_reserva }}</div>
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
                    <div class="col-6 col-lg-4"></div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Observación</small>
                            <span class="badge bg-dark text-white text-wrap text-start mt-1 badge2">{{
                                infoReserva.obs_solicitud_reserva
                            }}</span>
                        </div>
                    </div>
                    <div class="col-12" v-if="segmento.segmento || segmento.subsegmento">
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            <span class="text-muted me-1">Segmentación:</span>
                            <span v-if="segmento.segmento" class="badge bg-info">{{ segmento.segmento }}</span>
                            <span v-if="segmento.subsegmento" class="badge bg-primary">{{ segmento.subsegmento
                            }}</span>
                        </div>
                    </div>
                </div>

                <div class="table-responsive mb-2">
                    <table class="table table-sm table-borderless align-middle mb-0">
                        <thead style="position: sticky; top: 0; z-index: 1;">
                            <tr>
                                <th></th>
                                <th class="fs-sm">Código</th>
                                <th class="fs-sm">Descripción</th>
                                <th class="fs-sm">CTL</th>
                                <th class="fs-sm">UDM</th>
                                <th class="fs-sm text-end">Cantidad</th>
                                <th class="fs-sm text-end">Peso</th>
                                <th class="fs-sm text-end">Descuento</th>
                                <th class="fs-sm text-end">Precio</th>
                                <th class="fs-sm text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, i) in infoReserva.cotizacion.detallecotizacion" :key="item.id">
                                <td>{{ i + 1 }}</td>
                                <td class="code">{{ item.ART_CODIGO }}</td>
                                <td>
                                    <div class="text-truncate" :title="item.ART_DESCRIPCION" style="max-width: 420px;">
                                        {{ item.ART_DESCRIPCION }}
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-secondary">{{ item.ART_CODIGO_TRES_LETRAS }}</span>
                                </td>
                                <td>
                                    <span class="badge bg-info text-white">{{ item.ART_PLAN_UMEDIDA }}</span>
                                </td>
                                <td class="fs-sm text-end nums fw-semibold text-nowrap">{{ toInt(item.ART_CANTIDAD) }}
                                </td>
                                <td class="fs-sm text-end nums fw-semibold text-nowrap">{{ item.ART_PESO }}</td>
                                <td class="fs-sm text-end nums fw-semibold text-nowrap">{{ item.ART_DESCUENTO }}</td>
                                <td class="fs-sm text-end nums fw-semibold text-nowrap">${{
                                    formatJm(parseFloat(item.ART_VALOR)) }}
                                </td>
                                <td class="fs-sm text-end nums fw-semibold text-nowrap"> ${{
                                    formatPriceJm(parseFloat((item.ART_VALOR -
                                        item.ART_DESCUENTO)
                                        *
                                        item.ART_CANTIDAD)) }}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end">Subtotal</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.subtotal)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end">Iva</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.iva))
                                    }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end">Descuento</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.descuento))
                                    }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end">Total</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.total)) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div v-if="infoReserva.estado === 'procesado'">
                <div class="content text-end mb-4">
                    <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
                        Close
                    </button>
                </div>
            </div>
            <div v-else>
                <div class="block-content">
                    <div class="row g-1 align-items-start">
                        <div class="col-6 col-md-5">
                            <div class="kv ">
                                <label for="fechaReserva" class="form-label text-muted fs-sm">Fecha Aprobación</label>
                                <div class="fw-semibold">
                                    <flat-pickr id="fechaReserva" class="form-control form-control-sm"
                                        v-model="infoReserva.fe_autorizacion_reserva" :config="flatPickrState.fecha" />
                                </div>
                            </div>
                        </div>
                        <div class="col-6 col-md-7">
                            <div class="kv">
                                <label for="fechaReserva" class="form-label text-muted fs-sm">Observación</label>
                                <div class="fw-semibold">
                                    <textarea id="obs" rows="3" class="form-control form-control-sm" maxlength="400"
                                        v-model="infoReserva.obs_autorizacion_reserva"
                                        placeholder="Detalles adicionales (opcional)"></textarea>
                                </div>
                                <div class="text-end text-muted fs-xs">{{ (infoReserva.obs_autorizacion_reserva ||
                                    '').length
                                }}/400
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content text-end mb-4">
                    <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
                        Close
                    </button>
                    <button type="button" class="btn btn-sm btn-primary" @click="procesar"
                        :disabled="loadingFacturaDemanda">
                        <span v-if="loadingFacturaDemanda" class="spinner-border spinner-border-sm me-2" role="status"
                            aria-hidden="true"></span>
                        <!-- <i v-else class="fa fa-check me-1"></i> -->
                        Procesar
                    </button>
                </div>
            </div>
        </template>
    </BaseBlock>
</template>

<style scoped>
.nums {
    font-variant-numeric: tabular-nums;
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

.kv small {
    display: block;
    line-height: 1;
}

.kv .badge2 {
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

/* columnas numéricas alineadas */
.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}
</style>