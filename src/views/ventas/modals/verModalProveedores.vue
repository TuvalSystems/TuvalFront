<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue';
import VueSelect from "vue-select";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
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
    dateFormat: "d/m/Y"
});

const itemsProvider = ref([]);
watch(() => props.providers, (newVal) => {
    if (newVal && newVal.length > 0) {
        itemsProvider.value = JSON.parse(JSON.stringify(newVal));
    } else {
        itemsProvider.value = [];
    }
}, { immediate: true, deep: true });

const listaProviders = ref([]);
const addProvider = async () => {
    const newProveedor = {
        'ID_PROVEEDOR': null,
        'DESCRIPCION_ARTICULO': '',
        'FECHA_ENTREGA': '',
        'CANTIDAD': '',
        'COSTO_UNITARIO': '',
        'IMPUESTO': '',
        'TOTAL': '',
        'TOTALCONIMPUESTO': '',
        'NOTA': '',
        'MARGEN': ''
    };
    itemsProvider.value.push(newProveedor);
}

function eliminarProveedor(index) {
    itemsProvider.value.splice(index, 1);
}

function validaCantidadProveedor(event, index) {
    console.log('cantidad validada xddd', event.target.value, index);

}

function calculaTotalProveedor() {
    console.log('calcula total proveedor');
}

function guardarProveedor() {
    console.log('guardar proveedor');
}

const totalAsignado = computed(() => {
    if (!props.providers.length > 0) {
        return 0;
    }
    return props.providers.reduce((total, proveedor) => total + proveedor.CANTIDAD, 0);
});
onMounted(async () => {

});
</script>

<template>
    <BaseBlock class="mb-0 shadow-sm" transparent rounded>
        <template #title>
            <div class="d-flex align-items-center py-1">
                <div class="me-2">
                    <div class="d-flex align-items-center justify-content-center bg-primary-light text-primary rounded-circle"
                        style="width: 35px; height: 35px;">
                        <i class="fa fa-cubes"></i>
                    </div>
                </div>
                <div>
                    <h6 class="mb-0 fw-bold">Gestión de Proveedores</h6>
                    <div class="fs-xs text-muted">
                        Item: <span class="fw-semibold text-dark">Codo Inox.304 CI 150-1/2"x90</span>
                        <span class="mx-1">|</span>
                        Ref: <span class="text-success">$ 1000</span>
                    </div>
                </div>
            </div>
        </template>
        <template #options>
            <div class="d-flex align-items-center px-3 py-1 bg-body-light rounded border">
                <span class="fs-xs fw-bold text-muted me-2">REQUERIDO:</span>
                <span class="fs-6 fw-bold text-dark">10</span>
                <span class="fs-xs text-muted ms-1">MTRS</span>
            </div>
        </template>

        <template #content>
            <div class="block-content block-content-full p-0">
                <div class="table-responsive">
                    <table class="table table-hover table-vcenter mb-0 fs-sm">
                        <thead class="bg-body-light text-uppercase fs-xs">
                            <tr>
                                <th style="width: 300px;" class="fw-bold text-muted ps-3">Proveedor & Detalles</th>
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
                            <tr v-for="(prov, index) in props.providers" :key="index">
                                <td class="ps-3 align-top py-3">
                                    <div class="mb-2">
                                        <VueSelect v-model="prov.ID_PROVEEDOR" :options="listaProviders"
                                            :reduce="(option) => option.id" placeholder="Buscar proveedor..."
                                            label="PROV_RAZON_SOCIAL" class="style-chooser fs-xs fw-semibold">
                                        </VueSelect>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 ps-0 pe-1 text-muted"><i
                                                class="fa fa-pen"></i></span>
                                        <textarea class="form-control form-control-sm border-0 bg-body-light" rows="1"
                                            placeholder="Descripción técnica..." v-model="prov.DESCRIPCION_ARTICULO"
                                            style="resize: none;"></textarea>
                                    </div>
                                    <input type="text"
                                        class="form-control form-control-sm border-0 bg-transparent text-muted fs-xs mt-1 ps-4"
                                        placeholder="+ Agregar nota interna" v-model="prov.NOTA">
                                </td>
                                <td class="align-top py-3">
                                    <flat-pickr class="form-control form-control-sm text-center border-0 bg-body-light"
                                        v-model="prov.FECHA_ENTREGA" :config="flatPickrState" placeholder="Fecha" />
                                </td>
                                <td class="align-top py-3">
                                    <input type="text"
                                        class="form-control form-control-sm text-center fw-bold border-0 bg-body-light"
                                        v-model="prov.CANTIDAD" @change="validaCantidadProveedor($event, index)" />
                                </td>
                                <td class="align-top py-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            v-model="prov.COSTO_UNITARIO" @change="calculaTotalProveedor(index)" />
                                    </div>
                                </td>
                                <td class="align-top py-3">
                                    <div class="input-group input-group-sm">
                                        <input type="number"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            v-model="prov.MARGEN" @change="calculaTotalProveedor(index)" />
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">%</span>
                                    </div>
                                </td>
                                <td class="align-top py-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            v-model="prov.IMPUESTO" />
                                    </div>
                                </td>

                                <td class="text-end pe-3 align-top py-3">
                                    <div class="fw-bold text-dark mb-1">${{ format(prov.TOTAL) }}</div>

                                    <span v-if="parseFloat(prov.TOTAL) >= 300"
                                        class="badge bg-success-light text-success fs-xs rounded-pill px-2">
                                        <i class="fa fa-check me-1"></i>Ok
                                    </span>
                                    <span v-else class="badge bg-warning-light text-warning fs-xs rounded-pill px-2"
                                        title="El pedido debe superar los $300">
                                        <i class="fa fa-exclamation-triangle me-1"></i>Min $300
                                    </span>
                                </td>
                                <td class="text-center align-middle">
                                    <a href="javascript:void(0)" class="text-danger opacity-50 hover-opacity-100"
                                        @click="eliminarProveedor(index)">
                                        <i class="fa fa-times-circle"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr v-if="props.providers.length === 0">
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="fa fa-clipboard-list fa-2x mb-2 opacity-25"></i>
                                    <p class="fs-sm mb-2">No hay proveedores asignados a este ítem</p>
                                    <button class="btn btn-sm btn-alt-primary" @click="addProvider()">
                                        Asignar Primer Proveedor
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div
                class="block-content block-content-full bg-body-light border-top d-flex justify-content-between align-items-center py-2">
                <button class="btn btn-sm btn-alt-success" @click="addProveedor()">
                    <i class="fa fa-plus me-1"></i> Agregar Otro
                </button>

                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-baseline" v-if="totalAsignado > 0">
                        <span class="fs-xs text-muted me-2">TOTAL ASIGNADO:</span>
                        <span class="fs-sm fw-bold text-dark">${{ format(totalAsignado) }}</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary px-4" @click="guardarProveedor()">
                        <i class="fa fa-save me-1"></i> Guardar
                    </button>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="p-0 mt-4">

        <div class="block block-rounded shadow-sm mb-0">

            <div class="block-header block-header-default py-2 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <div class="d-flex align-items-center justify-content-center bg-primary-light text-primary rounded-circle"
                            style="width: 35px; height: 35px;">
                            <i class="fa fa-cubes"></i>
                        </div>
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold">Gestión de Proveedores</h6>
                        <div class="fs-xs text-muted">
                            Item: <span class="fw-semibold text-dark">Codo Inox.304 CI 150-1/2"x90</span>
                        </div>
                    </div>
                </div>

                <div class="block-options">
                    <div class="d-flex align-items-center px-2 py-1 bg-body-light rounded">
                        <span class="fs-xs fw-bold text-muted me-2">REQUERIDO:</span>
                        <span class="fs-6 fw-bold text-dark">100</span>
                    </div>
                </div>
            </div>

            <div class="block-content block-content-full p-0">
                <div class="table-responsive">
                    <table class="table table-hover table-vcenter mb-0 fs-sm">
                        <thead class="bg-body-light text-uppercase fs-xs">
                            <tr>
                                <th style="width: 300px;" class="fw-bold text-muted ps-3">Proveedor & Detalles</th>
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

                            <tr>
                                <td class="ps-3">
                                    <div class="mb-2">
                                        <select class="form-select form-select-sm fw-semibold">
                                            <option>FERRETERIA INDUSTRIAL S.A.</option>
                                        </select>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 ps-0 pe-1 text-muted"><i
                                                class="fa fa-pen"></i></span>
                                        <textarea class="form-control form-control-sm border-0 bg-body-light" rows="1"
                                            style="resize: none;" placeholder="Descripción..."></textarea>
                                    </div>
                                </td>

                                <td>
                                    <input type="text"
                                        class="form-control form-control-sm text-center border-0 bg-body-light"
                                        value="25/10/2025">
                                </td>

                                <td>
                                    <input type="text"
                                        class="form-control form-control-sm text-center fw-bold border-0 bg-body-light"
                                        value="50">
                                </td>

                                <td>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            value="12.50">
                                    </div>
                                </td>

                                <td>
                                    <div class="input-group input-group-sm">
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            value="16">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">%</span>
                                    </div>
                                </td>

                                <td>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            value="1.50">
                                    </div>
                                </td>

                                <td class="text-end pe-3">
                                    <div class="fw-bold text-dark mb-0">$ 700.00</div>
                                    <span class="badge bg-success-light text-success fs-xs rounded-pill px-2">
                                        Ok
                                    </span>
                                </td>

                                <td class="text-center">
                                    <a href="javascript:void(0)" class="text-danger opacity-50 hover-opacity-100">
                                        <i class="fa fa-times-circle"></i>
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td class="ps-3">
                                    <div class="mb-2">
                                        <select class="form-select form-select-sm fw-semibold">
                                            <option>IMPORTADORA DEL VALLE</option>
                                        </select>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 ps-0 pe-1 text-muted"><i
                                                class="fa fa-pen"></i></span>
                                        <textarea class="form-control form-control-sm border-0 bg-body-light" rows="1"
                                            style="resize: none;" placeholder="Descripción..."></textarea>
                                    </div>
                                </td>

                                <td>
                                    <input type="text"
                                        class="form-control form-control-sm text-center border-0 bg-body-light"
                                        placeholder="Fecha">
                                </td>

                                <td>
                                    <input type="text"
                                        class="form-control form-control-sm text-center fw-bold border-0 bg-body-light"
                                        value="10">
                                </td>

                                <td>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            value="5.00">
                                    </div>
                                </td>

                                <td>
                                    <div class="input-group input-group-sm">
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            value="16">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">%</span>
                                    </div>
                                </td>

                                <td>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-transparent border-0 text-muted px-1">$</span>
                                        <input type="text"
                                            class="form-control form-control-sm text-end border-0 bg-body-light"
                                            value="0.60">
                                    </div>
                                </td>

                                <td class="text-end pe-3">
                                    <div class="fw-bold text-dark mb-0">$ 56.00</div>
                                    <span class="badge bg-warning-light text-warning fs-xs rounded-pill px-2"
                                        title="El pedido debe superar los $300">
                                        <i class="fa fa-exclamation-triangle me-1"></i>Min $300
                                    </span>
                                </td>

                                <td class="text-center">
                                    <a href="javascript:void(0)" class="text-danger opacity-50 hover-opacity-100">
                                        <i class="fa fa-times-circle"></i>
                                    </a>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

            <div
                class="block-content block-content-full bg-body-light border-top d-flex justify-content-between align-items-center py-2">
                <button class="btn btn-sm btn-alt-success">
                    <i class="fa fa-plus me-1"></i> Agregar
                </button>

                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-baseline">
                        <span class="fs-xs text-muted me-2">TOTAL ASIGNADO:</span>
                        <span class="fs-sm fw-bold text-dark">$ 756.00</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary px-3">
                        Guardar
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Ajustes finos para que vue-select se vea integrado */
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
    /* Negrita para el nombre del proveedor */
    color: #343a40;
}

:deep(.style-chooser .vs__open-indicator) {
    transform: scale(0.8);
}
</style
