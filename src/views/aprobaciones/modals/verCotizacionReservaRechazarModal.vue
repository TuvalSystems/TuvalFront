<script setup>
import { computed, reactive } from 'vue';
import { useQuotationReserveApproval } from '@/composables/aprobaciones/reservas/useQuotationReserveApproval';
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import {
    swalSuccess,
    swalError,
} from "@/functions/swal-alert.js";
const props = defineProps({
    'reserva': Object

});
const emit = defineEmits(['closeModalRechazarReserva']);
const infoResponse = computed(() => props.reserva);
const infoReserva = infoResponse.value.reserva;
const { dataSendApproval, loadingDeny, denyReservation } = useQuotationReserveApproval();
const flatPickrState = reactive({
    fecha: {
        minDate: Date.now(),
        locale: Spanish,
    },
});

function rechazarReserva() {
    try {
        dataSendApproval.id = infoReserva.value.id;
        const response = denyReservation();
        if (response) {
             emit('closeModalRechazarReserva', true);
            swalSuccess("Cotización rechazada");
        }
    } catch (error) {
        swalError(error.response.data.error);
    }

}



</script>

<template>
    <BaseBlock :title="`Cotizacion por rechazar ${infoReserva.cotizacion.cotizacion}`" class="mb-0" transparent themed>
        <template #options>
            <div class="block-options-item">
                <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                    <i class="fa fa-fw fa-times"></i>
                </button>
            </div>
        </template>
    </BaseBlock>
    <div class="content">
        <div class="row g-2 mb-4">
            <div class="col-md-12">
               <div class="kv ">
                    <label for="fechaReserva" class="form-label text-muted fs-sm">Fecha Rechazo</label>
                    <div class="fw-semibold">
                        <flat-pickr id="fechaReserva" class="form-control form-control-sm"
                            v-model="dataSendApproval.fe_autSolResInv" :config="flatPickrState.fecha" />
                    </div>
                </div>
            </div>
             <div class="col-12">
              <div class="kv">
                    <label for="fechaReserva" class="form-label text-muted fs-sm">Observación</label>
                    <div class="fw-semibold">
                        <textarea id="obs" rows="3" class="form-control form-control-sm" maxlength="400"
                            v-model="dataSendApproval.tx_obsAutSolResInv"
                            placeholder="Detalles adicionales (opcional)"></textarea>
                    </div>
                    <div class="text-end text-muted fs-xs">{{ (dataSendApproval.tx_obsAutSolResInv || '').length
                    }}/400
                    </div>
                </div>
            </div>
        </div>
    </div>
     <div class="content text-end mb-4 space-x-2">
          <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal">
            Cerrar
        </button>
          <button type="button" class="btn btn-sm btn-danger" @click="rechazarReserva" :disabled="loadingDeny">
            <span v-if="loadingDeny" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
            <i v-else class="fa fa-times me-1"></i>
            Rechazar
        </button>
     </div>
</template>
<style scoped>
.kv small {
    display: block;
    line-height: 1;
}

.kv .fw-semibold {
    line-height: 1.2;
}

.text-monospace {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
    .table.table-sm> :not(caption)>*>* {
        padding-top: .35rem;
        padding-bottom: .35rem;
    }
}
</style>