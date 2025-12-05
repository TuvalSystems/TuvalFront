<script setup>
import { onMounted, reactive, ref, onBeforeUnmount, nextTick } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { usePtoVtaStore } from "@/stores/bodegas/utils/useListPuntoVentaStore";
import BaseTable from "@/components/BaseTable.vue";
import { useSendReservationTable } from '@/composables/bodegas/consultas/useSendReservationTable.js'
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';
import { useDetalleDespachoPedidos } from "@/composables/bodegas/consultas/detallesconsulta/useDetalleDespachoPedidos";
import { swalWarning, swalError, swalSuccess } from "@/functions/swal-alert.js";
import { formatPrice } from "@/functions";

const { table, columns, listPerpage, fetchList, onSort, refresh } = useSendReservationTable();
const { printGuidePdf } = useReservationTransferByWarehouse();
const { fetchDetailGuideReservation } = useDetalleDespachoPedidos();

const ptoVta = usePtoVtaStore();

const flatPickrState = reactive({
    fecha_desde: {
        // maxDate: Date.now(),
        locale: Spanish,
    },
    fecha_hasta: {
        maxDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        locale: Spanish,
    },
});

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

const handleClick = async ({ row, col }) => {
    if (col.key === "numero_guia") {
        await resetConsut();
        await buscarDetalleGuia(row);

    }
};

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

async function printPdfGuiaRemision(id) {
    const res = await printGuidePdf({ 'id': id });
    if (res?.ok) {
        await nextTick()
        swalSuccess('Documento generado correctamente.');
    } else {
        swalError(res?.message || 'No se pudo generar el PDF.')
    }
}


const detalleItem = ref({});
const showDetalle = ref(false);
const showTable = ref(true);
const guiaSeleccionada = ref(null);
const loadindDetalleGuia = ref(null);
async function buscarDetalleGuia(guia) {
    showTable.value = true;
    showDetalle.value = false;
    loadindDetalleGuia.value.statusLoading();
    const resp = await fetchDetailGuideReservation(guia.id);
    if (!resp?.ok) {
        await swalError(resp?.message);
        return;
    }
    await nextTick();
    guiaSeleccionada.value = guia;
    showTable.value = false;
    showDetalle.value = true;
    detalleItem.value = resp?.data;
    loadindDetalleGuia.value.statusNormal();

}

function optionShowTable() {
    showTable.value = !showTable.value
}

function optionShowDetalleGuia() {
    showDetalle.value = !showDetalle.value
    if (showDetalle.value === true) {
        loadindDetalleGuia.value.statusLoading();
        setTimeout(() => {
            loadindDetalleGuia.value.statusNormal();
        }, 2000);
    }
}

async function resetConsut() {
    guiaSeleccionada.value = null;
    detalleItem.value = [];
    showTable.value = true;
    showDetalle.value = false;
    loadindDetalleGuia.value.statusNormal();
}

onMounted(() => {
    if (!table.items.length && !table.loading) {
        fetchList(1);
    }
    ptoVta.fetchAll();
});
</script>

<template>
    <div class="content-fluid p-1 m-2">
        <BaseBlock title="Reservas enviadas" content-full rounded>
            <template #options>
                <div class="block-options-item">
                    <button class="btn btn-outline-primary btn-sm" title="Refrescar" aria-label="Refrescar"
                        @click="refresh">
                        <i v-if="!table.loading" class="fa fa-refresh"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                </div>
                <div class="block-options-item">
                    <button type="button" class="btn-block-option" @click="optionShowTable">
                        <i :class="['fa', showTable ? 'fa-angle-up' : 'fa-angle-down', 'opacity-100']"></i>
                    </button>
                </div>
            </template>
            <div v-show="showTable">
                <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
                    <!-- fecha -->
                    <div class="col-12 col-lg-4">
                        <small class="text-muted d-block mb-1">Fecha</small>
                        <div class="d-flex align-items-center">
                            <flat-pickr id="fecha_desde" class="form-control form-control-sm"
                                v-model="table.filters.fecha_desde" :config="flatPickrState.fecha_desde" />
                            <span class="text-muted">—</span>
                            <flat-pickr id="fecha_hasta" class="form-control form-control-sm"
                                v-model="table.filters.fecha_hasta" :config="flatPickrState.fecha_hasta" />
                        </div>
                    </div>
                    <!-- sucursal -->
                    <div class="col-12 col-sm-6 col-lg-2">
                        <small class="text-muted d-block mb-1">Bodega</small>
                        <select name="" id="" class="form-control form-control-sm"
                            v-model="table.filters.ptoVtaDestino">
                            <option value="">Todos</option>
                            <option v-for="p in ptoVta.list" :key="p.PTO_VTA_BOD_PUNTO_VENTA"
                                :value="p.PTO_VTA_BOD_PUNTO_VENTA">
                                {{ p.PTO_VTA_BOD_BODEGA }}
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

                <!-- basetable -->
                <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.perPage"
                    :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
                    :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort" @onPageChange="fetchList"
                    @onSearch="table.searchTerm" @onClick="handleClick" :is-row-disabled="isRowDisabled">

                    <template #actions="{ row }">
                        <button type="button" class="btn btn-outline-primary btn-sm mx-1"
                            title="Reprogramar Fecha Factura" @click="printPdfGuiaRemision(row.id)"
                            :disabled="isTestLocked(row)">
                            <span v-if="isTestLocked(row)" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <i v-else class="fa fa-print mx-1"></i>
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
                <!-- end basetable -->
            </div>
        </BaseBlock>


        <!-- secccionde la informacion de la guia -->
        <BaseBlock rounded title="Información de Guia" ref="loadindDetalleGuia" class="mb-3">
            <template #options>
                <div class="block-options-item">
                    <button type="button" class="btn-block-option" @click="optionShowDetalleGuia">
                        <i :class="['fa', showDetalle ? 'fa-angle-up' : 'fa-angle-down', 'opacity-100']"></i>
                    </button>
                </div>
            </template>
            <div class="content" v-if="guiaSeleccionada && showDetalle">
                <!-- cabecera del detalle de la Guia -->
                <div class="table-responsive">
                    <table class="table table-hover table-sm table-vcenter">
                        <tbody>
                            <tr>
                                <th class="text-uppercase fs-sm text-muted">Guia</th>
                                <td class="fs-sm">{{ guiaSeleccionada.numero_guia }}</td>

                                <th class="text-uppercase fs-sm text-muted">bodega destino</th>
                                <td class="fs-sm">{{ guiaSeleccionada.bodega_destino }}</td>
                            </tr>
                            <tr>
                                <th class="text-uppercase fs-sm text-muted">cliente</th>
                                <td class="fs-sm">{{ guiaSeleccionada.razon_social_destinatario }}</td>
                                <th class="text-uppercase fs-sm text-muted">Ruc</th>
                                <td class="fs-sm">{{ guiaSeleccionada.identificacion_destinatario || 'N/A' }}
                                </td>
                                <th class="text-uppercase fs-sm text-muted">Dirección</th>
                                <td class="fs-sm">{{ guiaSeleccionada.direccion_destinatario || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th class="text-uppercase fs-sm text-muted">Transporte</th>
                                <td class="fs-sm">{{ guiaSeleccionada.razon_social_transportista }}</td>
                                <th class="text-uppercase fs-sm text-muted">Placa</th>
                                <td class="fs-sm">{{ guiaSeleccionada.placa || 'N/A' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="row">
                    <div v-if="detalleItem.quoteList.length > 0" class="col-md-6">
                        <table>
                            <tbody>
                                <th class="fs-sm text-uppercase text-muted"> COTIZACIONES :
                                    <span v-for="c in detalleItem.quoteList" :key="c"> {{ c }}<span
                                            v-if="c != detalleItem.quoteList.length - 1">, </span></span>
                                </th>
                            </tbody>
                        </table>

                    </div>
                </div>
                <div style="text-align: right;">
                    <p class="fs-sm text-muted text-uppercase">Peso total: {{ formatPrice(detalleItem.pesoTotal, 2) }}
                        Kg</p>
                </div>

                <div class="card-body p-4">
                    <div class="table-responsive">
                        <table class="table table-striped table-sm table-vcenter">
                            <thead>
                                <tr>
                                    <th class="fs-sm text-uppercase text-muted text-center">codigo</th>
                                    <th class="fs-sm text-uppercase text-muted text-center">cod. let. itm</th>
                                    <th class="fs-sm text-uppercase text-muted text-end">Cantidad</th>
                                    <th class="fs-sm text-uppercase text-muted text-end">unidad</th>
                                    <th class="fs-sm text-uppercase text-muted text-center">descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(art, index) in detalleItem.detalle" :key="index">
                                    <td class="fs-sm text-center">{{ art.art_code }}</td>
                                    <td class="fs-sm text-center">{{ art.art_cod_tres_letras }}</td>
                                    <td class="fs-sm text-end">{{ art.cantidad }}</td>
                                    <td class="fs-sm text-end">{{ art.art_plan_umedida }}</td>
                                    <td class="fs-sm text-center">{{ art.art_descripcion }}
                                        <span v-if="art.detallecotizacion.CHECK_ALTERNATIVO == 1"
                                            class="badge bg-danger"> {{
                                                art.detallecotizacion.CHECK_ALTERNATIVO }}</span>
                                        <span v-else></span>

                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn btn-outline-primary btn-sm mx-2"
                        @click="printPdfGuiaRemision(guiaSeleccionada.id)">
                        <i class="fa fa-print"></i>
                    </button>
                </div>
            </div>
        </BaseBlock>

    </div>
</template>
