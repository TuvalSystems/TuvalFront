import axiosClient from "@/axios";
import Swal from "sweetalert2";
import { watch, reactive, ref } from "vue";
export function useFetchQuotationWitDetail() {
  const data = ref(null);
  const loadingQ = ref(false);
  const loadingQ1 = ref(false);
  const loadingDeny = ref(false);
  const loadingApproval = ref(false);
  /** datos para enviar a aprobar y rechazar */

  const dataSendApproval = reactive({
    id: null,
    fe_autSolResInv: null,
    tx_obsAutSolResInv: null,
  });

  async function fetchQuotationWithDetial(id) {
    loadingQ.value = true;
    try {
      const response = await axiosClient.get(
        `/cotizaciones/reserva/cotizacion-con-detalle/${id}`
      );
      const res = response.data;
      loadingQ.value = false;
      data.value = res.data;
      return data;
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
        `/cotizaciones/reserva/cotizacion-detalle-stock/${id}`
      );
      const res = response.data;
      loadingQ1.value = false;
      data.value = res.data;
      return data;
    } catch (error) {
      console.log("Error al obtener la cotizacion", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingQ1.value = false;
    }
  }

  /** denegar solicitud */
  async function fetchDenyApplicationReservedQuotationById(id) {
    loadingDeny.value = true;
    try {
      const response = await axiosClient.post(
        `/cotizaciones/reserva/rechazar-solicitud-reserva`,{ 
          data : dataSendApproval
        }
      );
      const res = response.data;
      loadingDeny.value = false;
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
  async function fetchApprovalApplicationReservedQuotationById() {
    loadingApproval.value = true;
    try {
      if (!dataSendApproval.fe_autSolResInv) {
        swalError("Debe ingresar una fecha de autorizacion");
        return;
      }
      const response = await axiosClient.post(
        `/cotizaciones/reserva/aprobar-solicitud-reserva`,
        {
          data :dataSendApproval,
        }
      );
      const res = response.data;
      loadingApproval.value = false;
      return res;
    } catch (error) {
      swalError(error.response.data.error);
    }
  }

  return {
    fetchQuotationWithDetial,
    fetchQuotationWithDetialAndStock,
    loadingDeny,
    fetchDenyApplicationReservedQuotationById,
    dataSendApproval,
    loadingApproval,
    fetchApprovalApplicationReservedQuotationById,
  };
}
