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
        printExcelStatusAccountClient

    }
}
