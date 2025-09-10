<script setup>
import { computed } from 'vue';
import { watch, reactive, onMounted } from 'vue';
import { formatPrice, format, format4 } from "@/functions";

const props = defineProps({
    infoCotizacion: {
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
const nf4 = new Intl.NumberFormat("es-EC", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const money = (n) => `$${nf2.format(n ?? 0)}`;
const num2 = (n) => nf2.format(n ?? 0);
const num4 = (n) => nf4.format(n ?? 0);
const infoCotizacion = computed(() => props.infoCotizacion);
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
                            <small class="text-muted">% Descuento</small>
                            <div class="fw-semibold">
                                <span class="badge bg-warning text-dark">{{ num2(infoCotizacion.porcentage_descuento)
                                    }}%</span>
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

                <div class="table-responsive mb-0">
                    <table class="table table-striped table-sm table-vcenter align-middle">

                        <thead>
                            <tr>
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
                            <tr v-for="item in infoCotizacion.detallecotizacion" :key="item.id">
                                <td>{{ item.ART_CODIGO }}</td>
                                <td>{{ item.ART_DESCRIPCION }}</td>
                                <td>{{ item.ART_CODIGO_TRES_LETRAS }}</td>
                                <td>{{ item.ART_PLAN_UMEDIDA }}</td>
                                <td class="fs-sm text-end">{{ item.ART_CANTIDAD }}</td>
                                <td class="fs-sm text-end">{{ item.ART_PESO }}</td>
                                <td class="fs-sm text-end">{{ item.ART_DESCUENTO }}</td>
                                <td class="fs-sm text-end">${{ format(parseFloat(item.ART_VALOR)) }}</td>
                                <td class="fs-sm text-end"> ${{ format(parseFloat((item.ART_VALOR - item.ART_DESCUENTO)
                                    *
                                    item.ART_CANTIDAD)) }}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="8" class="fw-semibold text-end">Subtotal</td>
                                <td class="fw-semibold text-end">${{ format(parseFloat(infoCotizacion.subtotal)) }}</td>
                            </tr>
                            <tr>
                                <td colspan="8" class="fw-semibold text-end">Descuento</td>
                                <td class="fw-semibold text-end">${{ format(parseFloat(infoCotizacion.descuento)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" class="fw-semibold text-end">Total</td>
                                <td class="fw-semibold text-end">${{ format(parseFloat(infoCotizacion.total)) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div class="content text-end mb-4">
                 <button
                  type="button"
                  class="btn btn-sm btn-alt-secondary me-1"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
            </div>
        </template>
    </BaseBlock>
</template>
