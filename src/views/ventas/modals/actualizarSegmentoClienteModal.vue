<script setup>
import { onMounted } from 'vue'
import { swalError } from "@/functions/swal-alert.js";
import { useGetSegmentClients } from "@/composables/venta/cotizaciones/useGetSegmentClients";
import { useUpdateSegmentClient } from "../../../composables/venta/cotizaciones/useUpdateSegmentClient";

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
    updateClientWithSegment,
    data,
    resetForm
} = useUpdateSegmentClient(props.cliente);

async function sendinfo() {
    if (!data.segmento || !data.subsegmento) {
        swalError('Debe seleccionar segmento y subsegmento');
        return
    }
    /** proceso para ejecutar la funcion del componente padre */
    const ok = await updateClientWithSegment(props.cliente);
    if (ok) {
        emit('updated', props.cliente);
    }
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
                        <option v-for="(seg, index) in segmentos" :key="index" :value="seg.cot_artPadre">
                            {{ seg.segmento }}
                        </option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">SUB SEGMENTO</label>
                    <div v-if="loadingSegmentos && loadingSubSegmentos" class="text-center"> <span
                            class="spinner-border spinner-border-sm"></span></div>
                    <select class="form-select" v-model="data.subsegmento" v-else>
                        <option v-for="(seg, index) in subsegmentos" :key="index" :value="seg.co_atrHijo">
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
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal"
                @click="sendinfo">Actualizar</button>
        </div>
    </div>
</template>