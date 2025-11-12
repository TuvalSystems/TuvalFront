<script setup>
import { onMounted, watch, ref } from 'vue';
import {
    swalSimple,
    swalInfo,
    swalSuccess,
    swalWarning,
    swalError,
    toast,
} from "@/functions/swal-alert.js";
import { useOrderUpdate } from '@/composables/venta/pedidos/useOrderUpdate'

const max_length_nota = ref(300);
const {  //state
    data,
    loadingUpdate,
    //functions
    insertData,
    updateOrder,
    resetForm, } = useOrderUpdate()

const emit = defineEmits(["llenarPedidos", "closeModal"]);
const props = defineProps({
    'pedido': Object
});

async function updateForm() {
  const ok = await updateOrder();  
  if (!ok) return;    
    emit('closeModal');
    emit('llenarPedidos');
}

watch(
    () => props.pedido,
    () => {
        insertData(props.pedido)
    },
    { immediate: true }
);

onMounted(() => { });
</script>

<template>
    <BaseBlock :title="`Pedido: ${pedido.pedido}`">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="resetForm">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm pb-0">
                <div class="mb-3">
                    <label for="orden_de_compra" class="form-label">Orden de Compra</label>
                    <input type="text" class="form-control form-control-sm" id="orden_de_compra"
                        v-model="data.orden_de_compra">
                </div>
                <div class="mb-3">
                    <label for="cliente" class="form-label">Nota Cliente</label>
                    <div class="input-group">

                        <textarea id="nota-cliente" class="form-control" rows="3" :maxlength="max_length_nota"
                            v-model.trim="data.nota_cliente"></textarea>
                        <span v-if="data.nota_cliente" class="input-group-text input-group-text-alt">{{ max_length_nota
                            -
                            data.nota_cliente.length
                        }}</span>
                    </div>
                </div>
            </div>
        </template>
    </BaseBlock>
    <!-- Footer -->
    <div class="block-content block-content-full bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-dark btn-sm" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal" :disabled="loadingUpdate"
                @click="updateForm">Actualizar</button>
        </div>
    </div>
</template>

<style lang="css" scoped></style>
