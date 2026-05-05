import { ref, reactive, computed } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import {
  swalWarning,
  swalError,
} from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";
import { useVehiclesStore } from "@/stores/bodegas/guiasremision/vehicles";

import { downloadFileFromApi } from "@/utils/pdf";
export function useReservationTransferByWarehouse() {
  const { run } = useApiAction();
  const vehicles = useVehiclesStore();
  const store = useStore();
  const ptoOrigen = store.state.puntodeventaselect;
  //cabecera
  const dataHeaderTransfer = ref(null);
  const loadingHeaderTransfer = ref(false);
  const apiHeaderTransferByWarehouseOriginAndDestination = `reservas/transferencias/cabecera-traslados-por-reserva-bodega`;
  const payloadHeader = reactive({
    origen: ptoOrigen,
    destino: null,
  });
  //detalle
  const dataDetailTransfer = ref([]);
  const loadingDetailTransfer = ref(false);
  const apiListTransferByWarehouse = `reservas/transferencias/lista-traslados-por-reserva-bodega`;

  const dataPendingGuides = ref([]);
  const loadingPendingGuides = ref(false);
  const apiListPendingGuides = `reservas/transferencias/lista-guias-remision-reservas-pendientes`;

  const apiCancelPicking = `reservas/transferencias/cancelar-picking-item-reserva`;
  const apiUpdatePicking = `reservas/transferencias/actualizar-picking-items`;
  const apiPdfPicking = `reservas/transferencias/pdf-picking-reserva`;

  // guías de remisión pendientes - pdf - despacho
  const apiPdfGuidePending = `bodegas/reservas/guia-remision/generar-pdf`;
  const apiDispatchPendingGuides = `bodegas/reservas/guia-remision/despachar-guia`;

  //payload detalle
  const payload = reactive({
    origen: ptoOrigen,
    destino: null,
    cotizacion: "",
  });

  // tabla detalle de transferencias de reservas
  const cols = reactive([
    {
      name: "CTL",
      field: "art_cod_tres_letras",
      thClass: "fs-sm text-center",
      sort: "",
    },
    {
      name: "CÓDIGO",
      field: "art_code",
      thClass: "fs-sm text-center",
      sort: "",
    },
    {
      name: "DESCRIPCION",
      field: "art_descripcion",
      thClass: "fs-sm text-center text-truncate",
      sort: "",
    },
    {
      name: "COMPART.",
      field: "compartimiento",
      thClass: "fs-sm text-center",
      sort: "",
    },
    {
      name: "COTIZACIÓN",
      field: "cotizacion",
      thClass: "fs-sm text-center",
      sort: "",
    },
    {
      name: "FECHA",
      field: "fecha",
      thClass: "fs-sm text-center",
      sort: "",
    },
    {
      name: "USUARIO",
      field: "user_solicitud_reserva",
      thClass: "fs-sm text-center",
      sort: "",
    },
    {
      name: "CANT.",
      field: "cantidad",
      thClass: "fs-sm text-end",
      sort: "",
    },
    {
      name: "RES.",
      field: "reservado",
      thClass: "fs-sm text-end",
      sort: "",
    },
    {
      name: "TRASL.",
      field: "trasladado",
      thClass: "fs-sm text-end",
      sort: "",
    },
    {
      name: "PEND.",
      field: "pending_transfer",
      thClass: "fs-sm text-end",
      sort: "",
    },
    {
      name: "PESO.",
      field: "art_peso",
      thClass: "fs-sm text-end",
      sort: "",
    },
  ]);

  const sortBy = computed(() =>
    cols
      .filter(col => col.sort)
      .map(col => col.sort === "asc" ? col.field : `-${col.field}`)
  );

  // On sort th click
  function onSort(event, i) {
    const sortEl = cols[i];
    if (!event.shiftKey) {
      cols.forEach(col => {
        if (col !== sortEl) col.sort = "";
      });
    }

    const transitions = {
      "": "asc", "asc": "desc", "desc": event.shiftKey ? "" : "asc"
    };
    sortEl.sort = transitions[sortEl.sort];
  }

  async function fetchHeaderTransferByWarehouseOriginAndDestination() {
    if (!validatePtoDestination()) return;
    return run(() => axiosClient.post(apiHeaderTransferByWarehouseOriginAndDestination, payloadHeader), {
      loadingRef: loadingHeaderTransfer,
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: (list) => {
        dataHeaderTransfer.value = list; // list ya es response.data.data
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener lista transferencia"
        );
      },
    });
  }

  async function fetchListTransfersByWarehouseOriginAndDestination() {
    if (!validatePtoDestination()) return;
    return run(() => axiosClient.post(apiListTransferByWarehouse, payload), {
      loadingRef: loadingDetailTransfer,
      successMessage: "Items cargados correctamente.",
      onSuccess: (list) => {
        dataDetailTransfer.value = list; // list ya es response.data.data
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener lista transferencia"
        );
      },
    });
  }

  function refresh() {
    fetchListTransfersByWarehouseOriginAndDestination();
    fectchListGuideRemisionPending();
    vehicles.fetch();

  }

  function seacrchQuotation() {
    fetchListTransfersByWarehouseOriginAndDestination();
  }

  async function validatePtoDestination() {
    if (payload.destino === null) {
      return false;
    }
  }


  /**
   *
   * funciones para seleccion y aplicacion de validacion para seleccionados
   *
   *
   * */

  function selectAll(event) {
    const checked = event.target.checked;
    if (dataDetailTransfer.value.length === 0) return;
    dataDetailTransfer.value.forEach((row) => {
      if (row.pending_transfer > 0) {
        row.seleccionado = checked ? row.pending_transfer : 0;
        row.check_seleccion = checked;
      }
    });
  }


  function applyAlPendingTransfer(event, row) {
    const checked = event.target.checked;
    row.check_seleccion = checked;
    row.seleccionado = checked ? row.pending_transfer : 0;
  }
  function applyTransfer(row) {
    const reset = (msg) => {
      if (msg) swalWarning(msg);
      row.seleccionado = 0;
      row.check_seleccion = false;
      return false;
    };

    // 1) Normalizar a número
    const raw = row?.seleccionado;
    // soporta "1,5" y trims
    let val = Number(
      String(raw ?? "")
        .replace(",", ".")
        .trim()
    );

    if (!Number.isFinite(val)) {
      return reset("La cantidad debe ser un número válido");
    }

    // 2) Negativos y cero
    if (val < 0) {
      return reset("La cantidad no puede ser negativa");
    }
    if (val === 0) {
      row.check_seleccion = false;
      row.seleccionado = 0;
      return false;
    }

    // 3) Decimales permitidos?
    const decimalsAllowed = Number(row?.art_decimal_cantidad ?? 0) > 0;
    const maxDecimals = Number(row?.art_decimal_cantidad ?? 0);

    if (!decimalsAllowed) {
      // si no admite decimales, debe ser entero
      if (!Number.isInteger(val)) {
        // opción A: corregir automáticamente
        val = Math.trunc(val);
        if (val === 0) return reset("La cantidad debe ser un número entero");
        // opción B (estricta): return reset('La cantidad debe ser un número entero');
      }
    } else if (maxDecimals >= 0) {
      // recorta al número de decimales permitido
      val = Number(val.toFixed(maxDecimals));
    }

    // 4) No exceder la pendiente
    const pending = Number(row?.pending_transfer ?? 0);
    if (val > pending) {

      return reset("La cantidad no puede ser mayor a la pendiente por transferir"); // si prefieres bloquear, deja este reset
    }

    // 5) Asignar y marcar
    row.seleccionado = val;
    row.check_seleccion = val > 0;
    return true;
  }

  /***
   *  disbaled de picking y modal de guia de remision
   *
   */

  const hasSelected = computed(() =>
   dataDetailTransfer.value.some(
      (r) => r.check_seleccion === true && Number(r.seleccionado) > 0
    )
  );
  const disabledPicking = computed(() => !hasSelected.value);
  const disabledGuiaRemision = computed(() => !hasSelected.value);
  /**
   *   funciones de proceso de actualizacion de picking de transferencias
   */

  const loadingCancelPicking = ref(false);
  async function cancelPicking(row) {
    return run(() => axiosClient.post(apiCancelPicking, { row }), {
      loadingRef: loadingCancelPicking,
      successMessage: "Proceso realizado exitosamente.",
    });
  }

  const loadingPicking = ref(false);

  async function applyPickingSelected(items) {
    return run(() => axiosClient.post(apiUpdatePicking, { items }), {
      loadingRef: loadingPicking,
      successMessage: "Proceso realizado exitosamente.",
    });
  }
  /** funcion para generar el pdf del picking */
  const loadingPdfPicking = ref(false);
  async function printPickingPdf(payload) {
    return await run(async () => {
      const filename = await downloadFileFromApi({
        url: apiPdfPicking,
        method: "POST",
        payload: payload,
        filenameFallback: "picking-reserva.pdf",
      });
      return { data: { success: true, data: filename } };
    }, {
      loadingRef: loadingPdfPicking,
      successMessage: "Documento generado exitosamente.",
      onError: (error) => {
        console.log(error);
      }
    });
  }



  /*** proceso de listado de guias de remision de reserva pendientes*/
  async function fectchListGuideRemisionPending() {
    if (!validatePtoDestination()) return;
    return run(() => axiosClient.post(apiListPendingGuides, payloadHeader), {
      loadingRef: loadingPendingGuides,
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: (list) => {
        dataPendingGuides.value = list; // list ya es response.data.data
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener lista transferencia"
        );
      },
    });
  }


  /***
   *  proceso de generar el pdf de las guias de remisiones pendientes
   */

  const loadingPdfPendingGuides = ref(false);

  async function printGuidePdf(payload) {
    return await run(async () => {
      const filename = await downloadFileFromApi({
        url: apiPdfGuidePending,
        method: "POST",
        payload: payload,
        filenameFallback: "guia-remision-reserva.pdf",
      });
      return { data: { success: true, data: filename } };
    }, {
      loadingRef: loadingPdfPendingGuides,
      successMessage: "Documento generado exitosamente.",
      onError: (error) => {
        console.log(error);
      }
    });
  }

  const loadingDispacthGuide = ref(false);
  async function dispatchGuideReservedPending(id) {
    return run(() => axiosClient.post(apiDispatchPendingGuides, { id }), {
      loadingRef: loadingDispacthGuide,
      // onSuccess: () => refresh(),
      successMessage: "Proceso realizado exitosamente.",
    })
  }

  return {
    //states

    //cabecera
    dataHeaderTransfer,
    loadingHeaderTransfer,
    payloadHeader,
    // detalle
    dataDetailTransfer,
    loadingDetailTransfer,
    payload,
    cols,
    disabledPicking,
    disabledGuiaRemision,
    dataPendingGuides,
    loadingPendingGuides,
    loadingDispacthGuide,
    //functions
    fetchHeaderTransferByWarehouseOriginAndDestination,
    sortBy,
    onSort,
    fetchListTransfersByWarehouseOriginAndDestination,
    refresh,
    seacrchQuotation,
    selectAll,
    applyAlPendingTransfer,
    applyTransfer,
    fectchListGuideRemisionPending,
    printGuidePdf,
    dispatchGuideReservedPending,
    // function picking
    //loading
    loadingCancelPicking,
    loadingPicking,
    // functions
    cancelPicking,
    applyPickingSelected,
    printPickingPdf,

  };
}
