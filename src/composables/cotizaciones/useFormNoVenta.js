import axiosClient from "../../axios";
import { useStore } from "vuex";
import { ref, reactive, computed, watch } from "vue";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

export function useFormNoVenta(vercotizacion, motivos = []) {
  const formData = reactive({
    motivo_id: null,
    recordar: 0,
    observacion: "",
    fecha_recordatorio: "",
    cotizacion_id: vercotizacion.id ?? null,
  });

  const errors = reactive({
    motivo_id: false,
    recordar: false,
    fecha_recordatorio: false,
  });

  // Asignar datos si ya vienen
  watch(
    () => vercotizacion?.id,
    (id) => {
      if (id) {
        // resetForm();
        const cotizacion = vercotizacion;
        formData.motivo_id = cotizacion.motivo_id ?? "";
        formData.recordar = cotizacion.recordar ?? 0;
        formData.observacion = cotizacion.observacion ?? "";
        formData.fecha_recordatorio = cotizacion.fecha_recordatorio ?? "";
        formData.cotizacion_id = cotizacion.id ?? null;
        // console.log("✅ Cotización lista en el modal:", cotizacion);
      }
    },
    { immediate: true }
  );

  const motivoSeleccionado = computed(() =>
    motivos.find((m) => m.id == formData.motivo_id)
  );

  const esProyecto = computed(() =>
    motivoSeleccionado.value?.descripcion?.toLowerCase().includes("proyecto")
  );

  const isValid = computed(() => {
    errors.motivo_id = !formData.motivo_id;
    errors.recordar = esProyecto.value && formData.recordar !== 1;
    errors.fecha_recordatorio =
      esProyecto.value && !formData.fecha_recordatorio;
    return !errors.motivo_id && !errors.recordar && !errors.fecha_recordatorio;
  });

  const guardar = async () => {
    if (!isValid.value) {
      swalWarning(
        "Al seleccionar Proyecto debe seleccionar recordar e ingresar la fecha del recordatorio"
      );
      return;
    }

    try {
      await axiosClient.put(
        "/cotizaciones/guardar-registro-no-venta",
        formData
      );
      swalSuccess("Registro Guardado Exitosamente");
      resetForm();
    } catch (error) {
      swalError("Error al guardar el registro");
    }
  };

  const resetForm = () => {
    formData.motivo_id = "";
    formData.recordar = 0;
    formData.observacion = "";
    formData.fecha_recordatorio = "";
    formData.cotizacion_id = null;

    Object.keys(errors).forEach((key) => (errors[key] = false));
  };

  return {
    formData,
    motivoSeleccionado,
    esProyecto,
    isValid,
    errors,
    guardar,
    resetForm,
  };
}
