<script setup>
import { onMounted } from 'vue'
import { swalError , swalSuccess, swalWarning} from "@/functions/swal-alert.js";
import { useGetSegmentClients } from "@/composables/venta/cliente/useGetSegmentClients";
import { useUpdateSegmentClient } from "@/composables/venta/cotizaciones/useUpdateSegmentClient";

const props = defineProps({
    cliente: { type: Object, required: true }
});

const emit = defineEmits(['updated']);  // definimos el evento que nos aydara a ejecutar la accion de procesoDeSelectCliente
const {
    segmentos,
    subsegmentos,
    loadingSegmentos,
    loadingSubSegmentos,
    fetchSegmentos,
    fetchSubSegmentos
} = useGetSegmentClients();
const {
    loadingUpdate,
    updateClientWithSegment,
    data,
    resetForm
} = useUpdateSegmentClient();

async function sendinfo() {
    if (!data.segmento || !data.subsegmento) {
        swalWarning('Debe seleccionar segmento y subsegmento');
        return
    }
    const resp = await updateClientWithSegment(props.cliente.CLI_RUC);
    if (!resp?.ok) {
        swalError(resp?.message);
        return;
    }
    await swalSuccess(resp?.message);
    emit('updated', props.cliente);
    await resetForm();
}


onMounted(() => {
    fetchSegmentos();
});

</script>
<template>
    <BaseBlock :title="`Cliente: ${props.cliente.CLI_RUC} `">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="resetForm">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>

            <div class="block-content fs-sm pb-0">
                <div class="alert alert-warning d-flex align-items-center mb-3" role="alert">
                    <i class="fa fa-exclamation-triangle me-3"></i>
                    <div>
                        Actualice el segmento y subsegmento del cliente
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">SEGMENTO</label>
                    <div v-if="loadingSegmentos" class="text-center"> <span
                            class="spinner-border spinner-border-sm"></span></div>
                    <select class="form-select" v-model="data.segmento" @change="fetchSubSegmentos($event.target.value)"
                        v-else>
                        <option v-for="(seg, index) in segmentos" :key="index" :value="seg.coAtrPadre">
                            {{ seg.segmento }}
                        </option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">SUB SEGMENTO</label>
                    <div v-if="loadingSegmentos && loadingSubSegmentos" class="text-center"> <span
                            class="spinner-border spinner-border-sm"></span></div>
                    <select class="form-select" v-model="data.subsegmento" v-else>
                        <option v-for="(seg, index) in subsegmentos" :key="index" :value="seg.coAtrHijo">
                            {{ seg.subsegmento }}
                        </option>
                    </select>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="block-content block-content-full bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal"
                @click="resetForm">Cerrar</button>
            <button type="button" class="btn btn-primary btn-sm"
                @click="sendinfo" :disabled="loadingUpdate">Actualizar</button>
        </div>
    </div>
</template>