<script setup>
import { nextTick, onMounted, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import { useVersionManagementTable } from "@/composables/sistemas/movil/useVersionManagementTable";
import { useVersionManagementProcess } from "@/composables/sistemas/movil/useVersionManagementProcess";
import verModalCreacionVersionApk from "@/views/sistemas/movil/modals/verModalCreacionVersionApk.vue"
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
    estadoClass
} = useVersionManagementTable();
const {
    loadingUpdateStatus,
    updateStatusVersion,
    formatApkSize,
    loadingDelete,
    deleteVersion,
    resetForm
} = useVersionManagementProcess();


//modals 
const modalCreateRef = ref(null);
const modalCreateObj = useBootstrapModal(modalCreateRef);


const handleClick = ({ row, col }) => {

};

function isRowDisabled(row) {
    return false;

}



async function cambiarEstadoVersion(row) {
    let newActive = !row.is_active;
    const resp = await updateStatusVersion(row.id, newActive);
    if (resp?.ok) {
        swalSuccess(resp.message);
        refresh();
        return;
    }
    const msg = resp?.message || "No se pudo actualizar el estado de la versión";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);

};

async function eliminarVersion(row) {

    const respD = await deleteVersion(row.id);
    if (respD?.ok) {
        swalSuccess(respD.message);
        refresh();
        return;
    }
    const msg = respD?.message || "No se puedo eliminar la versión";
    (respD?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
};



async function openModalCrearVersion() {
    resetForm();
    await nextTick();
    modalCreateObj.show();
}

async function closeModal() {
    modalCreateObj.hide();
}

onMounted(() => {
    fetchList(1);
});
</script>

<template>
    <BasePageHeading title="Versiones APK">
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

    <div class="content">
        <BaseBlock title="Lista de Versiones" content-full rounded>
            <template #options>
                <div class="block-options-item">
                    <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading"
                        title="Refrescar" aria-label="Refrescar">
                        <i v-if="!table.loading" class="fa fa-refresh"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                </div>
            </template>
            <div class="row g-3 justify-content-end align-items-end px-0 pt-2 pb-1 mb-4">
                <div class="col-12 col-md-auto">
                    <button type="button" class="btn btn-primary w-100 btn-sm" @click="openModalCrearVersion">
                        <i class="fa fa-plus me-1"></i> Subir APK
                    </button>
                </div>
            </div>

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

                <template #cell-id="{ row }">
                    <span class="badge bg-body-secondary  text-muted  border" style="font-size:12px">
                        #{{ row.id }}
                    </span>
                </template>

               
                <template #cell-platform="{ row }">
                    <span class="badge  bg-body-secondary platform-chip" :class="row.platform?.toLowerCase() === 'android'
                        ? ' text-success'
                        : ' text-dark'">
                        <i :class="row.platform?.toLowerCase() === 'android'
                            ? 'fab fa-android'
                            : 'fab fa-apple'" class="me-1"></i>
                        {{ row.platform }}
                    </span>
                </template>
                <template #cell-version_name="{ row }">
                    <div class="d-inline-flex align-items-center gap-1">
                        <span class="badge bg-primary-light text-secondary fw-semibold version-chip">
                            <i class="fa fa-code-branch me-1"></i>
                            v{{ row.version_name }}
                        </span>
                    </div>
                </template>

                <template #cell-build_number="{ row }">
                    <span class="badge bg-info-light text-info fw-semibold build-chip">
                        Build #{{ row.build_number }}
                    </span>
                </template>

                <template #cell-minimum_required_build="{ row }">
                    <span class="badge fw-semibold build-chip" :class="Number(row.minimum_required_build) === Number(row.build_number)
                        ? 'bg-warning-light text-warning'
                        : 'bg-body-secondary text-muted border'">
                        Min #{{ row.minimum_required_build }}
                    </span>
                </template>
                <template #cell-is_active="{ value, row }">
                    <span :class="estadoClass(value)" style="font-size:12px">{{
                        row.is_active === true ? 'Activo' : 'Inactivo'
                        }}</span>
                </template>
                <template #cell-apk_size_bytes="{ row }">
                    <span class="badge bg-secondary" style="font-size:12px">{{ formatApkSize(row.apk_size_bytes)
                        }}</span>

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
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm"
                        :aria-labelledby="`dropOptions-${row.id}`">
                        <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Gestión</li>
                        <li v-if="row.apk_url">
                            <a class="dropdown-item d-flex align-items-center gap-2 py-2" :href="row.apk_url"
                                target="_blank" rel="noopener noreferrer">
                                <i class="fa fa-download fa-fw text-success"></i> <span>Descargar APK</span>
                            </a>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="cambiarEstadoVersion(row)">
                                <i class="fa fa-fw"
                                    :class="row.is_active ? 'fa-toggle-off text-warning' : 'fa-toggle-on text-success'"></i>
                                <span>
                                    {{ row.is_active ? 'Desactivar' : 'Activar' }}
                                </span>
                            </button>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                                @click="eliminarVersion(row)">
                                <i class="fa fa-trash fa-fw"></i>
                                <span>Eliminar</span>
                            </button>
                        </li>
                    </ul>
                </template>
                <!-- end slot de acciones -->
            </BaseTable>
            <!-- end table -->

        </BaseBlock>
    </div>



    <div class="modal" id="modal-subir-version" tabindex="-1" aria-labelledby="modal-subir-version" aria-hidden="true"
        ref="modalCreateRef">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <verModalCreacionVersionApk @closeModal="closeModal" @refresh="refresh">
                </verModalCreacionVersionApk>
            </div>
        </div>
    </div>
</template>

<style scoped>
.version-chip,
.build-chip {
    font-size: 11px;
    letter-spacing: 0.2px;
    padding: 0.32rem 0.55rem;
    border-radius: 999px;
    white-space: nowrap;
}

.platform-chip {
    font-size: 11px;
    letter-spacing: 0.3px;
    padding: 0.32rem 0.55rem;
    border-radius: 999px;
}
</style>
