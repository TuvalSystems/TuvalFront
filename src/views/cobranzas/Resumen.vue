
<template>

  <div class="col-md-12 m-t20" v-if="cobranza.retenciones.length > 0 || cobranza.ingreso_efectivo.monto || cobranza.ingreso_tarjeta.monto || cobranza.ingreso_depositos.length > 0 || cobranza.ingreso_aplicaciones.length > 0  || cobranza.ingreso_cheques.monto_original">
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
                <td class="align-middle">{{ currentClienteCobro.CLI_RAZON_SOCIAL}}</td>
                <td class="align-middle">{{ currentClienteCobro.CLI_RUC}}</td>
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
                    <th colspan="7">Comprobante de Retención: {{ retencion.ret_comprobante }} <button class="btn btn-warning btn-sm float-end" @click="confirmeliminarretencion(index, retencion)"><i class="fa fa-trash"></i></button></th>
                </tr>
                <tr>
                    <th>Comprobante</th>
                    <th>Número</th>
                    <th>Fecha Emisión</th>
                    
                    <th>Impuesto</th>
                    <th>% Retención</th>
                    <th>Valor Retenido</th>
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
              <th colspan="7">Efectivo: ${{ cobranza.ingreso_efectivo.monto }} <button class="btn btn-warning btn-sm float-end" @click="confirmeliminarefectivo()"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead>        
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
            <tr v-for="(factura, index) in cobranza.ingreso_efectivo.facturas" :key="index">
                <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
                <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
                <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
                <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) + parseFloat(factura.aplicar_monto_efectivo)) }}</td>
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
              <th colspan="5">Despósito / Transferencia <button class="btn btn-warning btn-sm float-end" @click="confirmeliminardeposito(index)"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead> 
          <tbody>
            <tr>
              <th>Comprobante</th>
              <th>Tipo</th>                    
              <th>Banco</th>
              <th>Fecha</th>
              <th>Monto</th>
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
                <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) + parseFloat(factura.aplicar_monto_deposito)) }}</td>
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
              <th colspan="8">Cheques <button class="btn btn-warning btn-sm float-end" @click="confirmeliminarcheques(index)"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead>        
          <tbody>
            <tr>
              <th>Banco</th>
                        
              <th>#Cuenta</th>
              <th>#Cheque</th>
              <th>Monto</th>
              <th>Emisión</th>
              <th>Vencimiento</th>
              <th>Comentario</th>
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
              <th colspan="4" class="text-end">TOTAL </th>
              <th class="text-end">${{ formatPrice(cobranza.ingreso_cheques.monto_original) }}</th>
              <th colspan="3"></th>
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
                <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) + parseFloat(factura.aplicar_monto_cheque)) }}</td>
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
              <th colspan="2">Tarjeta: ${{ cobranza.ingreso_tarjeta.monto }} </th>
              <th colspan="2">Emisor: {{ cobranza.ingreso_tarjeta.banco_nombre }} </th>
              <th colspan="2">Comprobante: {{ cobranza.ingreso_tarjeta.comprobante }} </th>
              <th><button class="btn btn-warning btn-sm float-end" @click="confirmeliminartarjeta()"><i class="fa fa-trash"></i></button></th>
            </tr>
            <tr>
              <th colspan="7">Comentario: {{ cobranza.ingreso_tarjeta.comentario }} </th>
            </tr>
          </thead>        
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
            <tr v-for="(factura, index) in cobranza.ingreso_tarjeta.facturas" :key="index">
                <td style="width: 150px;">{{ factura.ECD_DET_NUM_DOC }}</td>
                <td style="width: 150px;">{{ factura.ECD_DET_FECHA_VENCIMIENTO }}</td>
                <td style="width: 110px;" class="text-end">${{ formatPrice(factura.ECD_DET_MONTO_ORIGINAL) }}</td>
                <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) + parseFloat(factura.aplicar_monto_tarjeta)) }}</td>
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
              <th colspan="6">Aplicacion de saldos <button class="btn btn-warning btn-sm float-end" @click="confirmeliminaraplicacion(index)"><i class="fa fa-trash"></i></button></th>
            </tr>
          </thead> 
          <tbody>
            <tr>
              <th>Documento</th>
              <th class="text-end">Monto original</th>  
              <th class="text-end">Saldo</th>
              <th>Fecha</th>
              <th class="text-end">Monto aplicado</th>
              <th>Comentario</th>
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
                <td style="width: 110px;" class="text-end">${{ formatPrice(parseFloat(factura.ECD_DET_SALDO_CLIENTE) + parseFloat(factura.aplicar_monto_aplicacion)) }}</td>
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
          <select 
            id="pago_a_padido" 
            name="pago_a_padido" 
            class="form-select fs-sm"
            v-model="pago_a_padido"
            >
              <option v-for="(pedido, index) in pedidos_por_cobrar" :key="index"
              :value="pedido.pedido"
              >{{pedido.pedido}} - ${{pedido.total}}</option> 
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="text-end my-4" v-if="cobranza.retenciones.length > 0 || cobranza.ingreso_efectivo.monto || cobranza.ingreso_tarjeta.monto || cobranza.ingreso_depositos.length > 0 || cobranza.ingreso_aplicaciones.length > 0  || cobranza.ingreso_cheques.monto_original">
    <input ref="botonRegistrarCobro" class="btn btn-success" type="button" value="Registrar Cobro" @click="registrarcobro()"/>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { formatPrice, formatPrice4 } from "@/functions";

const store = useStore();
const cobranza = computed(() => store.state.cobranza);
const currentClienteCobro = computed(() => store.state.currentClienteCobro);
const cobros_registrados = computed(() => store.state.cobros_registrados);
const pedidos_por_cobrar = computed(() => store.state.pedidos_por_cobrar);
const bancos_tarjetas = computed(() => store.state.bancos_tarjetas);
const facturas = computed(() => store.state.facturas);
const cobros_sin_aplicar = computed(() => store.state.cobros_sin_aplicar);
const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const permite_pedido = computed(() => store.state.permite_pedido);
const pago_a_padido = ref(() => store.state.pago_a_padido);
const botonRegistrarCobro = ref('botonRegistrarCobro');
function confirmeliminarretencion(index, retencion){
  toast.fire({
      title: "Estás seguro?",
      text: "De eliminar la retención "+retencion.ret_comprobante +"",
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

function eliminarRetencion(retencion, index){
  cobranza.value.retenciones.splice(index, 1);
  store.commit('calculaSaldoFacturas');
  store.commit('checkPermitePedido');
}

function confirmeliminarefectivo(){
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

function eliminarEfectivo(){
  store.commit("enceraEfectivo");
  store.commit('checkPermitePedido');
}


function confirmeliminartarjeta(){
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

function eliminarTarjeta(){
  store.commit("enceraTarjeta");
  store.commit('checkPermitePedido');
}

function confirmeliminardeposito(index){
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

function eliminardeposito(index){
  store.commit("eliminarDeposito",index);
  store.commit('checkPermitePedido');
}


function confirmeliminaraplicacion(index){
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

function eliminaraplicacion(index){
  store.commit("eliminarAplicacion",index);
  store.commit('checkPermitePedido');
}
function confirmeliminarcheques(){
  
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

function eliminarcheques(){
  store.commit("eliminarcobroCheques");
  store.commit('checkPermitePedido');
}

function registrarcobro(){
  botonRegistrarCobro.value.classList.add('hide');
  cobranza.value.cliente_id = currentClienteCobro.value.id;
  cobranza.value.pago_a_padido = pago_a_padido.value;
  cobranza.value.puntodeventa = store.state.puntodeventaselect;
  cobranza.value.userId = store.state.user.data.USERID;
 
  store.dispatch('registrarcobro', cobranza.value).then((res) => {
    store.commit('enceraRetencion');
    store.commit('enceraCobranzas');
    const cliente = reactive({
      id: currentClienteCobro.value.id
    });
    store.dispatch('cobrosRegistrados', cliente);
    botonRegistrarCobro.value.classList.remove('hide');
    store.dispatch('estadodecuenta', currentClienteCobro.value).then((res) => {
      store.commit('enceraRetencion');
      store.commit('enceraCobranzas');
      store.commit('resetPagoaPedido');
    })
    .catch(err => {
        swalError(err.response.data.error);
        botonRegistrarCobro.value.classList.remove('hide');
    });
  })
  .catch(err => {
    swalError(err.response.data.error);
    botonRegistrarCobro.value.classList.remove('hide');
  });
}


</script>