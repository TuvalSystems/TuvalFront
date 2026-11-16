<script setup>
import { watch, reactive, toRefs, unref } from 'vue';
import { formatPrice } from "@/functions";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useTipoReservasStore } from '@/stores/cotizaciones/reservas/useTipoReservasStore';
import { useQuotationReserveRequestSale } from '@/composables/venta/cotizaciones/reservas/useQuotationReserveRequestSale';
import {
    swalSuccess,
    swalWarning
} from "@/functions/swal-alert.js";
const emit = defineEmits(['modalReservaHide']);
const props = defineProps({
    datosReserva: Object,
});
const { datosReserva } = toRefs(props);
const tipoReservasStore = useTipoReservasStore();
const { reserva, solicitarReserva, isInvalid, resetForm, validateTypeReserveHasItemLOrService,
    validateHasDuplicateItems, } = useQuotationReserveRequestSale(datosReserva);

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
    const resp = await solicitarReserva();
    if (!resp.ok) {
        swalWarning(resp.message);
        return;
    }
    emit('modalReservaHide', true);
    await swalSuccess(resp?.message || 'Solicitud Guardada Exitosamente');
}

function hydrateReservaForm(row) {
    if (!row) {
        resetForm();
        return;
    }

    const fecha = row.fe_solicitud_reserva ?? null;

    Object.assign(reserva, {
        cotizacion_id: row.cotizacion_id ?? null,
        tipo_reserva_id: row.tipo_reserva_id ? Number(row.tipo_reserva_id) : null,
        tipo_traslado_reserva_id: row.tipo_traslado_reserva_id ? Number(row.tipo_traslado_reserva_id) : null,
        fe_solicitud_reserva: fecha,
        obs_solicitud_reserva: row.obs_solicitud_reserva ?? null,
    });
}
watch(
    [
        () => reserva.tipo_reserva_id,
        () => !!unref(datosReserva)?.has_l_items,
        () => !!unref(datosReserva)?.has_service_items,
        () => !!unref(datosReserva)?.has_duplicate_items,
    ],
    async () => {
        if (!reserva.tipo_reserva_id) {
            isInvalid.value = false;
            return;
        }

        const validations = [
            validateTypeReserveHasItemLOrService(),
            validateHasDuplicateItems(),
        ];

        const error = validations.find((item) => item.invalid);

        if (!error) {
            isInvalid.value = false;
            return;
        }

        reserva.tipo_reserva_id = null;
        reserva.tipo_traslado_reserva_id = null;
        isInvalid.value = true;

        await swalWarning(error.message);
    },
    { immediate: false }
);

watch(
    datosReserva,
    (row) => {
        hydrateReservaForm(row);
    },
    { immediate: true, deep: true }
);

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
                                    <label for="" class="form-label text-muted fs-sm">Bodega</label>
                                    <p class="fw-semibold mb-0">{{ datosReserva.pto_venta }}</p>
                                </div>
                                <div class="col-6">
                                    <label for="" class="form-label text-muted fs-sm">Cotización</label>
                                    <p class="fw-semibold mb-0">
                                        {{ datosReserva.cotizacion }}
                                    </p>
                                </div>
                                <div class="col-6">
                                    <label for="" class="form-label text-muted fs-sm">Fecha</label>
                                    <p class="fw-semibold mb-0">{{ datosReserva.fecha }}</p>
                                </div>
                                <div class="col-6">
                                    <label for="" class="form-label text-muted fs-sm">Cliente</label>
                                    <p class="fw-semibold mb-0 text-break">{{ datosReserva.razon_social }}</p>
                                </div>
                                <div class="col-12">
                                    <label for="" class="form-label text-muted fs-sm">Total</label>
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
                                <label for="tipoReserva" class="form-label text-muted fs-sm">Tipo de Reserva</label>
                                <div v-if="tipoReservasStore.loading"> Cargando motivos...</div>
                                <select v-else id="tipoReserva" class="form-select form-select-sm"
                                    v-model="reserva.tipo_reserva_id">
                                    <option disabled :value="null">Seleccione…</option>
                                    <option v-for="(tipo, index) in tipoReservasStore.tipoReservas" :key="index"
                                        :value="Number(tipo.id)">
                                        {{ tipo.descripcion }}
                                    </option>
                                </select>
                            </div>
                            <div v-if="reserva.tipo_reserva_id == 2"></div>
                            <div class="mb-3" v-else>
                                <label for="traslado" class="form-label text-muted fs-sm">Traslado</label>
                                <select id="traslado" class="form-select form-select-sm"
                                    v-model="reserva.tipo_traslado_reserva_id" aria-describedby="trasladoHelp">
                                    <option disabled :value="null">Seleccione…</option>
                                    <option v-for="(tipo, index) in traslado" :key="index" :value="Number(tipo.id)">
                                        {{ tipo.nombre }}
                                    </option>
                                </select>
                                <div id="trasladoHelp" class=" text-muted fs-sm">Indica si requiere movimiento entre
                                    bodegas.
                                </div>
                            </div>

                            <div class="mb-2">
                                <label for="fechaReserva" class="form-label text-muted fs-sm">Fecha solicitada</label>
                                <flat-pickr id="fechaReserva" class="form-control form-control-sm"
                                    v-model="reserva.fe_solicitud_reserva" :config="flatPickrState.fecha" />
                            </div>

                            <div class="mb-1">
                                <label for="obs" class="form-label text-muted fs-sm">Observación</label>
                                <textarea id="obs" rows="3" class="form-control form-control-sm"
                                    v-model="reserva.obs_solicitud_reserva" maxlength="400"
                                    placeholder="Agrega una observación..."></textarea>
                            </div>
                            <div class="text-end text-muted fs-xs">{{ (reserva.obs_solicitud_reserva || '').length
                                }}/400
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
            <button type="button" class="btn btn-sm btn-primary" @click="guardarYEmitir" :disabled="isInvalid">
                <span v-if="isInvalid" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Solicitar
            </button>
        </div>
    </div>
</template>
