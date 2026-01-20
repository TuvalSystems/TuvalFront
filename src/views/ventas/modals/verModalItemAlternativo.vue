<script setup>
import { watch } from 'vue';
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";

const { loadingListAlternative,
    getAlternativeDescriptions,
    listItemsAlternatives,
    clearSelectionItemalternative,
    descripcionAlternativa } = useProcessCreateQuote();
const props = defineProps({
    indice: {
        type: Number,
        required: true
    },
    item: {
        type: String,
        required: true
    }
})
const emit = defineEmits(['seleccionarAlternativa']);

watch(
    () => props.item,
    (newVal) => {
        if (newVal) {
            descripcionAlternativa.value = '';
            getAlternativeDescriptions(props.item);
        }
    }, { immediate: true }
);


const confirmarSeleccion = () => {
    if (!descripcionAlternativa.value) return;
    emit('seleccionarAlternativa', descripcionAlternativa, props.indice)
    clearSelectionItemalternative();
};


</script>
<template>
    <BaseBlock :title="`Item: ${item}`" transparent>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm text-muted">
                <div v-if="loadingListAlternative" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="text-muted mt-2 mb-0">Buscando alternativas...</p>
                </div>

                <div v-else-if="listItemsAlternatives.length === 0" class="text-center py-4">
                    <i class="fa fa-exclamation-circle text-warning fa-2x mb-2"></i>
                    <p class="text-muted mb-0">No se encontraron descripciones alternativas.</p>
                </div>
                <div v-else class="mb-4">
                    <label class="form-label">Descripciones Alternativas</label>
                    <select v-model="descripcionAlternativa" class="form-select">
                        <option value="" disabled>-- Seleccione una opción --</option>
                        <option v-for="(item, index) in listItemsAlternatives" :key="item.tx_itm || index"
                            :value="item.tx_desLar">
                            {{ item.tx_desLar }}</option>
                    </select>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="block-content block-content-full text-end bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary btn-sm" @click="confirmarSeleccion"
                :disabled="!descripcionAlternativa">Seleccionar</button>
        </div>
    </div>
</template>