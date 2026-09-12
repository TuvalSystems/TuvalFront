import axiosClient from "@/axios";
import { ref, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import {  swalWarning } from "@/functions/swal-alert";

import { downloadFileFromApi } from "@/utils/fileDownload";

export function useProcessDetailDevolution(infoRef) {
    const { run } = useApiAction();
    const apiDetail = "devoluciones/detalle-devolucion-por-recibir";
    const info = ref(null);
    const loadingDetail = ref(false);


    // =========================================
    // 1. OBTENCIÓN DE DETALLE MODAL 
    // ======


    async function fetchDetail(devolutionId) {
        return  run(() => axiosClient.post(apiDetail, { id: devolutionId }), {
            loadingRef: loadingDetail,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (rows) => {
                info.value = rows;
            }
        });
    }


    // =========================================
    // 2. SECCIÓN VISUAL (Badges y Estados) 🎨
    // ======


    /** proceso de visualizacion de modal  */
    const statusClasses = {
        'procesado': 'bg-success-light text-success',
        'aprobado': 'bg-info-light text-info',
        'solicitado': 'bg-secondary bg-opacity-25 text-white',
        'espera': 'bg-warning-light text-warning',
        'rechazado': 'bg-danger-light text-danger',
        'anulada': 'bg-danger-light text-danger',
        'recibido': 'bg-success-light text-info'
    };

    const getStatusClass = (status) => {
        if (!status) return 'bg-light text-secondary';
        return statusClasses[status.toLowerCase()] || 'bg-light text-secondary';
    };

    const orderDispatchBadge = computed(() => {
        let ord = infoRef.value?.devolucion?.orderDespacho;

        return ord ? {
            label: 'Si',
            class: 'bg-success-light text-success',
            icon: 'fa-check-circle'
        } : {
            label: 'No',
            class: 'bg-danger-light text-danger',
            icon: ''
        };

    });

    const dispacthDev = computed(() => {
        let disp = infoRef.value?.devolucion?.despachado;
        return disp ? {
            class: 'bg-info-light text-info',
            icon: 'fa-truck-fast'
        } : {
            class: 'bg-danger-light text-danger',
            icon: 'fa-xmark'
        }
    });


    const reInvoice = computed(() => {

        let reInv = infoRef.value?.devolucion?.volver_a_facturar;
        return reInv ? {
            label: 'Si',
            class: 'bg-success-light text-success',
            icon: 'fa-check-circle'
        } : {
            label: 'No',
            class: 'bg-danger-light text-danger',
            icon: 'fa-xmark'
        };
    });


    // =========================================
    // 3. SECCIÓN DE PROCESO (Inputs y Lógica) ⚙️
    // =========================================
    const selectAllItems = () => {
        const items = infoRef.value?.detalle || [];
        const allSelected = items.every(it => {
            return parseFloat(it.new_devuelto || 0) === parseFloat(it.pending_received_devolution || 0);
        });

        items.forEach(it => {
            if (allSelected) {
                it.new_devuelto = 0;
                it.aplicar_todo = false;
            } else {
                it.new_devuelto = it.pending_received_devolution;
                it.aplicar_todo = true;

            }
        });
    };

    const canReceivedItems = computed(() => {

        const detalles = infoRef.value?.detalle || [];
        if (detalles.length === 0) return false;
        return detalles.some(it => {
            // A. Convertimos a número para asegurar comparación (Input suele devolver String)
            const cantidad = parseFloat(it.new_devuelto || 0);

            // B. Verificamos el compartimiento (que no sea nulo, undefined ni string vacío)
            const tieneBin = it.compartimiento !== null && it.compartimiento !== undefined && it.compartimiento !== '';

            return cantidad > 0 && tieneBin;
        });
    });




    /** proceso de seleccionar toda la cantidad de un articulo */

    function selectAllArticle(art) {
        if (art.aplicar_todo === false) {
            art.new_devuelto = 0;
            return;
        }
        art.new_devuelto = art.pending_received_devolution;
    }

    /** funcion para aplicar devolucion con validacion de cantidad etc */

    function applyDevolution(art) {
        let cantIng = parseFloat(art.new_devuelto || 0);
        const cantDisp = parseFloat(art.pending_received_devolution || 0);
        const useDecimal = art.ART_DECIMAL_CANTIDAD !== 0;
        const compart = art.compartimiento !== null && art.compartimiento !== undefined && art.compartimiento !== '';

        // 1.- validaciones de errores 
        if (isNaN(cantIng)) {
            return resetArticle(art, 'Ingresar un número válido');
        }

        //2.- validar si se requiere enteros
        if (!useDecimal && !Number.isInteger(cantIng)) {
            return resetArticle(art, 'Ingresar un número entero');
        }

        //3.- Validar Negativos
        if (cantIng < 0) {
            return resetArticle(art, 'La cantidad no puede ser negativa');
        }

        //4.- Validar Cantidad a devolver
        if (cantIng > cantDisp) {
            return resetArticle(art, 'La cantidad a devolver no puede ser mayor a la cantidad disponible');
        }

        if (!compart) {
            return resetArticle(art, 'Debe seleccionar un compartimiento');
        }

        art.new_devuelto = cantIng;
        art.aplicar_todo = (cantIng > 0);
    }

    function resetArticle(art, msg) {
        swalWarning(msg);
        art.new_devuelto = 0;
        art.aplicar_todo = false;
        return false;
    }

    function filterDetails() {
        const allDetails = infoRef.value?.detalle || [];
        return allDetails.filter(it => {
            const cantidad = parseFloat(it.new_devuelto || 0);
            return cantidad > 0;
        });
    }

    // =========================================
    // 4. SECCIÓN DE impresion de pdf de orden de almacenamiento 
    // =========================================

    const loadingPdfOrden = ref(false);
    const apiPdfOrdenStorage = 'devoluciones/orden-almacenamiento';
    async function printPdfOrdenStorage() {
        const detallesFiltrados = filterDetails();
        if (detallesFiltrados.length === 0) {
            return { ok: false, message: 'No hay detalles para imprimir' };
        }
        let payloadPdf = {
            header: infoRef.value?.devolucion || {},
            details: detallesFiltrados,
        }

        return await run(async () => {
            const filename = await downloadFileFromApi({
                url: apiPdfOrdenStorage,
                method: "POST",
                payload: payloadPdf,
                filenameFallback: "orden-almacenamiento.pdf",
            });
            return { data: { success: true, data: filename } };
        }, {
            loadingRef: loadingPdfOrden,
            successMessage: "Documento generado exitosamente.",
            onError: (error) => {
                console.log(error);
            }
        });
    }



    // =========================================
    // 4. SECCIÓN DE PROCESAR DETALLE DE DEVOLUCIONES 
    // =========================================
    const loadingProcess = ref(false);
    const apiProcessDetail = 'devoluciones/recibir-devolucion';
    async function processDevolutionsDetails() {
        const detallesFiltrados = filterDetails();
        let payloadProcess = {
            header: infoRef.value?.devolucion || {},
            details: detallesFiltrados,
        }
        return  run(() => axiosClient.post(apiProcessDetail, payloadProcess), {
            loadingRef: loadingProcess,
            successMessage: "Proceso realizado exitosamente.",
        });
    }


    // =========================================
    // 5. SECCIÓN DE PROCESAR DETALLE DE DEVOLUCIONES 
    // =========================================

    const loadingDenny = ref(false);
    const apiDenny = 'devoluciones/rechazar-devolucion';
    async function dennyDevolution(id) {
        return  run(() => axiosClient.post(apiDenny, { id }), {
            loadingRef: loadingDenny,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        info,
        loadingDetail,
        fetchDetail,
        getStatusClass,
        orderDispatchBadge,
        dispacthDev,
        reInvoice,
        selectAllItems,
        canReceivedItems,
        selectAllArticle,
        applyDevolution,

        //pdf
        loadingPdfOrden,
        printPdfOrdenStorage,

        //recibir devoluciones
        loadingProcess,
        processDevolutionsDetails,

        //denny
        loadingDenny,
        dennyDevolution
    }
}