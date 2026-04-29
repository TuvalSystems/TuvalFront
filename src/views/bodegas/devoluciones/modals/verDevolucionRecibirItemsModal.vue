<script setup>
import { ref, reactive, computed, onMounted, toRef, nextTick } from "vue";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert";
import { useProcessDetailDevolution } from "@/composables/bodegas/devoluciones/useProcessDetailDevolution.js";

const props = defineProps({
    info: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

const infoRef = toRef(props, 'info');
const emit = defineEmits(["closeModal"]);

const {
    getStatusClass,
    orderDispatchBadge,
    dispacthDev,
    reInvoice,
    selectAllItems,
    canReceivedItems,
    selectAllArticle,
    applyDevolution,
    //pdf
    loadingPdfOrden,
    printPdfOrdenStorage,

    //recibir devoluciones
    loadingProcess,
    processDevolutionsDetails,

    //denny
    loadingDenny,
    dennyDevolution
} = useProcessDetailDevolution(infoRef);

const header = computed(() => props.info?.devolucion || {});
const details = computed(() => props.info?.detalle || []);
const segmento = computed(() => props.info?.segmento || {});
const pedido = computed(() => props.info?.pedido || {});




async function printOrdenAlm(art) {
    const resp = await printPdfOrdenStorage({ 'id': art.id });
    if (resp?.ok) {
        swalSuccess("Archivo descargado correctamente");
        return;
    }
    const msg = resp?.message || "No se pudo generar el documento";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}


async function proccessDevolucion() {
    const resp = await processDevolutionsDetails();
    if (!resp?.ok) {
        if (resp?.status >= 400 && resp?.status < 500) {
            await swalWarning(resp?.message);
            return
        }
        if (resp?.status >= 500) {
            await swalError(resp?.message);
            return;
        }
        await swalError(resp?.message || "Ocurrió un error inesperado.");
        return;
    }
    await swalSuccess(resp?.message || "Proceso realizado exitosamente.");
    emit('closeModal');
}



async function processDennyDevolution() {
    const resp = await dennyDevolution(header.value.id);
    if (!resp?.ok) {
        if (resp?.status >= 400 && resp?.status < 500) {
            await swalWarning(resp?.message);
            return
        }
        if (resp?.status >= 500) {
            await swalError(resp?.message);
            return;
        }
        await swalError(resp?.message || "Ocurrido un error inesperado.");
        return;
    }
    await swalSuccess(resp?.message || "Proceso realizado exitosamente.");
    emit('closeModal');
}


onMounted(() => { });
</script>

<template>
    <BaseBlock title="Recibir devolución" transparent>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <!-- cabecera -->
            <div class="block-content fs-sm m-2">
                <div class="row g-2 mb-3">
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Devolución</small>
                            <div class="fw-semibold">{{ header.devolucion }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Factura</small>
                            <div class="fw-semibold">{{ header.factura }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Pedido</small>
                            <div class="fw-semibold">{{ header.pedido }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Ruc</small>
                            <div class="fw-semibold">{{ pedido.CLI_RUC }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Razón Social</small>
                            <div class="fw-semibold">{{ pedido.CLI_RAZON_SOCIAL }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Usuario</small>
                            <div class="fw-semibold">{{ header.USERID }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Fecha/Hora</small>
                            <div class="fw-semibold">{{ header.created_at }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Motivo Devolución</small>
                            <div class="fw-semibold">{{ header.motivo }}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Estado</small>
                            <div class="fw-semibold">
                                <span class="badge rounded-pill py-2 px-3 text-uppercase"
                                    :class="getStatusClass(header.estado)">
                                    {{ header.estado }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Orden Despacho</small>
                            <div class="fw-semibold">
                                <span class="badge rounded-pill py-2 px-3 text-uppercase"
                                    :class="orderDispatchBadge.class">
                                    <i class="fa" :class="orderDispatchBadge.icon"></i>{{ orderDispatchBadge.label
                                    }}</span>
                            </div>

                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Despachado</small>
                            <div class="fw-semibold">
                                <span class="badge rounded-pill py-2 px-3 text-uppercase" :class="dispacthDev.class">
                                    <i class="fa" :class="dispacthDev.icon"></i></span>
                            </div>

                        </div>
                    </div>
                    <div class="col-6 col-lg-4">
                        <div class="kv">
                            <small class="text-muted">Refactura</small>
                            <div class="fw-semibold">
                                <span class="badge rounded-pill py-2 px-3 text-uppercase" :class="reInvoice.class">
                                    <i class="fa" :class="reInvoice.icon"></i>{{ reInvoice.label
                                    }}</span>
                            </div>

                        </div>
                    </div>
                    <div v-if="segmento" class="col-12">
                        <div class="d-flex flex-wrap gap-2 align-items-center fs-sm">
                            <span class="text-muted fw-semibold">
                                Segmentación:
                            </span>

                            <template v-if="segmento.segmento || segmento.subsegmento">

                                <span v-if="segmento.segmento"
                                    class="badge rounded-pill bg-info text-light border border-info"
                                    style="font-size:12px">
                                    {{ segmento.segmento }}
                                </span>
                                <span v-if="segmento.subsegmento"
                                    class="badge rounded-pill bg-primary text-light border border-primary"
                                    style="font-size:12px">
                                    {{ segmento.subsegmento }}
                                </span>
                            </template>

                            <span v-else class="text-muted fst-italic text-opacity-75">
                                <i class="fa fa-ban me-1"></i>Sin Segmentación asignada
                            </span>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2 justify-content-end px-2">
                    <button class="btn btn-sm btn-outline-primary " @click="selectAllItems" title="Seleccionar Todo">
                        <i class="fa fa-list-check me-1"></i>
                    </button>
                </div>

                <!-- detalle -->
                <div class="table-responsive">
                    <table class="table table-sm table-borderless align-middle mb-0">
                        <thead style="position: sticky;">
                            <th class="fs-sm" style="font-size: 10px">#</th>
                            <th class="fs-sm" style="font-size: 10px">CÓDIGO</th>
                            <th class="fs-sm" style="font-size: 10px;text-align: left">descripción</th>
                            <th class="fs-sm" style="font-size: 10px;text-align: left">3L</th>
                            <th class="fs-sm" style="font-size: 10px">UMD</th>
                            <th class="fs-sm" style="font-size: 10px; text-align: right">Solicitado</th>
                            <th></th>
                            <th class="fs-sm" style="font-size: 10px; text-align:center">Recibir</th>
                            <th class="fs-sm" style="font-size: 10px">Compartimiento</th>
                        </thead>
                        <tbody>
                            <template v-for="(det, index) in details" :key="index">
                                <tr>
                                    <td class="fs-sm code">{{ index + 1 }}</td>
                                    <td class="fs-sm  code">{{ det.ART_CODIGO }}</td>
                                    <td class="fs-sm" style="text-align:left">{{ det.ART_DESCRIPCION }}</td>
                                    <td class="fs-sm">{{ det.ART_CODIGO_TRES_LETRAS }}</td>
                                    <td class="fs-sm">{{ det.ART_PLAN_UMEDIDA }}</td>
                                    <td class="fs-sm text-end fw-semibold">{{ det.pending_received_devolution }}</td>
                                    <td style="width:1.938rem">
                                        <input type="checkbox" class="form-check-input" v-model="det.aplicar_todo"
                                            @change="selectAllArticle(det)">
                                    </td>
                                    <td style=" text-align:center;width:5rem"> <input type="text"
                                            class="form-control form-control-sm text-end d-inline-block"
                                            v-model="det.new_devuelto" @change="applyDevolution(det)"></td>
                                    <td>
                                        <select class="form-select form-select-sm" v-model="det.compartimiento">
                                            <option v-for="(com, index) in det.compartimientos"
                                                :value="com.compartimento" :key="index">
                                                {{ com.compartimento }}
                                            </option>
                                        </select>

                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="content text-end mb-4 space-x-2">
        <button type="button" class="btn btn-sm btn-warning" :disabled="(loadingPdfOrden || !canReceivedItems)"
            @click="printOrdenAlm">
            <span v-if="loadingPdfOrden" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <i v-else class="fa fa-boxes-stacked me-1"></i>
            Orden de Alm.
        </button>
        <button type="button" class="btn btn-sm btn-primary" :disabled="(loadingProcess || !canReceivedItems)"
            @click="proccessDevolucion">
            <span v-if="loadingProcess" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <i v-else class="fa fa-check-circle me-1"></i>
            Recibir
        </button>
        <button type="button" class="btn btn-sm btn-danger" :disabled="loadingDenny" @click="processDennyDevolution">
            <span v-if="loadingDenny" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <i v-else class="fa fa-ban me-1"></i>
            Rechazar
        </button>
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal">
            Cerrar
        </button>

    </div>
</template>

<style scoped>
.kv small {
    display: block;
    line-height: 1.2;
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

.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 14px;
}
</style>