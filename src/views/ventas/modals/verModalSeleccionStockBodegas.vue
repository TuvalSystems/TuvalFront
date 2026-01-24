<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";

const emit = defineEmits(['closeModal', 'update']);
const {
    localStocks,
    totalAsignado,
    getStockClass,
    validateInput,
    updateStockRowItem
} = useProcessCreateQuote();
const props = defineProps({
    stocks: {
        type: Array,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    permiteDecimales: {
        type: Boolean,
        default: false
    }
});


const handleBlur = (item) => {
    if (item.seleccionado === '' || item.seleccionado === null || Number.isNaN(item.seleccionado)) {
        item.seleccionado = 0;
        return;
    }
    if (!validateInput(item, props.permiteDecimales)) return;
    saveChanges(item);
    saveChangesLocal();
};

const close = () => {
    saveChangesLocal();
    emit('closeModal');
}
const saveChangesLocal = () => {
    emit('update', {
        stocks: localStocks.value,
        total: totalAsignado.value,
        index: props.index
    });
}

const saveChanges = async (item) => {
    const resp = await updateStockRowItem(item.id, item.seleccionado);
    if (!resp?.ok) {
        swalError(resp?.message);
        return;
    }
}
watch(() => props.stocks, (newStocks) => {
    if (newStocks) {
        const copia = JSON.parse(JSON.stringify(newStocks));
        localStocks.value = copia.map(item => ({
            ...item,
            seleccionado: Number(item.seleccionado || 0)
        }));
    }
}, { immediate: true, deep: true });
</script>

<template>
    <BaseBlock title="Selección de stock por bodega" transparent class="mb-0">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close" @click="close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <div class="content-full">
            <div v-if="localStocks.length" class="table-responsive">
                <table class="table table-borderless table-vcenter table-hover mb-0 table-sm">
                    <thead class="text-uppercase fs-xs text-muted border-bottom border-opacity-10">
                        <tr>
                            <th>Bodega</th>
                            <th class="text-end" style="width: 100px;">Disponible</th>
                            <th class="text-end" style="width: 120px;">Asignar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, i) in localStocks" :key="i"
                            class="border-bottom border-opacity-10 row-hover-effect">
                            <td class="fs-sm">{{ item.STO_ART_BODEGA }}</td>
                            <td class="text-end">
                                <span class="badge bg-opacity-10 px-2 rounded-pill"
                                    :class="getStockClass(item.STO_ART_STOCK_DISPONIBLE)">
                                    {{ Number(item.STO_ART_STOCK_DISPONIBLE).toLocaleString() }}
                                </span>
                            </td>
                            <td>
                                <input type="text" class="form-control form-control-sm text-end"
                                    :class="{ 'is-invalid': item.error, 'opacity-50': item.STO_ART_STOCK_DISPONIBLE <= 0 }"
                                    v-model.number="item.seleccionado" :disabled="item.STO_ART_STOCK_DISPONIBLE <= 0"
                                    :step="props.permiteDecimales ? '0.01' : '1'" placeholder="0"
                                    @input="validateInput(item, props.permiteDecimales)" @focus="$event.target.select()"
                                    @blur="handleBlur(item)" @keydown.enter.prevent="$event.target.blur()">
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="fs-sm">
                        <tr>
                            <td colspan="2" class="text-end align-middle pt-3 text-muted fs-sm">TOTAL A DESPACHAR:</td>
                            <td class="text-end pt-3 pe-2">
                                <div class="h4 mb-0 text-primary fw-bold">
                                    {{ totalAsignado }}
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div v-else class="alert alert-warning text-center">
                No hay bodegas con stock disponible.
            </div>
        </div>
    </BaseBlock>
    <div class="block-content block-content-full text-end">
        <button type="button" class="btn btn-sm btn-primary" data-bs-dismiss="modal" @click="close">
            Cerrar
        </button>
    </div>
</template>
