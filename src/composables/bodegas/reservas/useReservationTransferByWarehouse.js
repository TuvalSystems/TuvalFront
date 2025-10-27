import { ref, reactive, nextTick, watch, computed } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

export function useReservationTransferByWarehouse() {
  /** maneja el detalle de mis transferencias de reserva por bodega */
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
  const dataDetailTransfer = ref(null);
  const loadingDetailTransfer = ref(false);
  const apiListTransferByWarehouse = `reservas/transferencias/lista-traslados-por-reserva-bodega`;

  const payload = reactive({
    origen: ptoOrigen,
    destino: null,
    cotizacion: "",
  });

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
      field: "",
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

  const sortBy = computed(() => {
    return cols.reduce((acc, o) => {
      if (o.sort) {
        o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
      }
      return acc;
    }, []);
  });

  // On sort th click
  function onSort(event, i) {
    let toset;
    const sortEl = cols[i];

    if (!event.shiftKey) {
      cols.forEach((o) => {
        if (o.field !== sortEl.field) {
          o.sort = "";
        }
      });
    }

    if (!sortEl.sort) {
      toset = "asc";
    }

    if (sortEl.sort === "desc") {
      toset = event.shiftKey ? "" : "asc";
    }

    if (sortEl.sort === "asc") {
      toset = "desc";
    }

    sortEl.sort = toset;
  }

  async function fetchHeaderTransferByWarehouseOriginAndDestination() {
    loadingHeaderTransfer.value = true;
    try {
      validatePtoDestination();
      const response = await axiosClient.post(
        apiHeaderTransferByWarehouseOriginAndDestination,
        payloadHeader
      );
      const res = response.data;
      loadingHeaderTransfer.value = false;
      dataHeaderTransfer.value = res.data;
      return dataHeaderTransfer.value;
    } catch (error) {
      console.log("Error al obtener cabecera transferencia", error);
      swalError(error?.response?.data?.error || error?.message || "Error");
      return;
    } finally {
      loadingHeaderTransfer.value = false;
    }
  }

  async function fetchListTransfersByWarehouseOriginAndDestination() {
    loadingDetailTransfer.value = true;
    try {
      validatePtoDestination();
      const response = await axiosClient.post(
        apiListTransferByWarehouse,
        payload
      );
      const res = response.data;
      loadingDetailTransfer.value = false;
      dataDetailTransfer.value = res.data;
      return dataDetailTransfer.value;
    } catch (error) {
      console.log("Error al obtener lista transferencia", error);
      swalError(error?.response?.data?.error || error?.message || "Error");
      return;
    } finally {
      loadingDetailTransfer.value = false;
    }
  }

  function refresh() {
    fetchListTransfersByWarehouseOriginAndDestination();
  }

  function seacrchQuotation() {
    fetchListTransfersByWarehouseOriginAndDestination();
  }

  async function validatePtoDestination() {
    if (payload.destino === null) {
      return;
    }
  }

  /** funciones para limpiar estilos del dataSet */
  const datasetLengthRef = ref(null);
  let mo; // MutationObserver
  function styleDatasetLength(root) {
    if (!root) return;

    const labelWithSelect = root.querySelector("label")?.querySelector("select")
      ? root.querySelector("label")
      : null;
    if (labelWithSelect) {
      const select = labelWithSelect.querySelector("select");
      if (select) labelWithSelect.replaceWith(select);
    }

    //eliminar lables sobrantes
    root.querySelectorAll("label").forEach((l) => l.remove());
    //estilizar el select
    const select = root.querySelector("select");
    if (!select) return false;
    select.className = "form-select";
    select.style.width = "80px";
    return true;
  }

  function clearStyleDatatable() {
    //esperar a que pinte el DOM
    const root = datasetLengthRef.value;
    if (!root) return;
    // Intenta estilizar ahora
    const ok = styleDatasetLength(root);
    if (ok) return; //si ya se estilizó, salir

    mo?.disconnect(); //desconectar si ya existe
    mo = new MutationObserver(() => {
      if (styleDatasetLength(root)) {
        mo.disconnect();
        mo = null;
      }
    });
    mo.observe(root, { childList: true, subtree: true });
  }

  const showDataset = computed(
    () =>
      !loadingDetailTransfer.value &&
      dataDetailTransfer.value &&
      dataDetailTransfer.value.length > 0
  );
  watch(
    showDataset,
    async (visible) => {
      if (visible) {
        await nextTick();
        clearStyleDatatable();
      }
    },
    { immediate: true }
  );

  /**
   *
   * funciones para seleccion y aplicacion de validacion para seleccionados
   *
   *
   * */

  function selectAll(event) {
    const checked = event.target.checked;
    if (!dataDetailTransfer.value) return;
    dataDetailTransfer.value.forEach((row) => {
      if (row.pending_transfer > 0) {
        row.seleccionado = checked ? row.pending_transfer : 0;
        row.check_seleccion = checked;
      }
    });
    checkDisablePickingAndGuide();
  }

  function applyAlPendingTransfer(event, row) {
    const checked = event.target.checked;
    row.check_seleccion = checked;
    row.seleccionado = checked ? row.pending_transfer : 0;
    checkDisablePickingAndGuide();
  }
  function applyTransfer(row) {
    const reset = (msg) => {
      if (msg) swalError(msg);
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
      // puedes elegir: clamp + aviso, o reset
      swalError("La cantidad no puede ser mayor a la pendiente por transferir");
      // Opción clamp:
      // val = pending;
      return reset(); // si prefieres bloquear, deja este reset
    }

    // 5) Asignar y marcar
    row.seleccionado = val;
    row.check_seleccion = val > 0;
    checkDisablePickingAndGuide();  
    return true;
  }

  /***
   *  disbaled de picking y modal de guia de remision
   *
   */

  const disabledPicking = ref(true);
  const disabledGuiaRemision = ref(true);

  function checkDisablePickingAndGuide() {
    const hasSelected = (dataDetailTransfer.value ?? []).some(
      (r) => r.check_seleccion === true && Number(r.seleccionado) > 0
    );
    disabledPicking.value = !hasSelected;
    disabledGuiaRemision.value = !hasSelected;
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
    payloadHeader,
    payload,
    cols,
    datasetLengthRef,
    disabledPicking,
    disabledGuiaRemision,

    //functions
    fetchHeaderTransferByWarehouseOriginAndDestination,
    sortBy,
    onSort,
    fetchListTransfersByWarehouseOriginAndDestination,
    refresh,
    seacrchQuotation,
    selectAll,
    applyAlPendingTransfer,
    applyTransfer
    
  };
}
