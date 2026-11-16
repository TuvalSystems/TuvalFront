<template>
  <!-- Hero -->
  <BasePageHeading
    title="Consulta cierre de caja"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Consultas cierre de caja</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Seleccionar caja" class="pb-4">
      <form
          class="row row-cols-lg-auto g-3 align-items-center"
          @submit.prevent="onSubmit"
          >
          <div class="col-auto">
            <div class="row">
              <label class="col-sm-4 col-form-label text-end" for="fecha">Punto de venta:</label>
              <div class="col-sm-8">
                <select 
                    id="punto_de_venta" 
                    name="punto_de_venta" 
                    class="form-select fs-sm"
                    v-model="puntodeventa"
                    @change="selectPuntodeventa($event)"
                    >
                      <option v-for="(puntodeventa, index) in puntodeventa_caja" :key="index"
                      :value="index"
                      >{{ puntodeventa.PTO_VTA_DESCRIPCION }}</option> 
                  </select>
              </div>
            </div>
          </div>
          <div class="col-auto">
            <div class="row">
              <label class="col-sm-4 col-form-label text-end" for="fecha">Caja/Usuario:</label>
              <div class="col-sm-8">
                <select 
                    id="punto_de_venta" 
                    name="punto_de_venta" 
                    class="form-select fs-sm"
                    v-model="caja_usuario"
                    >
                      <option v-for="(caja, index) in cajas" :key="index"
                      :value="caja.CAJA_CODIGO"
                      >{{ caja.CAJA_DESCRIPCION }} - {{ caja.USERNAME }}</option> 
                  </select>
              </div>
            </div>
          </div>
          <div class="col-auto">
            <div class="row">
              <label class="col-sm-4 col-form-label text-end" for="fecha">Fecha:</label>
              <div class="col-sm-8">
                <div class="input-group date" style="max-width: 180px;">
                  <span class="input-group-text"><i class="far fa-calendar"></i></span>
                  <flat-pickr
                    id="fecha" 
                    name="fecha" 
                    class="form-control fs-sm"
                    placeholder="Y-m-d"
                    v-model="set_fecha"
                    :config="flatPickrState.fecha"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="">
              <button v-if="caja_usuario" type="button" v-on:click="generarcaja(set_fecha)" class="btn btn-success"><i class="fa fa-magnifying-glass"></i> Consultar</button>
          </div>
      </form>
      <template v-if="cobros_caja_usuario">
        <div class="text-end pt-3">
          <button class="btn btn-primary btn-sm mx-1" @click="imprimirCaja(set_fecha)"><i class="fa fa-print"></i> Imprimir consulta</button>
          <button class="btn btn-warning btn-sm mx-1" @click="descargarcierredecaja(set_fecha)"><i class="fa fa-print"></i> Imprimir cierre de caja</button>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.aplicacion_saldos.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="7">APLICACIÓN DE SALDOS (NOTAS DE CRÉDITO / ANTICIPOS)</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.aplicacion_saldos_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Cobro</th>
                <th>Tipo</th>
                <th class="text-end">Monto</th>
                <th class="text-end">APlicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(saldo, index) in cobros_caja_usuario.aplicacion_saldos" :key="index">
                <td>{{ saldo.numero_recibo }}</td>
                <td>{{ saldo.cobro }}</td>
                <td>{{ saldo.tipo }}</td>
                <td class="text-end">${{ saldo.monto }}</td>
                <td class="text-end">${{ formatPriceJm(saldo.aplicado) }}</td>
                <td>{{ saldo.CLI_RUC }}</td>
                <td>{{ saldo.CLI_RAZON_SOCIAL }}</td>
                <td>{{ saldo.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.depositos.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="8">Depósitos</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.depositos_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Comprobante</th>
                <th>Banco</th>
                <th>Fecha depósito</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(deposito, index) in cobros_caja_usuario.depositos" :key="index">
                <td>{{  deposito.numero_recibo }}</td>
                <td>{{  deposito.comprobante }}<span v-if="deposito.mensaje_ws !== 'Registro de cobro guardado correctamente.'"> * </span></td>
                <td>{{  deposito.CB_DESCRIPCION }}</td>
                <td>{{  deposito.fecha_deposito }}</td>
                <td class="text-end">${{  deposito.monto }}</td>
                <td class="text-end">${{  formatPriceJm(deposito.aplicado) }}</td>
                <td>{{ deposito.CLI_RUC }}</td>
                <td>{{ deposito.CLI_RAZON_SOCIAL }}</td>
                <td>{{ deposito.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.cheques_aldia.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="10">Cheques al día</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.cheques_aldia_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th># Cheque</th>
                <th># Cuenta</th>
                <th>Banco</th>
                <th>F. Emisión</th>
                <th>F. Vencimiento</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cheque, index) in cobros_caja_usuario.cheques_aldia" :key="index">
                <td>{{  cheque.numero_recibo }}</td>
                <td>{{  cheque.cheque }}</td>
                <td>{{  cheque.cuenta }}</td>
                <td>{{  cheque.CB_DESCRIPCION }}</td>
                <td>{{  cheque.fecha_emision }}</td>
                <td>{{  cheque.fecha_vencimiento }}</td>
                <td class="text-end">${{  cheque.monto }}</td>
                <td class="text-end">${{  formatPriceJm(cheque.aplicado) }}</td>
                <td>{{ cheque.CLI_RUC }}</td>
                <td>{{ cheque.CLI_RAZON_SOCIAL }}</td>
                <td>{{ cheque.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.cheques_posfechados.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="10">Cheques Posfechados</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.cheques_posfechados_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th># Cheque</th>
                <th># Cuenta</th>
                <th>Banco</th>
                <th>F. Emisión</th>
                <th>F. Vencimiento</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cheque, index) in cobros_caja_usuario.cheques_posfechados" :key="index">
                <td>{{  cheque.numero_recibo }}</td>
                <td>{{  cheque.cheque }}</td>
                <td>{{  cheque.cuenta }}</td>
                <td>{{  cheque.CB_DESCRIPCION }}</td>
                <td>{{  cheque.fecha_emision }}</td>
                <td>{{  cheque.fecha_vencimiento }}</td>
                <td class="text-end">${{  cheque.monto }}</td>
                <td class="text-end">${{  formatPriceJm(cheque.aplicado) }}</td>
                <td>{{ cheque.CLI_RUC }}</td>
                <td>{{ cheque.CLI_RAZON_SOCIAL }}</td>
                <td>{{ cheque.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.efectivo.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="5">Efectivo</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.efectivo_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(efectivo, index) in cobros_caja_usuario.efectivo" :key="index">
                <td>{{  efectivo.numero_recibo }}<span v-if="efectivo.mensaje_ws !== 'Registro de cobro guardado correctamente.'"> * </span></td>
                <td class="text-end">${{  efectivo.monto }}</td>
                <td class="text-end">${{  formatPriceJm(efectivo.aplicado) }}</td>
                <td>{{ efectivo.CLI_RUC }}</td>
                <td>{{ efectivo.CLI_RAZON_SOCIAL }}</td>
                <td>{{ efectivo.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.retenciones.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="11">Retenciones</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.retenciones_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Factura</th>
                <th>Comprobante</th>
                <th>F. Emisión</th>
                <th>F. Vencimiento</th>
                <th>Ret. IVA</th>
                <th>Ret. Renta</th>
                <th>Ret. IVA Srv.</th>
                <th>Ret. Renta Srv.</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(retencion, index) in cobros_caja_usuario.retenciones" :key="index">
                <td>{{  retencion.numero_recibo }}</td>
                <td>{{  retencion.ret_factura }}</td>
                <td>{{  retencion.ret_comprobante }}</td>
                <td>{{  retencion.ret_fecha_emision }}</td>
                <td>{{  retencion.ret_fecha_vencimiento }}</td>
                <td>{{  retencion.ret_porcentaje_iva }}% ${{ retencion.ret_iva }}</td>
                <td>{{  retencion.ret_porcentaje_renta }}% ${{ retencion.ret_renta }}</td>
                <td>
                  <span v-if="retencion.ret_iva_srv > 0">
                    {{  retencion.ret_porcentaje_iva_srv }}% ${{ retencion.ret_iva_srv }}
                  </span>
                </td>
                <td>
                  <span v-if="retencion.ret_renta_srv > 0">
                    {{  retencion.ret_porcentaje_renta_srv }}% ${{ retencion.ret_renta_srv }}
                  </span>
                </td>
                <td>{{ retencion.CLI_RUC }}</td>
                <td>{{ retencion.CLI_RAZON_SOCIAL }}</td>
                <td>{{ retencion.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.tarjeta.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="7">Tarjeta de crédito</th>
                <th class="text-end">Total: ${{ cobros_caja_usuario.tarjeta_total }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Comprobante</th>
                <th>Banco</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tarjeta, index) in cobros_caja_usuario.tarjeta" :key="index">
                <td>{{  tarjeta.numero_recibo }}</td>
                <td>{{  tarjeta.comprobante }}<span v-if="tarjeta.mensaje_ws !== 'Registro de cobro guardado correctamente.'"> * </span></td>
                <td>{{  tarjeta.banco }}</td>
                <td class="text-end">${{  tarjeta.monto }}</td>
                <td class="text-end">${{  formatPriceJm(tarjeta.aplicado) }}</td>
                <td>{{ tarjeta.CLI_RUC }}</td>
                <td>{{ tarjeta.CLI_RAZON_SOCIAL }}</td>
                <td>{{ tarjeta.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import { swalError } from "@/functions/swal-alert.js";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { formatPriceJm } from "@/functions";

const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  fecha: {
    maxDate: Date.now(),
    locale: Spanish,
    monthSelectorType: "static"
  },
});

const store = useStore();

const today = new Date();
const fecha = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const puntodeventa_caja = computed(() => store.state.puntodeventa_caja);
const cobros_caja_usuario = ref(null);
const caja_usuario = ref(null);
const puntodeventa = ref(null);
const set_fecha = ref(fecha);
const cajas = ref([]);

store.dispatch('puntodeventacaja')
.catch(err => {
    swalError(err.response.data.error)
});

function selectPuntodeventa(event){
  cajas.value = puntodeventa_caja.value[event.target.value].cajas;
}

function generarcaja(set_fecha){
  const consulta = reactive({
    caja_usuario: caja_usuario.value,
    fecha: set_fecha,
  })
  store.dispatch('consultacierrecajausuario', consulta).then((res) => {
    cobros_caja_usuario.value = res.data
  });
}

function imprimirCaja(set_fecha){
  store.dispatch('imprimir', '/cobranzas/imprimircierredecajausuario/'+set_fecha+'/'+caja_usuario.value)
  .then((response) => {
    if(response.status == 200){
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'consulta-de-caja-'+caja_usuario.value+'-'+set_fecha+'.pdf');
      document.body.appendChild(link);
      link.click();
    }
  });
}

function descargarcierredecaja(set_fecha){
  store.dispatch('estadoCajafecha', set_fecha).then((res) => {
    if(res.caja.estado == 'cerrado'){
      store.dispatch('imprimir', '/cobranzas/imprimircierredecaja/'+set_fecha+'/'+caja_usuario.value)
          .then((response) => {
            if(response.status == 200){
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'cierre-de-caja-'+caja_usuario.value+'.pdf');
              document.body.appendChild(link);
              link.click();
            }
          });
    }else{
      swalError('La caja se encuentra abierta');
    }
  }).catch(err => {
    swalError(err.response.data.error);
  });
}

</script>
