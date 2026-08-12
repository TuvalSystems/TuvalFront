import { ref, reactive, computed } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { swalWarning } from "@/functions/swal-alert.js";
import { downloadFileFromApi } from "@/utils/fileDownload";


import { useStore } from "vuex";

export function useSalesTransfersProcess() {
    const { run } = useApiAction();
    const store = useStore();
    const ptoOrigen = computed(() => store.state.puntodeventaselect);
    const payload = reactive({
        origen: ptoOrigen.value,
        destino: null,
        pedido: "",
        compartimiento: "",
    });

    const cols = reactive([
        {
            name: "CTL",
            field: "ART_CODIGO_TRES_LETRAS",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "CÓDIGO",
            field: "ART_CODIGO",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "DESCRIPCION",
            field: "ART_DESCRIPCION",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "COMPART.",
            field: "compartimiento",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "PEDIDO",
            field: "orderNumber",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "FECHA",
            field: "fecha",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "USUARIO",
            field: "usuario",
            thClass: "fs-sm text-start text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "CANT",
            field: "cantidad",
            thClass: "fs-sm text-end text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "RES",
            field: "reservado",
            thClass: "fs-sm text-end text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "TRASL",
            field: "trasladado",
            thClass: "fs-sm text-end text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "PEND",
            field: "pending_transfer",
            thClass: "fs-sm text-end text-muted  text-uppercase fw-bold",
            sort: "",
        },
        {
            name: "PESO",
            field: "ART_PESO",
            thClass: "fs-sm text-end text-muted  text-uppercase fw-bold",
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
    const apiListTransferByWarehouse = 'bodegas/transferencia-venta/dashboard';

    async function fetchListTransfersCount() {
        return run(() => axiosClient.post(apiListTransferByWarehouse, { ptoVtaId: ptoOrigen.value }), {
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
    const apiDataTransferHeader = 'bodegas/transferencia-venta/cabecera';
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


    const dataListTransfer = ref([]);
    const loadingListTransfer = ref(false);
    const apiListTransfer = 'bodegas/transferencia-venta/lista';
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
        payload.compartimiento = "";
        payload.pedido = "";
        await fetchListTransfer();
    }


    const loadingPendingGuides = ref(false);
    const apiListGuidePendings = 'bodegas/transferencia-venta/lista-guias-pendientes';
    const dataPendingGuides = ref([]);
    async function fectchListGuideRemisionPending() {
        return run(() => axiosClient.post(apiListGuidePendings, payload), {
            loadingRef: loadingPendingGuides,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (list) => {
                dataPendingGuides.value = list;
            }
        })
    }



    //funciones para la seelccion y aplicación de validacion para seleccionados


    async function selectAll(event) {
        const checked = event.target.checked;
        if (dataListTransfer.value.length === 0) return;
        dataListTransfer.value.forEach((row) => {
            if (row.pending_transfer > 0) {
                row.seleccionado = checked ? row.pending_transfer : 0;
                row.check_seleccion = checked;
            }
        });
    }

    async function applyPendingTransfer(event, row) {
        const checked = event.target.checked;
        row.check_seleccion = checked;
        row.seleccionado = checked ? row.pending_transfer : 0;
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
            if (!Number.isInteger(val)) {
                val = Math.trunc(val);
                if (val === 0) return reset("La cantidad debe ser un número entero");
            }
        } else if (maxDecimals >= 0) {
            val = Number(val.toFixed(maxDecimals));
        }
        const pending = Number(row?.pending_transfer ?? 0);
        if (val > pending) {
            return reset("La cantidad no puede ser mayor a la pendiente por transferir"); // si prefieres bloquear, deja este reset
        }
        row.seleccionado = val;
        row.check_seleccion = val > 0;
        return true;

    }


    //funcion para colorear el row de la tabla basado en las condiciones de la transferencia
    const getRowClass = (row) => {
        if (row.has_guide_active && row.pending_transfer > 0) {
            return 'table-warning';
        }
        if (row.picking) {
            return 'table-info';
        }
        return '';
    }


    const hasSelected = computed(() =>
        dataListTransfer.value.some(
            (r) => r.check_seleccion === true && Number(r.seleccionado) > 0
        )
    );

    const disabledPicking = computed(() => !hasSelected.value);
    const disabledGuiaRemision = computed(() => !hasSelected.value);



    //api para actualizar el picking
    const loadingUpdatePicking = ref(false);
    const apiUpdatePicking = 'bodegas/transferencia-venta/actualizar-picking';

    async function applyPickingSelected(items) {
        return await run(() => axiosClient.post(apiUpdatePicking, { items }), {
            loadingRef: loadingUpdatePicking,
            successMessage: "Proceso realizado exitosamente.",
        });
    }


    //funcion para imprimir el picking de la transferencia
    const loadingPrintPicking = ref(false);
    const apiPrintPicking = 'bodegas/transferencia-venta/imprimir-picking';
    async function printPicking(payload) {
        return await run(async () => {
            const filename = await downloadFileFromApi({
                url: apiPrintPicking,
                method: "POST",
                payload: payload,
                filenameFallback: "picking-transferencia-venta.pdf",
            });
            return { data: { success: true, data: filename } };
        }, {
            loadingRef: loadingPrintPicking,
            successMessage: "Documento generado exitosamente.",
            onError: (error) => {
                console.log(error);
            }
        });
    }

    // api para cancelar el picking

    const loadingCancelPicking = ref(false);
    const apiCancelPicking = 'bodegas/transferencia-venta/cancelar-picking';
    async function cancelPicking(row) {
        return await run(() => axiosClient.post(apiCancelPicking, { payload: row }), {
            loadingRef: loadingCancelPicking,
            successMessage: "Proceso realizado exitosamente.",
        });
    }




    /***
   *  proceso de generar el pdf de las guias de remisiones pendientes
   */

    const loadingPrintGuideRemision = ref(false);
    const apiPdfGuidePending = 'bodegas/transferencia-venta/guia-remision/generar/pdf';
    async function printGuidePdf(payload) {
        return await run(async () => {
            const filename = await downloadFileFromApi({
                url: apiPdfGuidePending,
                method: "POST",
                payload: payload,
                filenameFallback: "guia-remision-transferencia-venta.pdf",
            });
            return { data: { success: true, data: filename } };
        }, {
            loadingRef: loadingPrintGuideRemision,
            successMessage: "Documento generado exitosamente.",
            onError: (error) => {
                console.log(error);
            }
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

        //carga de lista de guias pendientes 
        dataPendingGuides,
        loadingPendingGuides,
        fectchListGuideRemisionPending,
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
        //pintar tabla
        getRowClass,
        //refresh
        refresh,

        //actualizar picking
        loadingUpdatePicking,
        applyPickingSelected,
        // imprimir picking
        loadingPrintPicking,
        printPicking,

        //cancelar picking
        loadingCancelPicking,
        cancelPicking,

        //imprimir guias pendientes
        loadingPrintGuideRemision,
        printGuidePdf
    }
}