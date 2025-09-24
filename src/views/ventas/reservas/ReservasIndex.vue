<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref, onBeforeUnmount } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useApprovedReservations } from "@/composables/venta/cotizaciones/reservas/useApprovedReservations";
import { usePtoVtaStore } from "../../../stores/bodegas/utils/useListPuntoVentaStore";
import { formatPriceJm } from "@/functions";
import { Modal } from "bootstrap";
import { useQuotationReserveApproval } from "@/composables/aprobaciones/reservas/useQuotationReserveApproval";
import {
    swalWarning,
    swalError,
} from "@/functions/swal-alert.js";
//modales
import FiltrarClienteConsulta from "@/views/bodegas/modals/FiltrarClienteConsulta.vue";
import VerCotizacionDetalleReservaComponent from "@/views/aprobaciones/modals/VerCotizacionDetalleReservaModal.vue";
import verUsoReservaModal from "@/views/ventas/reservas/modal/verUsoReservaModal.vue";
import verUsoFacturaDemandaComponent from "@/views/ventas/reservas/modal/verUsoFacturaDemandaModal.vue";

// import { echo } from '@/resources/echo'


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

const { columns, listPerpage, listStatus, table, fetchList, onSort, refresh, estadoClass, totalClass } = useApprovedReservations();
const ptoVta = usePtoVtaStore();
const {
    fetchQuotationWithDetial,
    fetchQuotationWithDetialAndStockActive
} = useQuotationReserveApproval();



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
    if (col.key === "cotizacion") {
        visualizarDetalleCotización(row.id);
    }
};


/** disabled boton aprobar */

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

const dataModal = ref(null);
let verCrearEditarReservaModal = ref(null);
let verCrearEditarReservaModalObj = null;
let verUsoFacturaDemandaModalObj = null;
let verUsoFacturaDemandaModal = ref(null);
async function crearReserva(row) {

    if (row.st_solResInv == 'pendiente') {
        swalWarning("La reserva aun no ha sido aprobada, no puede visualizar el detalle");
        return;
    }
    if (row.tipo_reserva_id == 1) {
        openModalUsoReserva(row);

    } else if (row.tipo_reserva_id == 2) {
        openModalUsoFacturaDemanda(row);
    }


}

async function openModalUsoReserva(row) {

    if (!row || row.id == null) return
    const id = row.id
    if (isTestLocked(id)) return

    try {
        lockTest(id)
        const response = await fetchQuotationWithDetialAndStockActive(row.id);
        if (response) {
            dataModal.value = response;
            verCrearEditarReservaModalObj.show();
        }
        unlockTest(id);
    } catch (e) {
        swalError(e?.response?.data?.error || e?.message || 'Error')
    } finally {
        unlockTest(id)
    }
}

async function openModalUsoFacturaDemanda(row) {
    if (!row || row.id == null) return
    const id = row.id
    if (isTestLocked(id)) return
    try {
        lockTest(id)
        const response = await fetchQuotationWithDetialAndStockActive(row.id);
        if (response) {
            dataModal.value = response;
            verUsoFacturaDemandaModalObj.show();
        }
        unlockTest(id);
    } catch (e) {
        swalError(e?.response?.data?.error || e?.message || 'Error')
    } finally {
        unlockTest(id)
    }
}

async function closeModalUsoReserva() {
    verCrearEditarReservaModalObj.hide();
    dataModal.value = null;
    refresh();
}

async function closeModalUsoFacturaDemanda() {
    verUsoFacturaDemandaModalObj.hide();
    dataModal.value = null;
    refresh();
}







// funcion para modal de filtro de cliente
let filtrarClienteModal = ref(null);
let filtrarClienteModalObj = null;
function levantarFiltrocliente() {
    filtrarClienteModalObj.show();
}

function filtrarClienteConsulta(clienteRuc) {
    filtrarClienteModalObj.hide();
    table.cliente = clienteRuc;
}


/** funciones para visualizar el detalle de la cotizacion  */

let verCotizacionDetalleModal = ref(null);
let verCotizacionDetalleModalObj = null;
let datosModalCotizacionDetalle = ref(null);
let datosModalCotizacionSegmento = ref(null);
async function visualizarDetalleCotización(id) {
    if (lockedIds.value.has(id)) return;
    lock(id);
    try {
        const response = await fetchQuotationWithDetial(id);
        if (response) {
            datosModalCotizacionDetalle.value = response.cotizacion;
            datosModalCotizacionSegmento.value = response.segmento;
            verCotizacionDetalleModalObj.show();
            unlock(id);
        }
    } catch (error) {
        console.log(error);
    } finally {
        unlock(id); // 🔓 re-habilita esa fila
    }
}


function modalesComponent() {
    filtrarClienteModalObj = new Modal(filtrarClienteModal.value);
    verCotizacionDetalleModalObj = new Modal(verCotizacionDetalleModal.value);
    verCrearEditarReservaModalObj = new Modal(verCrearEditarReservaModal.value);
    verUsoFacturaDemandaModalObj = new Modal(verUsoFacturaDemandaModal.value);
}

onMounted(() => {
    modalesComponent();
    ptoVta.fetchAll();
    if (!table.items.length && !table.loading) {
        fetchList(1);
    }

    // try {
    //     echo.connector.pusher.connection.bind('connected', () => console.log('🔌 WS conectado'))
    //     echo.connector.pusher.connection.bind('error', (err) =>
    //         console.warn('⚠️ WS error', err)
    //     )

    // } catch {
    // }
    // const chan = echo.channel('test')
    //     .subscribed(() => console.log('📡 Suscrito a canal: test'))
    //     .listen('.DemoMessage', (e) => console.log('✅ DemoMessage recibido:', e))

    // // Opcional: dejar accesible para inspección en consola
    // window.__chan = chan
});
// onBeforeUnmount(() => { try { echo.leave('test') } catch {} });
</script>
<template>
    <BasePageHeading title="Reservas">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Ventas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Reservas</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>


    <!-- contenido -->
    <div class="content">
        <BaseBlock title="Reservas" content-full themed rounded>
            <template #options>
                <div class="block-options-item">
                    <button class="btn btn-outline-success btn-sm" @click="refresh" :disabled="table.loading"
                        title="Refrescar" aria-label="Refrescar">
                        <i v-if="!table.loading" class="fa fa-refresh"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                </div>
            </template>
            <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
                <!-- fecha -->
                <div class="col-12 col-lg-4">
                    <small class="text-muted d-block mb-1">Fecha</small>
                    <div class="d-flex align-items-center">
                        <flat-pickr id="fecha_desde" class="form-control form-control-sm" v-model="table.fecha_desde"
                            :config="flatPickrState.fecha_desde" />
                        <span class="text-muted">—</span>
                        <flat-pickr id="fecha_hasta" class="form-control form-control-sm" v-model="table.fecha_hasta"
                            :config="flatPickrState.fecha_hasta" />
                    </div>
                </div>
                <!-- sucursal -->
                <div class="col-12 col-sm-6 col-lg-2">
                    <small class="text-muted d-block mb-1">Sucursal</small>
                    <select name="" id="" class="form-control form-control-sm" v-model="table.ptovta">
                        <option v-for="p in ptoVta.list" :key="p.PTO_VTA_BOD_PUNTO_VENTA"
                            :value="p.PTO_VTA_BOD_PUNTO_VENTA">
                            {{ p.PTO_VTA_BOD_BODEGA }}
                        </option>
                    </select>
                </div>
                <!-- sucursal -->
                <div class="col-12 col-sm-6 col-lg-2">
                    <small class="text-muted d-block mb-1">Cliente</small>
                    <button type="button" title="Seleccionar cliente" @click="levantarFiltrocliente()"
                        class="btn btn-outline-info btn-sm w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-2">
                        <i class="fa fa-user"></i>
                        <span>Cliente</span>
                    </button>
                </div>
                <!-- sucursal -->
                <div class="col-12 col-sm-6 col-lg-2">
                    <small class="text-muted d-block mb-1">Estado</small>
                    <select class="form-select form-select-sm" v-model="table.status">
                        <option v-for="item in listStatus" :key="item.value" :value="item.value"> {{ item.label }}
                        </option>
                    </select>
                </div>
            </div>
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

                <template #cell-st_solResInv="{ value, row }">
                    <span :class="estadoClass(value)">{{
                        row.st_solResInv ?? "N/A"
                    }}</span>
                </template>
                <template #cell-total="{ value, row }">
                    <span :class="totalClass(value)"> ${{ formatPriceJm(row.total) ?? "N/A" }}</span>
                </template>
                <template #actions="{ row }">
                    <button type="button" class="btn btn-primary btn-sm mx-1" title="Usar Reserva"
                        @click="crearReserva(row)" :disabled="isTestLocked(row)">
                        <span v-if="isTestLocked(row)" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <i v-else class="far fa-circle-right"></i>
                        <!-- <span>{{ isTestLocked(row) ? 'Cargando…' : 'Ver' }}</span> -->
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

    <!-- Modal para filtro de cliente -->
    <div class="modal" id="modal-filtrar-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-filtrar-cliente"
        aria-hidden="true" ref="filtrarClienteModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <FiltrarClienteConsulta @filtrarClienteConsulta="filtrarClienteConsulta"></FiltrarClienteConsulta>
            </div>
        </div>
    </div>


    <!-- Modal de reserva -->
    <div class="modal" id="modal-cotizacion-detalle" tabindex="-1" role="dialog"
        aria-labelledby="modal-cotizacion-detalle" aria-hidden="true" ref="verCotizacionDetalleModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <VerCotizacionDetalleReservaComponent v-if="datosModalCotizacionDetalle &&
                    datosModalCotizacionSegmento &&
                    datosModalCotizacionDetalle.id" :infoCotizacion="datosModalCotizacionDetalle"
                    :segmento="datosModalCotizacionSegmento">
                </VerCotizacionDetalleReservaComponent>
            </div>
        </div>
    </div>

    <!-- Modal de generacion de reservas -->
    <div class="modal" id="modal-uso-reserva" tabindex="-1" role="dialog" aria-labelledby="modal-uso-reserva"
        aria-hidden="false" ref="verCrearEditarReservaModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <verUsoReservaModal v-if="dataModal" :reserva="dataModal"
                    @closeModalUsoReserva="closeModalUsoReserva()">
                </verUsoReservaModal>
            </div>
        </div>
    </div>

    <!-- Modal para generar facturas a demanda -->
    <div class="modal" id="modal-uso-reserva" tabindex="-1" role="dialog" aria-labelledby="modal-uso-reserva"
        aria-hidden="false" ref="verUsoFacturaDemandaModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <verUsoFacturaDemandaComponent v-if="dataModal" :reserva="dataModal"
                    @closeModalUsoFacturaDemanda="closeModalUsoFacturaDemanda()">
                </verUsoFacturaDemandaComponent>
            </div>
        </div>
    </div>
</template>