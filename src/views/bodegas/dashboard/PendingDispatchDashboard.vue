<script setup>
import { computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDashboardOrderDispatch } from "@/composables/bodegas/dashboard/useDashboardOrderDispatch";

const route = useRoute();
const {
    dataOrderDispatch,
    loadingOrderDispatch,
    getDataOrderDispatchPending,
    countItemsServ,
    getCountItemsServ
} = useDashboardOrderDispatch();

// --- LÓGICA ---
const dashboardSections = computed(() => {
    const sections = [];

    // 1. CARD DESPACHOS
    if (dataOrderDispatch.value && dataOrderDispatch.value.allCount > 0) {
        const raw = dataOrderDispatch.value;
        sections.push({
            id: 'orders_dashboard',
            type: 'complex_dispatch',
            title: 'Resumen de Despachos',
            stats: {
                totalWeight: raw.totalKg,
                totalOrders: raw.allCount,
                maxDays: raw.maxDays,
                today: { count: raw.ordersNow?.allCount || 0, weight: raw.ordersNow?.totalKg || 0 },
                pickupDispatch: { count: raw.typeRetired?.allCount || 0, weight: raw.typeRetired?.totalKg || 0 },
                previous: { count: raw.oldOrders?.allCount || 0, weight: raw.oldOrders?.totalKg || 0 },
                routeDispatch: { count: raw.typeDispatch?.allCount || 0, weight: raw.typeDispatch?.totalKg || 0 }
            }
        });
    }

    // 2. CARD SERVICIOS
    if (countItemsServ.value && countItemsServ.value.totalItemServ > 0) {
        sections.push({
            id: 'services_dashboard',
            type: 'split_services',
            title: 'Servicios Pendientes',
            count: countItemsServ.value.totalItemServ,
            label: 'Items SERV Pendientes',
            // Mapeamos las ordenes del Top 5
            details: countItemsServ.value.TopFiveOrderes || []
        });
    }

    return sections;
});


function getGridClass(index) {
    const total = dashboardSections.value.length;

    // CASO 1: Solo 1 tarjeta -> Pantalla completa
    if (total === 1) return 'col-12';

    // CASO 2: Son 2 tarjetas -> Mitad y Mitad
    if (total === 2) return 'col-12 col-xl-12';

    // CASO 3: Son 3 tarjetas -> EL CAMBIO QUE PEDISTE
    if (total === 3) {
        // Si es la primera (índice 0), ocupa todo el ancho
        if (index === 0) return 'col-12';
        // Las otras dos (índice 1 y 2) ocupan la mitad cada una
        return 'col-12 col-xl-6';
    }

    // CASO 4: Son 4 tarjetas -> Grid 2x2 (Mitad y Mitad)
    if (total === 4) return 'col-12 col-xl-6';

    // CASO 5 o MÁS: Estándar (3 columnas por fila)
    return 'col-12 col-lg-6 col-xl-4';
}

const refreshData = () => {
    const ptoVta = route.params.ptovta;
    if (ptoVta) {
        getDataOrderDispatchPending(ptoVta);
        getCountItemsServ(ptoVta);
    }
};

onMounted(async () => { refreshData(); });
watch(() => route.params.ptovta, () => refreshData());
</script>

<template>
    <div v-if="loadingOrderDispatch" class="text-center p-5">
        <span class="fw-bold">Cargando Datos...</span> <span class="spinner-border spinner-border-sm"></span>
    </div>

    <div v-else class="content" style="padding: 15px;">
        <div class="row g-3 align-items-stretch">
            <div v-for="section in dashboardSections" :key="section.id" :class="getGridClass(index)">
                <BaseBlock v-if="section.type === 'complex_dispatch'" :title="section.title"
                    class="h-100 mb-0 shadow-sm" rounded>
                    <template #content>
                        <div class="block-content p-0" style="min-height: 260px;">
                            <div class="row g-0 h-100">
                                <div
                                    class="col-md-5 d-flex flex-column justify-content-center align-items-center bg-body-light border-end p-3">
                                    <h6 class="text-muted fw-bold text-uppercase mb-2 text-center">Total Órdenes
                                        Pendientes</h6>

                                    <div class="display-3 fw-bold text-dark mb-0 text-center line-height-1">
                                        {{ section.stats.totalOrders }}
                                    </div>
                                    <div class="text-dark mb-3 fs-sm font-w600">
                                        {{ section.stats.totalWeight.toFixed(2) }} Kg
                                    </div>

                                    <div class="alert alert-warning py-2 px-2 mb-0 text-center w-100 shadow-sm border-warning"
                                        style="max-width: 200px;">
                                        <div class="fs-xs fw-bold text-uppercase text-warning-dark">Más antiguo</div>
                                        <div class="fs-4 fw-bold text-dark">{{ section.stats.maxDays }} Días</div>
                                    </div>
                                </div>

                                <div class="col-md-7">
                                    <div class="row g-0 h-100">
                                        <div class="col-6 border-end border-bottom p-2 text-center d-flex flex-column justify-content-center"
                                            style="min-height: 130px;">
                                            <div class="fs-xs fw-bold text-uppercase text-muted mb-1"><i
                                                    class="fa fa-calendar-day text-info me-1"></i> Hoy</div>
                                            <div class="fs-3 fw-bold text-dark">{{ section.stats.today.count }}</div>
                                            <div class="fs-xs text-muted">{{ section.stats.today.weight.toFixed(0) }} Kg
                                            </div>
                                        </div>
                                        <div class="col-6 border-bottom p-2 text-center d-flex flex-column justify-content-center"
                                            style="min-height: 130px;">
                                            <div class="fs-xs fw-bold text-uppercase text-muted mb-1"><i
                                                    class="fa fa-warehouse text-warning me-1"></i> Retiro</div>
                                            <div class="fs-3 fw-bold text-dark">{{ section.stats.pickupDispatch.count }}
                                            </div>
                                            <div class="fs-xs text-muted">{{
                                                section.stats.pickupDispatch.weight.toFixed(0) }} Kg</div>
                                        </div>
                                        <div class="col-6 border-end p-2 text-center d-flex flex-column justify-content-center"
                                            style="min-height: 130px;">
                                            <div class="fs-xs fw-bold text-uppercase text-muted mb-1"><i
                                                    class="fa fa-history text-danger me-1"></i> Ant.</div>
                                            <div class="fs-3 fw-bold text-dark">{{ section.stats.previous.count }}</div>
                                            <div class="fs-xs text-muted">{{ section.stats.previous.weight.toFixed(0) }}
                                                Kg</div>
                                        </div>
                                        <div class="col-6 p-2 text-center d-flex flex-column justify-content-center"
                                            style="min-height: 130px;">
                                            <div class="fs-xs fw-bold text-uppercase text-muted mb-1"><i
                                                    class="fa fa-truck text-success me-1"></i> Ruta</div>
                                            <div class="fs-3 fw-bold text-dark">{{ section.stats.routeDispatch.count }}
                                            </div>
                                            <div class="fs-xs text-muted">{{
                                                section.stats.routeDispatch.weight.toFixed(0) }} Kg</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </BaseBlock>

                <BaseBlock v-else-if="section.type === 'split_services'" :title="section.title"
                    class="h-100 mb-0 shadow-sm" rounded>
                    <template #content>
                        <div class="block-content p-0" style="min-height: 260px;">
                            <div class="row g-0 h-100">

                                <div
                                    class="col-5 d-flex flex-column align-items-center justify-content-center border-end bg-body-extra-light p-3">

                                    <div class="mb-2 text-dark opacity-25">
                                        <i class="fa fa-tools fa-3x"></i>
                                    </div>

                                    <div class="display-3 fw-bold text-dark mb-1 text-center">
                                        {{ section.count }}
                                    </div>
                                    <div class="fw-bold text-uppercase text-muted fs-sm text-center">
                                        Servicios Totales
                                    </div>
                                </div>

                                <div class="col-7">
                                    <div
                                        class="bg-body-light border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
                                        <span class="fs-xs fw-bold text-uppercase text-muted">Orden</span>
                                        <span class="fs-xs fw-bold text-uppercase text-muted">Cliente</span>
                                    </div>

                                    <div class="p-0" style="overflow-y: auto; max-height: 220px;">
                                        <table class="table table-sm table-vcenter table-hover mb-0 fs-sm">
                                            <tbody>
                                                <tr v-for="(order, i) in section.details" :key="i">
                                                    <td class="fw-bold text-dark ps-3" style="width: 40%;">
                                                        {{ order.orden }}
                                                    </td>
                                                    <td class="pe-3">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <div class="text-muted text-truncate"
                                                                style="max-width: 200px;" :title="order.cliente">
                                                                {{ order.cliente }}
                                                            </div>
                                                            <span class="badge bg-info rounded-pill ms-1">{{
                                                                order.totalItemServ }}</span>
                                                        </div>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </template>
                </BaseBlock>

            </div>
        </div>

        <div v-if="dashboardSections.length === 0" class="text-center py-5 bg-white rounded border mt-3">
            <i class="fa fa-check-circle fa-3x text-success mb-3"></i>
            <h4 class="fw-normal text-muted">No hay información pendiente</h4>
        </div>

    </div>
</template>