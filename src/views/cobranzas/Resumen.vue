<script setup>
import { ref, reactive, computed } from "vue";
import { useStore } from 'vuex'
import { swalError, swalWarning, toast } from "@/functions/swal-alert.js";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import { formatPrice } from "@/functions";
//import de composables 
import verModalValidacionAplicacionPagos from '@/views/cobranzas/modals/verModalValidacionAplicacionPagos.vue';
import { useCustomerPaymentApply } from "@/composables/cobranzas/cobros/useCustomerPaymentApply";

//import modales
const store = useStore();
const cobranza = computed(() => store.state.cobranza);
const currentClienteCobro = computed(() => store.state.currentClienteCobro);
const cobros_registrados = computed(() => store.state.cobros_registrados);
const pedidos_por_cobrar = computed(() => store.state.pedidos_por_cobrar);
const bancos_tarjetas = computed(() => store.state.bancos_tarjetas);
const facturas = computed(() => store.state.facturas);
const cobros_sin_aplicar = computed(() => store.state.cobros_sin_aplicar);
const today = new Date();
const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
const permite_pedido = computed(() => store.state.permite_pedido);
const pago_a_padido = ref(store.state.pago_a_padido);
const botonRegistrarCobro = ref(null);

const {
  loadingPayment,
  fecthDataValidate
} = useCustomerPaymentApply();
function confirmeliminarretencion(index, retencion) {
  toast.fire({
    title: "Estás seguro?",
    text: "De eliminar la retención " + retencion.ret_comprobante + "",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  })
    .then((result) => {
      if (result.value) {
        eliminarRetencion(retencion, index)
      }
    });
}

function eliminarRetencion(retencion, index) {
  cobranza.value.retenciones.splice(index, 1);
  store.commit('calculaSaldoFacturas');
  store.commit('checkPermitePedido');
}

function confirmeliminarefectivo() {
  toast.fire({
    title: "Estás seguro?",
    text: "De eliminar el cobro en efectivo",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  })
    .then((result) => {
      if (result.value) {
        eliminarEfectivo()
      }
    });
}

function eliminarEfectivo() {
  store.commit("enceraEfectivo");
  store.commit('checkPermitePedido');
}


function confirmeliminartarjeta() {
  toast.fire({
    title: "Estás seguro?",
    text: "De eliminar el cobro de tarjeta de crédito",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  })
    .then((result) => {
      if (result.value) {
        eliminarTarjeta()
      }
    });
}

function eliminarTarjeta() {
  store.commit("enceraTarjeta");
  store.commit('checkPermitePedido');
}

function confirmeliminardeposito(index) {
  toast.fire({
    title: "Estás seguro?",
    text: "De eliminar el depósito",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  })
    .then((result) => {
      if (result.value) {
        eliminardeposito(index)
      }
    });
}

function eliminardeposito(index) {
  store.commit("eliminarDeposito", index);
  store.commit('checkPermitePedido');
}


function confirmeliminaraplicacion(index) {
  toast.fire({
    title: "Estás seguro?",
    text: "De eliminar la aplicación",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  })
    .then((result) => {
      if (result.value) {
        eliminaraplicacion(index)
      }
    });
}

function eliminaraplicacion(index) {
  store.commit("eliminarAplicacion", index);
  store.commit('checkPermitePedido');
}
function confirmeliminarcheques() {

  toast.fire({
    title: "Estás seguro?",
    text: "De eliminar los cheques?",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  })
    .then((result) => {
      if (result.value) {
        eliminarcheques()
      }
    });
}

function eliminarcheques() {
  store.commit("eliminarcobroCheques");
  store.commit('checkPermitePedido');
}

const modalValidacionPagoRef = ref(null);
const modalValidacionPagoObj = useBootstrapModal(modalValidacionPagoRef);

const disabledPayment = ref(false);
async function validarAplicacioneFactura() {
  if (disabledPayment.value) {
    return;
  }

  if (!hasCollectionPaymentRecords(cobranza.value)) {
    showEmptyCollectionWarning();
    return;
  }

  disabledPayment.value = true;
  try {
    const resp = await fecthDataValidate(cobranza.value);
    if (!resp?.ok) {
      const msg = resp?.message || "Opps! Ocurrio un Error inesperado";
      (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
      return;
    }

    Object.assign(cobranza.value, resp.data);

    if (cobranza.value.hasGlobalExcess) {
      modalValidacionPagoObj.show();
      return;
    }
    await registrarcobro();
  } finally {
    disabledPayment.value = false;
  }
}


const excessItems = computed(() => {
  return collectValidationItems(cobranza.value);
});

function collectValidationItems(data) {
  const items = [];

  const addItem = ({ source, label, row, field, parent = null }) => {
    const hasExcess = Boolean(row?.hasExcess);
    const hasDoubleApply = Boolean(row?.hasDoubleApply);

    if (!hasExcess && !hasDoubleApply) {
      return;
    }

    const validationType = resolveValidationType(row);

    items.push({
      source,
      label,
      row,
      parent,
      field,
      invoice: row.ret_factura ?? row.ECD_DET_NUM_DOC,
      enteredAmount: toNumber(row[field]),
      saldoFactura: toNumber(row.saldoFactura),
      saldoBase: toNumber(row.saldoBase),
      saldoDisponible: toNumber(row.saldoDisponible),
      totalApply: toNumber(row.totalApply),
      excessValue: toNumber(row.excessValue),
      priceRecommend: toNumber(row.priceRecommend),
      hasExcess,
      hasDoubleApply,
      validationType,
      validationLabel: resolveValidationLabel(row),
      validationMessage: row.validationMessage ?? null,
      doubleApplyDoc: row.doubleApplyDoc ?? null,
    });
  };

  data.retenciones?.forEach((row) => {
    addItem({
      source: 'retenciones',
      label: 'Retención',
      row,
      field: 'total',
    });
  });

  data.ingreso_efectivo?.facturas?.forEach((row) => {
    addItem({
      source: 'ingreso_efectivo',
      label: 'Efectivo',
      row,
      field: 'aplicar_monto_efectivo',
    });
  });

  data.ingreso_tarjeta?.facturas?.forEach((row) => {
    addItem({
      source: 'ingreso_tarjeta',
      label: 'Tarjeta',
      row,
      field: 'aplicar_monto_tarjeta',
    });
  });

  data.ingreso_cheques?.facturas?.forEach((row) => {
    addItem({
      source: 'ingreso_cheques',
      label: 'Cheque',
      row,
      field: 'aplicar_monto_cheque',
    });
  });

  data.ingreso_depositos?.forEach((deposito) => {
    deposito.facturas?.forEach((row) => {
      addItem({
        source: 'ingreso_depositos',
        label: `${deposito.tipo} - ${deposito.dep_comprobante}`,
        row,
        parent: deposito,
        field: 'aplicar_monto_deposito',
      });
    });
  });

  data.ingreso_aplicaciones?.forEach((aplicacion) => {
    aplicacion.facturas?.forEach((row) => {
      addItem({
        source: 'ingreso_aplicaciones',
        label: `Aplicación - ${aplicacion.detalle?.CN_DOCUMENTO ?? ''}`,
        row,
        parent: aplicacion,
        field: 'aplicar_monto_aplicacion',
      });
    });
  });

  return items;
}
function resolveValidationType(row) {
  if (row?.hasDoubleApply) {
    return 'double_apply';
  }

  if (row?.hasExcess) {
    return 'excess';
  }

  return row?.validationType ?? null;
}

function resolveValidationLabel(row) {
  if (row?.hasDoubleApply) {
    return 'Doble aplicación';
  }

  if (row?.hasExcess) {
    return 'Excedente';
  }

  return 'Validación';
}



async function applyRecommendationsAndRegister() {
  if (disabledPayment.value) {
    return;
  }

  disabledPayment.value = true;
  try {
    applyRecommendedAmounts();
    modalValidacionPagoObj.hide();
    await registrarcobro();
  } finally {
    disabledPayment.value = false;
  }
}

function applyRecommendedAmounts() {
  const items = [...excessItems.value];

  items.forEach((item) => {
    const recommended = roundMoney(item.priceRecommend);

    if (recommended <= 0) {
      removePaymentApplicationRow(item);
      return;
    }

    item.row[item.field] = recommended;

    updateInvoiceBalanceAfterRecommendation(item, recommended);

    item.row.hasExcess = false;
    item.row.hasDoubleApply = false;
    item.row.excessValue = 0;
    item.row.validationType = null;
    item.row.validationMessage = null;
  });

  removeZeroAmountApplications(cobranza.value);
  removeEmptyPaymentApplications(cobranza.value);
  recalculatePaymentHeaders(cobranza.value);

  cobranza.value.hasGlobalExcess = false;

  store.commit('calculaSaldoFacturas');
  store.commit('checkPermitePedido');
}

function removeZeroAmountApplications(data) {
  data.retenciones = data.retenciones?.filter((retencion) => {
    return toNumber(retencion.total) > 0;
  }) ?? [];

  if (data.ingreso_efectivo?.facturas) {
    data.ingreso_efectivo.facturas = data.ingreso_efectivo.facturas.filter((factura) => {
      return toNumber(factura.aplicar_monto_efectivo) > 0;
    });
  }

  if (data.ingreso_tarjeta?.facturas) {
    data.ingreso_tarjeta.facturas = data.ingreso_tarjeta.facturas.filter((factura) => {
      return toNumber(factura.aplicar_monto_tarjeta) > 0;
    });
  }

  if (data.ingreso_cheques?.facturas) {
    data.ingreso_cheques.facturas = data.ingreso_cheques.facturas.filter((factura) => {
      return toNumber(factura.aplicar_monto_cheque) > 0;
    });
  }

  data.ingreso_depositos?.forEach((deposito) => {
    deposito.facturas = deposito.facturas?.filter((factura) => {
      return toNumber(factura.aplicar_monto_deposito) > 0;
    }) ?? [];
  });

  data.ingreso_aplicaciones?.forEach((aplicacion) => {
    aplicacion.facturas = aplicacion.facturas?.filter((factura) => {
      return toNumber(factura.aplicar_monto_aplicacion) > 0;
    }) ?? [];
  });
}

function removeEmptyPaymentApplications(data) {
  data.ingreso_aplicaciones = data.ingreso_aplicaciones?.filter((aplicacion) => {
    return aplicacion.facturas?.length > 0;
  }) ?? [];
}

function removePaymentApplicationRow(item) {
  if (!item) {
    return;
  }

  if (item.source === 'retenciones') {
    removeRowFromArray(cobranza.value.retenciones, item.row);
    return;
  }

  if (item.source === 'ingreso_efectivo') {
    removeRowFromArray(cobranza.value.ingreso_efectivo?.facturas, item.row);
    return;
  }

  if (item.source === 'ingreso_tarjeta') {
    removeRowFromArray(cobranza.value.ingreso_tarjeta?.facturas, item.row);
    return;
  }

  if (item.source === 'ingreso_cheques') {
    removeRowFromArray(cobranza.value.ingreso_cheques?.facturas, item.row);
    return;
  }

  if (item.source === 'ingreso_depositos') {
    removeRowFromArray(item.parent?.facturas, item.row);
    return;
  }

  if (item.source === 'ingreso_aplicaciones') {
    removePaymentApplicationGroup(item.parent);
    return;
  }
}

function removePaymentApplicationGroup(application) {
  if (!application) {
    return;
  }

  removeRowFromArray(cobranza.value.ingreso_aplicaciones, application);
}

function removeRowFromArray(array, row) {
  if (!Array.isArray(array)) {
    return;
  }

  const index = array.indexOf(row);

  if (index >= 0) {
    array.splice(index, 1);
  }
}

function updateInvoiceBalanceAfterRecommendation(item, recommended) {
  if (!item.row?.ECD_DET_NUM_DOC) {
    return;
  }

  const saldoBase = toNumber(
    item.row.saldoBase ?? (toNumber(item.row.saldoFactura) + toNumber(item.enteredAmount))
  );

  item.row.ECD_DET_SALDO_CLIENTE = roundMoney(
    Math.max(saldoBase - recommended, 0)
  );
}

function recalculatePaymentHeaders(data) {
  if (data.ingreso_efectivo) {
    recalculateHeaderAmount(data.ingreso_efectivo, 'aplicar_monto_efectivo');
  }

  if (data.ingreso_tarjeta) {
    recalculateHeaderAmount(data.ingreso_tarjeta, 'aplicar_monto_tarjeta');
  }

  if (data.ingreso_cheques) {
    recalculateHeaderAmount(data.ingreso_cheques, 'aplicar_monto_cheque');
  }

  data.ingreso_depositos?.forEach((deposito) => {
    recalculateHeaderAmount(deposito, 'aplicar_monto_deposito');
  });

  data.ingreso_aplicaciones?.forEach((aplicacion) => {
    recalculateHeaderAmount(aplicacion, 'aplicar_monto_aplicacion');
  });
}

function recalculateHeaderAmount(group, field) {
  const applied = roundMoney(
    group.facturas?.reduce((total, factura) => {
      return total + toNumber(factura[field]);
    }, 0) ?? 0
  );

  const original = toNumber(group.monto_original ?? group.monto ?? 0);

  group.monto_aplicado = applied;
  group.monto_no_aplicado = roundMoney(Math.max(original - applied, 0));
}


function toNumber(value) {
  const number = Number(value ?? 0);

  return Number.isFinite(number) ? number : 0;
}

function roundMoney(value, decimals = 2) {
  return Number(toNumber(value).toFixed(decimals));
}

function hasCollectionPaymentRecords(data) {
  return hasRetenciones(data)
    || hasIngresoEfectivo(data)
    || hasIngresoTarjeta(data)
    || hasIngresoDepositos(data)
    || hasIngresoAplicaciones(data)
    || hasIngresoCheques(data);
}

function hasRetenciones(data) {
  return Array.isArray(data.retenciones)
    && data.retenciones.some((retencion) => toNumber(retencion.total) > 0);
}

function hasIngresoEfectivo(data) {
  const efectivo = data.ingreso_efectivo;

  if (!efectivo || Array.isArray(efectivo)) {
    return false;
  }

  return toNumber(efectivo.monto) > 0
    || toNumber(efectivo.monto_original) > 0
    || toNumber(efectivo.efectivo_recibido) > 0
    || toNumber(efectivo.monto_aplicado) > 0
    || toNumber(efectivo.monto_no_aplicado) > 0;
}

function hasIngresoTarjeta(data) {
  const tarjeta = data.ingreso_tarjeta;

  if (!tarjeta || Array.isArray(tarjeta)) {
    return false;
  }

  return toNumber(tarjeta.monto) > 0
    || toNumber(tarjeta.monto_original) > 0
    || toNumber(tarjeta.monto_aplicado) > 0
    || toNumber(tarjeta.monto_no_aplicado) > 0;
}

function hasIngresoCheques(data) {
  const cheques = data.ingreso_cheques;

  if (!cheques || Array.isArray(cheques)) {
    return false;
  }

  return toNumber(cheques.monto_original) > 0
    || toNumber(cheques.monto_aplicado) > 0
    || toNumber(cheques.monto_no_aplicado) > 0
    || (
      Array.isArray(cheques.cheques)
      && cheques.cheques.some((cheque) => toNumber(cheque.monto) > 0)
    );
}

function hasIngresoDepositos(data) {
  return Array.isArray(data.ingreso_depositos)
    && data.ingreso_depositos.some((deposito) => {
      return toNumber(deposito.monto) > 0
        || toNumber(deposito.monto_original) > 0
        || toNumber(deposito.monto_aplicado) > 0
        || toNumber(deposito.monto_no_aplicado) > 0;
    });
}

function hasIngresoAplicaciones(data) {
  return Array.isArray(data.ingreso_aplicaciones)
    && data.ingreso_aplicaciones.some((aplicacion) => {
      return Array.isArray(aplicacion.facturas)
        && aplicacion.facturas.some((factura) => {
          return toNumber(factura.aplicar_monto_aplicacion) > 0;
        });
    });
}

function showEmptyCollectionWarning() {
  toast.fire({
    title: 'Cobro sin registros',
    text: 'No existen valores aplicados para registrar el cobro.',
    icon: 'warning',
    confirmButtonText: 'Entendido',
    customClass: {
      confirmButton: 'btn btn-warning m-1',
    },
    buttonsStyling: false,
  });
}

async function registrarcobro() {
  return;
  const clienteActual = { ...currentClienteCobro.value };
  cobranza.value.cliente_id = clienteActual.id;
  cobranza.value.pago_a_padido = pago_a_padido.value;
  cobranza.value.puntodeventa = store.state.puntodeventaselect;
  cobranza.value.userId = store.state.user.data.USERID;

  if (!hasCollectionPaymentRecords(cobranza.value)) {
    showEmptyCollectionWarning();
    return;
  }

  try {
    await store.dispatch('registrarcobro', cobranza.value);

    store.commit('enceraRetencion');
    store.commit('enceraCobranzas');

    await store.dispatch('cobrosRegistrados', {
      id: clienteActual.id,
    });

    await store.dispatch('estadodecuenta', clienteActual);
    console.log('cliente después de registrar:', store.state.currentClienteCobro);
    // store.commit('enceraRetencion');
    // store.commit('enceraCobranzas');
    store.commit('resetPagoaPedido');
    store.commit('setCurrentclienteCobro', clienteActual);
  } catch (err) {
    const status = err.response?.status ?? 0;
    const error =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Ops! Ha ocurrido un error inesperado';

    if (status === 422) {
      const htmlMessage = String(error).replace(/\n/g, '<br>');

      toast.fire({
        title: 'Cobro bloqueado',
        html: `
          <div class="text-start" style="font-size: 13px; line-height: 1.5;">
            ${htmlMessage}
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        customClass: {
          confirmButton: 'btn btn-warning m-1',
        },
        buttonsStyling: false,
      });

      return;
    }

    swalError(error);
  }
}
</script>
<template>

  <div class="col-md-12 m-t20"
    v-if="cobranza.retenciones.length > 0 || cobranza.ingreso_efectivo.monto || cobranza.ingreso_tarjeta.monto || cobranza.ingreso_depositos.length > 0 || cobranza.ingreso_aplicaciones.length > 0 || cobranza.ingreso_cheques.monto_original">
    <div class="table-responsive">
      <table class="table table-bordered table-sm fs-sm">
        <thead>
          <tr class="table-active">
            <th>Fecha</th>
            <th>Cliente</th>
            <th>RUC</th>
            <th>Referencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="width: 160px;" class="align-middle">
              {{ date }}
            </td>
            <td class="align-middle">{{ currentClienteCobro.CLI_RAZON_SOCIAL }}</td>
            <td class="align-middle">{{ currentClienteCobro.CLI_RUC }}</td>
            <td><input type="text" class="form-control" v-model="cobranza.referencia"></td>
          </tr>
        </tbody>
      </table>
      <template v-if="cobranza.retenciones.length > 0">
        <table class="table table-bordered table-sm fs-sm">
          <thead>
            <tr class="table-active">
              <th colspan="7">Retenciones</th>
            </tr>
          </thead>
        </table>
        <div style="width: 100%; height: 200px; overflow-y: scroll;" class="m-b15">
          <table class="table table-bordered table-sm fs-sm">
            <tbody>
              <template v-for="(retencion, index) in cobranza.retenciones" :key="index">
                <tr>
                  <th scope colspan="7">Comprobante de Retención: {{ retencion.ret_comprobante }} <button
                      class="btn btn-warning btn-sm float-end" @click="confirmeliminarretencion(index, retencion)"><i
                        class="fa fa-trash"></i></button></th>
                </tr>
                <tr>
                  <th scope>Comprobante</th>
                  <th scope>Número</th>
                  <th scope>Fecha Emisión</th>

                  <th scope>Impuesto</th>
                  <th scope>% Retención</th>
                  <th scope>Valor Retenido</th>
                </tr>
                <tr>
                  <td>Factura</td>
                  <td>{{ retencion.ret_factura }}</td>
                  <td>{{ retencion.ret_emision }}</td>

                  <td>IVA</td>
                  <td class="text-end">{{ retencion.ret_porcentaje_iva }}%</td>
                  <td class="text-end">${{ retencion.ret_iva }}</td>
                </tr>
                <tr>
                  <td>Factura</td>
                  <td>{{ retencion.ret_factura }}</td>
                  <td>{{ retencion.ret_emision }} </td>

                  <td>RENTA</td>
                  <td class="text-end">{{ retencion.ret_porcentaje_renta }}%</td>
                  <td class="text-end">${{ retencion.ret_renta }}</td>
                </tr>
                <tr v-if="retencion.ret_iva_srv">
                  <td>Factura</td>
                  <td>{{ retencion.ret_factura }}</td>
                  <td>{{ retencion.ret_emision }}</td>

                  <td>IVA SRV</td>
                  <td class="text-end">{{ retencion.ret_porcentaje_iva_srv }}%</td>
                  <td class="text-end">${{ retencion.ret_iva_srv }}</td>
                </tr>
                <tr v-if="retencion.ret_renta_srv">
                  <td>Factura</td>
                  <td>{{ retencion.ret_factura }}</td>
                  <td>{{ retencion.ret_emision }}</td>

                  <td>RENTA SRV</td>
                  <td class="text-end">{{ retencion.ret_porcentaje_renta_srv }}%</td>
                  <td class="text-end">${{ retencion.ret_renta_srv }}</td>
                </tr>
                <tr>
                  <td colspan="2"><b>Fecha caducidad:</b> {{ retencion.ret_caducidad }}</td>
                  <td colspan="5"><b>Número de autorización:</b> {{ retencion.ret_autorizacion }}</td>
                </tr>
                <tr>
                  <td colspan="7" class="text-end"><b>Total Retenido ${{ retencion.total }}</b></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>
      <template v-if="cobranza.ingreso_efectivo.monto">
        <table class="table table-bordered table-sm fs-sm">
          <thead>
            <tr class="table-active">
              <th colspan="7">Efectivo: ${{ cobranza.ingreso_efectivo.monto }} <button
                  class="btn btn-warning btn-sm float-end" @click="confirmeliminarefectivo()"><i
                    class="fa fa-trash"></i></button></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope style="width: 150px;">Factura</th>
              <th scope style="width: 150px;">Fecha Vencimiento</th>
              <th scope style="width: 110px;">Monto Original</th>
              <th scope style="width: 110px;">Monto Pendiente</th>
              <th scope style="width: 150px;">Monto Aplicado</th>
              <th scope style="width: 150px;">Saldo</th>
              <th scope>Comentario</th>
            </tr>
            <tr v-for="(factura, index) in cobranza.ingreso_efectivo.facturas" :key="index">
              <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
              <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) +
                parseFloat(factura.aplicar_monto_efectivo)) }}</td>
              <td style="width: 150px;" class="text-end">${{ formatPrice(factura.aplicar_monto_efectivo) }}</td>
              <td class="text-end" style="width: 150px;">${{ formatPrice(factura.ECD_DET_SALDO_CLIENTE) }}</td>
              <td>{{ factura.observacion_efectivo }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-for="(deposito, index) in cobranza.ingreso_depositos" :key="index">
        <table class="table table-bordered table-sm fs-sm">
          <thead>
            <tr class="table-active">
              <th scope colspan="5">Despósito / Transferencia <button class="btn btn-warning btn-sm float-end"
                  @click="confirmeliminardeposito(index)"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope>Comprobante</th>
              <th scope>Tipo</th>
              <th scope>Banco</th>
              <th scope>Fecha</th>
              <th scope>Monto</th>
            </tr>
            <tr>
              <td>{{ deposito.dep_comprobante }}</td>
              <td>{{ deposito.tipo }}</td>
              <td>{{ deposito.banco_nombre }}</td>
              <td>{{ deposito.dep_fecha }}</td>
              <td class="text-end"><b>${{ deposito.monto }}</b></td>
            </tr>
          </tbody>
        </table>
        <table class="table table-bordered table-sm fs-sm">
          <tbody>
            <tr>
              <th style="width: 150px;">Factura</th>
              <th style="width: 150px;">Fecha Vencimiento</th>
              <th style="width: 110px;">Monto Original</th>
              <th style="width: 110px;">Monto Pendiente</th>
              <th style="width: 150px;">Monto Aplicado</th>
              <th style="width: 150px;">Saldo</th>
              <th>Comentario</th>
            </tr>
            <tr v-for="(factura, index) in deposito.facturas" :key="index">
              <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
              <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) +
                parseFloat(factura.aplicar_monto_deposito)) }}</td>
              <td style="width: 150px;" class="text-end">${{ formatPrice(factura.aplicar_monto_deposito) }}</td>
              <td class="text-end" style="width: 150px;">${{ formatPrice(factura.ECD_DET_SALDO_CLIENTE) }}</td>
              <td>{{ factura.observacion_deposito }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-if="cobranza.ingreso_cheques.monto_original">
        <table class="table table-bordered table-sm fs-sm" style="margin-bottom: 0px;">
          <thead>
            <tr class="table-active">
              <th colspan="8">Cheques <button class="btn btn-warning btn-sm float-end"
                  @click="confirmeliminarcheques(index)"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope>Banco</th>

              <th scope>#Cuenta</th>
              <th scope>#Cheque</th>
              <th scope>Monto</th>
              <th scope>Emisión</th>
              <th scope>Vencimiento</th>
              <th scope>Comentario</th>
            </tr>
            <tr v-for="(cheque, index) in cobranza.ingreso_cheques.cheques" :key="index">
              <td>{{ cheque.banco_nombre }}</td>

              <td>{{ cheque.cuenta }}</td>
              <td>{{ cheque.cheque }}</td>
              <td class="text-end">${{ cheque.monto }}</td>
              <td>{{ cheque.fecha_emision }}</td>
              <td>{{ cheque.fecha_vencimiento }}</td>
              <td>{{ cheque.observacion_cheque }}</td>
            </tr>
            <tr>
              <th scope colspan="4" class="text-end">TOTAL </th>
              <th scope class="text-end">${{ formatPrice(cobranza.ingreso_cheques.monto_original) }}</th>
              <th scope colspan="3"></th>
            </tr>
          </tbody>
        </table>
        <table class="table table-bordered table-sm fs-sm">
          <tbody>
            <tr>
              <th style="width: 150px;">Factura</th>
              <th style="width: 150px;">Fecha Vencimiento</th>
              <th style="width: 110px;">Monto Original</th>
              <th style="width: 110px;">Monto Pendiente</th>
              <th style="width: 150px;">Monto Aplicado</th>
              <th style="width: 150px;">Saldo</th>
              <th>Comentario</th>
            </tr>
            <tr v-for="(factura, index) in cobranza.ingreso_cheques.facturas" :key="index">
              <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
              <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) +
                parseFloat(factura.aplicar_monto_cheque)) }}</td>
              <td style="width: 150px;" class="text-end">${{ formatPrice(factura.aplicar_monto_cheque) }}</td>
              <td class="text-end" style="width: 150px;">${{ formatPrice(factura.ECD_DET_SALDO_CLIENTE) }}</td>
              <td>{{ factura.observacion_deposito }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-if="cobranza.ingreso_tarjeta.monto">
        <table class="table table-bordered table-sm fs-sm">
          <thead>
            <tr class="table-active">
              <th scope colspan="2">Tarjeta: ${{ cobranza.ingreso_tarjeta.monto }} </th>
              <th scope colspan="2">Emisor: {{ cobranza.ingreso_tarjeta.banco_nombre }} </th>
              <th scope colspan="2">Comprobante: {{ cobranza.ingreso_tarjeta.comprobante }} </th>
              <th scope><button class="btn btn-warning btn-sm float-end" @click="confirmeliminartarjeta()"><i
                    class="fa fa-trash"></i></button></th>
            </tr>
            <tr>
              <th scope colspan="7">Comentario: {{ cobranza.ingreso_tarjeta.comentario }} </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope style="width: 150px;">Factura</th>
              <th scope style="width: 150px;">Fecha Vencimiento</th>
              <th scope style="width: 110px;">Monto Original</th>
              <th scope style="width: 110px;">Monto Pendiente</th>
              <th scope style="width: 150px;">Monto Aplicado</th>
              <th scope style="width: 150px;">Saldo</th>
              <th scope>Comentario</th>
            </tr>
            <tr v-for="(factura, index) in cobranza.ingreso_tarjeta.facturas" :key="index">
              <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
              <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) +
                parseFloat(factura.aplicar_monto_tarjeta)) }}</td>
              <td style="width: 150px;" class="text-end">${{ formatPrice(factura.aplicar_monto_tarjeta) }}</td>
              <td class="text-end" style="width: 150px;">${{ formatPrice(factura.ECD_DET_SALDO_CLIENTE) }}</td>
              <td>{{ factura.observacion_efectivo }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-for="(aplicacion, index) in cobranza.ingreso_aplicaciones" :key="index">
        <table class="table table-bordered table-sm fs-sm">
          <thead>
            <tr class="table-active">
              <th colspan="6">Aplicacion de saldos <button class="btn btn-warning btn-sm float-end"
                  @click="confirmeliminaraplicacion(index)"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope>Documento</th>
              <th scope class="text-end">Monto original</th>
              <th scope class="text-end">Saldo</th>
              <th scope>Fecha</th>
              <th scope class="text-end">Monto aplicado</th>
              <th scope>Comentario</th>
            </tr>
            <tr>
              <td>{{ aplicacion.detalle.CN_DOCUMENTO }}</td>
              <td class="text-end">${{ aplicacion.detalle.CN_MONTO_ORIGINAL }}</td>
              <td class="text-end">${{ aplicacion.detalle.CN_SALDO_PENDIENTE }}</td>
              <td>{{ aplicacion.detalle.CN_FECHA_EMISION.date.substr(0, 10) }}</td>
              <td class="text-end"><b>${{ aplicacion.monto_aplicado }}</b></td>
              <td>{{ aplicacion.comentario }}</td>
            </tr>
          </tbody>
        </table>
        <table class="table table-bordered table-sm fs-sm">
          <tbody>
            <tr>
              <th style="width: 150px;">Factura</th>
              <th style="width: 150px;">Fecha Vencimiento</th>
              <th style="width: 110px;">Monto Original</th>
              <th style="width: 110px;">Monto Pendiente</th>
              <th style="width: 150px;">Monto Aplicado</th>
              <th style="width: 150px;">Saldo</th>
              <th>Comentario</th>
            </tr>
            <tr v-for="(factura, index) in aplicacion.facturas" :key="index">
              <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
              <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
              <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) +
                parseFloat(factura.aplicar_monto_aplicacion)) }}</td>
              <td style="width: 150px;" class="text-end">${{ formatPrice(factura.aplicar_monto_aplicacion) }}</td>
              <td class="text-end" style="width: 150px;">${{ formatPrice(factura.ECD_DET_SALDO_CLIENTE) }}</td>
              <td>{{ factura.observacion_aplicacion }}</td>
            </tr>
          </tbody>
        </table>



      </template>

    </div>
    <div class="row hide" v-if="permite_pedido">
      <label class="col-sm-9 col-form-label text-end" for="pago_a_padido">Pago a pedido:</label>
      <div class="col-sm-3">
        <div class="input-group">
          <select id="pago_a_padido" name="pago_a_padido" class="form-select fs-sm" v-model="pago_a_padido">
            <option v-for="(pedido, index) in pedidos_por_cobrar" :key="index" :value="pedido.pedido">{{ pedido.pedido
            }}
              -
              ${{ pedido.total }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="text-end my-4"
    v-if="cobranza.retenciones.length > 0 || cobranza.ingreso_efectivo.monto || cobranza.ingreso_tarjeta.monto || cobranza.ingreso_depositos.length > 0 || cobranza.ingreso_aplicaciones.length > 0 || cobranza.ingreso_cheques.monto_original">
    <input ref="botonRegistrarCobro" class="btn btn-success" type="button" value="Registrar Cobro"
      :disabled="disabledPayment" @click="validarAplicacioneFactura()" />
  </div>


  <!-- modales -->
  <div class="modal" id="modal-validacion-aplicacion-pagos" tabindex="-1"
    aria-labelledby="modal-validacion-aplicacion-pagos" aria-hidden="true" ref="modalValidacionPagoRef">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable modal-validacion-pagos">
      <div class="modal-content">
        <verModalValidacionAplicacionPagos :items="excessItems" :processing="disabledPayment"
          @close-modal="modalValidacionPagoObj.hide()" @apply-recommendations="applyRecommendationsAndRegister" />
      </div>
    </div>
  </div>


</template>