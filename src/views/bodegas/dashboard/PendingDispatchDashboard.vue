<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTemplateStore } from "@/stores/template";
const storeTemplate = useTemplateStore();

// ... (Tus datos dashboardSections siguen igual) ...
const dashboardSections = ref([
    {
        id: 1, // ID 1: Estructura de PEDIDOS (ref, customer, total)
        title: 'Pending Orders',
        data: [
            { id: 101, ref: 'ORD-001', customer: 'Corporación Alpha', total: '$500.00' },
            { id: 102, ref: 'ORD-002', customer: 'Tiendas Beta', total: '$120.50' },
            { id: 103, ref: 'ORD-003', customer: 'Construcciones Gamma', total: '$3,200.00' },
            { id: 104, ref: 'ORD-004', customer: 'Distribuidora Delta', total: '$850.00' },
            { id: 105, ref: 'ORD-005', customer: 'Importadora Epsilon', total: '$2,100.00' },
        ]
    },
    {
        id: 2, // ID 2: Estructura de SERVICIOS (ref, type, technician)
        title: 'Pending Services',
        data: [
            { id: 201, ref: 'SRV-55', type: 'Instalación CCTV', technician: 'Juan Pérez' },
            { id: 202, ref: 'SRV-56', type: 'Mantenimiento AC', technician: 'María López' },
            { id: 203, ref: 'SRV-57', type: 'Reparación Tubería', technician: 'Carlos Ruiz' },
        ]
    },
    {
        id: 3, // ID 3: Estructura de PRIORITARIOS (ref, destination, due)
        title: 'Priority Dispatch',
        data: [
            { id: 301, ref: 'EXP-99', destination: 'Quito - Norte', due: 'URGENTE' },
            { id: 302, ref: 'EXP-100', destination: 'Guayaquil - Centro', due: 'HOY 14:00' },
            { id: 303, ref: 'EXP-101', destination: 'Cuenca', due: 'MAÑANA AM' },
        ]
    },
    {
        id: 4, // ID 4: Estructura de DEVOLUCIONES (ref, reason)
        title: 'Returns to Process',
        data: [
            { id: 401, ref: 'RET-10', reason: 'Producto Dañado en Transporte' },
            { id: 402, ref: 'RET-11', reason: 'Error en Pedido (Ref incorrecta)' },
            { id: 403, ref: 'RET-12', reason: 'Cambio por Garantía' },
        ]
    },
     {
        id: 5, // ID 4: Estructura de DEVOLUCIONES (ref, reason)
        title: 'Returns to Process',
        data: [
            { id: 401, ref: 'RET-10', reason: 'Producto Dañado en Transporte' },
            { id: 402, ref: 'RET-11', reason: 'Error en Pedido (Ref incorrecta)' },
            { id: 403, ref: 'RET-12', reason: 'Cambio por Garantía' },
        ]
    },
     {
        id: 6, // ID 4: Estructura de DEVOLUCIONES (ref, reason)
        title: 'Returns to Process',
        data: [
            { id: 401, ref: 'RET-10', reason: 'Producto Dañado en Transporte' },
            { id: 402, ref: 'RET-11', reason: 'Error en Pedido (Ref incorrecta)' },
            { id: 403, ref: 'RET-12', reason: 'Cambio por Garantía' },
        ]
    }
]);

const activeSections = computed(() => {
    return dashboardSections.value.filter(section => section.data && section.data.length > 0);
});

// --- NUEVA LÓGICA: Clases según el índice ---
function getItemClasses(index) {
    const count = activeSections.value.length;

    if (count === 1) return 'col-12 h-100';
    if (count === 2) return 'col-12 col-md-6 h-100';
    if (count === 3) {
        if (index === 0) return 'col-12 h-50';
        return 'col-12 col-md-6 h-50';
    }
    if (count === 4) return 'col-12 col-md-6 h-50';
    if (count === 5) {
        if (index < 2) return 'col-12 col-md-6 h-50';
        return 'col-12 col-md-4 h-50';
    }
    if (count >= 6) {
        return 'col-12 col-md-4 h-50';
    }
    return 'col-12 col-md-6 h-50';
}

onMounted(() => { storeTemplate.sidebar({ mode: 'close' }); });
onUnmounted(() => { storeTemplate.sidebar({ mode: 'open' }); });
</script>

<template>
    <div class="content d-flex flex-column" style="height: calc(100vh - 140px); overflow: hidden;">
        
        <div v-if="activeSections.length > 0" class="row d-flex flex-wrap flex-grow-1 g-3 p-2 overflow-y-auto">
            
            <div 
                v-for="(section, index) in activeSections" 
                :key="section.id" 
                :class="getItemClasses(index)"
            >
                <BaseBlock :title="section.title" class="h-100 mb-0 shadow-sm d-flex flex-column" rounded>
                    <template #content>
                        <div class="block-content font-size-sm flex-grow-1 overflow-y-auto" style="min-height: 0;">
                            <ul class="list-group list-group-flush">
                                <li v-for="item in section.data" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <div v-if="section.id === 1">
                                         <span class="fw-semibold text-primary">#{{ item.ref }}</span>
                                         <div class="text-muted small">{{ item.customer }}</div>
                                    </div>
                                    <div v-else>
                                         <span class="fw-semibold text-primary">#{{ item.ref }}</span>
                                         <div class="text-muted small">Detalle genérico</div>
                                    </div>
                                    <span class="badge rounded-pill bg-warning text-dark">Pendiente</span>
                                </li>
                            </ul>
                        </div>
                    </template>
                </BaseBlock>
            </div>

        </div>

        <div v-else class="text-center py-10 bg-body-extra-light rounded border flex-grow-1 d-flex flex-column justify-content-center m-2">
           </div>
    </div>
</template>