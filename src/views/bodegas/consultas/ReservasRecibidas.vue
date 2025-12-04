<script setup>
import { onMounted, reactive, ref, onBeforeUnmount, nextTick } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { usePtoVtaStore } from "@/stores/bodegas/utils/useListPuntoVentaStore";
import BaseTable from "@/components/BaseTable.vue";
import { useReceivedReservationTable } from '@/composables/bodegas/consultas/useReceivedReservationTable.js'
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';

const { table,
    columns,
    listPerpage,
    fetchList,
    onSort,
    refresh } = useReceivedReservationTable();
const {
    printGuidePdf
} = useReservationTransferByWarehouse();
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

const handleClick = ({ row, col }) => {
    if (col.key === "numero_guia") {
        console.log('Olap k ase');

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
            </template>

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
                    <small class="text-muted d-block mb-1">Sucursal</small>
                    <select name="" id="" class="form-control form-control-sm" v-model="table.filters.ptoVtaDestino">
                        <option value="">Todos</option>
                        <option v-for="p in ptoVta.list" :key="p.PTO_VTA_BOD_PUNTO_VENTA"
                            :value="p.PTO_VTA_BOD_PUNTO_VENTA">
                            {{ p.PTO_VTA_DESCRIPCION }}
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
                    <button type="button" class="btn btn-outline-primary btn-sm mx-1" title="Reprogramar Fecha Factura"
                     @click="printPdfGuiaRemision(row.id)"
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
        </BaseBlock>
    </div>
</template>

<style lang="css" scoped></style>
