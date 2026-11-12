import { computed, onScopeDispose, ref, watch } from "vue";
import { useStore } from "vuex";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useQuotationImageDraft() {
  const store = useStore();
  const { run } = useApiAction();
  const customer = ref(null);
  const images = ref([]);
  const rows = ref([]);
  const observations = ref([]);
  const confirmed = ref(false);
  const extracted = ref(false);
  const extracting = ref(false);
  const creating = ref(false);
  const error = ref("");
  const created = ref(null);
  const pendingRequest = ref(null);
  const pvId = computed(() => Number(store.state.puntoventaselectid) || null);
  const pointOfSale = computed(() =>
    (store.state.puntosdeventa || []).find((point) => Number(point.id) === pvId.value)
  );
  const pointLabel = computed(() => pointOfSale.value?.PTO_VTA_DESCRIPCION || store.state.puntodeventaselect || "Sin punto de venta");
  const busy = computed(() => extracting.value || creating.value);
  const locked = computed(() => creating.value || !!pendingRequest.value || !!created.value?.id);
  const validRows = computed(() => rows.value.length > 0 && rows.value.length <= 20 && rows.value.every((row) => {
    const quantity = String(row.cantidad ?? "");
    return row.texto.trim().length > 0 && row.texto.trim().length <= 200 &&
      /^\d+(\.\d{1,2})?$/.test(quantity) && Number(quantity) > 0 && Number(quantity) <= 1000000;
  }));
  let extractionVersion = 0;
  let controller;
  let rowId = 0;

  function invalidateExtraction() {
    extractionVersion++;
    controller?.abort();
    if (pendingRequest.value || creating.value) return;
    rows.value = [];
    observations.value = [];
    extracted.value = false;
    created.value = null;
    confirmed.value = false;
    error.value = "";
  }

  watch([() => customer.value?.CLI_RUC, pvId], invalidateExtraction, { flush: "sync" });
  watch(rows, () => { confirmed.value = false; }, { deep: true, flush: "sync" });

  function selectCustomer(client) {
    if (locked.value || extracting.value) return;
    customer.value = client;
  }

  function addFiles(files) {
    if (locked.value || extracting.value) return;
    const additions = Array.from(files || []);
    if (!additions.length) return;
    if (images.value.length + additions.length > 3) {
      error.value = "Puede adjuntar hasta 3 imágenes.";
      return;
    }
    if (additions.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024)) {
      error.value = "Seleccione imágenes JPG, PNG o WEBP de hasta 2 MiB cada una.";
      return;
    }
    invalidateExtraction();
    images.value.push(...additions.map((file) => ({ file, url: URL.createObjectURL(file) })));
  }

  function removeFile(index) {
    if (locked.value || extracting.value) return;
    URL.revokeObjectURL(images.value[index].url);
    images.value.splice(index, 1);
    invalidateExtraction();
  }

  async function extract() {
    if (busy.value || locked.value) return;
    if (!customer.value?.CLI_RUC || !pvId.value || !images.value.length) {
      error.value = "Seleccione un cliente, verifique el punto de venta y adjunte al menos una imagen.";
      return;
    }
    invalidateExtraction();
    const version = extractionVersion;
    const body = new FormData();
    body.append("cliente_ruc", customer.value.CLI_RUC);
    body.append("pv_id", String(pvId.value));
    images.value.forEach(({ file }) => body.append("imagenes[]", file));
    controller = new AbortController();
    const result = await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.EXTRACT_IMAGES, body, {
      signal: controller.signal,
      timeout: 130000,
      skipMaintenanceRedirect: true,
    }), { loadingRef: extracting });
    if (version !== extractionVersion || result.canceled) return;
    if (!result.ok) {
      if (!result.handled) error.value = result.status === 503
        ? "La lectura de imágenes no está disponible. Intente más tarde o contacte al administrador."
        : result.message;
      return;
    }
    const response = result.data;
    const reviews = new Map((response.revisiones || []).map((review) => [review.indice, review.observacion]));
    rows.value = (response.payload?.detalle || []).map((item, index) => ({
      id: ++rowId,
      texto: item.texto || "",
      cantidad: item.cantidad ?? "",
      review: reviews.get(index) || "",
    }));
    observations.value = response.observaciones || [];
    extracted.value = true;
  }

  function addRow() {
    if (locked.value || rows.value.length >= 20) return;
    rows.value.push({ id: ++rowId, texto: "", cantidad: "", review: "" });
  }

  function removeRow(index) {
    if (locked.value) return;
    rows.value.splice(index, 1);
  }

  function uuid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    // getRandomValues also works on the existing HTTP intranet deployment.
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }

  async function createDraft() {
    if (busy.value || created.value?.id) return;
    if (!pendingRequest.value) {
      if (!confirmed.value || !validRows.value || !customer.value?.CLI_RUC || !pvId.value) {
        error.value = "Revise las descripciones, complete las cantidades y confirme el detalle.";
        return;
      }
      pendingRequest.value = {
        request_id: uuid(), confirmado: true,
        cliente_ruc: customer.value.CLI_RUC,
        pv_id: pvId.value,
        detalle: rows.value.map((row) => ({ texto: row.texto.trim(), cantidad: Number(row.cantidad) })),
        maxCandidatos: 6,
      };
    }
    error.value = "";
    const result = await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.CREATE_ITEMS, pendingRequest.value, {
      timeout: 130000, skipMaintenanceRedirect: true,
    }), { loadingRef: creating });
    if (result.ok) {
      created.value = result.data;
      pendingRequest.value = null;
      confirmed.value = false;
    } else {
      if (!result.handled) error.value = result.message;
      // A timeout/5xx can happen after commit. Freeze the body and reuse the UUID.
      if (result.status >= 400 && result.status < 500 && ![408, 429].includes(result.status)) {
        pendingRequest.value = null;
        confirmed.value = false;
      }
    }
  }

  function reset() {
    if (busy.value || pendingRequest.value) return;
    customer.value = null;
    created.value = null;
    images.value.forEach(({ url }) => URL.revokeObjectURL(url));
    images.value = [];
    invalidateExtraction();
  }

  onScopeDispose(() => {
    extractionVersion++;
    controller?.abort();
    images.value.forEach(({ url }) => URL.revokeObjectURL(url));
  });

  return {
    customer, images, rows, observations, confirmed, extracted, extracting, creating,
    error, created, pendingRequest, pvId, pointLabel, busy, locked, validRows,
    selectCustomer, addFiles, removeFile, extract, addRow, removeRow, createDraft, reset,
  };
}
