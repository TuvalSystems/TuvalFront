<script setup>
import { onMounted, watch } from 'vue';
import { useReservationTransferReceipt } from "@/composables/bodegas/reservas/useReservationTransferReceipt";
import {
    swalSuccess,
    swalError,
    toast
} from "@/functions/swal-alert.js";
import Swal from "sweetalert2";
const emit = defineEmits(['closeModal', 'refresh']);
const props = defineProps({
    'header': Object,
});
const { data, loading, fetchDetail, loadingPdf, loadingReceived, printPdfOrderStorage, sanitize, processReceivedItems } = useReservationTransferReceipt();

function closeModal() {
    emit('closeModal');
}

watch(() => props.header, (id) => {
    if (id) {
        fetchDetail(props.header.id);
    }
}, { immediate: true });


/** acciones rapidas */
function clearAll() {
    (data.value || []).forEach(r => { r.recibir_ahora = 0; });
}

/** print pdf */
async function printPdf(id) {
    const res = await printPdfOrderStorage(id);
    if (!res?.ok) {
        swalError(res?.message || 'No se pudo generar el PDF.');
        return
    }
    swalSuccess('Documento generado correctamente.');
}


/** confirmar recibir items */

async function confirmarRecibir() {

    if (loadingReceived.value) return;
    const rows = Array.isArray(data.value) ? data.value : [];
    const items = rows
        .map(r => {
            const recibir = Math.min(Math.max((r.recibir_ahora), 0), r.pending_received);
            const c_cotizacion = r.cotizacion.cotizacion ?? '';
            return { ...r, recibir, c_cotizacion };
        }).filter(r => r.recibir > 0);

    if (items.length === 0) {
        return swalError('No se encontraron items para recibir.');
    }
    const guideId = props.header?.id;
    const numeroGuia = props.header?.numero_guia ?? '';
    const payload = {
        guiaId: guideId,
        items: items
    }
    loadingReceived.value = true;
    toast.fire({
        title: 'Confimar recibir items?',
        icon: 'question',
        html: `Vas a recibir <b>${items.length}</b> ítems .<br>Guía: <b>${numeroGuia}</b>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn btn-success m-1',
            cancelButton: 'btn btn-secondary m-1',
        },
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 50);
            });

        },
    }).then((r) => {
        const isConfirmed = r?.isConfirmed;
        if (isConfirmed) {
            procesar(payload);
        }
        if (r?.dismiss === 'cancel') {
            closeModal()
        }
    });
}

async function procesar(payload) {
    const resp = await processReceivedItems(payload);
    if (!resp?.ok) {
        swalError(resp?.message || 'No se pudo procesar la recepción.');
        return;
    }
    swalSuccess(resp?.message)
    emit('closeModal');
    emit('refresh');
    return resp;
}

onMounted(async () => {

});
</script>

<template>
    <BaseBlock :title="`Detalle de Guía: ${props.header.numero_guia}`" class="mb-0 modal-card shadow-lg" bordered
        themed>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>

        <!-- Meta de cabecera -->
        <div class="row g-3 px-3 pt-2">
            <div class="col-12 col-md-4">
                <div class="kv">
                    <div class="text-muted mini">Origen</div>
                    <div class="fw-semibold">{{ props.header?.bodega_origen ?? '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="kv">
                    <div class="text-muted mini">Placa</div>
                    <div class="fw-semibold">{{ props.header?.placa ?? '-' }}</div>
                </div>
            </div>
            <div class="col-12 col-md-5">
                <div class="text-muted mini">Cotizaciones</div>
                <div class="chips-wrap">
                    <span v-if="!props.header?.quotesText.length" class="text-muted mini">—</span>
                    <span v-else class="fw-semibold mini">{{ props.header?.quotesText }}</span>
                </div>
            </div>
        </div>

        <!-- acciones -->
        <div class="d-flex gap-2 justify-content-end px-1 mt-4">
            <button class="btn btn-sm btn-outline-secondary" @click="clearAll" title="Encerar">
                <i class="fa fa-eraser me-1"></i>
            </button>

        </div>
        <!-- Loader -->
        <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando información...</p>
        </div>
        <div v-if="!loading && data" class="container mt-2">
            <div class="table-responsive mb-4">
                <table class="table table-sm table-borderless align-middle mb-0 ">
                    <thead>
                        <tr>
                            <th class="fs-sm">Cod</th>
                            <th class="fs-sm d-none d-md-table-cell">Cotización</th>
                            <th class="fs-sm d-none d-md-table-cell">CTL</th>
                            <th class="fs-sm d-none d-md-table-cell">UDM</th>
                            <th class="fs-sm d-none d-md-table-cell">Descripción</th>
                            <th class="fs-sm text-end">CANT.</th>
                            <th class="fs-sm text-end">PEND.</th>
                            <th class="fs-sm text-end">RECIBIR</th>
                        </tr>
                    </thead>
                    <tbody v-if="!loading">
                        <tr v-for="(art, i) in data" :key="i">
                            <td class="fs-sm code nums kv">{{ art.art_code }}</td>
                            <td class="mini kv d-none d-md-table-cell"> <span
                                    class="badge text-bg-dark border border-secondary ">{{
                                        art.cotizacion.cotizacion }}</span></td>
                            <td class="d-none d-md-table-cell"><span
                                    class="badge text-bg-dark border border-secondary "> {{
                                        art.art_cod_tres_letras
                                    }}</span>
                            </td>
                            <td class="d-none d-md-table-cell"><span class="badge bg-info text-dark">{{
                                art.art_plan_umedida
                                    }}</span>
                            </td>
                            <td class="mini text-wrap d-none d-md-table-cell">{{ art.art_descripcion }}</td>
                            <td class="text-end mini">{{ art.cantidad }}</td>
                            <td class="text-end mini">{{ art.pending_received }}</td>
                            <td class="text-end mini" style="width: 80px">
                                <input type="text" class="form-control text-end form-control-sm"
                                    v-model="art.recibir_ahora" @input="sanitize(art)" @blur="sanitize(art)"
                                    :placeholder="String(art.pending_received ?? 0)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
        <div class=" text-end mb-4">
            <button type="button" class="btn btn-sm btn-alt-secondary " data-bs-dismiss="modal" @click="closeModal">
                Close
            </button>
            <button type="button" class="btn btn-warning btn-sm mx-1" @click="printPdf(props.header.id)"
                :disabled="loadingPdf">
                <i class="fa fa-print"></i> Ord. almacenamiento
            </button>
            <button type="button" class="btn btn-sm btn-primary" :disabled="loadingReceived"
                @click="confirmarRecibir(row)">
                <span v-if="loadingReceived" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                <i v-else class="fa fa-check me-1"></i>
                Recibir
            </button>
        </div>
    </BaseBlock>
</template>

<style lang="css" scoped>
.table.table-sm>:not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .25rem;
}

.sticky-header thead th {
    position: sticky;
    top: 0;
    background: var(--bs-body-bg);
    z-index: 1;
}


/* Números monoespaciados */
.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 14px;
}

.nums {
    font-variant-numeric: tabular-nums;
}

.mini {
    font-size: .85rem;
}


/* Chips de cotización */
.chips-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: .375rem;
}

.chip {
    padding: .15rem .5rem;
    border-radius: 999px;
    background: #0b1727;
    color: #e6e9ef;
    border: 1px solid #334155;
    font-size: .72rem;
}

/* Key–value */
.kv .fw-semibold {
    line-height: 1.1;
}
</style>
