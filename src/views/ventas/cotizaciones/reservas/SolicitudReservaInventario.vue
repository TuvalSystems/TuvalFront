<script setup>
import { onMounted, onBeforeUnmount, watch, reactive, ref } from "vue";
import { useTemplateStore } from "@/stores/template";
import { useReservedQuotation } from '@/composables/venta/cotizaciones/reservas/useReservedQuotation';
import { formatPrice, formatPrice4 } from "@/functions";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import VerCotizacionModal from "@/views/ventas/modals/VerCotizacionModal.vue";
import { Modal } from "bootstrap";
import { useStore } from "vuex";


// Main store
const templateStore = useTemplateStore();
const { data, isLoading, error, fetchQuotationHeader, cancel, reserva , solicitarReserva} = useReservedQuotation()
const store = useStore();
const props = defineProps({
    id: { type: String, required: true } // ya viene de la ruta
});

const flatPickrState = reactive({
    fecha: {
        locale: Spanish,
    },
});

const tipos = reactive([
    { tipo: "04", nombre: "reserva1" },
    { tipo: "05", nombre: "reserva2" },
]);
const traslado = reactive([
    { tipo: "1", nombre: "si" },
    { tipo: "2", nombre: "no" },
]);

let vercotizacionModal = ref(null);
let vercotizacionModalObj = null;
const indexCotizacion = ref(null);
const vercotizacion = ref({});
const tipo = ref(null);
async function funcionvercotizacion(cotizacion) {
    vercotizacionModalObj.show();
    vercotizacion.value = cotizacion;
    tipo.value = "cotizacion";
    store.dispatch("detallecotizacion", cotizacion);
}




onBeforeUnmount(() => {
    cancel?.() // aborta si hay una request en vuelo
    templateStore.pageLoader({ mode: 'off' })
})

watch(isLoading, (loading) => {
    if (loading === false) {
        templateStore.pageLoader({ mode: "off" });
    }
},
    { inmediate: true });

watch(() => props.id, (id) => {
    if (id) fetchQuotationHeader(id)
});


onMounted(() => {
    fetchQuotationHeader(props.id)
    vercotizacionModalObj = new Modal(vercotizacionModal.value);
});

</script>
<template>
    <!-- <BasePageHeading title="Solicitar Reserva">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Cotizaciones</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Solicitar Reserva</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading> -->

    <!-- contenido -->
    <div class="content">
        <BaseBlock title="solicitud de reserva de inventario">
            <div class="table-responsive">
                <table class="table table-sm table-hover table-vcenter">
                    <thead>
                        <tr>
                            <th class="text-nowrap">PTO VTA</th>
                            <th class="text-nowrap">cotización</th>
                            <th class="text-nowrap">fecha</th>
                            <th class="text-nowrap">cliente</th>
                            <th class="text-nowrap">total</th>
                            <th class="text-nowrap">traslado</th>
                            <th class="text-nowrap">t. reserva</th>
                            <th class="text-nowrap">F. solicitada</th>
                            <th class="text-nowrap">observación</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="data">
                            <td class="text-norwrap text-center fs-sm">{{ data.BOD_BODEGA }}</td>
                            <td class="text-norwrap text-center fs-sm">
                                <a href="javascript:void(0);" @click="funcionvercotizacion(data)">{{
                                    data.cotizacion}}</a>
                            </td>
                            <td class="text-norwrap text-center fs-sm">{{ data.created_at }}</td>
                            <td class="text-norwrap text-center fs-sm">{{ data.CLI_RAZON_SOCIAL }}</td>
                            <td class="text-norwrap text-right fs-sm">${{ formatPrice(data.total) }}</td>
                            <td class="text-norwrap" style="width: 50px;">

                                <select class="form-select  fs-sm" id="select-tipo" name="select-tipo" v-model="reserva.traslado">
                                    <option v-for="(tipo, index) in traslado" :key="index" :value="tipo.tipo"
                                        class=" fs-sm">
                                        {{ tipo.nombre }}
                                    </option>
                                </select>

                            </td>
                            <td class="text-norwrap" style="width: 150px;">

                                <select class="form-select  fs-sm" id="select-tipo" name="select-tipo" v-model="reserva.tipo_reserva">
                                    <option v-for="(tipo, index) in tipos" :key="index" :value="tipo.tipo"
                                        class=" fs-sm">
                                        {{ tipo.nombre }}
                                    </option>
                                </select>

                            </td>
                            <td class="text-norwrap"><flat-pickr style="width: 120px" id="fecha"
                                    class="form-control form-control-sm" v-model="reserva.fecha_reserva" :config="flatPickrState.fecha" /></td>
                            <td class="text-norwrap"><textarea name="" id="" rows="2" class="form-control" v-model="reserva.observacion"></textarea>
                            </td>
                        <td><button class="btn btn-primary" @click="solicitarReserva">Reservar</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </BaseBlock>
    </div>

    <!-- Modales -->
    <!-- Modal de ver cotizacion -->
    <div class="modal" id="modal-cotizacion" tabindex="-1" role="dialog" aria-labelledby="modal-cotizacion"
        aria-hidden="true" ref="vercotizacionModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <VerCotizacionModal :vercotizacion="vercotizacion" :indexCotizacion="indexCotizacion" :tipo="tipo">
                </VerCotizacionModal>
            </div>
        </div>
    </div>
</template>

<style scoped>
th,
td {
    padding: 4px 8px !important;
}

.text-nowrap {
    white-space: nowrap;
}

th {
    text-align: center;
}

td {
    vertical-align: middle;
}
</style>