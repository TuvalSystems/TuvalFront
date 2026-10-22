<script setup>
import { computed, onMounted , ref, watch} from 'vue';
const emit = defineEmits(["cerrar", 'actualizar']);
const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
});

const localPeso = ref(props.item.ART_PESO);
const pesoObligatorio = computed(() => (props.item.ART_TIPO_COMPRA || '').trim().toUpperCase() === 'L');
const pesoInvalido = computed(() => pesoObligatorio.value && (!Number.isFinite(Number(localPeso.value)) || Number(localPeso.value) <= 0));
watch(() => props.item, (newItem) => {
    localPeso.value = newItem.ART_PESO || 0;
});
const updatePesoRow = () => {
    emit('actualizar', { index: props.index, peso: localPeso.value });
}
onMounted(() => { });
</script>

<template>
    <BaseBlock :title="'Peso de :' + props.item.ART_DESCRIPCION" class="mb-0" transparent>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="emit('cerrar')">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm mb-4 space-y-2">
                <div class="input-group">
                    <input type="number" step="0.01" min="0" class="form-control text-end no-spinners"
                        :required="pesoObligatorio" :class="{ 'is-invalid': pesoInvalido }"
                        :aria-invalid="pesoInvalido"
                        placeholder="0.00" @focus="$event.target.select()" v-model.number="localPeso"
                        @change="updatePesoRow(index)" @keydown.enter.prevent="$event.target.blur();">
                    <span class="input-group-text">Kg</span>
                </div>
                <p v-if="pesoInvalido" class="text-danger mb-0" role="alert">El peso es obligatorio y debe ser mayor a cero para un ítem L.</p>
            </div>
        </template>
    </BaseBlock>
</template>

<style lang="css" scoped>
/* Chrome, Safari, Edge, Opera */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    -moz-appearance: textfield;
}
</style>
