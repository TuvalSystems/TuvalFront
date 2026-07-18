<script setup>
import { swalError, swalSuccess, swalWarning } from '@/functions/swal-alert.js';
import { onMounted, ref, computed, markRaw } from 'vue';
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import BaseBlock from '@/components/BaseBlock.vue';

//composables
import { useInvoiceCollectionActions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions';
import { useInvoiceCollectionDraft } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionDraft.js';
//componentes
import TarjetaEstadoCaja from './components/TarjetaEstadoCaja.vue';
import TablaBusquedaCliente from './components/TablaBusquedaCliente.vue';
import TarjetaInformacionCliente from './components/TarjetaInformacionCliente.vue';
import PagoRetenciones from './components/PagoRetenciones.vue';
import PagoEfectivo from './components/PagoEfectivo.vue';
import PagoDepositos from './components/PagoDepositos.vue';
import PagoCheques from './components/PagoCheques.vue';
import PagoTarjetas from './components/PagoTarjetas.vue';
import PagoAplicaciones from './components/PagoAplicaciones.vue';

const {
    //obtener estado de caja
    loadingCashBoxStatus,
    getUserCashBoxStatus,
    dataCashBoxStatus,

    //aperturar caja
    loadingOpenCashBox,
    openCashBoxed,

    //carga de facturas y facturas retenciones
    clientInvoices,
    retentionInvoices,
    loadingClientInvoices,
    fetchClientInvoices,

    //carga de documentos pendiente de aplicacion 
    pendingApplicationDocuments,
    loadingPendingApplicationDocuments,
    fetchPendingApplicationDocuments,
    //carga de bancos 
    bankTuval,
    bankClient,
    bankCard,
    loadingCollectionBanks,
    fetchCollectionBanks,
    resetCustomerCollectionData
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

const {
    collectionDraft,
    //funciones de limpieza
    resetDraft,
    //asignacion de clienteId
    setCustomer,
    //retenciones
    addRetention,
    removeRetention,
    //cheques
    addCheck,
    removeCheck,
    //depositos
    addDeposits,
    removeDeposits,
    //efectivo
    addCash,
    removeCash,
    //tarjetas
    addCards,
    removeCards,
    //aplicaciones
    addApplications,
    removeApplications
} = useInvoiceCollectionDraft();

function paymentCountLabel(count) {
    return count === 1 ? '1 registro' : `${count} registros`;
}

const paymentComponents = {
    retenciones: markRaw(PagoRetenciones),
    efectivo: markRaw(PagoEfectivo),
    depositos: markRaw(PagoDepositos),
    cheques: markRaw(PagoCheques),
    tarjetas: markRaw(PagoTarjetas),
    aplicaciones: markRaw(PagoAplicaciones),
};

const paymentMethodSections = computed(() => {
    const sections = [
        {
            key: 'retenciones',
            headingId: 'payment-retentions-heading',
            collapseId: 'payment-retentions-collapse',
            title: 'Ingreso de Retenciones',
            subtitle: 'Comprobantes de retencion',
            icon: 'fa-file-invoice-dollar',
            count: collectionDraft.retenciones.length,
            component: paymentComponents.retenciones,
            props: {
                facturasRetenciones : retentionInvoices.value,
                retenciones: collectionDraft.retenciones
                
            },
            events: {
                'add-retention': addRetention,
                'remove-retention': removeRetention
            }
        },
        {
            key: 'efectivo',
            headingId: 'payment-cash-heading',
            collapseId: 'payment-cash-collapse',
            title: 'Efectivo',
            subtitle: 'Pago directo en caja',
            icon: 'fa-money-bill-wave',
            count: collectionDraft.efectivo ? 1 : 0,
            component: paymentComponents.efectivo,
        },
        {
            key: 'depositos',
            headingId: 'payment-deposits-heading',
            collapseId: 'payment-deposits-collapse',
            title: 'Depositos / transferencias',
            subtitle: 'Pagos bancarios',
            icon: 'fa-building-columns',
            count: collectionDraft.depositos.length,
            component: paymentComponents.depositos,
        },
        {
            key: 'cheques',
            headingId: 'payment-checks-heading',
            collapseId: 'payment-checks-collapse',
            title: 'Cheques',
            subtitle: 'Cheques recibidos',
            icon: 'fa-money-check-dollar',
            count: collectionDraft.cheque ? 1 : 0,
            component: paymentComponents.cheques,
        },
        {
            key: 'tarjetas',
            headingId: 'payment-cards-heading',
            collapseId: 'payment-cards-collapse',
            title: 'Tarjetas de credito',
            subtitle: 'Voucher o comprobante de tarjeta',
            icon: 'fa-credit-card',
            count: collectionDraft.tarjetas.length,
            component: paymentComponents.tarjetas,
        },
        {
            key: 'aplicaciones',
            headingId: 'payment-applications-heading',
            collapseId: 'payment-applications-collapse',
            title: 'Aplicacion de saldos',
            subtitle: 'Saldos pendientes del cliente',
            icon: 'fa-scale-balanced',
            count: collectionDraft.aplicaciones.length,
            component: paymentComponents.aplicaciones,
        },
    ];

    return sections.map((section) => ({
        ...section,
        badgeClass: section.count > 0 ? 'bg-success-light text-success' : 'bg-body text-muted',
        badgeText: section.count > 0 ? paymentCountLabel(section.count) : 'Sin registros',
    }));
});

const totalPaymentRecords = computed(() => {
    return paymentMethodSections.value.reduce((total, section) => total + section.count, 0);
});

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



const cannotProcessCollection = computed(() => {
    const status = dataCashBoxStatus.value?.estado;

    return ['cerrado', 'sin_cierre'].includes(status);
});

function clearCurrentCustomerCollection() {
    selectedCustomer.value = null;
    resetDraft();
    resetCustomerCollectionData();
}


/** 
 * 
 * busqueda de cliente  
 * 
 * */

async function updateCustomerSearchTerm(textSearch) {
    dataSearch.search = textSearch;
    const searchTextLength = textSearch?.trim().length ?? 0;
    const hasSearchText = searchTextLength > 0;
    const canShowCustomerResults = searchTextLength > 4;

    showCustomerResults.value = canShowCustomerResults;
    if (hasSearchText && (selectedCustomer.value || collectionDraft.cliente_id)) {
        clearCurrentCustomerCollection();
        showCustomerResults.value = canShowCustomerResults;
    }
}

async function searchCustomerFilters() {
    showCustomerResults.value = true;

    if (!dataSearch.search || dataSearch.search.trim().length <= 4) {
        errorSearchClient.value = true
        showCustomerResults.value = false;
        return;
    }
    clearCurrentCustomerCollection();
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
    resetDraft();

    const availableResponse = await fetchAvailableCreditCustomer(selection.CLI_RUC);
    if (!availableResponse?.ok) {
        const message = availableResponse?.message || 'Opps! Ocurrio un error al obtener la lista de clientes.';
        (availableResponse?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
        return;
    }

    setCustomer(selectedCustomer.value);
    await refreshCustomerCollectionData(selectedCustomer.value);
}

async function cleanSearchClients() {
    dataSearch.search = '';
    clients.value = [];
}



/** 
 * proceso de refresco de data del cliente 
 *
 *  */
const loadingCustomerCollectionData = computed(() =>
    loadingClientInvoices.value ||
    loadingPendingApplicationDocuments.value ||
    loadingCollectionBanks.value
);

async function refreshCustomerCollectionData(customer) {
    const clientId = customer?.id;
    if (!clientId) {
        swalWarning('Debe seleccionar un cliente.');
        return false;
    }
    const responses = await Promise.all([
        fetchClientInvoices(clientId),
        fetchPendingApplicationDocuments(clientId),
        fetchCollectionBanks()
    ]);

    const errorResponse = responses.find(
        response => response?.ok === false
    );

    if (errorResponse) {
        const msg = errorResponse?.message || 'No se pudo cargar la información del cliente';
        (errorResponse?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
        return false;
    }
    swalSuccess('Información Actualizada Exitosamente');
    return true;
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
    <div class="content-full m-2">
        <!-- cabecera de estado de caja-->
        <div v-if="loadingCashBoxStatus" class="text-center py-3">
            <div class="spinner-border text-primary spinner-border-sm">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="fs-sm text-muted mt-2">
                Consultando estado de caja...
            </div>
        </div>
        <TarjetaEstadoCaja v-else-if="dataCashBoxStatus" :cash-box="dataCashBoxStatus" :loading="loadingOpenCashBox"
            @open-cash-box="confirmOpenCashBox" />

        <div v-else class="alert alert-warning">
            <i class="fa fa-triangle-exclamation me-1"></i>
            No se pudo obtener la información de la caja.
        </div>
        <!-- end cabecera de estado de caja-->

        <BaseBlock v-if="dataCashBoxStatus && !cannotProcessCollection" title="Cliente" class="mb-3" rounded>
            <!-- busqueda de cliente y seleccion de cliente-->
            <TablaBusquedaCliente :clients="clients" :loading="loadingSearch" :error-search="errorSearchClient"
                :show-results="showCustomerResults" @search-term-change="updateCustomerSearchTerm"
                @search-customers="searchCustomerFilters" @select-customer="handleCustomerSelected">
            </TablaBusquedaCliente>
            <!-- end seccion clientes -->

            <!-- informacion del cliente -->
            <TarjetaInformacionCliente v-if="selectedCustomer" :loading="loadingAvailableCredit"
                :loading-info="loadingCustomerCollectionData" :client="infoClient" :segment="infoSegmento" class="mb-3"
                @refresh-info="refreshCustomerCollectionData"></TarjetaInformacionCliente>
            <!-- end informacion del cliente -->


            <!-- inicio proceso de cobros a ejecutar -->
            <div v-if="collectionDraft.cliente_id" class="payment-methods mt-3 mb-2">
                <div class="payment-methods-header">
                    <div>
                        <h3 class="h6 fw-bold mb-1 text-uppercase">Metodos de cobro</h3>
                        <div class="fs-sm text-muted">
                            {{ totalPaymentRecords > 0 ? paymentCountLabel(totalPaymentRecords) : 'SIN REGISTROS' }}
                        </div>
                    </div>

                    <span class="badge rounded-pill bg-primary-light text-primary">
                        {{ paymentMethodSections.length }} procesos
                    </span>
                </div>

                <div class="accordion payment-accordion" id="invoiceCollectionPaymentMethods">
                    <div v-for="method in paymentMethodSections" :key="method.key" class="accordion-item">
                        <h2 class="accordion-header " :id="method.headingId">
                            <button class="accordion-button payment-accordion-button collapsed " type="button"
                                data-bs-toggle="collapse" :data-bs-target="`#${method.collapseId}`"
                                aria-expanded="false" :aria-controls="method.collapseId">
                                <span class="payment-method-icon">
                                    <i :class="['fa', method.icon]"></i>
                                </span>

                                <span class="payment-method-title">
                                    <span class="fw-semibold text-uppercase  fw-bold" style="font-size:12px">{{
                                        method.title
                                    }}</span>
                                    <!-- <span class="fs-sm text-muted">{{ method.subtitle }}</span> -->
                                </span>

                                <span class="badge rounded-pill payment-method-badge" :class="method.badgeClass">
                                    {{ method.badgeText }}
                                </span>
                            </button>
                        </h2>

                        <div :id="method.collapseId" class="accordion-collapse collapse"
                            :aria-labelledby="method.headingId" data-bs-parent="#invoiceCollectionPaymentMethods">
                            <div class="accordion-body payment-accordion-body">
                                <component :is="method.component" v-bind="method.props" v-on="method.events" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- fin proceso de cobros a ejecutar -->

            <div v-if="collectionDraft.cliente_id" class="mb-2">
                <h1>Resumén</h1>
                {{ collectionDraft }}
            </div>
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

.payment-methods {
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
    overflow: hidden;
}

.payment-methods-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
    padding: .95rem 1rem;
    border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
    background: var(--tuval-surface-muted, var(--bs-light));
}

.payment-accordion {
    --bs-accordion-border-width: 0;
    --bs-accordion-border-radius: 0;
    --bs-accordion-inner-border-radius: 0;
}

.payment-accordion .accordion-item {
    border: 0;
    border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
}

.payment-accordion .accordion-item:last-child {
    border-bottom: 0;
}

.payment-accordion-button {
    display: flex;
    gap: .75rem;
    align-items: center;
    padding: .85rem 1rem;
    color: var(--tuval-text, var(--bs-body-color));
    background: var(--bs-body-bg);
    box-shadow: none;
}

.payment-accordion-button:not(.collapsed) {
    color: var(--tuval-primary, var(--bs-primary));
    background: rgba(var(--bs-primary-rgb), .06);
    box-shadow: inset 0 -1px 0 var(--tuval-border, var(--bs-border-color));
}

.payment-accordion-button:focus {
    box-shadow: inset 0 0 0 1px rgba(var(--bs-primary-rgb), .25);
}

.payment-method-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 2.25rem;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--tuval-radius-md, 8px);
    color: var(--tuval-primary, var(--bs-primary));
    background: rgba(var(--bs-primary-rgb), .08);
}

.payment-method-title {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    line-height: 1.25;
}

.payment-method-badge {
    flex: 0 0 auto;
    margin-right: .75rem;
}

.payment-accordion-body {
    min-height: 4.5rem;
    padding: 1rem;
    background: var(--bs-body-bg);
}

@media (max-width: 575.98px) {
    .payment-methods-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .payment-accordion-button {
        align-items: flex-start;
    }

    .payment-method-badge {
        margin-top: .35rem;
    }
}
</style>
