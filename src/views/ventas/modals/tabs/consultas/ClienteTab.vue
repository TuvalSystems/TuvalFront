<script setup>
import { ref, reactive , nextTick} from "vue";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { swalWarning, swalError } from "@/functions/swal-alert.js";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import verModalDetalleCliente from "@/views/ventas/modals/tabs/consultas/modals-consulta/verModalDetalleCliente.vue";
const {
    clients,
    errorSearchClient,
    dataSearch,
    loadingSearch,
    searchClients,

    //customer
    infoClient,
    infoSegmento,
    loadingAvailableCredit,
    fetchAvailableCreditCustomer,

    //sucursales
    loadingSucursales,
    sucursales,
    fetchCustomerBranches,
    //validations
    getClientStatus,

} = useClientSearch();

const verModalDetalleRef = ref(null);
const verModalDetalleObj = useBootstrapModal(verModalDetalleRef, {
    onHidden: () => {
        dataModal.cliente = null
        dataModal.sucursal = null
    }
});

//nuevas funciones 
const showResultClients = ref(false); // para loading de tablas
const showInfoClient = ref(false);  // para loading de informacion
const showInfoSucursales = ref(false); // para loading de informacion - sucursales
async function searchFilterClientes() {
    if (dataSearch.search == null || dataSearch.search.length < 4) {
        showInfoClient.value = false;
        showResultClients.value = false;
        errorSearchClient.value = true
        return false;
    }
    showInfoClient.value = false;
    showInfoSucursales.value = false;
    showResultClients.value = false;
    const resp = await searchClients();
    if (!resp?.ok) {
        errorSearchClient.value = true
        showResultClients.value = false;
        showInfoClient.value = false;
        swalWarning(resp?.message);
        return;
    }
    errorSearchClient.value = false;
    showResultClients.value = true;
}

const dataModal = reactive({
    'cliente': null,
    'sucursal': null
});
async function selectClient(client) {
    const [respCredit, respBranches] = await Promise.all([
        fetchAvailableCreditCustomer(client.CLI_RUC),
        fetchCustomerBranches(client.CLI_RUC, 'consulta')
    ]);

    if (respCredit?.ok && respBranches?.ok) {
        dataModal.cliente = infoClient;
        dataModal.sucursal = sucursales
        await nextTick();
        verModalDetalleObj.show();
    } else {
        swalError('Hubo un problema al cargar los datos del cliente.');
    }

}

</script>

<template>
    <BaseBlock class="mb-3" transparent>
        <div class="block-content fs-sm  p-0 rounded mb-2">
            <div class="row g-2">
                <div class="col">
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" :class="errorSearchClient ? 'is-invalid' : ''"
                            placeholder="Buscar cliente..." autocomplete="off" @keyup.enter="searchFilterClientes"
                            v-model="dataSearch.search" />
                        <button class="btn btn-primary" type="button" @click="searchFilterClientes"
                            :disabled="loadingSearch">
                            <i class="fa fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="loadingSearch" class="text-center py-4">
                <div class="spinner-border text-primary mt-4">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <!-- mostrar lista de los clientes -->
            <BaseBlock v-if="showResultClients && clients.length > 0 && !loadingSearch" class="mb-2">
                <div class="table-responsive">
                    <table class="table table-hover table-sm ">
                        <thead>
                            <tr>
                                <th>Ruc</th>
                                <th>Razón Social</th>
                                <th>Contacto</th>
                                <th>Ciudad</th>
                                <th>Provincia</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(client, index) in clients" :key="index">
                                <td class="fs-sm" @click="selectClient(client)" style="cursor:pointer">
                                    <span class="text-primary">{{ client.CLI_RUC }}</span>
                                </td>
                                <td class="fs-sm" @click="selectClient(client)" style="cursor:pointer">
                                    <span class="text-primary">{{ client.CLI_RAZON_SOCIAL }}</span>
                                </td>
                                <td class="fs-sm">{{ client.CLI_CONTACTO }}</td>
                                <td class="fs-sm">{{ client.CLI_CIUDAD }}</td>
                                <td class="fs-sm">{{ client.CLI_PROVINCIA }}</td>
                                <td class="fs-sm">{{ client.CLI_TELEFONO_1 }}</td>
                                <td class="fs-sm">
                                    <a :href="'mailto:' + client.CLI_CORREO_ELECT_SRI">{{ client.CLI_CORREO_ELECT_SRI }}
                                        <span class="badge bg-danger text-white" v-if="!client.emails_validated"> correo
                                            no valido</span>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </BaseBlock>
        </div>
    </BaseBlock>



    <div class="modal fade" id="verModalDetalleObj" tabindex="-1" aria-hidden="true" ref="verModalDetalleRef">
         <div class="modal-dialog modal-lg">
            <div class="modal-content border-0 shadow-xl">
                <verModalDetalleCliente v-if="dataModal.cliente && dataModal.sucursal" :cliente="dataModal.cliente"
                    :sucursales="dataModal.sucursal">
                </verModalDetalleCliente>
            </div>
        </div>
    </div>
</template>
