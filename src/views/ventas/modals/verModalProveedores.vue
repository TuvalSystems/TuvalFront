<script setup>
import { onMounted, ref, reactive, computed, watch, toRaw } from 'vue';
import { useStore } from 'vuex'
import VueSelect from "vue-select";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { formatPrice, formatPrice4, format } from "@/functions";

const {
    //proceso de proveedores - modal
    itemsProvider,
    eliminarProveedor,
    margenPorDefecto,
    getMargenFotItemL,
    validateProviderBeforeStore,
} = useProcessCreateQuote();
const store = useStore();
const listaProviders = ref(store.state.proveedores);

const emit = defineEmits(['save', 'update:providers']);
const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    providers: {
        type: Array,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
})
const flatPickrState = reactive({
    minDate: Date.now(),
    monthSelectorType: "static",
    locale: Spanish,
});


watch(() => props.providers, (newVal) => {
    if (newVal && newVal.length > 0) {
        const rawData = toRaw(newVal);
        itemsProvider.value = structuredClone(rawData);
    } else {
        itemsProvider.value = [];
    }
}, { immediate: true, deep: true });

watch(() => props.item.ART_CODIGO, (newVal) => {
    if (newVal) {
        getMargenFotItemL(newVal);
    }
}, { immediate: true, deep: true });
const addProvider = async () => {
    const newProveedor = {
        'ID_PROVEEDOR': null,
        'DESCRIPCION_ARTICULO': props.item.ART_DESCRIPCION,
        'FECHA_ENTREGA': '',
        'CANTIDAD': 0,
        'COSTO_UNITARIO': '',
        'IMPUESTO': '',
        'TOTAL': '',
        'TOTALCONIMPUESTO': '',
        'NOTA': '',
        'MARGEN': margenPorDefecto.value
    };

    itemsProvider.value.push(newProveedor);
}


function calculaTotalProveedor(index) {
    const row = itemsProvider.value[index];

    const costo = Number.parseFloat(row.COSTO_UNITARIO) || 0;
    if (Number.isNaN(costo)) {
        swalWarning('El costo unitario debe ser un número válido');
        return;
    }
    const cantidad = Number.parseFloat(row.CANTIDAD) || 0;
    const margen = Number.parseFloat(row.MARGEN) || 0;

    const impuestoPorcentaje = Number.parseFloat(props.item.ART_IMP_VTA) || 0;
    const descuentoItem = Number.parseFloat(props.item.descuento) || 0;

    const totalNeto = costo * cantidad;

    const iva = totalNeto * (impuestoPorcentaje / 100);
    const totalFinal = totalNeto + iva;

    row.TOTALCONIMPUESTO = totalFinal;
    row.IMPUESTO = iva;
    row.TOTAL = totalNeto;  //por ahora solo visualizamos el total neto


    const denominadorMargen = 1 - (margen / 100);
    const denominadorDescuento = 1 - (descuentoItem / 100);

    if (denominadorMargen > 0 && denominadorDescuento > 0 && costo > 0) {
        const precioSugerido = (costo / denominadorMargen) / denominadorDescuento;

        props.item.ART_VALOR = precioSugerido.toFixed(4);
    }
}

function guardarProveedor() {
    if (!validateProviderBeforeStore()) {
        return;
    }
    emit('update:providers', {
        index: props.index,
        providers: itemsProvider.value,
        nuevoPrecio: props.item.ART_VALOR
    });
}

const totalAsignado = computed(() => {
    return itemsProvider.value.reduce((total, p) => total + (Number(p.TOTAL) || 0), 0);
});
onMounted(async () => {

});
</script>

<template>
    <BaseBlock class="mb-0 shadow-sm d-flex flex-column h-100" transparent rounded>
        <template #title>
            <div class="d-flex align-items-center py-1">
                <div class="me-2">
                    <div class="d-flex align-items-center justify-content-center bg-primary-light text-primary rounded-circle"
                        style="width: 40px; height: 40px;">
                        <i class="fa fa-cubes"></i>
                    </div>
                </div>
                <div>
                    <h6 class="mb-0 fw-bold">Gestión de Proveedores</h6>
                    <div class="fs-xs text-muted">
                        Item: <span class="fw-semibold text-dark">{{ props.item.ART_DESCRIPCION }}</span>
                        <span class="mx-1">|</span>
                        Ref: <span class="text-success">$ {{ props.item.ART_VALOR }}</span>
                    </div>
                </div>
            </div>
        </template>
        <template #options>
            <div class="d-flex align-items-center px-3 py-1 bg-body-light rounded border">
                <span class="fs-xs fw-bold text-muted me-2">REQUERIDO:</span>
                <span class="fs-6 fw-bold text-dark">{{ props.item.ART_CANTIDAD || 0 }}</span>
                <span class="fs-xs text-muted ms-1">{{ props.item.ART_PLAN_UMEDIDA }}</span>
            </div>
        </template>

        <template #content>
            <div class="block-content block-content-full p-0 d-flex flex-column flex-grow-1 overflow-hidden">
                <div class="table-responsive flex-grow-1" style="max-height: 100%; overflow-y: auto;">
                    <table class="table table-hover table-vcenter mb-0 fs-sm table-striped">
                        <thead class="bg-body-light text-uppercase fs-xs sticky-top" style="z-index: 10;">
                            <tr>
                                <th style="width: 280px;" class="fw-bold text-muted ps-3">Proveedor & Detalles</th>
                                <th style="width: 120px;" class="fw-bold text-muted text-center">Entrega</th>
                                <th style="width: 80px;" class="fw-bold text-muted text-center">Cant.</th>
                                <th style="width: 120px;" class="fw-bold text-muted text-end">Costo U.</th>
                                <th style="width: 100px;" class="fw-bold text-muted text-end">Margen</th>
                                <th style="width: 100px;" class="fw-bold text-muted text-end">IVA</th>
                                <th style="width: 120px;" class="fw-bold text-muted text-end pe-3">Total</th>
                                <th style="width: 40px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(prov, index) in itemsProvider" :key="index">
                                <td class="ps-3 align-top py-3">
                                    <div class="mb-2">
                                        <small class="text-primary fw-bold mb-1 d-block" style="font-size: 0.65rem;">
                                            PROVEEDOR:
                                        </small>
                                        <VueSelect v-model="prov.ID_PROVEEDOR" :options="listaProviders"
                                            :reduce="(option) => option.id" placeholder="Seleccionar proveedor..."
                                            label="PROV_RAZON_SOCIAL"
                                            class="style-chooser fs-xs fw-bold bg-white border-bottom">
                                        </VueSelect>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 ps-0 pe-1 text-muted"><i
                                                class="fa fa-pen"></i></span>
                                        <textarea class="form-control form-control-sm " rows="2"
                                            placeholder="Descripción técnica..." v-model="prov.DESCRIPCION_ARTICULO"
                                            style="resize: none;"></textarea>
                                    </div>
                                    <input type="text" class="form-control form-control-sm  text-muted fs-xs mt-1 ps-4"
                                        placeholder="+ Agregar nota interna" v-model="prov.NOTA">
                                </td>
                                <td class="align-top py-3">
                                    <flat-pickr class="form-control form-control-sm text-center "
                                        v-model="prov.FECHA_ENTREGA" :config="flatPickrState" placeholder="Fecha" />
                                </td>
                                <td class="align-top py-3">
                                    <input type="number" min="0" class="form-control form-control-sm text-end fw-bold"
                                        v-model.number="prov.CANTIDAD" @input="calculaTotalProveedor(index)" />
                                </td>
                                <td class="align-top py-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="number" class="form-control form-control-sm text-end"
                                            v-model="prov.COSTO_UNITARIO" @input="calculaTotalProveedor(index)" />
                                    </div>
                                </td>
                                <td class="align-top py-3">
                                    <div class="input-group input-group-sm">
                                        <input type="number" class="form-control form-control-sm text-end "
                                            v-model="prov.MARGEN" @input="calculaTotalProveedor(index)" />
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">%</span>
                                    </div>
                                </td>
                                <td class="align-top py-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="number" class="form-control form-control-sm text-end "
                                            v-model="prov.IMPUESTO" @input="calculaTotalProveedor(index)" />
                                    </div>
                                </td>

                                <td class="text-end pe-3 align-top py-3">
                                    <div class="fw-bold text-dark mb-1">${{ formatPrice4(prov.TOTAL) }}</div>
                                    <span v-if="parseFloat(prov.TOTAL) >= 300"
                                        class="badge bg-success-light text-success fs-xs rounded-pill px-2">
                                        <i class="fa fa-check me-1"></i> Ok
                                    </span>
                                    <span v-else class="badge bg-warning-light text-warning fs-xs rounded-pill px-2"
                                        title="El pedido debe superar los $300">
                                        <i class="fa fa-exclamation-triangle me-1"></i> Min $300
                                    </span>
                                </td>
                                <td class="text-center align-middle">
                                    <a href="javascript:void(0)" class="text-danger opacity-50 hover-opacity-100"
                                        @click="eliminarProveedor(index)">
                                        <i class="fa fa-trash-can fs-lg"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr v-if="itemsProvider.length === 0">
                                <td colspan="8" class="text-center py-5">
                                    <div class="py-4">
                                        <i class="fa fa-clipboard-list fa-3x text-muted opacity-25 mb-3"></i>
                                        <p class="fs-sm text-muted mb-3">No hay proveedores asignados a este ítem</p>
                                        <button class="btn btn-alt-primary btn-sm px-4" @click="addProvider()">
                                            <i class="fa fa-plus me-1"></i> Asignar Primer Proveedor
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div
                class="block-content block-content-full bg-body-light border-top d-flex justify-content-between align-items-center py-2">
                <button class="btn btn-sm btn-alt-success" @click="addProvider()">
                    <i class="fa fa-plus me-1"></i> Agregar Otro
                </button>

                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-baseline" v-if="totalAsignado > 0">
                        <span class="fs-xs text-muted me-2 text-uppercase">Total Asignado:</span>
                        <span class="fs-sm fw-bold text-dark">${{ format(totalAsignado) }}</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary px-4 shadow-sm" @click="guardarProveedor()">
                        <i class="fa fa-save me-1"></i> Guardar Cambios
                    </button>
                </div>
            </div>
        </template>
    </BaseBlock>

</template>

<style scoped>
/* CSS para ocultar los spinners de los inputs numéricos */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type=number] {
    -moz-appearance: textfield;
}

/* Ajustes para VueSelect */
:deep(.style-chooser .vs__dropdown-toggle) {
    border: none;
    background-color: transparent;
    padding: 0;
    height: auto;
}

:deep(.style-chooser .vs__search),
:deep(.style-chooser .vs__selected) {
    padding-left: 0;
    font-weight: 600;
    color: #343a40;
}

:deep(.style-chooser .vs__open-indicator) {
    transform: scale(0.8);
}

/* Cabecera pegajosa (Sticky Header) */
.sticky-top {
    position: sticky;
    top: 0;
    background-color: #f9fafc;
    /* Coincide con bg-body-light */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    /* Sombra sutil al hacer scroll */
}
</style
