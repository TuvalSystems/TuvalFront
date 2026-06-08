<script setup>
import { nextTick, onMounted, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import { useUnapplicationTable } from "@/composables/cobranzas/desaplicaciones/useUnapplicationTable";
import { useUnapplicationProcess } from "@/composables/cobranzas/desaplicaciones/useUnapplicationProcess";
import { formatPriceJm } from "@/functions";
import verModalDesaplicacionDetalle from "@/views/cobranzas/desaplicaciones/modals/verModalDesaplicacionDetalle.vue";
import {
    swalSuccess,
    swalError,
    swalWarning
} from "@/functions/swal-alert.js";

const {
    table,
    columns,
    loadingRef,
    listPerpage,
    fetchList,
    refresh,
    onSort,
} = useUnapplicationTable();
const {
    detailPayment,
    loadingDetail,
    getDetail
} = useUnapplicationProcess();


const modalUnapplicationRef = ref(null);
const modalUnapplicationObj = useBootstrapModal(modalUnapplicationRef);

const splitCell = (value) => {
    if (!value) return [];

    return String(value)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
};

const visibleCell = (value, max = 2) => {
    return splitCell(value).slice(0, max);
};

const hiddenCellCount = (value, max = 2) => {
    const total = splitCell(value).length;
    return total > max ? total - max : 0;
};

const cellTitle = (value) => {
    const items = splitCell(value);
    return items.length ? items.join(', ') : 'N/A';
};
const handleClick = ({ row, col }) => {

}

function isRowDisabled(row) {
    return false;

};

const dataModal = ref(null);
async function openModalUnapplication(row) {
    const resp = await getDetail(row.ruc, row.factura);
    if (!resp?.ok) {
        const msg = resp?.message || "No se pudo actualizar el estado del usuario";
        (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
        return;
    }

    dataModal.value = {
        activos: resp.data?.activos ?? [],
        inactivos: resp.data?.inactivos ?? [],
        collectionsIds: resp.data?.collectionsIds ?? [],
        receiptNumbers: resp.data?.receiptNumbers ?? [],
        detalle: row,
    };
    await modalUnapplicationObj.show();
}


async function closeModal() {
    await nextTick();
    modalUnapplicationObj.hide();
}

onMounted(() => {
    fetchList(1);
});
</script>

<template>
    <BasePageHeading title="Desaplicaciónes Cobros">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Sistemas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Móvil</li>
                    <li class="breadcrumb-item" aria-current="page">Versiones</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>


    <!-- contenido -->
    <div class="content">
        <BaseBlock title="Lista de Cobros" content-full rounded>
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
                    <select v-model="table.filters.perpage" class="form-select form-select-sm">
                        <option v-for="item in listPerpage" :key="item.value" :value="item.value"> {{ item.label }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input v-model="table.filters.search" placeholder="Buscar..."
                        class="form-control form-control-sm" />
                </div>
            </div>


            <!-- table -->
            <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.filters.perpage"
                :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
                :sortField="table.filters.sortField" :sortOrder="table.filters.sortOrder" @onSort="onSort"
                @onPageChange="fetchList" @onSearch="table.filters.search" @onClick="handleClick"
                @onKeyDown="handleClick" :is-row-disabled="isRowDisabled">

                <template #cell-recibos="{ row }">
                    <div class="cell-compact" :title="cellTitle(row.recibos)">
                        <span v-for="recibo in visibleCell(row.recibos, 3)" :key="recibo"
                            class="cell-token cell-token-blue">
                            {{ recibo }}
                        </span>

                        <span v-if="hiddenCellCount(row.recibos, 3)" class="cell-token-more">
                            +{{ hiddenCellCount(row.recibos, 3) }}
                        </span>

                        <span v-if="!row.recibos" class="cell-na">N/A</span>
                    </div>
                </template>

                <template #cell-documentos_gp="{ row }">
                    <div class="cell-compact" :title="cellTitle(row.documentos_gp)">
                        <span v-for="documento in visibleCell(row.documentos_gp, 2)" :key="documento"
                            class="cell-token cell-token-cyan">
                            {{ documento }}
                        </span>

                        <span v-if="hiddenCellCount(row.documentos_gp, 2)" class="cell-token-more">
                            +{{ hiddenCellCount(row.documentos_gp, 2) }}
                        </span>

                        <span v-if="!row.documentos_gp" class="cell-na">N/A</span>
                    </div>
                </template>

                <template #cell-usuarios_creadores="{ row }">
                    <div class="cell-compact" :title="cellTitle(row.usuarios_creadores)">
                        <span v-for="usuario in visibleCell(row.usuarios_creadores, 2)" :key="usuario"
                            class="cell-token cell-token-muted">
                            {{ usuario }}
                        </span>

                        <span v-if="hiddenCellCount(row.usuarios_creadores, 2)" class="cell-token-more">
                            +{{ hiddenCellCount(row.usuarios_creadores, 2) }}
                        </span>

                        <span v-if="!row.usuarios_creadores" class="cell-na">N/A</span>
                    </div>
                </template>

                <template #cell-tipos_medio="{ row }">
                    <div class="cell-compact" :title="cellTitle(row.tipos_medio)">
                        <span v-for="tipo in visibleCell(row.tipos_medio, 2)" :key="tipo"
                            class="cell-token cell-token-soft">
                            {{ tipo }}
                        </span>

                        <span v-if="hiddenCellCount(row.tipos_medio, 2)" class="cell-token-more">
                            +{{ hiddenCellCount(row.tipos_medio, 2) }}
                        </span>

                        <span v-if="!row.tipos_medio" class="cell-na">N/A</span>
                    </div>
                </template>

                <template #cell-total_aplicado="{ row }">
                    <div class="text-end">
                        <span class="amount-cell">
                            ${{ formatPriceJm(row.total_aplicado ?? 0) }}
                        </span>
                    </div>
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

                <!-- slot de acciones -->
                <template #actions="{ row }">
                    <button type="button" class="btn btn-sm btn-alt-secondary" :id="`dropOptions-${row.id}`"
                        data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-fw fa-ellipsis-v"></i> </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm" :aria-labelledby="`dropOptions-${row.id}`">
                        <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Gestión</li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="openModalUnapplication(row)">
                                <i class="fa fa-circle-info fa-fw text-info"></i><span>Detalle</span>
                            </button>
                        </li>
                        <li>

                        </li>
                        <!-- <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>

                        </li> -->
                    </ul>
                </template>
                <!-- end slot de acciones -->
            </BaseTable>
            <!-- end table -->
        </BaseBlock>
    </div>



    <!-- modales -->
    <div class="modal" id="modal-open-unapplication" tabindex="-1" aria-labelledby="modal-open-unapplication"
        aria-hidden="true" ref="modalUnapplicationRef">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <verModalDesaplicacionDetalle v-if="dataModal" 
                    :detalle="dataModal.detalle"
                    :activos="dataModal.activos"
                    :inactivos="dataModal.inactivos" :documentos-gp="dataModal.collectionsIds"
                    :documentos-web="dataModal.receiptNumbers" @closeModal="closeModal" @refresh="refresh">
                </verModalDesaplicacionDetalle>
            </div>
        </div>
    </div>

</template>

<style scoped>
.amount-cell {
    justify-content: flex-end;
    min-width: 86px;
    border-radius: 0.65rem;
    font-weight: 800;
}

/* diseño para los cells */
.amount-cell {
    justify-content: flex-end;
    min-width: 86px;
    border-radius: 0.65rem;
    font-weight: 800;
}

/* diseño compacto para celdas */
.cell-compact {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    max-width: 320px;
}

.cell-token {
    display: inline-flex;
    align-items: center;
    max-width: 145px;
    padding: 0.16rem 0.45rem;
    border-radius: 0.45rem;
    font-size: 0.70rem;
    font-weight: 600;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid transparent;
}

/* recibos */
.cell-token-blue {
    color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.07);
    border-color: rgba(13, 110, 253, 0.12);
}

/* documentos gp */
.cell-token-cyan {
    color: #087990;
    background-color: rgba(13, 202, 240, 0.08);
    border-color: rgba(13, 202, 240, 0.14);
}

/* usuarios */
.cell-token-muted {
    background-color: rgba(108, 117, 125, 0.08);
    border-color: rgba(108, 117, 125, 0.14);
}

/* tipos de medio */
.cell-token-soft {
    color: #7a5c00;
    background-color: rgba(255, 193, 7, 0.10);
    border-color: rgba(255, 193, 7, 0.16);
}

.cell-token-more {
    display: inline-flex;
    align-items: center;
    padding: 0.12rem 0.4rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    color: #6c757d;
    background-color: rgba(108, 117, 125, 0.10);
}

.cell-na {
    font-size: 0.72rem;
    font-weight: 600;
    color: #adb5bd;
}
</style>
