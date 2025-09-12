<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useApprovedReservations } from "@/composables/venta/cotizaciones/reservas/useApprovedReservations";
import { usePtoVtaStore } from "../../../stores/bodegas/utils/useListPuntoVentaStore";
import { formatPriceJm } from "@/functions";
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

const { columns, listPerpage, listStatus, table, fetchList, onSort, refresh } = useApprovedReservations();
const ptoVta = usePtoVtaStore();


function isRowDisabled(row) {
}

const handleClick = ({ row, col }) => {

};

function test(row) {
    console.log(row);

}

const estadoClass = (st) => {
    switch (st || "") {
        case "pendiente":
            return "badge bg-dark text-light fw-semibold";
        case "aprobado":
            return "badge bg-success  fw-semibold";
        case "rechazada":
            return "badge bg-danger  fw-semibold";
        case "cancelada":
            return "badge bg-warning  fw-semibold";
        case "facturado":
            return "badge bg-success  fw-semibold";
        default:
            return "badge bg-secondary";
    }
};

const totalClass = (total) => {
    if (total > 0) {
        return "text-end fw-semibold";
    }
    return "text-end fw-semibold";
};





onMounted(() => {
    ptoVta.fetchAll();
    if (!table.items.length && !table.loading) {
        fetchList(1);
    }
});
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
                    <select name="" id="" class="form-control form-control-sm"  v-model="table.ptovta">
                      <option v-for="p in ptoVta.list" :key="p.PTO_VTA_BOD_PUNTO_VENTA" :value="p.PTO_VTA_BOD_PUNTO_VENTA">
                    {{ p.PTO_VTA_BOD_BODEGA }}
                  </option>
                    </select>
                </div>
                <!-- sucursal -->
                <div class="col-12 col-sm-6 col-lg-2">
                    <small class="text-muted d-block mb-1">Cliente</small>
                    <select name="" id="" class="form-control form-control-sm">
                        <option value="">Todas</option>
                        <option value="1">Cliente 1</option>
                        <option value="2">Cliente 2</option>
                    </select>
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
                    <button type="button" class="btn btn-primary btn-sm mx-1" @click="test(row)">
                        <i class="fa-solid fa-circle-check me-1"></i> ver
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

</template>