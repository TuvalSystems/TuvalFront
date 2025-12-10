<script setup>
import { onMounted, watch, ref, reactive } from 'vue';
import {
    swalSuccess,
    swalError,
} from "@/functions/swal-alert.js";
import { useOrderUpdate } from '@/composables/venta/pedidos/useOrderUpdate'
const {  //state
    formUpdateStateEgress,
    loadingPending,
    updateStatePendingEgress,
    resetFormPendingEgress,
    insertDataPendingEgress
} = useOrderUpdate();
const emit = defineEmits(["closeModal"]);
const props = defineProps({
    'pedido': Object
});



watch(
    () => props.pedido,
    () => {
        insertDataPendingEgress(props.pedido)
    }, { immediate: true }
);


async function updateStatusPending() {
    const resp = await updateStatePendingEgress();
    if (!resp.ok) {
        swalError(resp.message || 'Error al actualizar el pedido');
        return;
    }
    emit('closeModal');
    await swalSuccess(resp.message || 'Pedido actualizado correctamente');
}


onMounted(() => { });
</script>

<template>
    <BaseBlock :title="`Pedido: ${pedido.pedido}`">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="resetFormPendingEgress">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm pb-4">
                <div class="d-flex justify-content-between align-items-center border p-3 rounded bg-body-light">
                    <div>
                        <label class="form-check-label fw-semibold mb-0" for="pendiente_salida">
                            <i class="fa fa-truck-loading me-1 text-muted"></i> Bloquear Despacho
                        </label>
                        <div class="text-muted fs-xs">
                            {{ formUpdateStateEgress.pendiente_salida === 1
                                ? 'El pedido tiene bloqueo de despacho activo.'
                                : 'El pedido puede ser despachado.' }}
                        </div>
                    </div>

                    <div class="form-check form-switch m-0">
                        <input class="form-check-input" type="checkbox" id="pendiente_salida" :true-value="1"
                            :false-value="0" v-model="formUpdateStateEgress.pendiente_salida"
                            style="cursor: pointer; transform: scale(1.2);">
                    </div>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="block-content block-content-full bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-dark btn-sm" data-bs-dismiss="modal"
                @click="resetFormPendingEgress">Cerrar</button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="loadingPending"
                @click="updateStatusPending">Actualizar</button>
        </div>
    </div>
</template>
