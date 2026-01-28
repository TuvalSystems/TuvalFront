<script setup>
import {  computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDashboardOrderDispatch } from "@/composables/bodegas/dashboard/useDashboardOrderDispatch";

const route = useRoute();
const {
    dataOrderDispatch,
    loadingOrderDispatch,
    getDataOrderDispatchPending,
    colsOrdPend,
    countItemsServ,
    getCountItemsServ
} = useDashboardOrderDispatch();

// ... (Tus datos dashboardSections siguen igual) ...
const dashboardSections = computed(() => {
    const sections = [];
    if (dataOrderDispatch.value && dataOrderDispatch.value.length > 0) {
        sections.push({
            id: 1,
            type: 'table',
            title: 'Ordenes de Despacho Pendientes',
            data: dataOrderDispatch.value.map(item => ({
                id: item.id,
                ref: item.orden,
                customer: item.pedido.pedido,
                extra: `Hace ${item.dias_transcurridos} días`,

            }))
        });
    }

    if (countItemsServ.value !== null && countItemsServ.value > 0) {
        sections.push({
            id: 2,
            type: 'counter',
            title: 'Servicios de Pendientes',
            count: countItemsServ.value,
            label: 'Items SERV pendientes'
        });
    }
    return sections || [];
});

const activeSections = computed(() => dashboardSections.value);

// --- NUEVA LÓGICA: Clases según el índice ---
function getItemClasses(index) {
    const count = activeSections.value.length;
    // Eliminamos 'h-100' para que los bloques no se estiren artificialmente
    if (count === 1) return 'col-12';
    if (count === 2) return 'col-12 col-md-6';
    if (count === 3) return index === 0 ? 'col-12' : 'col-12 col-md-6';
    return 'col-12 col-md-4';
}


const refreshData = () => {
    const ptoVta = route.params.ptovta; // Captura el parámetro de la URL
    if (ptoVta) {
        getDataOrderDispatchPending(ptoVta);
        getCountItemsServ(ptoVta);
    }
};

onMounted(async() =>{
    refreshData();
});

watch(() => route.params.ptovta, () => refreshData());

</script>

<template>
    <div v-if="loadingOrderDispatch" class="text-center p-5">
        <i class="fa fa-2x fa-sun fa-spin text-primary"></i>
    </div>

    <div v-else class="content" style="height: calc(100vh - 140px); overflow-y: auto;">
        <div v-if="activeSections.length > 0" class="row g-3 p-2">
            <div v-for="(section, index) in activeSections" :key="section.id" :class="getItemClasses(index)">
                <BaseBlock :title="section.title" class="mb-0 shadow-sm" rounded>
                    <template #content>
                        <div class="block-content" style="min-height: 200px;">

                            <div v-if="section.type === 'table'" style="max-height: 400px; overflow-y: auto;"
                                class="px-1">
                                <Dataset v-slot="{ ds }" :ds-data="section.data">
                                    <div class="row" :data-page-count="ds.dsPagecount">
                                        <div id="datasetLengthPedidos" class="col-md-2 py-1">
                                            <DatasetShow :ds-show-entries="5" />
                                        </div>

                                    </div>
                                    <div v-if="loadingOrderDispatch" class="text-center">
                                        <div class="spinner-border text-primary mt-4" role="status"><span
                                                class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                    <div class="table-responsive table-sm">
                                        <table class="table table-sm table-hover table-vcenter mb-1">
                                            <thead>
                                                <tr class="border-bottom">
                                                    <th v-for="(th) in colsOrdPend" :key="th.field"
                                                        class="text-center text-uppercase fs-xs fw-bold">
                                                        {{ th.name }}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <DatasetItem tag="tbody" class="fs-sm">
                                                <template #default="{ row }">
                                                    <tr class="text-center">
                                                        <td class="fw-bold text-primary"># {{ row.ref }}</td>
                                                        <td class="text-muted">{{ row.customer }}</td>
                                                        <td>
                                                            <span class="badge bg-primary text-white py-1 px-2">
                                                                {{ row.extra }}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </template>
                                            </DatasetItem>
                                        </table>

                                    </div>
                                    <div
                                        class="d-flex flex-md-row flex-column justify-content-between align-items-center">
                                        <DatasetInfo class="py-3 fs-sm" />
                                        <DatasetPager class="flex-wrap py-3 fs-sm" />
                                    </div>
                                </Dataset>
                            </div>

                            <div v-else-if="section.type === 'counter'"
                                class="d-flex align-items-center justify-content-center h-100 my-auto py-5">
                                <div class="row w-100 align-items-center">
                                    <div class="col-5 text-end">
                                        <div class="item item-circle bg-body-light mx-auto shadow-sm"
                                            style="width: 70px; height: 70px; border: 2px solid #e1e8f0;">
                                            <i class="fa fa-tools fa-lg text-primary"></i>
                                        </div>
                                    </div>
                                    <div class="col-7 text-start">
                                        <div class="display-4 fw-bold text-primary line-height-1 mb-1">
                                            {{ section.count }}
                                        </div>
                                        <div class="mt-1">
                                            <span class="badge bg-warning text-white fw-bold text-uppercase px-2 py-1"
                                                style="font-size: 0.65rem; letter-spacing: 0.5px;">
                                                <i class="fa fa-exclamation-triangle me-1"></i> {{ section.label }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </template>
                </BaseBlock>
            </div>
        </div>

        <div v-else class="text-center py-10 bg-body-extra-light rounded border m-2">
            <i class="fa fa-check-circle fa-3x text-success mb-3"></i>
            <h4 class="fw-normal">No hay tareas pendientes</h4>
        </div>
    </div>
</template>