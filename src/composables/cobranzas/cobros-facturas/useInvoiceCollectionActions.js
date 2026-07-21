import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { INVOICE_COLLECTION_API_ROUTES } from "@/constants/apiRoutes/cobranzas/invoiceCollectionRoutes";
import { downloadFileFromApi } from "@/utils/fileDownload";
import { ref, computed } from "vue";
import { useStore } from 'vuex'


export function useInvoiceCollectionActions() {
    const { run } = useApiAction();
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);


    const loadingCashBoxStatus = ref(false);
    const dataCashBoxStatus = ref(null);
    async function getUserCashBoxStatus(date = null) {
        return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.GET_USER_CASH_BOX_STATUS, {
            pvId: selectedPointSaleId.value,
            pvCodigo: selectedPointSaleCode.value,
            fecha: date
        }), {
            loadingRef: loadingCashBoxStatus,
            onSuccess: (info) => {
                dataCashBoxStatus.value = info ?? null
            }
        });
    }


    const loadingOpenCashBox = ref(false);
    async function openCashBoxed() {
        return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.OPEN_USER_CASH_BOX, {
            pvId: selectedPointSaleId.value
        }), {
            loadingRef: loadingOpenCashBox

        });
    }


    const loadingDownloadPdf = ref(false);
    async function printPdfStatusAccountClient(id) {
        const paylaod = {
            id: id
        }
        return run(async () => {
            const filename = await downloadFileFromApi({
                url: INVOICE_COLLECTION_API_ROUTES.DOWNLOAD_PDF,
                method: "POST",
                payload: paylaod,
                filenameFallback: "estado-cuenta.pdf",
            });
            return { data: { success: true, data: filename } };

        }, {
            loadingRef: loadingDownloadPdf,
            onError: (error) => {
                console.log(error);
            }
        });
    }


    const loadingDownloadExcel = ref(false);
    async function printExcelStatusAccountClient(id) {
        const paylaod = {
            id: id
        }
        return run(async () => {
            const filename = await downloadFileFromApi({
                url: INVOICE_COLLECTION_API_ROUTES.DOWNLOAD_EXCEL,
                method: "POST",
                payload: paylaod,
                filenameFallback: "estado-cuenta.xlsx",
            });
            return { data: { success: true, data: filename } };

        }, {
            loadingRef: loadingDownloadExcel,
            onError: (error) => {
                console.log(error);
            }
        });
    }

    const clientInvoices = ref([]);
    const retentionInvoices = ref([]);
    const loadingClientInvoices = ref(false);
    async function fetchClientInvoices(id) {
        return run(
            () => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.INVOICE_CLIENTS, { id: id }),
            {
                loadingRef: loadingClientInvoices,
                onSuccess: (data) => {
                    clientInvoices.value = data.facturas ?? data.invoices ?? [];
                    retentionInvoices.value = data.facturas_retenciones ?? [];
                }

            }
        );
    }

    const pendingApplicationDocuments = ref([]);
    const loadingPendingApplicationDocuments = ref(false);
    async function fetchPendingApplicationDocuments(id) {
        return run(
            () => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.APPLICATIONS_PENDING, { id: id }),
            {
                loadingRef: loadingPendingApplicationDocuments,
                onSuccess: (data) => {
                    pendingApplicationDocuments.value = data ?? [];
                }
            }
        );
    }

    const bankTuval = ref([]);
    const bankClient = ref([]);
    const bankCard = ref([]);
    const loadingCollectionBanks = ref(false);
    async function fetchCollectionBanks() {
        return run(
            () => axiosClient.get(INVOICE_COLLECTION_API_ROUTES.GET_BANKS),
            {
                loadingRef: loadingCollectionBanks,
                onSuccess: (data) => {
                    bankTuval.value = data.bancos_tuval ?? [];
                    bankClient.value = data.bancos_cientes ?? [];
                    bankCard.value = data.bancos_tarjetas ?? [];
                }
            }
        );
    }

    function resetCustomerCollectionData() {
        clientInvoices.value = [];
        retentionInvoices.value = [];
        pendingApplicationDocuments.value = [];
        bankTuval.value = [];
        bankClient.value = [];
        bankCard.value = [];
    }




    const loadingRetentionReceiptValidation = ref(false);
    async function validateRetentionReceiptNumber(clientId, receiptNumber) {
        return run(
            () => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.VALIDATE_RECEIPT_NUMBER,{
                id: clientId,
                comprobante: receiptNumber
            }),
            {
                loadingRef: loadingRetentionReceiptValidation
            });
    }






    return {
        //obtener estado de caja
        loadingCashBoxStatus,
        getUserCashBoxStatus,
        dataCashBoxStatus,

        //aperturar caja
        loadingOpenCashBox,
        openCashBoxed,

        //download pdf 
        loadingDownloadPdf,
        printPdfStatusAccountClient,
        //download excel
        loadingDownloadExcel,
        printExcelStatusAccountClient,

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

        //limpieza de data del cliente
        resetCustomerCollectionData,

        //validacion de comprobante
        loadingRetentionReceiptValidation,
        validateRetentionReceiptNumber

    }
}
