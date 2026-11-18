<script setup>
import { format, formatPriceJm } from '@/functions';
import { swalInfo, swalWarning, swalError , swalSuccess} from '@/functions/swal-alert';
import { computed, watch, ref } from 'vue';
import { useCreditOrdersActions } from '@/composables/aprobaciones/pedidos/useCreditOrdersActions';
import { useApprovalOrder } from '@/composables/aprobaciones/pedidos/useApprovalOrder';

const props = defineProps({
    info: {
        type: Object,
        required: true,
        default: () => ({
            pedido: {},
            detalle: [],
            segmento: null,
            pendiente_aprobacion_comercial: false,
        }),
    }
});
const emit = defineEmits(["closeModal", "refresh"]);

const {
    //process
    laodingCreditApproval,
    approveCreditOrder,
    loadingCreditRejection,
    rejectCreditOrder,
    loadingCreditRejectionStock,
    rejectCreditOrderForStock
} = useCreditOrdersActions();

const {
    loadingValidateStockOrderApproval,
    validateStockForOrderApproval
} = useApprovalOrder();

const isProcessing = computed(() =>
  loadingValidateStockOrderApproval.value ||
  laodingCreditApproval.value ||
  loadingCreditRejection.value ||
  loadingCreditRejectionStock.value
);


const orderHeader = computed(() => props.info?.pedido ?? {});
const orderDetail = computed(() => props.info?.detalle ?? []);
const segmentClient = computed(() => props.info?.segmento ?? null);
const isPendingApprovalCommercial = computed(() => {
    return Boolean(props.info?.pendiente_aprobacion_comercial);
});
async function closeModalEvent() {
    emit('closeModal');
}

const calculateTotal = (row) => {
    let price = Number.parseFloat(row.ART_VALOR);
    let qty = Number.parseFloat(row.ART_CANTIDAD);
    let discount = Number.parseFloat(row.ART_DESCUENTO);
    return ((price - discount) * qty);
}

const approvalMessage = ref("");

watch(orderHeader,
    (value) => {
        approvalMessage.value = value?.aprobado_crediticio_mensaje ?? "";
    },
    { immediate: true }
);

function hasPaymentConditionChange() {
    return orderHeader.value?.COND_ID_ORIGINAL
        && orderHeader.value?.COND_ID
        && orderHeader.value?.COND_ID !== orderHeader.value?.COND_ID_ORIGINAL;
}

function showPaymentConditionDiff() {
    swalInfo(
        "Cambio condición de pago",
        `de <b>${orderHeader.value.COND_ID_ORIGINAL}</b> a <b>${orderHeader.value.COND_ID}</b>`
    );
}



function hasDiscountPercentChange() {
    return orderHeader.value?.porcentage_descuentooriginal !== undefined
        && orderHeader.value?.porcentage_descuento !== undefined
        && Number(orderHeader.value.porcentage_descuento) !== Number(orderHeader.value.porcentage_descuentooriginal);
}

function showDiscountPercentDiff() {
    swalInfo(
        "Cambio porcentaje de descuento",
        `de <b>${orderHeader.value.porcentage_descuentooriginal}%</b> a <b>${orderHeader.value.porcentage_descuento}%</b>`
    );
}



function hasDescriptionChange(row) {
    return row.ART_TIPO_COMPRA !== "L"
        && row.ART_DESCRIPCION_ORIGINAL
        && row.ART_DESCRIPCION !== row.ART_DESCRIPCION_ORIGINAL;
}

function showDescriptionDiff(row) {
    swalInfo(
        "Cambio de descripción de artículo",
        `de <br><b>${row.ART_DESCRIPCION_ORIGINAL}</b><br> a <br><b>${row.ART_DESCRIPCION}</b>`
    );
}


function hasPriceChange(row) {
    return row.ART_TIPO_COMPRA !== "L"
        && row.ART_VALOR_ORIGINAL !== undefined
        && Number(row.ART_VALOR) !== Number(row.ART_VALOR_ORIGINAL);
}

function showPriceDiff(row) {
    swalInfo(
        "Cambio de precio de artículo",
        `de <b>$${formatPriceJm(row.ART_VALOR_ORIGINAL)}</b> a <b>$${formatPriceJm(row.ART_VALOR)}</b>`
    );
}


function hasDiscountChange(row) {
    return row.ART_TIPO_COMPRA !== "L"
        && row.descuento_original !== undefined
        && Number(row.descuento) !== Number(row.descuento_original);
}

function showDiscountDiff(row) {
    swalInfo(
        "Cambio de porcentaje de descuento",
        `de <b>${format(row.descuento_original)}%</b> a <b>${format(row.descuento)}%</b>`
    );
}

async function approveOrder() {
  if (isProcessing.value) return;

    const resp = await validateStockForOrderApproval(orderHeader.value?.id);
    if (!resp?.ok) {
      const  respRejection = await rejectCreditOrderForStock(orderHeader.value?.id, resp?.message)
        swalWarning(respRejection?.message);
        await closeModalEvent();
        emit('refresh');
        return;
    }

    const respApproval = await approveCreditOrder(orderHeader.value?.id, approvalMessage.value);
    if (respApproval?.ok) {
        swalSuccess(respApproval?.message);
        await closeModalEvent();
        emit('refresh');

        return;
    }
    const msg = resp?.message || "Opps! Ocurrio un problema al momento de aprobar el pedido";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);

}

async function rejectOrder() {
  if (isProcessing.value) return;
    const resp = await rejectCreditOrder(orderHeader.value?.id, approvalMessage.value);
    if (resp?.ok) {
        swalSuccess(resp?.message);
        await closeModalEvent();
        emit('refresh');
        return;
    }
    const msg = resp?.message || "No se pudo actualizar el acceso a la App móvil";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}


</script>

<template>
    <BaseBlock title="Pedido por Aprobar" class="mb-0" transparent>
        <template #options>
            <button type="button" class="btn-block-option" aria-label="Close" @click="closeModalEvent">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm m-0 mb-2">
                <div class="row g-2 mb-3">
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">pedido</small>
                            <div class="fw-semibold">{{ orderHeader.pedido }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">ruc</small>
                            <div class="fw-semibold">{{ orderHeader.CLI_RUC }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">razón social</small>
                            <div class="fw-semibold">{{ orderHeader.CLI_RAZON_SOCIAL }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">P. venta</small>
                            <div class="fw-semibold">{{ orderHeader.PTO_VTA_DESCRIPCION }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">cond. pago</small>
                            <div class="fw-semibold">
                                <a v-if="hasPaymentConditionChange()" href="javascript:void(0)"
                                    class="text-danger fw-semibold" @click="showPaymentConditionDiff">
                                    de {{ orderHeader.COND_ID_ORIGINAL }} a {{ orderHeader.COND_ID }}
                                </a>

                                <span v-else>
                                    {{ orderHeader.COND_ID }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">usuario</small>
                            <div class="fw-semibold">{{ orderHeader.USERID }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">BODEGA</small>
                            <div class="fw-semibold">{{ orderHeader.BOD_BODEGA }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">DESCUENTO</small>
                            <div class="fw-semibold">
                                <a v-if="hasDiscountPercentChange()" href="javascript:void(0)"
                                    class="text-danger fw-semibold" @click="showDiscountPercentDiff">
                                    {{ orderHeader.porcentage_descuento }}%
                                </a>

                                <span v-else>
                                    {{ orderHeader.porcentage_descuento }}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">fecha/hora</small>
                            <div class="fw-semibold">{{ orderHeader.created_at }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="label-small">Origen</small>
                            <div class="fw-semibold">
                                <span :class="[
                                    'badge rounded-pill fw-semibold d-inline-block py-2 px-4 fs-xs ',
                                    {
                                        'bg-info-light text-info': orderHeader.origen === 'cotizacion',
                                        'bg-warning-light text-warning': orderHeader.origen === 'reserva',
                                        'bg-success-light text-success': orderHeader.origen === 'factura_demanda',
                                        'bg-light text-primary': orderHeader.origen === 'facturar_existente',
                                        'bg-light text-danger': orderHeader.origen === 'devolucion',
                                        'bg-info-light text-warning': orderHeader.origen === 'app_movil',
                                    }
                                ]">
                                    {{
                                        orderHeader.origen === 'factura_demanda' ? 'Factura Demanda' :
                                            orderHeader.origen === 'facturar_existente' ? 'Factura Existente' :
                                                orderHeader.origen === 'devolucion' ? 'Refacturación' :
                                                    orderHeader.origen === 'app_movil' ? 'App Móvil' :
                                                        orderHeader.origen
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="segmentClient" class="col-12">
                        <div class="d-flex flex-wrap gap-1 align-items-center fs-sm">
                            <span class="label-small">
                                Segmentación:
                            </span>

                            <template v-if="segmentClient.segmento || segmentClient.subsegmento">

                                <span v-if="segmentClient.segmento"
                                    class="badge rounded-pill bg-info text-light border border-info"
                                    style="font-size:12px">
                                    {{ segmentClient.segmento }}
                                </span>
                                <span v-if="segmentClient.subsegmento"
                                    class="badge rounded-pill bg-primary text-light border border-primary"
                                    style="font-size:12px">
                                    {{ segmentClient.subsegmento }}
                                </span>
                            </template>

                            <span v-else class="text-muted fst-italic text-opacity-75">
                                <i class="fa fa-ban me-1"></i>Sin Segmentación asignada
                            </span>
                        </div>
                    </div>
                    <div v-if="orderHeader.nota_interna" class="col-12">
                        <div class="alert alert-danger py-2 mb-0">
                            <div class="fw-bold text-uppercase small mb-1">
                                Nota interna
                            </div>
                            <div>
                                {{ orderHeader.nota_interna }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- detalle (tabla)-->
                <div class="table-responsive">
                    <table class="table table-sm table-borderless align-middle mb-0">
                        <thead class="table-head-sticky">
                            <th class="fs-sm">#</th>
                            <th class="fs-sm">CÓDIGO</th>
                            <th class="fs-sm">descripción</th>
                            <th class="fs-sm">3L</th>
                            <th class="fs-sm">UMD</th>
                            <th class="fs-sm text-end">cant</th>
                            <th class="fs-sm text-end">precio</th>
                            <th class="fs-sm text-end">Desc.</th>
                            <th class="fs-sm text-end">%Desc.</th>
                            <th class="fs-sm text-end">total</th>
                        </thead>
                        <tbody>
                            <template v-for="(det, index) in orderDetail" :key="index">
                                <tr>
                                    <td class="fs-sm code" width="5px">{{ index + 1 }}</td>
                                    <td class="fs-sm code" width="105px">{{ det.ART_CODIGO }}</td>
                                    <td class="fs-sm" width="500px">
                                        <a v-if="hasDescriptionChange(det)" href="javascript:void(0)"
                                            class="text-danger fw-semibold" :title="det.ART_DESCRIPCION"
                                            @click="showDescriptionDiff(det)">
                                            {{ det.ART_DESCRIPCION }}
                                        </a>

                                        <span v-else :title="det.ART_DESCRIPCION">
                                            {{ det.ART_DESCRIPCION }}
                                        </span>
                                    </td>
                                    <td class="fs-sm">{{ det.ART_CODIGO_TRES_LETRAS }}</td>
                                    <td class="fs-sm">{{ det.ART_PLAN_UMEDIDA }}</td>
                                    <td class="fs-sm text-end nums fw-bold"> {{ det.ART_CANTIDAD }}</td>
                                    <td class="fs-sm text-end nums fw-bold">
                                        <a v-if="hasPriceChange(det)" href="javascript:void(0)"
                                            class="text-danger fw-semibold" @click="showPriceDiff(det)">
                                            ${{ formatPriceJm(det.ART_VALOR) }}
                                        </a>
                                        <span v-else>
                                            ${{ formatPriceJm(det.ART_VALOR) }}
                                        </span>
                                    </td>
                                    <td class="fs-sm text-end nums fw-bold">
                                        ${{ formatPriceJm(det.ART_DESCUENTO) }}
                                    </td>
                                    <td class="fs-sm text-end nums fw-bold">
                                        <a v-if="hasDiscountChange(det)" href="javascript:void(0)"
                                            class="text-danger fw-semibold" @click="showDiscountDiff(det)">
                                            {{ format(det.descuento) }}%
                                        </a>
                                        <span v-else>
                                            {{ format(det.descuento) }}%
                                        </span>
                                    </td>
                                    <td class="fs-sm text-end nums fw-bold"> ${{ formatPriceJm(calculateTotal(det)) }}
                                    </td>
                                </tr>
                                <tr v-if="det.proveedores?.length">
                                    <td colspan="10" class="provider-row">
                                        <table class="table table-sm table-borderless align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th class="fs-sm">Descripción L</th>
                                                    <th class="fs-sm text-end">Cantidad</th>
                                                    <th class="fs-sm text-end">Precio venta mín.</th>
                                                    <th class="fs-sm text-end">Margen</th>
                                                    <th class="fs-sm text-end">Costo unit.</th>
                                                    <th class="fs-sm text-end">Subtotal</th>
                                                    <th class="fs-sm text-end">Impuesto</th>
                                                    <th class="fs-sm text-end">Total</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr v-for="(proveedor, indice) in det.proveedores" :key="indice">
                                                    <td class="fs-sm">{{ proveedor.DESCRIPCION_ARTICULO }}</td>
                                                    <td class="fs-sm text-end nums">{{ proveedor.CANTIDAD }}</td>
                                                    <td class="fs-sm text-end nums">${{ formatPriceJm(proveedor.margen)
                                                        }}</td>
                                                    <td class="fs-sm text-end nums">{{ format(proveedor.MARGEN) }}%</td>
                                                    <td class="fs-sm text-end nums">${{
                                                        formatPriceJm(proveedor.COSTO_UNITARIO) }}</td>
                                                    <td class="fs-sm text-end nums">${{ formatPriceJm(proveedor.TOTAL)
                                                        }}</td>
                                                    <td class="fs-sm text-end nums">${{
                                                        formatPriceJm(proveedor.IMPUESTO) }}</td>
                                                    <td class="fs-sm text-end nums fw-bold">${{
                                                        formatPriceJm(proveedor.TOTALCONIMPUESTO) }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end text-uppercase py-1">subt</td>
                                <td class="fw-semibold text-end nums py-1">
                                    ${{ formatPriceJm(parseFloat(orderHeader.subtotal)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end text-uppercase py-1">desc</td>
                                <td class="fw-semibold text-end nums py-1">
                                    ${{ formatPriceJm(parseFloat(orderHeader.descuento)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end text-uppercase py-1">Sub - desc</td>
                                <td class="fw-semibold text-end nums py-1">
                                    ${{ formatPriceJm(parseFloat(orderHeader.subtotalmenosdescuento)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end text-uppercase py-1">Iva</td>
                                <td class="fw-semibold text-end nums py-1">
                                    ${{ formatPriceJm(parseFloat(orderHeader.iva)) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="fw-semibold text-end text-uppercase py-1">total</td>
                                <td class="fw-semibold text-end nums py-1">
                                    ${{ formatPriceJm(parseFloat(orderHeader.total)) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div class="block-content block-content-full bg-body border-top">
                <div v-if="isPendingApprovalCommercial" class="alert alert-warning d-flex align-items-center mb-0"
                    role="alert">
                    <i class="fa fa-triangle-exclamation me-2"></i>

                    <div>
                        <div class="fw-bold">
                            Pedido pendiente de aprobación comercial
                        </div>
                        <div class="small">
                            Este pedido aún requiere aprobación comercial. Primero debe ser aprobado comercialmente para
                            continuar
                            con la aprobación crediticia.
                        </div>
                    </div>
                </div>
                <div v-else class="row g-2 align-items-center">
                    <label for="approval-message" class="col-sm-2 col-form-label text-sm-end fw-semibold">
                        Mensaje:
                    </label>
                    <div class="col-sm-7">
                        <input id="approval-message" v-model="approvalMessage" type="text"
                            class="form-control form-control-sm" placeholder="Motivo de rechazo" />
                    </div>
                    <div class="col-sm-3 text-sm-end">
                        <button type="button" class="btn btn-success btn-sm me-1" @click="approveOrder"
                            :disabled="isProcessing">
                            <i class="fa fa-check me-1"></i>
                            Aprobar
                        </button>

                        <button type="button" class="btn btn-danger btn-sm" @click="rejectOrder"
                            :disabled="isProcessing">
                            <i class="fa fa-times me-1"></i>
                            Rechazar
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div>
    </div>
</template>

<style lang="css" scoped>
.table-head-sticky th {
    position: sticky;
    top: 0;
    background: var(--tuval-surface, #fff);
    z-index: 1;
}

.kv small {
    display: block;
    line-height: 1;
}

.kv .badge {
    white-space: normal;
    text-align: left;
    display: block;
    line-height: 1.4;
    font-size: 12px;
    font-weight: 500;
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

.label-small {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--tuval-text-muted);
    margin-bottom: 0.35rem;

}

.provider-row {
    background: var(--tuval-surface-muted, #f8f9fa);
    border-radius: 0.5rem;
    padding: 0.5rem !important;
}
</style>
