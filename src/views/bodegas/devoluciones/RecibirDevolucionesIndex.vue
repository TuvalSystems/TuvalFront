<script setup>
import { onMounted, ref, nextTick } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import { Modal } from "bootstrap";
import { useDevolutionReceivedTable } from "@/composables/bodegas/devoluciones/useDevolutionReceivedTable.js";
import { useProcessDetailDevolution } from "@/composables/bodegas/devoluciones/useProcessDetailDevolution.js";
import verRecibirDevolucionesModal from "@/views/bodegas/devoluciones/modals/verDevolucionRecibirItemsModal.vue";
import {
    swalError,
} from "@/functions/swal-alert.js";

const { table,
    columns,
    onSort,

    refresh,
    listPerpage,
    refacturaClass,
    fetchData } = useDevolutionReceivedTable();


const { fetchDetail } = useProcessDetailDevolution();
/** este bloque es para desactivar el click de la tabla */

const lockedIds = ref(new Set())
function lock(id) {
    const s = new Set(lockedIds.value)
    s.add(id)
    lockedIds.value = s
}
function unlock(id) {
    const s = new Set(lockedIds.value)
    s.delete(id)
    lockedIds.value = s
}
function isRowDisabled(row) {
    return row && lockedIds.value.has(row.id)
}


const handleClick = ({ row, col }) => {
    if (col.key === "devolucion") {
        openModalRecibirDevoluciones(row.id);
    }
};



/** este bloquedo desactiva el boton del modal  */
const modalLocks = ref(new Map());

const isModalLocked = (modalRow) => {
    const id = typeof modalRow === "object" ? modalRow?.id : modalRow;
    return modalLocks.value.get(String(id)) === true;
}

function lockModal(id) {
    const m = new Map(modalLocks.value)
    m.set(String(id), true)
    modalLocks.value = m;
}

function unLockedModal(id) {
    const m = new Map(modalLocks.value)
    m.delete(String(id))
    modalLocks.value = m
}



const dataModal = ref(null);
const verRecibirModal = ref(null);
let verRecibirModalObj = null;

async function openModalRecibirDevoluciones(id) {
    if (lockedIds.value.has(id)) return;
    lock(id);
    lockModal(id);

    const resp = await fetchDetail(id);
    if (!resp?.ok) {
        unlock(id);
        unLockedModal(id);
        await swalError(resp?.message);
        return
    }
    dataModal.value = resp.data;
    await nextTick();
    verRecibirModalObj = Modal.getOrCreateInstance(verRecibirModal.value, { backdrop: true });
    unlock(id);
    unLockedModal(id);
    verRecibirModalObj.show();
}

async function closeModalRecibirDevoluciones() {
    await nextTick();
    dataModal.value = null;
    verRecibirModalObj.hide();
    fetchData();
}



function modalsComponentSetup() {
    if (verRecibirModal.value) {
        verRecibirModalObj = Modal.getOrCreateInstance(verRecibirModal.value, { backdrop: true })
    }
}


onMounted(async () => {
    if (!table.items.length && !table.loading) {
        fetchData();
    }
    await nextTick();
    modalsComponentSetup();
});
</script>

<template>
    <!-- Hero -->
    <BasePageHeading title="Recibir devoluciones">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Bodegas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Devoluciones</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>


    <div class="content">
        <BaseBlock title="Recibir devoluciones" content-full rounded>
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
                    <select v-model="table.perPage" class="form-select form-select-sm">
                        <option v-for="item in listPerpage" :key="item.value" :value="item.value"> {{ item.label }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input v-model="table.searchTerm" placeholder="Buscar..." class="form-control form-control-sm" />
                </div>
            </div>


            <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :error="table.error" retryable
        @onRetry="fetchData(table.currentPage)" :perPage="table.perPage"
                :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
                :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort" @onPageChange="fetchData"
                @onSearch="table.searchTerm" @onClick="handleClick" @onKeyDown="handleClick" :is-row-disabled="isRowDisabled">

                <template #cell-volver_a_facturar="{ value, row }">
                    <span v-if="row.volver_a_facturar === 1" class="badge rounded-pill py-2 px-3 text-uppercase"
                        :class="refacturaClass(value)" style="font-size:0.75rem;">
                        <i class="fa fa-check-circle"></i> SI
                    </span>
                    <span v-else class="badge rounded-pill py-2 px-3 text-uppercase" :class="refacturaClass(value)"
                        style="font-size:0.75rem;">
                        <i class="fa fa-xmark"></i> NO</span>
                </template>

                <!-- slot para cambiar el diseño y estilo de la columna para listar las bodegas usadas por la cotizacion -->
                <template #actions="{ row }">
                    <button type="button" class="btn btn-primary btn-sm mx-1" title="Recibir devolucion"
                        :disabled="isModalLocked(row)" @click="openModalRecibirDevoluciones(row.id)">
                        <span v-if="isModalLocked(row)" class="spinner-border spinner-border-sm" 
                            aria-hidden="true"></span>
                        <i v-else class="fas fa-box-open "></i>
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



    <!-- Modal de recibir devoluciones -->
    <div class="modal" id="modal-cotizacion-detalle" tabindex="-1" role="dialog"
        aria-labelledby="modal-cotizacion-detalle" aria-hidden="true" ref="verRecibirModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <verRecibirDevolucionesModal v-if="dataModal" :info="dataModal"
                    @closeModal="closeModalRecibirDevoluciones()">
                </verRecibirDevolucionesModal>
            </div>
        </div>
    </div>


</template>
