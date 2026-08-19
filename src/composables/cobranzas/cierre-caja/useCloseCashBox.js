import { INVOICE_COLLECTION_API_ROUTES } from "@/constants/apiRoutes/cobranzas/invoiceCollectionRoutes";
import { formatDateForInput } from "@/utils/cobros/validateDate";
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useApiAction } from "@/composables/core/useApiAction";
import { downloadFileFromApi } from "@/utils/fileDownload";
import axiosClient from "@/axios";
export function useCloseCashBox() {
  const store = useStore();
  const { run } = useApiAction();

  const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
  const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);

  const cashClosurePayload = reactive({
    pvId: selectedPointSaleId.value,
    pvCodigo: selectedPointSaleCode.value,
    caja_id: null,
    fecha: formatDateForInput(new Date()),
  });

  function buildCashClosurePayload() {
    return {
      ...cashClosurePayload,
      pvId: selectedPointSaleId.value,
      pvCodigo: selectedPointSaleCode.value,
    };
  }

  function hasRequiredCashClosurePayload() {
    return Boolean(cashClosurePayload.caja_id && cashClosurePayload.fecha);
  }

  function setSelectedCashBox(cashBox) {
    cashClosurePayload.caja_id = cashBox?.id ?? null;
    return cashClosurePayload.caja_id;
  }

  const loadingCloseCashBox = ref(false);
  async function closeCashBox() {
    const payload = buildCashClosurePayload();
    return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.BOX.CLOSE_BOX, {
      pvId: payload.pvId,
      pvCodigo: payload.pvCodigo,
      caja_id: payload.caja_id
    }),
      {
        loadingRef: loadingCloseCashBox,
      });
  }

  const loadingCashClosureSummary = ref(false);
  const cashClosureSummary = ref(null);
  async function fetchCashClosureSummary() {
    if (!hasRequiredCashClosurePayload()) {
      cashClosureSummary.value = null;
      return { ok: false, status: 400, message: "Seleccione caja y fecha." };
    }
    const payload = buildCashClosurePayload();
    return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.BOX.RESUMEN, {
      pvId: payload.pvId,
      pvCodigo: payload.pvCodigo,
      caja_id: payload.caja_id,
      fecha : payload.fecha
    }),
      {
        loadingRef: loadingCashClosureSummary,
        onSuccess: (info) => {
          cashClosureSummary.value = info ?? null;
        },
        onError: () => {
          cashClosureSummary.value = null;
        },
      });


  }

  const loadingSummaryPdfDownload = ref(false);
  async function downloadCashClosureSummaryPdf() {
    if (!hasRequiredCashClosurePayload()) {
      return { ok: false, status: 400, message: "Seleccione caja y fecha." };
    }
    const payload = buildCashClosurePayload();
    return await run(async () => {
      const filename = await downloadFileFromApi({
        url: INVOICE_COLLECTION_API_ROUTES.BOX.PRINT_PDF,
        method: "POST",
        payload: {
          caja_id: payload.caja_id,
          fecha: payload.fecha,
          pv_id: payload.pvId
        },
        filenameFallback: "consulta-cierre-caja.pdf",
      });
      return { data: { success: true, data: filename } };
    }, {
      loadingRef: loadingSummaryPdfDownload,
      successMessage: "Documento generado exitosamente.",
      onError: (error) => {
        console.log(error);
      }
    });
  }

  return {
    cashClosurePayload,
    buildCashClosurePayload,
    setSelectedCashBox,

    loadingCloseCashBox,
    closeCashBox,

    loadingCashClosureSummary,
    fetchCashClosureSummary,
    cashClosureSummary,

    loadingSummaryPdfDownload,
    downloadCashClosureSummaryPdf,
  };
}
