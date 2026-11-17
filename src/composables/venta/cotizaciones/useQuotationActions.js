import axiosClient from "@/axios";
import { useRouter } from "vue-router";
import { useApiAction } from "@/composables/core/useApiAction";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { swalInfo, swalWarning } from "@/functions/swal-alert";

export function useQuotationActions() {
  const router = useRouter();
  const { run, loading: checkingReserve } = useApiAction();

  async function canManageQuotation(quote) {
    if (checkingReserve.value) return false;
    const result = await run(
      () => axiosClient.get(`${QUOTE_API_ROUTES.QUOTES.CHECK_RESERVE}/${quote.id}`).then(({ data }) => ({
        // En este endpoint, exists=false también es una respuesta válida.
        data: { ...data, success: typeof data.exists === "boolean", data },
      }))
    );
    if (!result.ok) {
      if (!result.handled && !result.canceled) swalWarning(result.message);
      return false;
    }
    if (result.data.exists) {
      swalInfo(result.data.message);
      return false;
    }
    return true;
  }

  async function openQuotation(quote, mode) {
    if (!await canManageQuotation(quote)) return;
    return router.push({ name: "ventas-crearcotizacion", query: { id: quote.id, mode } });
  }

  return {
    checkingReserve,
    canManageQuotation,
    recoverQuotation: (quote) => openQuotation(quote, "restore_quote"),
    reorderQuotation: (quote) => openQuotation(quote, "reorder_quote"),
  };
}
