<script setup>
import { watch, reactive, onMounted, toRefs } from 'vue';
import { formatPrice, formatPrice4 } from "@/functions";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { storeToRefs } from 'pinia'
import { useTipoReservasStore } from '@/stores/cotizaciones/reservas/useTipoReservasStore';
import { useQuotationReserveRequest } from '@/composables/venta/cotizaciones/reservas/useQuotationReserveRequest';
import {
    swalSuccess,
    swalError,
} from "@/functions/swal-alert.js";
const emit = defineEmits(['modalReservaHide']);
const props = defineProps({
    datosReserva: Object,
});
const { datosReserva } = toRefs(props);
const tipoReservasStore = useTipoReservasStore();
const { tipoReservas } = storeToRefs(tipoReservasStore);
const { reserva, solicitarReserva, isInvalid, resetForm, isInvalidType } = useQuotationReserveRequest(datosReserva);

const flatPickrState = reactive({
    fecha: {
        minDate: Date.now(),
        locale: Spanish,
    },
});

const traslado = reactive([
    { id: "1", nombre: "Sin Traslado" },
    { id: "2", nombre: "Traslado entre Bodegas" },
]);

async function guardarYEmitir() {
    try {
        await solicitarReserva();
        emit('modalReservaHide', true);
        await swalSuccess('Solicitud Guardada Exitosamente');
    } catch (error) {
        const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Error al guardar la solicitud";
        swalError(msg);
    }
}

function hydrateReservaForm(row) {

    if (!row) {
        resetForm();
        return;
    }
    const fecha = row.value.fe_solResInv ?? null;
    Object.assign(reserva, {
        id: row.value.id ?? null,
        co_tipSolResInv: row.value.co_tipSolResInv ?? row.value.co_tipSolResInv ?? null,
        co_tipTrasResInv: row.value.co_tipTrasResInv ?? null,
        fe_solResInv: fecha ?? null,
        tx_obsSolResInv: row.value.tx_obsSolResInv ?? null,
    });
}

watch(
    () => datosReserva,
    (row) => {
        hydrateReservaForm(row);
    },
    { immediate: true, deep: true }
);

// onMounted(() => {
//     if (tipoReservasStore.tipoReservas.length === 0) {
//         tipoReservasStore.fetchListTypeReserved()
//     }
// });

</script>
<template>
    <BaseBlock title="Solicitud de Reserva de Inventario" class="mb-4" themed>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="resetForm">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <div class="block-content block-content-full">
            <div class="row g-3">
                <!-- Resumen -->
                <div class="col-md-6">
                    <BaseBlock title="Resumen de Cotización" rounded>
                        <div class="block-content">
                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="form-label text-muted fs-sm">Bodega</label>
                                    <p class="fw-semibold mb-0">{{ datosReserva.pto_venta }}</p>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted fs-sm">Cotización</label>
                                    <p class="fw-semibold mb-0">
                                        {{ datosReserva.cotizacion }}
                                    </p>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted fs-sm">Fecha</label>
                                    <p class="fw-semibold mb-0">{{ datosReserva.fecha }}</p>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted fs-sm">Cliente</label>
                                    <p class="fw-semibold mb-0 text-break">{{ datosReserva.razon_social }}</p>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted fs-sm">Total</label>
                                    <p class="fw-semibold mb-0">${{ formatPrice(datosReserva.total) }}</p>
                                </div>
                            </div>

                            <div class="alert alert-info mt-4 mb-0">
                                <i class="fa fa-info-circle me-1"></i>
                                Esta acción **reserva stock**; no genera factura.
                            </div>
                        </div>
                    </BaseBlock>
                </div>

                <!-- Formulario -->
                <div class="col-md-6">
                    <BaseBlock title="Datos de la Solicitud" rounded>
                        <div class="block-content">
                            <div class="mb-3">
                                <label for="traslado" class="form-label text-muted fs-sm">Traslado</label>

                                <select id="traslado" class="form-select form-select-sm"
                                    v-model="reserva.co_tipTrasResInv" aria-describedby="trasladoHelp">
                                    <option disabled value="">Seleccione…</option>
                                    <option v-for="(tipo, index) in traslado" :key="index" :value="tipo.id">
                                        {{ tipo.nombre }}
                                    </option>
                                </select>
                                <div id="trasladoHelp" class=" text-muted fs-sm">Indica si requiere movimiento entre
                                    bodegas.
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="tipoReserva" class="form-label text-muted fs-sm">Tipo de Reserva</label>
                                <div v-if="tipoReservasStore.loading"> Cargando motivos...</div>
                                <select v-else id="tipoReserva" class="form-select form-select-sm"
                                    v-model="reserva.co_tipSolResInv">
                                    <option disabled value="">Seleccione…</option>
                                    <option v-for="(tipo, index) in tipoReservasStore.tipoReservas" :key="index"
                                        :value="tipo.id">
                                        {{ tipo.descripcion }}
                                    </option>
                                </select>
                            </div>

                            <div class="mb-2">
                                <label for="fechaReserva" class="form-label text-muted fs-sm">Fecha solicitada</label>
                                <flat-pickr id="fechaReserva" class="form-control form-control-sm"
                                    v-model="reserva.fe_solResInv" :config="flatPickrState.fecha" />
                            </div>

                            <div class="mb-1">
                                <label for="obs" class="form-label text-muted fs-sm">Observación</label>
                                <textarea id="obs" rows="3" class="form-control form-control-sm"
                                    v-model="reserva.tx_obsSolResInv" maxlength="400"
                                    placeholder="Agrega una observación..."></textarea>
                            </div>
                            <div class="text-end text-muted fs-xs">{{ (reserva.tx_obsSolResInv || '').length }}/400
                            </div>
                        </div>
                    </BaseBlock>
                </div>
            </div>
        </div>
    </BaseBlock>

    <div class="block-content block-content-full bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal"
                @click="resetForm">Cancelar</button>
            <button type="button" class="btn btn-sm btn-primary" @click="guardarYEmitir"
                :disabled="isInvalid || isInvalidType">
                <span v-if="isInvalidType || isInvalid" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                Solicitar
            </button>
        </div>
    </div>
</template>