import { reactive, toRef, onScopeDispose } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import axiosClient from "@/axios";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useQuotationDetail() {
  const { run, invalidate } = useApiAction();
  const detail = reactive({ id: null, data: null, loading: false, error: "", saving: false, saveError: "" });
  const loadingRef = toRef(detail, "loading");
  const errorRef = toRef(detail, "error");
  const savingRef = toRef(detail, "saving");
  const saveErrorRef = toRef(detail, "saveError");
  const detailKey = "detalle-cotizacion";
  const notesKey = "observaciones-cotizacion";
  let controller;

  function clear() {
    invalidate(detailKey);
    invalidate(notesKey);
    controller?.abort();
    Object.assign(detail, { id: null, data: null, error: "", saveError: "" });
  }

  function load(id) {
    clear();
    detail.id = id;
    controller = new AbortController();
    return run(
      () => axiosClient.post(QUOTE_API_ROUTES.QUOTES.DETAIL, { id }, { signal: controller.signal }),
      {
        loadingRef,
        errorRef,
        latestOnly: true,
        key: detailKey,
        onSuccess: (data) => { detail.data = data; },
      }
    );
  }

  function saveNotes() {
    if (!detail.data || detail.saving) return;
    const { id, orden_de_compra, nota_interna } = detail.data.cabecera;
    return run(
      () => axiosClient.post(QUOTE_API_ROUTES.QUOTES.SAVE_NOTES, { id, orden_de_compra, nota_interna }),
      {
        loadingRef: savingRef,
        errorRef: saveErrorRef,
        latestOnly: true,
        key: notesKey,
      }
    );
  }

  onScopeDispose(clear);
  return { detail, load, clear, saveNotes };
}
