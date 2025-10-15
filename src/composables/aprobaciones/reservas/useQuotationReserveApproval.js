import axiosClient from "@/axios";
import { swalError } from "@/functions/swal-alert.js";
import { watch, reactive, ref } from "vue";
export function useQuotationReserveApproval() {
  const data = ref(null);
  const dataQutationDetailStock = ref(null);
  const loadingQ = ref(false);
  const loadingQ1 = ref(false);
  const loadingDeny = ref(false);
  const loadingApproval = ref(false);

  /** para listar los detalles de la cotizacion y el stock activo */
  const dataQuotationDetailAndStockActive = ref(null);
  const loadingQ2 = ref(false);

  /** datos para enviar a aprobar y rechazar */
  const dataSendApproval = reactive({
    id: null,
    fe_autorizacion_reserva: null,
    obs_autorizacion_reserva: null,
  });

  const resetForm = () => {
    dataSendApproval.id = null;
    dataSendApproval.fe_autorizacion_reserva = null;
    dataSendApproval.obs_autorizacion_reserva = null;
  };

  async function fetchQuotationWithDetial(id) {
    loadingQ.value = true;
    try {
      const response = await axiosClient.get(
        `/reservas/cotizacion-con-detalle/${id}`
      );
      const res = response.data;
      loadingQ.value = false;
      data.value = res.data;
      return data.value;
    } catch (error) {
      console.log("Error al obtener la cotizacion", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingQ.value = false;
    }
  }

  async function fetchQuotationWithDetialAndStock(id) {
    loadingQ1.value = true;
    try {
      const response = await axiosClient.get(
        `/reservas/cotizacion-detalle-stock/${id}`
      );
      const res = response.data;
      loadingQ1.value = false;
      dataQutationDetailStock.value = res.data;
      return dataQutationDetailStock.value;
    } catch (error) {
      console.log("Error al obtener la cotizacion", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingQ1.value = false;
    }
  }

  async function fetchQuotationWithDetialAndStockActive(id) {
    loadingQ2.value = true;
    try {
      const response = await axiosClient.get(
        `/reservas/cotizacion-detalle-stock-activo/${id}`
      );
      const res = response.data;
      loadingQ2.value = false;
      dataQuotationDetailAndStockActive.value = res.data;
      return dataQuotationDetailAndStockActive.value;
    } catch (error) {
      console.log("Error al obtener la reserva", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingQ2.value = false;
    }
  }

  /** denegar solicitud */
  async function denyReservation() {
    loadingDeny.value = true;
    try {
      const response = await axiosClient.post(
        `/reservas/rechazar-solicitud-reserva`,
        {
          data: dataSendApproval,
        }
      );
      const res = response.data;
      loadingDeny.value = false;
      resetForm();
      return res;
    } catch (error) {
      console.log("Error al obtener la cotizacion", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingDeny.value = false;
    }
  }

  /** aprobar solicitud */
  async function approveReservation() {
    loadingApproval.value = true;
    try {
      if (!dataSendApproval.fe_autorizacion_reserva) {
        swalError("Debe ingresar una fecha de autorizacion");
        return;
      }
      const response = await axiosClient.post(
        `/reservas/aprobar-solicitud-reserva`,
        {
          data: dataSendApproval,
        }
      );
      const res = response.data;
      loadingApproval.value = false;
      resetForm();
      return res;
    } catch (error) {
      swalError(error.response.data.error);
    }
  }

  return {
    fetchQuotationWithDetial,
    dataQutationDetailStock,
    fetchQuotationWithDetialAndStock,
    loadingDeny,
    denyReservation,
    dataSendApproval,
    loadingApproval,
    approveReservation,
    fetchQuotationWithDetialAndStockActive,
    resetForm
  };
}
