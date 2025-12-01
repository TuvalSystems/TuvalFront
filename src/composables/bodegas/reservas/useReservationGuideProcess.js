import { ref, reactive } from "vue";
import axiosClient from "@/axios";
import { formatJm } from "@/functions";
import { useApiAction } from "@/composables/core/useApiAction";
import {
  swalWarning
} from "@/functions/swal-alert.js";
export const useReservationGuideProcess = () => {
  //instancia general para apis 
  const { run } = useApiAction();
  const loadingProcessGuide = ref(false);
  const apiCreateGuideRemision = `bodegas/reservas/guia-remision/crear-guia-reserva`;
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
  const tipoIdentificacion = [
    { value: "04", label: "Ruc" },
    { value: "05", label: "Cedula" },
    { value: "06", label: "Pasaporte" },
  ];

  function calcularPesoItems(items) {
    const totalKg = Array.isArray(items)
      ? items.reduce(
        (acc, it) =>
          acc +
          (Number(it?.art_peso) || 0) * (Number(it?.seleccionado ?? 0) || 0),
        0
      )
      : 0;
    pesoTotalItems.value = totalKg;
    pesoTotalItemsFmt.value = formatJm(totalKg, 2);
  }

  function assignHeader(h) {
    data.bod_origen = h?.bodOrigin;
    data.pto_origen = h?.ptoOrigin;
    data.origen = h?.origin;
    data.bod_destino = h?.bodDestination;
    data.pto_destino = h?.ptoDestination;
    data.destino = h?.destination;
  }
  function assignDetail(d) {
    data.detalle = d;
  }

  /** limpiar cambio de modos */
  function clearChangeModeLocal() {
    // data.transporte = null;
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

  function isBlank(v) {
    return v == null || (typeof v === "string" && v.trim() === "");
  }
  function validarPlacaEC(placa) {
    // A1: ABC-123 o ABC1234 (simple y suficiente para UI)
    return /^[A-Z]{3}-?\d{4,4}$/.test(String(placa).toUpperCase().trim());
  }
  function toDate(s) {
    return new Date(s);
  }
  function isValidDateStr(s) {
    const d = new Date(s);
    return !isNaN(d.getTime());
  }
  function validationModo() {
    if (modo.value === "local") {
      if (isBlank(data.vehiculo_id) || isBlank(data.transporte_id)) {
        swalWarning("Selecciona el vehículo y el transportista");
        return false;
      }
    } else {
      if (isBlank(data.nombre_transporte)) {
        swalWarning("ngresa el nombre del transportista externo");
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
    if (isBlank(data.ruta)) {
      swalWarning("Ingresa la ruta");
      return false;
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

  async function generarGuiaRemision() {
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
          // transporte: (data.transporte || "").trim(), // empresa/razón social si aplica
          nombre_transporte: (data.nombre_transporte || "").trim(),
          tipo_identificacion: data.tipo_identificacion,
          identificacion: String(data.identificacion || "").trim(),
          placa: String(data.placa || "")
            .toUpperCase()
            .replace(/\s/g, ""),
        }),
    };
    return await run(() => axiosClient.post(apiCreateGuideRemision, payload), {
      loadingRef: loadingProcessGuide,
      onSuccess: () => clearData(),
      successMessage: "Guía de remisión creada.",
    });
  }

  return {
    // state
    data,
    modo,
    tipoIdentificacion,
    pesoTotalItemsFmt,
    loadingProcessGuide,

    //functions
    calcularPesoItems,
    generarGuiaRemision,
    assignHeader,
    assignDetail,
    clearChangeModeLocal,
    clearChangeModeExterno,
    validationModo
  };
};
