<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { Modal } from "bootstrap";
import BaseTable from "@/components/BaseTable.vue";
import { useReceiveReservationTransfers } from "@/composables/bodegas/reservas/useReceiveReservationTransfers";
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';
import verRecibirReserva from "@/views/bodegas/reservas/modals/verRecibirReservaModal.vue"
import {
    swalError,
    swalSuccess
} from "@/functions/swal-alert.js";
const {
    //states
    table,
    columns,
    listPerpage,

    //functions
    onSort,
    refresh,
    fetchListReceivedReservationTransfers,
} = useReceiveReservationTransfers();

const {
    printGuidePdf,
} = useReservationTransferByWarehouse();


/** datos de modales */
let receivedModal = ref(null);
let receivedModalObj = null;

/** functions standar component table  */
const handleClick = ({ row, col }) => {
    if (col.key === "numero_guia") {
    }
};


const lockedIds = ref(new Set());
function isRowDisabled(row) {
    return lockedIds.value.has(row.id);
}



/** bloqueo de modal  */
const lockRecived = ref(new Map());
const isModalRecivedLocked = (row) => {
    const id = typeof row === "object" ? row?.id : row;
    return lockRecived.value.get(String(id)) === true;
}

function lockReceived(id) {
    const m = new Map(lockRecived.value)
    m.set(String(id), true)
    lockRecived.value = m;
}


function unLockRecived(id) {
    const m = new Map(lockRecived.value)
    m.delete(String(id))
    lockRecived.value = m
}


const dataHeaderModal = ref({});
async function openModalRecived(row) {
    dataHeaderModal.value = {};
    if (!row || row.id === null) return
    const id = row.id
    dataHeaderModal.value = row
    if (isModalRecivedLocked(id)) return
    lockReceived(id);
    await nextTick();
    receivedModalObj = Modal.getOrCreateInstance(receivedModal.value, { backdrop: true });
    unLockRecived(id);
    receivedModalObj.show();
}

async function closeModalRecived() {
    await nextTick();
    dataHeaderModal.value = {};
    receivedModalObj.hide();
}


/** print pdf */
const lockIdPdf = ref(new Map());
function islockedPdf(row) {
    const id = typeof row === "object" ? row?.id : row;
    return lockIdPdf.value.get(String(id)) === true;
}
function lockPdf(id) {
    const m = new Map(lockIdPdf.value)
    m.set(String(id), true)
    lockIdPdf.value = m;
}
function unLockedPdf(id) {
    const m = new Map(lockIdPdf.value)
    m.delete(String(id))
    lockIdPdf.value = m
}
async function printPdfGuiaRemision(row) {

    if (!row || row.id === null) return
    const id = row.id
    if (islockedPdf(id)) return
    lockPdf(id);
    const res = await printGuidePdf({ 'id': id });
    if (res?.ok) {
        unLockedPdf(id);
        await nextTick()
        swalSuccess('Documento generado correctamente.');
    } else {
        unLockedPdf(id);
        swalError(res?.message || 'No se pudo generar el PDF.')
    }
}



async function initalModal() {
    if (receivedModal.value) {
        receivedModalObj = Modal.getOrCreateInstance(receivedModal.value, { backdrop: true })
    }
}

onMounted(async () => {

    if (!table.items.length && !table.loading) {
        fetchListReceivedReservationTransfers(1);
    }
    await nextTick()
    initalModal();
});
</script>

<template>
    <!-- Hero -->
    <BasePageHeading title="Recibir Reservas">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Bodegas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Recibir Reservas</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
    <!-- END Hero -->
    <!-- Page Content -->

    <!-- END Page Content -->
    <div class="content">
        <BaseBlock title="Recibir Reservas" content-full rounded>
            <template #options>
                <div class="block-options-item">
                    <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading"
                        title="Refrescar" aria-label="Refrescar">
                        <i v-if="!table.loading" class="fa fa-refresh"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                </div>
            </template>
            <div class="row justify-content-between align-items-center mb-3">
                <div class="col-md-1">
                    <select v-model="table.perPage" class="form-select">
                        <option v-for="item in listPerpage" :key="item.value" :value="item.value"> {{ item.label }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input v-model="table.searchTerm" placeholder="Buscar..." class="form-control" />
                </div>
            </div>
            <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.perPage"
                :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
                :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort"
                @onPageChange="fetchListReceivedReservationTransfers" @onSearch="table.searchTerm"
                @onClick="handleClick" :is-row-disabled="isRowDisabled">
                <!-- Slot específico para la columna 'estado' -->
                <template #actions="{ row }">
                    <button type="button" class="btn btn-primary btn-sm mx-1" aria-placeholder="imprir pdf"
                        @click="printPdfGuiaRemision(row)" :disabled="islockedPdf(row)">
                        <span v-if="islockedPdf(row)" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <i v-else class="fa fa-print"></i>
                    </button>
                    <button type="button" class="btn btn-success btn-sm nowrap mx-1" aria-placeholder="recibir"
                        @click="openModalRecived(row)" :disabled="isModalRecivedLocked(row)">
                        <span v-if="isModalRecivedLocked(row)" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <i v-else class="fa fa-people-carry-box"></i>
                        Recibir
                    </button>
                </template>
                <!-- Slot de vacío -->
                <template #empty>
                    <div class="text-center py-5">
                        <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0">
                            No se encontraron registros para mostrar
                        </p>
                    </div>
                </template>
            </BaseTable>
        </BaseBlock>
    </div>


    <!-- modal para recibir reservas -->
    <div class="modal" id="modal-guia-reservas" tabindex="-1" role="dialog" aria-labelledby="modal-guia-reservas"
        aria-hidden="true" ref="receivedModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <verRecibirReserva v-if="dataHeaderModal && dataHeaderModal.id" :header="dataHeaderModal"
                    @closeModal="closeModalRecived()" @refresh="refresh()">
                </verRecibirReserva>
            </div>
        </div>
    </div>

</template>

<style scoped>
@media (min-width: 1000px) {
    .table.table-sm> :not(caption)>*>* {
        padding-top: .25rem;
        padding-bottom: .15rem;
    }
}
</style>
