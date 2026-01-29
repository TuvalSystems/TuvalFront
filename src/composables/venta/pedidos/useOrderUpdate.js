import axiosClient from "@/axios";
import { reactive, ref } from "vue";

import { swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";

export function useOrderUpdate() {
  const { run } = useApiAction();

  const loadingUpdate = ref(false);
  const apiOrderUpdate = "/pedidos/actualizar-datos-pedidos";

  const loadingDateInvoice = ref(false);
  const apiOrderUpdateDateInvoice = "/pedidos/actualizar-fecha-factura-reserva";

  const data = reactive({
    id: null,
    orden_de_compra: null,
    nota_cliente: null,
  });

  function insertData(ord) {
    data.id = ord.id;
    data.orden_de_compra = ord.orden_de_compra;
    data.nota_cliente = ord.nota_cliente;
  }

  async function updateOrder() {
    loadingUpdate.value = true;
    try {
      const payload = {
        id: data.id, // si aplica
        orden_de_compra: data.orden_de_compra ?? null,
        nota_cliente: data.nota_cliente ?? null,
        // agrega otros campos que realmente actualizas...
      };
      const { data: resp } = await axiosClient.post(apiOrderUpdate, payload);
      if (resp?.success) {
        swalSuccess(resp?.message || "Pedido actualizado");
        resetForm?.();
        return true;
      } else {
        swalWarning(resp?.message || "No se pudo actualizar el pedido");
        return false;
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.error ||
        "Error al actualizar el pedido.";

      loadingUpdate.value = false;
      swalError(msg);
      return false;
    } finally {
      loadingUpdate.value = false;
    }
  }

  function resetForm() {
    data.id = null;
    data.orden_de_compra = null;
    data.nota_cliente = null;
  }



  /*** proceso de actualizar fecha de factura */
  const dataUpddateDateInvoice = reactive({
    id: null,
    fe_facturacion_reserva: null,
  });

  function insertDataInvoice(ord) {
    dataUpddateDateInvoice.id = ord.id;
    dataUpddateDateInvoice.fe_facturacion_reserva = ord.fe_facturacion_reserva;
  }

  function resetFormDateInvoice() {
    dataUpddateDateInvoice.id = null;
    dataUpddateDateInvoice.fe_facturacion_reserva = null;
  }

  async function updateDateInvoiceReserved() {
    return  run(() => axiosClient.post(apiOrderUpdateDateInvoice, dataUpddateDateInvoice), {
      loadingRef: loadingDateInvoice,
      onSuccess: () => {
        resetFormDateInvoice();
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.error ||
          "Error al actualizar la fecha de factura.";
        swalError(msg);
      },
    });
  }



  /** funcion para actualizar el estado de pendiente de salida para pedidos de factura demanda - (reserva)  */
  const formUpdateStateEgress = reactive({
    id: null,
    pendiente_salida: null,
  });
  const loadingPending = ref(false);
  const apiUpdatePendingEgress = '/pedidos/bloquear-despacho-pedido';
  async function updateStatePendingEgress() {
    return  run(() => axiosClient.post(apiUpdatePendingEgress, formUpdateStateEgress), {
      loadingRef: loadingPending,
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: () => {
        resetFormPendingEgress();
      }
    });
  }

  function resetFormPendingEgress() {
    formUpdateStateEgress.id = null;
    formUpdateStateEgress.pendiente_salida = null;
  }


  function insertDataPendingEgress(pedido) {
    formUpdateStateEgress.id = pedido.id;
    formUpdateStateEgress.pendiente_salida = pedido.pendiente_salida
  }


  return {
    //state
    data,
    loadingUpdate,
    //functions
    insertData,
    updateOrder,
    resetForm,


    // para actualizar fecha de factura
    dataUpddateDateInvoice,
    loadingDateInvoice,
    updateDateInvoiceReserved,
    insertDataInvoice,
    resetFormDateInvoice,


    //para actualizar pendiente de salida de un pedido
    formUpdateStateEgress,
    loadingPending,
    updateStatePendingEgress,
    resetFormPendingEgress,
    insertDataPendingEgress
  };
}
