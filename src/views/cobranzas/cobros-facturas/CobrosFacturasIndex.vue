<script setup>
import {  useInvoiceCollectionActions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions';
import { swalError, swalSuccess, swalWarning } from '@/functions/swal-alert.js';
import { onMounted, ref } from 'vue';
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import BaseBlock from '@/components/BaseBlock.vue';



//componentes
import CashBoxStatusCard from './components/CashBoxStatusCard.vue';
import CustomerSearchTable from './components/CustomerSearchTable.vue';
import CustomerInfoCard from './components/CustomerInfoCard.vue';

const {
    //obtener estado de caja
    loadingCashBoxStatus,
    getUserCashBoxStatus,
    dataCashBoxStatus,

    //aperturar caja
    loadingOpenCashBox,
    openCashBoxed
} = useInvoiceCollectionActions();
const {
    //search Customers
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
} = useClientSearch();

async function confirmOpenCashBox() {
    const openResponse = await openCashBoxed();
    if (!openResponse?.ok) {
        const message = openResponse?.message || 'No se pudo abrir la caja.';
        (openResponse?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
        return;
    }
    const statusResponse = await getUserCashBoxStatus();
    if (!statusResponse?.ok) {
        const message = statusResponse?.message || 'La caja se abrió, pero no se pudo actualizar el estado.';
        (statusResponse?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
        return;
    }
    swalSuccess(openResponse?.message || 'Caja abierta correctamente.');
}



/** 
 * 
 * busqueda de cliente  
 * 
 * */

async function updateCustomerSearchTerm(textSearch) {
    dataSearch.search = textSearch;
    const hasSearchText = (textSearch?.trim().length ?? 0) > 4;


    showCustomerResults.value = hasSearchText;
    if (hasSearchText) {
        selectedCustomer.value = null;
    }
}

async function searchCustomerFilters() {
    showCustomerResults.value = true;

    if (!dataSearch.search || dataSearch.search.trim().length <= 4) {
        errorSearchClient.value = true
        showCustomerResults.value = false;
        return;
    }
    dataSearch.tipo = 'proceso';
    const searchRespesponse = await searchClients();
    if (!searchRespesponse?.ok) {
        errorSearchClient.value = true;
        showCustomerResults.value = false;
        const message = searchRespesponse?.message || 'Opps! Ocurrio un error al obtener la lista de clientes.';
        (searchRespesponse?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
        return;
    }
    errorSearchClient.value = false;

}

/** variable para la visualizacion de tabla de resultados de 
 *  clientes 
 */
const selectedCustomer = ref(null);
const showCustomerResults = ref(true);
async function handleCustomerSelected(selection) {
    selectedCustomer.value = selection;
    showCustomerResults.value = false;
    cleanSearchClients();

    const availableResponse = await fetchAvailableCreditCustomer(selection.CLI_RUC);
    if (!availableResponse?.ok) {
        const message = availableResponse?.message || 'Opps! Ocurrio un error al obtener la lista de clientes.';
        (availableResponse?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
        return;
    }
}


async function cleanSearchClients() {
    dataSearch.search = '';
    clients.value = [];
}
onMounted(() => {
    getUserCashBoxStatus();
});
</script>

<template>
    <!-- Hero -->
    <BasePageHeading title="Cobros facturas">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">
                        Cobros Facturas
                    </li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
    <!-- END Hero -->

    <!-- contenido -->
    <div class="content">
        <!-- cabecera de estado de caja-->
        <div v-if="loadingCashBoxStatus" class="text-center py-3">
            <div class="spinner-border text-primary spinner-border-sm">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="fs-sm text-muted mt-2">
                Consultando estado de caja...
            </div>
        </div>

        <CashBoxStatusCard v-else-if="dataCashBoxStatus" :cash-box="dataCashBoxStatus" :loading="loadingOpenCashBox"
            @open-cash-box="confirmOpenCashBox" />

        <div v-else class="alert alert-warning">
            <i class="fa fa-triangle-exclamation me-1"></i>
            No se pudo obtener la información de la caja.
        </div>
        <!-- end cabecera de estado de caja-->


        <BaseBlock v-if="dataCashBoxStatus" title="Cliente" class="mb-3" rounded>
            <!-- busqueda de cliente y seleccion de cliente-->
            <CustomerSearchTable :clients="clients" :loading="loadingSearch" :error-search="errorSearchClient"
                :show-results="showCustomerResults" @search-term-change="updateCustomerSearchTerm"
                @search-customers="searchCustomerFilters" @select-customer="handleCustomerSelected">
            </CustomerSearchTable>
            <!-- end seccion clientes -->

            <!-- informacion del cliente -->
            <CustomerInfoCard v-if="selectedCustomer" :loading="loadingAvailableCredit" :client="infoClient"
                :segment="infoSegmento" class="mb-3"></CustomerInfoCard>
            <!-- end informacion del cliente -->

        </BaseBlock>
    </div>
</template>

<style lang="css" scoped>
td input.form-control {
    min-width: 60px;
    /* Asegura que nunca sean inusables */
    width: 100%;
    /* Ocupa toda la celda */
    padding: 0.25rem;
    /* Padding pequeño */
}


@media (min-width: 992px) {
    .table.table-sm> :not(caption)>*>* {
        padding-top: .35rem;
        padding-bottom: .35rem;
    }
}
</style>
