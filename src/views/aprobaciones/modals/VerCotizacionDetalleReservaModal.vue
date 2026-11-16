<script setup>
import { computed } from 'vue';

import { formatPriceJm, formatJm, toInt } from "@/functions";

const props = defineProps({
    infoReserva: {
        type: Object,
        required: true
    },
    segmento: {
        type: Object,
        required: true
    }
});

// Formateadores (USD y cantidades)
const nf2 = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
new Intl.NumberFormat("es-EC", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const num2 = (n) => nf2.format(n ?? 0);

const infoReserva = computed(() => props.infoReserva);
const segmento = computed(() => props.segmento);
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
                            <small class="text-muted">Usuario solicita</small>
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
                            <small class="text-muted">% Descuento</small>
                            <div class="fw-semibold">
                                <span class="badge bg-warning text-white" style="font-size:12px">{{ num2(infoReserva.cotizacion.porcentage_descuento)
                                    }}%</span>
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
                                <!-- <th class="fs-sm text-end">Peso</th> -->
                                <th class="fs-sm text-end">Descuento</th>
                                <th class="fs-sm text-end">Precio</th>
                                <th class="fs-sm text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="( item, i) in infoReserva.cotizacion.detallecotizacion" :key="item.id">
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
                                <!-- <td class="fs-sm text-end nums fw-semibold text-nowrap">{{ item.ART_PESO }}</td> -->
                                <td class="fs-sm text-end nums fw-semibold text-nowrap">{{ item.descuento }}%</td>
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
                                <td colspan="8" class="fw-semibold text-end">Subtotal</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.subtotal)) }}
                                </td>
                            </tr>
                             <tr>
                                <td colspan="8" class="fw-semibold text-end">Iva</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.iva)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" class="fw-semibold text-end">Descuento</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.descuento))
                                }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" class="fw-semibold text-end">Total</td>
                                <td class="fw-semibold text-end nums">${{
                                    formatPriceJm(parseFloat(infoReserva.cotizacion.total)) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div class="content text-end mb-4">
                <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
                    Close
                </button>
            </div>
        </template>
    </BaseBlock>
</template>

<style scoped>
.nums {
    font-variant-numeric: tabular-nums;
}

/* columnas numéricas alineadas */
.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}
</style>
