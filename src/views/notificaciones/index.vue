<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { swalError, swalSuccess } from "@/functions/swal-alert.js";
import { useNotifications } from '@/composables/notificaciones/useNotifications';

const {
    table,
    listPerpage,
    refresh,
    fetchAllNotify,
    ensureInitialNotifications,
    loadingMarkAsRead,
    markAsReadItem,
    markAsReadAll
} = useNotifications();

const router = useRouter();

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

function openNotification(row) {
    if (hasQuotationLink(row)) {
        goToQuotation(row);
    }
}

function isUnread(row) {
    return !row?.read_at && !row?.readAt;
}

function getNotificationTime(row) {
    return row?.time ?? row?.created_at ?? row?.createdAt ?? '';
}

function getNotificationIcon(row) {
    return hasQuotationLink(row) ? 'fa fa-file-alt' : 'fa fa-bell';
}

function getNotificationIconClass(row) {
    if (hasQuotationLink(row)) return 'bg-info-light text-info';
    return 'bg-primary-light text-primary';
}

function getNotificationBadge(row) {
    const payload = getNotificationPayload(row);
    return payload?.cotizacion ? `Cotización ${payload.cotizacion}` : 'Notificación';
}

function getNotificationStatus(row) {
    const payload = getNotificationPayload(row);
    return payload?.estado ?? payload?.Estado ?? payload?.status ?? payload?.state ?? '';
}

function getNotificationStatusLabel(row) {
    const status = String(getNotificationStatus(row) ?? '').trim();
    if (!status) return '';

    const normalizedStatus = normalizeQuotationStatus(status);
    const labels = {
        pendientes: 'Pendiente',
        caducado: 'Caducada',
        caducada: 'Caducada',
        caducados: 'Caducada',
        caducadas: 'Caducada',
        procesado: 'Procesada',
        procesada: 'Procesada',
        procesados: 'Procesada',
        procesadas: 'Procesada',
        rechazado: 'Rechazada',
        rechazada: 'Rechazada',
        rechazados: 'Rechazada',
        rechazadas: 'Rechazada',
        aprobado: 'Pendiente',
        aprobada: 'Pendiente',
        espera: 'Pendiente',
    };

    return labels[status.toLowerCase()] ?? labels[normalizedStatus] ?? status;
}

function getNotificationStatusClass(row) {
    const status = String(getNotificationStatus(row) ?? '').trim().toLowerCase();
    const normalizedStatus = normalizeQuotationStatus(status);

    if (normalizedStatus === 'caducado') return 'bg-danger-light text-danger';
    if (normalizedStatus === 'rechazadas') return 'bg-danger-light text-danger';
    if (normalizedStatus === 'procesadas') return 'bg-info-light text-info';
    if (normalizedStatus === 'pendientes') return 'bg-warning-light text-warning';

    return 'bg-body-light text-muted border';
}

function getPuntoVentaBadge(row) {
    const payload = getNotificationPayload(row);
    const pvCodigo = payload?.pvCodigo ?? payload?.pv_codigo ?? payload?.PTO_VTA_ID;
    return pvCodigo ? `PV ${pvCodigo}` : '';
}

const lockIdMark = ref(new Map());
function isLockedMark(row) {
    const id = typeof row === "object" ? row?.id : row;
    return lockIdMark.value.get(String(id)) === true;
}

function lockMark(id) {
    const m = new Map(lockIdMark.value);
    m.set(String(id), true);
    lockIdMark.value = m;
}

function unLockedMark(id) {
    const m = new Map(lockIdMark.value);
    m.delete(String(id));
    lockIdMark.value = m;
}

async function markAsReadNotify(row) {
    if (!row || row.id === null) return;
    const id = row.id;
    if (isLockedMark(id)) return;
    lockMark(id);

    const res = await markAsReadItem(id);
    if (res?.ok) {
        unLockedMark(id);
        swalSuccess('Notificación marcada como leída.');
    } else {
        unLockedMark(id);
        swalError(res?.message || 'No se pudo marcar la notificación.');
    }
}

async function markAllItemsRead() {
    const resp = await markAsReadAll();
    if (!resp.ok) {
        swalError(resp.message);
        return;
    }
    swalSuccess(resp.message);
}

const unreadTotal = computed(() => {
    return table.items.filter((row) => isUnread(row)).length;
});

const pages = computed(() => {
    const range = [];
    const total = Number(table.totalPage) || 1;
    const maxVisiblePages = 5;
    let start = Math.max(1, table.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(total, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    return range;
});

const pageStart = computed(() => {
    if (!table.totalItems) return 0;
    return ((Number(table.currentPage) || 1) - 1) * (Number(table.perPage) || 10) + 1;
});

const pageEnd = computed(() => {
    return Math.min((Number(table.currentPage) || 1) * (Number(table.perPage) || 10), table.totalItems || 0);
});

function fetchPage(page) {
    const total = Number(table.totalPage) || 1;
    const nextPage = Math.min(Math.max(Number(page) || 1, 1), total);
    if (nextPage === table.currentPage) return;
    fetchAllNotify(nextPage);
}

onMounted(() => {
    ensureInitialNotifications();
});
</script>

<template>
    <BasePageHeading title="Notificaciones" subtitle="Notificaciones y mensajes">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item" aria-current="page">Notificaciones</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>

    <div class="content">
        <BaseBlock title="Centro de notificaciones" content-full rounded>
            <template #options>
                <div class="block-options-item space-x-2">
                    <button class="btn btn-alt-secondary btn-sm" @click="refresh" :disabled="table.loading"
                        title="Refrescar" aria-label="Refrescar">
                        <i v-if="!table.loading" class="fa fa-refresh"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                    <button class="btn btn-alt-success btn-sm" @click="markAllItemsRead" :disabled="loadingMarkAsRead"
                        title="Marcar todas como leídas" aria-label="Marcar todas como leídas">
                        <i v-if="!loadingMarkAsRead" class="fa fa-check-double"></i>
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                </div>
            </template>

            <div class="notification-toolbar-card">
                <div class="notification-toolbar">
                    <div class="notification-summary">
                        <div class="notification-summary-icon">
                            <i class="fa fa-bell"></i>
                        </div>
                        <div>
                            <div class="fw-semibold">Bandeja</div>
                            <div class="fs-xs text-muted">
                                {{ table.totalItems }} notificaciones
                                <span v-if="unreadTotal">, {{ unreadTotal }} sin leer en esta página</span>
                            </div>
                        </div>
                    </div>

                    <div class="notification-controls">
                        <div class="notification-search">
                            <i class="fa fa-search"></i>
                            <input v-model="table.searchTerm" placeholder="Buscar notificaciones..."
                                class="form-control form-control-sm" />
                        </div>
                        <div class="fs-xs text-muted">
                            Mostrar
                        </div>
                        <select v-model="table.perPage" class="form-select form-select-sm notification-page-size">
                            <option v-for="item in listPerpage" :key="item.value" :value="item.value">
                                {{ item.label }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div v-if="table.loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>

            <div v-else-if="!table.items.length" class="notification-empty">
                <i class="fa fa-bell-slash"></i>
                <p class="mb-0">No se encontraron notificaciones para mostrar.</p>
            </div>

            <div v-else class="notification-card-list">
                <article v-for="row in table.items" :key="row.id" class="notification-card"
                    :class="{ 'is-unread': isUnread(row), 'is-clickable': hasQuotationLink(row) }"
                    @click="openNotification(row)">
                    <div class="notification-card-accent"></div>

                    <div class="notification-card-main">
                        <div class="notification-card-top">
                            <div class="notification-card-heading">
                                <div class="item item-rounded notification-icon" :class="getNotificationIconClass(row)">
                                    <i :class="getNotificationIcon(row)"></i>
                                </div>

                                <div class="min-w-0">
                                    <h3 class="notification-title">
                                        <a v-if="hasQuotationLink(row)" :href="getQuotationHref(row)" class="notification-title-link"
                                            @click.prevent.stop="goToQuotation(row)">
                                            {{ row.title }}
                                        </a>
                                        <span v-else>{{ row.title }}</span>
                                    </h3>

                                    <div class="notification-meta">
                                        <span class="badge notification-chip bg-primary-light text-primary">{{ getNotificationBadge(row) }}</span>
                                        <!-- <span v-if="getNotificationStatusLabel(row)" class="badge notification-chip"
                                            :class="getNotificationStatusClass(row)">
                                            {{ getNotificationStatusLabel(row) }}
                                        </span> -->
                                        <span v-if="getPuntoVentaBadge(row)" class="badge notification-chip bg-body-light text-muted border">
                                            {{ getPuntoVentaBadge(row) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="notification-card-side">
                                <span v-if="isUnread(row)" class="notification-unread-dot" title="No leída"></span>
                                <time class="notification-time">{{ getNotificationTime(row) }}</time>
                            </div>
                        </div>

                        <p class="notification-message">{{ row.message }}</p>
                    </div>

                    <div class="notification-actions">
                        <a v-if="hasQuotationLink(row)" :href="getQuotationHref(row)" class="btn btn-sm btn-alt-primary"
                            title="Ver cotización" aria-label="Ver cotización" @click.prevent.stop="goToQuotation(row)">
                            <i class="fa fa-arrow-right"></i>
                        </a>

                        <button v-if="isUnread(row)" type="button" class="btn btn-sm btn-alt-success"
                            title="Marcar como leída" aria-label="Marcar como leída" @click.stop="markAsReadNotify(row)"
                            :disabled="isLockedMark(row)">
                            <span v-if="isLockedMark(row)" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                            <i v-else class="fa fa-check"></i>
                        </button>
                        <span v-else class="notification-read-check" title="Leída">
                            <i class="fa fa-check"></i>
                        </span>
                    </div>
                </article>
            </div>

            <div v-if="!table.loading && table.items.length"
                class="notification-pagination">
                <p class="mb-0 fs-sm text-muted">
                    Mostrando <strong>{{ pageStart }}</strong> a <strong>{{ pageEnd }}</strong>
                    de <strong>{{ table.totalItems }}</strong> notificaciones
                </p>

                <nav aria-label="Paginación de notificaciones">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: table.currentPage === 1 }">
                            <button class="page-link" @click="fetchPage(1)">
                                <i class="fa fa-angle-double-left"></i>
                            </button>
                        </li>
                        <li class="page-item" :class="{ disabled: table.currentPage === 1 }">
                            <button class="page-link" @click="fetchPage(table.currentPage - 1)">
                                <i class="fa fa-angle-left"></i>
                            </button>
                        </li>
                        <li v-for="page in pages" :key="page" class="page-item" :class="{ active: page === table.currentPage }">
                            <button class="page-link" @click="fetchPage(page)">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: table.currentPage === table.totalPage }">
                            <button class="page-link" @click="fetchPage(table.currentPage + 1)">
                                <i class="fa fa-angle-right"></i>
                            </button>
                        </li>
                        <li class="page-item" :class="{ disabled: table.currentPage === table.totalPage }">
                            <button class="page-link" @click="fetchPage(table.totalPage)">
                                <i class="fa fa-angle-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </BaseBlock>
    </div>
</template>

<style lang="scss" scoped>
.notification-toolbar-card {
    padding: 0.625rem 0.75rem;
    margin-bottom: 0.75rem;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.85rem;
}

.notification-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.notification-summary {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 12rem;
}

.notification-summary-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--tuval-primary-strong);
    background: var(--tuval-primary-soft);
    border-radius: var(--tuval-radius-md);
    font-size: 0.82rem;
}

.notification-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex: 1 1 auto;
}

.notification-page-size {
    width: 90px;
    flex: 0 0 auto;
}

.notification-search {
    position: relative;
    width: min(100%, 320px);

    i {
        position: absolute;
        top: 50%;
        left: 0.75rem;
        transform: translateY(-50%);
        color: var(--tuval-text-muted);
        font-size: 0.75rem;
    }

    input {
        padding-left: 2rem;
    }
}

.notification-card-list {
    display: grid;
    gap: 0.45rem;

    --notification-card-bg: var(--bs-body-bg);
    --notification-card-border: var(--bs-border-color);
    --notification-card-color: var(--bs-body-color);
    --notification-muted-color: var(--bs-secondary-color);
    --notification-hover-bg: rgba(var(--bs-primary-rgb), 0.045);
    --notification-selected-bg: rgba(var(--bs-primary-rgb), 0.10);
    --notification-selected-border: rgba(var(--bs-primary-rgb), 0.65);
}

.notification-card {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    padding: 0.45rem;
    overflow: hidden;
    color: var(--notification-card-color);
    background: var(--notification-card-bg);
    border: 1px solid var(--notification-card-border);
    border-radius: 0.85rem;
    box-shadow: none;
    transition:
        border-color 0.15s ease,
        background-color 0.15s ease,
        box-shadow 0.15s ease;
}

.notification-card.is-clickable {
    cursor: pointer;
}

.notification-card.is-clickable:hover {
    border-color: rgba(var(--bs-primary-rgb), 0.35);
    background: var(--notification-hover-bg);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.notification-card.is-unread {
    border-color: var(--notification-card-border);
    background: var(--notification-card-bg);
}

.notification-card-accent {
    display: none;
}

.notification-card-main {
    flex: 1 1 auto;
    min-width: 0;
}

.notification-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
}

.notification-card-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    min-width: 0;
}

.notification-icon {
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    border-radius: 0.75rem;
    font-size: 0.8rem;
    margin-top: 0.05rem;
}

.notification-title {
    margin: 0;
    color: var(--notification-card-color);
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.1;

    a,
    span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.notification-title-link {
    color: var(--notification-card-color);
    text-decoration: none;

    &:hover,
    &:focus {
        color: var(--bs-primary);
    }
}

.notification-card-side {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.4rem;
    flex: 0 0 auto;
    padding-top: 0.05rem;
}

.notification-time {
    flex: 0 0 auto;
    color: var(--notification-muted-color);
    font-size: 0.72rem;
    line-height: 1.2;
    white-space: nowrap;
}

.notification-unread-dot {
    width: 0.48rem;
    height: 0.48rem;
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--bs-warning);
    box-shadow: 0 0 0 3px rgba(var(--bs-warning-rgb), 0.16);
}

.notification-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.18rem;
}

.notification-chip {
    max-width: 12rem;
    padding: 0.22rem 0.45rem;
    border-radius: 999px;
    overflow: hidden;
    font-size: 0.68rem;
    font-weight: 700;
    line-height: 1.15;
    text-overflow: ellipsis;
    vertical-align: middle;
    white-space: nowrap;
}

.notification-message {
    display: -webkit-box;
    margin: 0.25rem 0 0;
    color: var(--notification-muted-color);
    font-size: 0.76rem;
    line-height: 1.25;
    overflow: hidden;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.notification-actions {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex: 0 0 auto;
    padding-left: 0.2rem;

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        border-radius: 0.65rem;
    }
}

.notification-read-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.65rem;
    color: var(--bs-success);
    background: rgba(var(--bs-success-rgb), 0.14);
    font-size: 0.75rem;
}

.notification-empty {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    padding: 3rem 1rem;
    color: var(--tuval-text-muted);

    i {
        font-size: 2rem;
        opacity: 0.65;
    }
}

.notification-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bs-border-color);
}

@media (max-width: 767.98px) {
    .notification-toolbar,
    .notification-controls,
    .notification-pagination {
        align-items: stretch;
        flex-direction: column;
    }

    .notification-search {
        width: 100%;
    }

    .notification-card {
        gap: 0.45rem;
        padding: 0.5rem;
    }

    .notification-card-top {
        flex-direction: column;
        gap: 0.35rem;
    }

    .notification-card-heading {
        width: 100%;
    }

    .notification-card-side {
        width: 100%;
        justify-content: flex-start;
    }

    .notification-actions {
        align-self: flex-start;
    }
}
</style>
