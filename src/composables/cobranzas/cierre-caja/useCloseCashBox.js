import { formatDateForInput } from "@/utils/cobros/validateDate";
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";

export function useCloseCashBox() {
  const store = useStore();

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
    console.log(payload, "proceso de cierre de caja pruebas");
  }

  const loadingCashClosureSummary = ref(false);
  const cashClosureSummary = ref(null);
  async function fetchCashClosureSummary() {
    if (!hasRequiredCashClosurePayload()) {
      cashClosureSummary.value = null;
      return { ok: false, status: 400, message: "Seleccione caja y fecha." };
    }

    const payload = buildCashClosurePayload();
    console.log(payload, "proceso de resumen de cierre de caja");
  }

  const loadingSummaryPdfDownload = ref(false);
  async function downloadCashClosureSummaryPdf() {
    if (!hasRequiredCashClosurePayload()) {
      return { ok: false, status: 400, message: "Seleccione caja y fecha." };
    }

    const payload = buildCashClosurePayload();
    console.log(payload, "proceso de generar pdf");
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
