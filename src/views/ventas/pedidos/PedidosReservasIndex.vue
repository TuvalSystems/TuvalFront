<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref, onBeforeUnmount, nextTick } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { Modal } from "bootstrap";
import { formatPriceJm } from "@/functions";
import { useOrderReservationTable } from "@/composables/venta/pedidos/useOrderReservationTable.js";
import verActualizarFechaFacturaReserva from "@/views/ventas/modals/verActualizarFechaFacturaReserva.vue";

import {
    swalWarning,
    swalError,
} from "@/functions/swal-alert.js";

const flatPickrState = reactive({
    fecha_desde: {
        // maxDate: Date.now(),
        locale: Spanish,
    },
    fecha_hasta: {
        // maxDate: Date.now(),
        locale: Spanish,
    },
});

const {
    columns,
    table,
    listPerpage,
    fetchList,
    onSort,
    refresh,
    totalClass,
    estadoClass,
} = useOrderReservationTable();

// functiones de locked para tabla
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
    // if (col.key === "cotizacion") {
    //     visualizarDetalleCotización(row.id);
    // }
};

// disable para el boton 

const testLocks = ref(new Map()) // Map<id, true>

const isTestLocked = (idOrRow) => {
    const id = typeof idOrRow === 'object' ? idOrRow?.id : idOrRow
    return testLocks.value.get(String(id)) === true
}

function lockTest(id) {

    const m = new Map(testLocks.value)
    m.set(String(id), true)
    testLocks.value = m        // 👈 reasignar dispara reactividad
}

function unlockTest(id) {
    const m = new Map(testLocks.value)
    m.delete(String(id))
    testLocks.value = m        // 👈 idem
}


let verModalUpdateDateInvoice = ref(null);
let verModalUpdateDateInvoiceObj = null;
let datosModalPedidoAcDate = ref({});

const BLOCKED_STATES = ['facturado', 'rechazado', 'anulada', 'eliminado'];
function canRescheduleInvoice(row) {
    return row.origen === 'reserva' && !BLOCKED_STATES.includes(row.estado);
}
async function openModalUpdateDateInvoice(pedido) {
    if (pedido.origen !== 'reserva') {
        swalWarning('Solo se puede reprogramar la facturación de pedidos de origen reserva')
        return;
    }
    datosModalPedidoAcDate.value = pedido;
    await nextTick();
    verModalUpdateDateInvoiceObj = Modal.getOrCreateInstance(verModalUpdateDateInvoice.value, { backdrop: true })
    verModalUpdateDateInvoiceObj.show();
}

async function closeModalUpdateDateInvoice() {
    await nextTick();
    datosModalPedidoAcDate.value = {};
    verModalUpdateDateInvoiceObj.hide();
    refresh();
}


function initialModal() {
    if (verModalUpdateDateInvoice.value) {
        verModalUpdateDateInvoiceObj = Modal.getOrCreateInstance(verModalUpdateDateInvoice.value, { backdrop: true })
    }

}

onMounted(async () => {
    if (!table.items.length && !table.loading) {
        fetchList(1);
    }
    await nextTick();
    initialModal();
});
</script>

<template>
    <BasePageHeading title="Pedidos Reservas">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Ventas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Pedidos_Reservas</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>

    <!-- contenido -->
    <div class="content">
        <BaseBlock title="Reprogramar Facturación" content-full rounded>
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
                :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort" @onPageChange="fetchList"
                @onSearch="table.searchTerm" @onClick="handleClick" :is-row-disabled="isRowDisabled">

                <template #cell-estado="{ value, row }">
                    <span :class="estadoClass(value)" style="font-size:12px">{{
                        row.estado ?? "N/A"
                        }}</span>
                </template>
                <template #cell-total="{ value, row }">
                    <span :class="totalClass(value)"> ${{ formatPriceJm(row.total) ?? "N/A" }}</span>
                </template>
                <!-- slot para cambiar el diseño y estilo de la columna para listar las bodegas usadas por la cotizacion -->

                <template #actions="{ row }">
                    <button v-if="canRescheduleInvoice(row)" type="button" class="btn btn-secondary btn-sm mx-1"
                        title="Reprogramar Fecha Factura" @click="openModalUpdateDateInvoice(row)"
                        :disabled="isTestLocked(row)">
                        <span v-if="isTestLocked(row)" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <i v-else class="fa-regular fa-calendar-days"></i>
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


    <!-- modal de actualizacion de fecha de facturacion de reserva -->

    <div class="modal" id="modal-noventa" tabindex="-1" role="dialog" aria-labelledby="modal-noventa" aria-hidden="true"
        ref="verModalUpdateDateInvoice">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <verActualizarFechaFacturaReserva v-if="datosModalPedidoAcDate && datosModalPedidoAcDate.id"
                    :pedido="datosModalPedidoAcDate" 
                    @closeModal="closeModalUpdateDateInvoice">
                </verActualizarFechaFacturaReserva>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped></style>
