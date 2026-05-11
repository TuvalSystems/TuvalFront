import { ref, reactive } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { isBlank, validarPlacaEC, toDate, isValidDateStr } from "@/utils/guia-remision/validators";
import { swalWarning } from "@/functions/swal-alert.js";
import { formatJm } from "@/functions";

export function useSalesTransfersGuideProcess() {
    const { run } = useApiAction();

    const pesoTotalItems = ref(0);
    const pesoTotalItemsFmt = ref("0.00");
    const initialState = {
        // header
        bod_origen: null,
        pto_origen: null,
        origen: null,
        bod_destino: null,
        pto_destino: null,
        destino: null,
        // detalle
        detalle: [],
        // local
        vehiculo_id: null,
        transporte_id: null,

        // externo
        // transporte: null,
        nombre_transporte: null,
        tipo_identificacion: null,
        identificacion: null,
        placa: null,

        fecha_salida: null,
        fecha_llegada: null,
        observacion: null,
        ruta: null,
    };
    const data = reactive(structuredClone(initialState));
    let modo = ref("local");


    async function calcularPesoItems(items) {
        const totalKg = Array.isArray(items)
            ? items.reduce(
                (acc, it) =>
                    acc +
                    (Number(it?.ART_PESO) || 0) * (Number(it?.seleccionado ?? 0) || 0),
                0
            )
            : 0;
        pesoTotalItems.value = totalKg;
        pesoTotalItemsFmt.value = formatJm(totalKg, 2);
    }

    async function assignHeader(h) {
        data.bod_origen = h?.origen;
        data.pto_origen = h?.ptoOrigin;
        data.origen = h?.origen;
        data.bod_destino = h?.bodDestination;
        data.pto_destino = h?.ptoDestination;
        data.destino = h?.destination;
    }

    function assignDetail(d) {
        data.detalle = d;
    }

    /** limpiar cambio de modos */
    function clearChangeModeLocal() {
        data.nombre_transporte = null;
        data.tipo_identificacion = null;
        data.identificacion = null;
        data.placa = null;
    }
    function clearChangeModeExterno() {
        data.vehiculo_id = null;
        data.transporte_id = null;
    }
    function clearData() {
        Object.keys(initialState).forEach((key) => {
            if (Array.isArray(initialState[key])) {
                data[key] = [];
            } else {
                data[key] = initialState[key];
            }
        });
    }


    function validationModo() {
        if (modo.value === "local") {
            if (isBlank(data.vehiculo_id) || isBlank(data.transporte_id)) {
                swalWarning("Selecciona el vehículo y el transportista");
                return false;
            }
        } else {
            if (isBlank(data.nombre_transporte)) {
                swalWarning("Ingresa el nombre del transportista externo");
                return false;
            }
            if (isBlank(data.identificacion)) {
                swalWarning("Ingresa la identificación del transportista externo");
                return false;
            }
            if (isBlank(data.tipo_identificacion)) {
                swalWarning("Selecciona el tipo de identificación");
                return false;
            }
            if (!validarPlacaEC(data.placa)) {
                swalWarning("Placa inválida");
                return false;
            }
        }
        if (isBlank(data.fecha_llegada) || !isValidDateStr(data.fecha_llegada)) {
            swalWarning("Fecha/Hora de llegada inválida");
            return false;

        }
        if (toDate(data.fecha_salida) > toDate(data.fecha_llegada)) {
            swalWarning("La salida no puede ser posterior a la llegada");
            return false;
        }
        return true;
    }


 
    const loading = ref(false);
    const apiCreateGuide = `bodegas/transferencia-venta/guia-remision/crear-guia-transferencia-venta`;
    async function createGuideTransfer(data) {

        const observacion = (data.observacion || "").trim().slice(0, 350);
        const ruta = (data.ruta || "").trim();

        // payload condicionado por modo
        const payload = {
            //header
            bod_origen: data.bod_origen,
            pto_origen: data.pto_origen,
            origen: data.origen,
            bod_destino: data.bod_destino,
            pto_destino: data.pto_destino,
            destino: data.destino,

            //   detalle
            detalle: data.detalle,
            modo: modo.value,
            fecha_salida: data.fecha_salida,
            fecha_llegada: data.fecha_llegada,
            observacion,
            ruta,
            ...(modo.value === "local"
                ? {
                    vehiculo_id: data.vehiculo_id,
                    transporte_id: data.transporte_id,
                }
                : {
                    nombre_transporte: (data.nombre_transporte || "").trim(),
                    tipo_identificacion: data.tipo_identificacion,
                    identificacion: String(data.identificacion || "").trim(),
                    placa: String(data.placa || "")
                        .toUpperCase()
                        .replaceAll(" ", ""),
                }),
        };

        return await run(() => axiosClient.post(apiCreateGuide, payload), {
            loadingRef: loading,
            onSuccess: () => clearData(),
            successMessage: "Proceso realizado exitosamente.",
        });
    }


    const apiVerifyGuide = 'bodegas/transferencia-venta/guia-remision/verificar-guia-transferencia-venta-v1';
    const loadingVerifyGuide = ref(false);
    async function verifyGuideTransfer(data) {
        return await run(() => axiosClient.post(apiVerifyGuide, data), {
            loadingRef: loadingVerifyGuide,
        });
    }


    const apiSendSalesTransfer = 'bodegas/transferencia-venta/guia-remision/despachar-guia-transferencia-venta';
    const loadingSendGuide = ref(false);
    async function sendGuideSalesTransfer(id) {
        return await run(() => axiosClient.post(apiSendSalesTransfer, { id: id }), {
            loadingRef: loadingSendGuide,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    /** recibir guia de transferencia de venta */

    const apiRecived = 'bodegas/transferencia-venta/guia-remision/recibir-guia-transferencia-venta';
    const loadingRecivedGuide = ref(false);
    async function receivedGuideSalesTransfer(data) {
        return await run(() => axiosClient.post(apiRecived, data), {
            loadingRef: loadingRecivedGuide,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        // state
        data,
        modo,
        pesoTotalItemsFmt,
        loading,
        createGuideTransfer,
        loadingVerifyGuide,
        verifyGuideTransfer,


        // funciones de valiaciones y generacion de guia 
        calcularPesoItems,
        assignHeader,
        assignDetail,
        clearChangeModeLocal,
        clearChangeModeExterno,
        validationModo,
        // despachar guia de transferencia de venta
        loadingSendGuide,
        sendGuideSalesTransfer,

        // Recibir guia de transferencia de venta
        loadingRecivedGuide,
        receivedGuideSalesTransfer,

    }
}