import { ref, reactive, computed } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { useStore } from "vuex";

export function useSalesTransfersProcess() {
    const { run } = useApiAction();
    const store = useStore();
    const ptoOrigen = store.state.puntodeventaselect;
    const disabledPicking = ref(true);
    const disabledGuiaRemision = ref(true);
    const payload = reactive({
        origen: ptoOrigen,
        destino: null,
        pedido: "",
    });

    const cols = reactive([
        {
            name: "CTL",
            field: "ART_CODIGO_TRES_LETRAS",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "CÓDIGO",
            field: "ART_CODIGO",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "DESCRIPCION",
            field: "ART_DESCRIPCION",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "COMPART.",
            field: "compartimiento",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "PEDIDO",
            field: "orderNumber",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "FECHA",
            field: "fecha",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "USUARIO",
            field: "usuario",
            thClass: "fs-sm text-start",
            sort: "",
        },
        {
            name: "CANT",
            field: "cantidad",
            thClass: "fs-sm text-end",
            sort: "",
        },
        {
            name: "RES",
            field: "reservado",
            thClass: "fs-sm text-end",
            sort: "",
        },
        {
            name: "TRASL",
            field: "trasladado",
            thClass: "fs-sm text-end",
            sort: "",
        },
        {
            name: "PEND",
            field: "pending_transfer",
            thClass: "fs-sm text-end",
            sort: "",
        },
        {
            name: "PESO",
            field: "ART_PESO",
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


    const dataTransfer = ref(null);
    const loadingTransfer = ref(false);
    const apiListTransferByWarehouse = 'bodegas/transferencia-ventas/dashboard';

    async function fetchListTransfersCount() {
        return run(() => axiosClient.post(apiListTransferByWarehouse, { ptoVtaId: ptoOrigen }), {
            loadingRef: loadingTransfer,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (list) => {
                dataTransfer.value = list;
            },
            onError: (backend, error) => {
                console.log(backend, error);
            },
        });
    }



    const dataTransferHeader = ref(null);
    const loadingTransferHeader = ref(false);
    const apiDataTransferHeader = 'bodegas/transferencia-ventas/cabecera';
    async function fetchDataTransferHeader(id) {
        return await run(() => axiosClient.post(apiDataTransferHeader, payload), {
            loadingRef: loadingTransferHeader,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (data) => {
                dataTransferHeader.value = data;
            },
            onError: (backend, error) => {
                console.error(backend, error);
            },
        });
    }


    const dataListTransfer = ref(null);
    const loadingListTransfer = ref(false);
    const apiListTransfer = 'bodegas/transferencia-ventas/lista';
    async function fetchListTransfer(id) {
        return await run(() => axiosClient.post(apiListTransfer, payload), {
            loadingRef: loadingListTransfer,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (data) => {
                dataListTransfer.value = data;
            },
            onError: (backend, error) => {
                console.error(backend, error);
            },
        });
    }

    async function refresh() {
        await fetchListTransfer();
    }



    //funciones para la seelccion y aplicación de validacion para seleccionados


    async function selectAll(event) {
        const checked = event.target.checked;
        if (!dataListTransfer.value) return;
        dataListTransfer.value.forEach((row) => {
            if (row.pending_transfer > 0) {
                row.seleccionado = checked ? row.pending_transfer : 0;
                row.check_seleccion = checked;
            }
        });
        await checkDisablePickingAndGuide();
    }

    async function applyPendingTransfer(event, row) {
        const checked = event.target.checked;
        row.check_seleccion = checked;
        row.seleccionado = checked ? row.pending_transfer : 0;
        await checkDisablePickingAndGuide();
    }


    async function applyTransfer(row) {

        const reset = (msg) => {
            if (msg) swalWarning(msg);
            row.seleccionado = 0;
            row.check_seleccion = false;
            return false;
        }

        const raw = row?.seleccionado;
        let val = Number(String(raw ?? "").replace(",", ".").trim());
        if (!Number.isFinite(val)) {
            return reset("La cantidad debe ser un número válido");
        }

        if (val < 0) {
            return reset("La cantidad no puede ser negativa");
        }
        if (val === 0) {
            row.check_seleccion = false;
            row.seleccionado = 0;
            return false;
        }

        const decimalsAllowed = Number(row?.ART_CANTIDAD_DECIMAL ?? 0) > 0;
        const maxDecimals = Number(row?.ART_CANTIDAD_DECIMAL ?? 0);

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
        checkDisablePickingAndGuide();
        return true;

    }


    async function checkDisablePickingAndGuide() {
        const hasSelected = (dataListTransfer.value ?? []).some(
            (r) => r.check_seleccion === true && Number(r.seleccionado) > 0
        );
        disabledPicking.value = !hasSelected;
        disabledGuiaRemision.value = !hasSelected;
    }

    // api para cancelar el picking

    const loadingCancelPicking = ref(false);
    const apiCancelPicking = 'bodegas/transferencias/cancelar-picking';
    async function cancelPicking(row) {
        return await run(() => axiosClient.post(apiCancelPicking, { payload: row }), {
            loadingRef: loadingCancelPicking,
            successMessage: "Proceso realizado exitosamente.",
        });
    }
    return {
        loadingTransfer,
        fetchListTransfersCount,
        dataTransfer,

        //cargar cabecera de transferencia
        payload,
        dataTransferHeader,
        loadingTransferHeader,
        fetchDataTransferHeader,

        //tabla 
        cols,
        sortBy,
        onSort,
        //cargar lista de transferencia
        dataListTransfer,
        loadingListTransfer,
        fetchListTransfer,

        //proceso de seleccion 
        selectAll,
        applyPendingTransfer,
        applyTransfer,
        disabledPicking,
        disabledGuiaRemision,

        //refresh
        refresh,

        //cancelar picking
        loadingCancelPicking,
        cancelPicking
    }
}