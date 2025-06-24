<script setup>
import { useStore } from 'vuex'
import { computed, ref } from 'vue';
const store = useStore();
const listaDescripcionAlternativas = computed(() => store.state.articulos_alternativos);
const props = defineProps({
    item: {
        type: String,
        required: true
    }
})
const emit = defineEmits(['seleccionarAlternativa']);
const descripcionAlternativa = ref('');

function clearListAlternative(){
    const listaDescripcionAlternativas = [];
}

const cargandoAlternativas = computed(() => {
  return !listaDescripcionAlternativas?.data || listaDescripcionAlternativas.data.length === 0;
});
</script>
<template>
    <BaseBlock :title="`Item: ${item}`">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm text-muted">
                <div v-if="cargandoAlternativas"> Cargando Alternativas...</div>
                <div class="mb-4" v-else>
                    <label class="form-label">Descripciones Alternativas</label>
                    <select  v-model="descripcionAlternativa"  class="form-select">
                        <option v-for="item in listaDescripcionAlternativas.data" :key="item.tx_itm"
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
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal"
                @click="() => {emit('seleccionarAlternativa', descripcionAlternativa), clearListAlternative()}" :disabled="!descripcionAlternativa">Seleccionar</button>
        </div>
    </div>
</template>