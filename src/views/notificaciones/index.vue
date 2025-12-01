<script setup>
import { onMounted, ref } from 'vue';
import { swalError, swalSuccess } from "@/functions/swal-alert.js";
import { useNotifications } from '@/composables/notificaciones/useNotifications';
const { table, columns, listPerpage, onSort, refresh, fetchAllNotify,loadingMarkAsRead,
    markAsReadItem, markAsReadAll
} = useNotifications();
import BaseTable from "@/components/BaseTable.vue";

const handleClick = ({ row, col }) => {
    if (col.key === "numero_guia") {
    }
};


const lockIdMark = ref(new Map());
function isLockedMark(row) {
    const id = typeof row === "object" ? row?.id : row;
    return lockIdMark.value.get(String(id)) === true;
}

function lockMark(id) {
    const m = new Map(lockIdMark.value)
    m.set(String(id), true)
    lockIdMark.value = m;
}
function unLockedMark(id) {
    const m = new Map(lockIdMark.value)
    m.delete(String(id))
    lockIdMark.value = m
}


async function markAsReadNotify(row) {
    if (!row || row.id === null) return
    const id = row.id
    if (isLockedMark(id)) return
    lockMark(id);

    const res = await markAsReadItem(id);
    if (res?.ok) {
        unLockedMark(id);
        swalSuccess('Notificacion marcada como leida.');
    } else {
        unLockedMark(id);
        swalError(res?.message || 'No se pudo marcar la notificacion.');
    }
}

async function markAllItemsRead(){
    const resp = await markAsReadAll();
    if (!resp.ok) {
        swalError(resp.message);
        return;
    }
    swalSuccess(resp.message);
}

onMounted(() => {
    if (!table.items.length && !table.loading) {
        fetchAllNotify(1);
    }
});
</script>

<template>
    <!-- Hero -->
    <BasePageHeading title="Notificaciones" subtitle="Notificaciones y mensajes">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item" aria-current="page">Notificaciones</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
    <!-- END Hero -->

    <div class="content">
        <BaseBlock title="Notificaciones" content-full rounded>

            <template #options>
                <div class="block-options-item space-x-2">
                    <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading"
                        title="Refrescar" aria-label="Refrescar">
                        <i v-if="!table.loading" class="fa fa-refresh"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                    <button class="btn btn-outline-success btn-sm" @click="markAllItemsRead" :disabled="loadingMarkAsRead"
                        title="Marcar todas como leidas" aria-label="Refrescar">
                        <i v-if="!loadingMarkAsRead" class="fa fa-check-double"></i>
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
                @onPageChange="fetchAllNotify" @onSearch="table.searchTerm" @onClick="handleClick">
                <!-- Slot específico para la columna 'estado' -->
                <template #actions="{ row }">
                    <button type="button" class="btn btn-primary btn-sm mx-1" aria-placeholder="marcar como leido"
                        @click="markAsReadNotify(row)" :disabled="isLockedMark(row)">
                        <span v-if="isLockedMark(row)" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <i v-else class="fa fa-check"></i>
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

<style lang="css" scoped></style>
