<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref, onBeforeUnmount, nextTick } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { Modal } from "bootstrap";
import { formatPriceJm } from "@/functions";
import { useOrderReservationTable } from "@/composables/venta/pedidos/useOrderReservationTable.js";
import { useApiValidatesOrdersReservation } from "@/composables/venta/pedidos/useApiValidatesOrdersReservation.js";
import verActualizarFechaFacturaReserva from "@/views/ventas/pedidos/modals/verActualizarFechaFacturaReserva.vue";
import verActualizarPendienteDespachoPedidosModal from "@/views/ventas/pedidos/modals/verActualizarPendienteDespachoPedidosModal.vue";

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

const { validateExistingGuidesWithAjustment } = useApiValidatesOrdersReservation();

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
    return row.origen === 'factura_demanda' && !BLOCKED_STATES.includes(row.estado);
}
async function openModalUpdateDateInvoice(pedido) {
    if (pedido.origen !== 'factura_demanda') {
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

/** funciones para actualizar el estado pendientde de pedidos */
let verModalUpdatePendienteDespacho = ref(null);
let verModalUpdatePendienteDespachoObj = null;
let datosModalPendienteDespacho = ref({});

async function openModalUpdatePendienteDespacho(pedido) {
    const resp = await validateExistingGuidesWithAjustment(pedido.id);
    if (resp.ok) {
        swalWarning('No puede realizar el bloqueo de despacho en este pedido: ' + resp.message);
        return;
    }
    datosModalPendienteDespacho.value = pedido;
    await nextTick();
    verModalUpdatePendienteDespachoObj = Modal.getOrCreateInstance(verModalUpdatePendienteDespacho.value, { backdrop: true })
    verModalUpdatePendienteDespachoObj.show();
}

async function closeModalUpdatePendienteDespacho() {
    await nextTick();
    datosModalPendienteDespacho.value = {};
    verModalUpdatePendienteDespachoObj.hide();
    refresh();
}


function initialModal() {
    if (verModalUpdateDateInvoice.value) {
        verModalUpdateDateInvoiceObj = Modal.getOrCreateInstance(verModalUpdateDateInvoice.value, { backdrop: true })
    }
    if (verModalUpdatePendienteDespacho.value) {
        verModalUpdatePendienteDespachoObj = Modal.getOrCreateInstance(verModalUpdatePendienteDespacho.value, { backdrop: true })
    }
}

function motivoEspera(pedido) {
    let msg = 'Pedido ';
    if (pedido.factura_siguiente_mes) {
        msg += 'factura a siguiente mes';
    }
    if (pedido.requiere_aprobacion_comercial === 'yes' && pedido.aprobado_comercial === 'no') {
        msg += ' requiere aprobación comercial ';
    }
    if (pedido.requiere_aprobacion_comercial === 'yes' && pedido.aprobado_comercial === 'no' && pedido.requiere_aprobacion_crediticia === 'yes') {
        msg += ' y ';
    }
    if (pedido.requiere_aprobacion_crediticia === 'yes' && pedido.aprobado_crediticio === 'no') {
        msg += ' requiere aprobación crediticia ';
    }
    if (pedido.factura_a_demanda) {
        msg += 'requiere factura a demanda posterior al despacho ';
    }
    swalWarning(msg);
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
                @onSearch="table.searchTerm" @onClick="handleClick" :is-row-disabled="isRowDisabled" @onKeyDown="handleClick">

                <template #cell-estado="{ value, row }">
                    <span v-if="row.estado === 'espera'" :class="estadoClass(value)" style="font-size:0.75rem;"
                        @click="motivoEspera(row)">
                        {{ row.estado ?? "N/A" }}</span>
                    <span v-else :class="estadoClass(value)" style="font-size:12px;">{{
                        row.estado ?? "N/A"
                    }}</span>
                </template>
                <template #cell-total="{ value, row }">
                    <span :class="totalClass(value)"> ${{ formatPriceJm(row.total) ?? "N/A" }}</span>
                </template>
                <!-- slot para cambiar el diseño y estilo de la columna para listar las bodegas usadas por la cotizacion -->

                <template #actions="{ row }">
                    <button type="button" class="btn btn-sm btn-alt-secondary" id="dropOptions"
                        data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-fw fa-ellipsis-v"></i> </button>

                    <ul class="dropdown-menu dropdown-menu-end  shadow-sm"
                        aria-labelledby="dropOptions">
                        <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Gestión</li>
                        <li v-if="canRescheduleInvoice(row)">
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="openModalUpdateDateInvoice(row)">
                                <i class="fa-regular fa-calendar-days me-2"></i>Reprogramar Fecha
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2 text-warning"
                                @click="openModalUpdatePendienteDespacho(row)">
                                <i class="fa-solid fa-clipboard-check me-2 "></i> Bloquear Despacho
                            </button>
                        </li>
                    </ul>


                    <!-- <button v-if="canRescheduleInvoice(row)" type="button" class="btn btn-secondary btn-sm mx-1"
                        title="Reprogramar Fecha Factura" @click="openModalUpdateDateInvoice(row)"
                        :disabled="isTestLocked(row)">
                        <span v-if="isTestLocked(row)" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <i v-else class="fa-regular fa-calendar-days"></i>
                    </button> -->
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
                    :pedido="datosModalPedidoAcDate" @closeModal="closeModalUpdateDateInvoice">
                </verActualizarFechaFacturaReserva>
            </div>
        </div>
    </div>

    <!-- modal para actualizar el pendiente de despacho de pedidos de factura demanda -->
    <div class="modal" id="modal-noventa" tabindex="-1" role="dialog" aria-labelledby="modal-noventa" aria-hidden="true"
        ref="verModalUpdatePendienteDespacho">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <verActualizarPendienteDespachoPedidosModal
                    v-if="datosModalPendienteDespacho && datosModalPendienteDespacho.id"
                    :pedido="datosModalPendienteDespacho" @closeModal="closeModalUpdatePendienteDespacho">
                </verActualizarPendienteDespachoPedidosModal>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped></style>
