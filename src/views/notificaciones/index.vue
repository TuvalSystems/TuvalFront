<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { swalError, swalSuccess } from "@/functions/swal-alert.js";
import { useNotifications } from '@/composables/notificaciones/useNotifications';
const { table, columns, listPerpage, onSort, refresh, fetchAllNotify,loadingMarkAsRead,
    markAsReadItem, markAsReadAll
} = useNotifications();
import BaseTable from "@/components/BaseTable.vue";

const router = useRouter();

const handleClick = ({ row, col }) => {
    if (col.key === "numero_guia") {
    }
};

function parseNotificationData(value) {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return {};

    try {
        return JSON.parse(value);
    } catch {
        return {};
    }
}

function getNotificationPayload(row) {
    const parsed = parseNotificationData(row?.data);
    if (parsed?.data) {
        const nested = parseNotificationData(parsed.data);
        if (Object.keys(nested).length) return nested;
    }

    return parsed;
}

function hasQuotationLink(row) {
    return !!getNotificationPayload(row)?.cotizacion;
}

function normalizeQuotationStatus(value) {
    const status = String(value ?? '').trim().toLowerCase();
    if (!status) return '';

    if (['procesado', 'procesada', 'procesados', 'procesadas'].includes(status)) {
        return 'procesadas';
    }

    if (['caducado', 'caducada', 'caducados', 'caducadas'].includes(status)) {
        return 'caducado';
    }

    if (['rechazado', 'rechazada', 'rechazados', 'rechazadas'].includes(status)) {
        return 'rechazadas';
    }

    return 'pendientes';
}

function getQuotationRoute(row) {
    const payload = getNotificationPayload(row);
    const cotizacion = payload?.cotizacion;
    const pvCodigo = payload?.pvCodigo ?? payload?.pv_codigo ?? payload?.PTO_VTA_ID;
    const pvId = payload?.pvId ?? payload?.pv_id ?? payload?.punto_venta_id;
    const status = payload?.estado ?? payload?.Estado ?? payload?.status ?? payload?.state;
    if (!cotizacion) return null;

    return {
        name: 'ventas-cotizaciones',
        query: {
            cotizacion,
            estado: normalizeQuotationStatus(status),
            ...(pvCodigo ? { pvCodigo } : {}),
            ...(pvId ? { pvId } : {}),
        }
    };
}

function getQuotationHref(row) {
    const route = getQuotationRoute(row);
    return route ? router.resolve(route).href : '#';
}

function goToQuotation(row) {
    const route = getQuotationRoute(row);
    if (!route) return;
    router.push(route);
}

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
                @onPageChange="fetchAllNotify" @onSearch="table.searchTerm" @onClick="handleClick" @onKeyDown="handleClick"> 
                <template #cell-title="{ row, value }">
                    <a v-if="hasQuotationLink(row)" :href="getQuotationHref(row)" class="fw-semibold"
                        @click.prevent="goToQuotation(row)">
                        {{ value }}
                    </a>
                    <span v-else>{{ value }}</span>
                </template>
                <!-- Slot específico para la columna 'estado' -->
                <template #actions="{ row }">
                    <button v-if="hasQuotationLink(row)" type="button" class="btn btn-alt-primary btn-sm mx-1"
                        title="Ver cotización" aria-label="Ver cotización" @click="goToQuotation(row)">
                        <i class="fa fa-external-link-alt"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm mx-1" aria-placeholder="marcar como leido"
                        @click="markAsReadNotify(row)" :disabled="isLockedMark(row)">
                        <span v-if="isLockedMark(row)" class="spinner-border spinner-border-sm" 
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
