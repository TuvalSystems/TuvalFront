<template>
  <form @submit.prevent="aplicar_deposito()">
    <div class="row">
      <div class="col-sm-10 offset-1">
        <table class="table table-bordered table-condensed">
          <thead>
            <tr>
              <th colspan="3">Ingreso de Depósitos o Transferencias</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Tipo:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <select 
                        id="dep_tipo" 
                        name="dep_tipo" 
                        class="form-select fs-sm"
                        v-model="ingreso_deposito.tipo"
                        @change="selectDepositoTipo($event)"
                        :class="{
                          'is-invalid': v$.tipo.$errors.length,
                        }"
                        @blur="v$.tipo.$touch"
                        >
                          <option value="">-- Seleccione un tipo--</option>
                          <option value="DP">Depósito Bancario</option>
                          <option value="DA">Depósito Anterior</option>
                          <option value="TR">Transferencia Bancaria</option>
                      </select>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Banco:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <select 
                        id="dep_banco" 
                        name="dep_banco" 
                        class="form-select fs-sm"
                        v-model="ingreso_deposito.banco"
                        :class="{
                          'is-invalid': v$.banco.$errors.length,
                        }"
                        @blur="v$.banco.$touch"
                        >
                          <option v-for="(banco, index) in bancos_tuval" :key="index"
                          :value="index"
                          >{{banco.CB_DESCRIPCION}}</option> 
                      </select>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="dep_comprobante">#Comprobante:</label>
                  <div class="col-sm-8">
                      <input 
                        type="text" 
                        name="dep_comprobante" 
                        id="dep_comprobante" 
                        v-model="ingreso_deposito.dep_comprobante"
                        class="form-control fs-sm"
                        :class="{
                          'is-invalid': v$.dep_comprobante.$errors.length,
                        }"
                        @blur="v$.dep_comprobante.$touch"
                        @change="validaDeposito()"
                      />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="dep_fecha">Fecha:</label>
                  <div class="col-sm-8">
                    <div class="input-group date" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-calendar"></i></span>
                      <flat-pickr
                        id="dep_fecha" 
                        name="dep_fecha" 
                        class="form-control fs-sm"
                        placeholder="Y-m-d"
                        v-model="ingreso_deposito.dep_fecha"
                        :config="flatPickrState.dep_fecha"
                        :class="{
                          'is-invalid': v$.dep_fecha.$errors.length,
                        }"
                        @blur="v$.dep_fecha.$touch"
                      />
                        
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Monto:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-usd"></i></span>
                      <input 
                        type="text" 
                        class="form-control text-end" 
                        v-model="ingreso_deposito.monto"
                        :class="{
                          'is-invalid': v$.monto.$errors.length,
                        }"
                        @blur="v$.monto.$touch"
                        @keyup="verifica()"
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-text-end v-align-m" colspan="2">
                <input type="submit" class="btn btn-primary" value="Aplicar" id="aplicar_deposito"/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </form>
  <div v-if="ingreso_deposito.monto_original" class="row">
    <div class="col-sm-12">
      <div class="row">
        <div class="col-sm-6 offset-3"> 
          <table class="table table-bordered table-sm fs-sm">
            <thead>
              <tr>
                <th class="text-end">Monto original</th>
                <th class="text-end">${{ formatPrice(ingreso_deposito.monto_original) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto no aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_deposito.monto_no_aplicado) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_deposito.monto_aplicado) }}</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
     
      <div class="row">
        <div class="col-md-12 justify-content-center">
          <Dataset
            v-if="facturas.data && facturas.data.length"
            v-slot="{ ds }"
            :ds-data="facturas.data"
            :ds-sortby="sortBy"
            :ds-search-in="['ECD_DET_NUM_DOC',]"
            >
            <div class="row mb-2">
              <div class="col-sm-3">
                <div class="input-group ">
                  <span class="input-group-text" id="basic-addon1">
                    <i class="fa fa-magnifying-glass"></i>
                  </span>
                  <DatasetSearch ds-search-placeholder="Buscar factura..." />
                </div>
              </div>
            </div>
            <table class="table table-bordered table-sm fs-sm centered" style="margin-bottom: 0px;">
              <thead>
                <tr>
                  
                  <th
                    v-for="(th, index) in cols"
                    :key="th.field"
                    :class="['sort', th.sort]"
                    @click="onSort($event, index)"
                    class="nowrap"
                    >
                    {{ th.name }} <i class="gg-select float-end"></i>
                  </th>
                  <th style="width: 31px;" class="text-center"><i class="fa fa-check"></i></th>
                  <th style="width: 120px;">Aplicar Monto</th>
                  <th>Observación</th>
                </tr>
              
              </thead>
              <DatasetItem tag="tbody">
                <template #default="{ row, index }">
                  <tr>
                    <td style="width: 140px;" class="numero_factura_efe">{{ row.ECD_DET_NUM_DOC }}</td>
                    <td style="width: 90px;">{{ row.ECD_DET_FECHA_EMISION }}</td>
                    <td style="width: 100px;">{{ row.ECD_DET_FECHA_VENCIMIENTO }}</td>
                    <td style="width: 90px;" class="text-end">${{ formatPrice(row.ECD_DET_MONTO_ORIGINAL) }}</td>
                    <td style="width: 90px;" class="text-end">${{ formatPrice(parseFloat(row.ECD_DET_SALDO_CLIENTE) - parseFloat(row.aplicar_monto_deposito)) }}</td>
                    <td style="width: 31px;" class="text-center">
                        <input type="checkbox" class="form-check-input" v-model="row.aplicar_todo_deposito" @change="aplicatodo(row)"/>
                    </td>
                    <td style="width: 120px;">
                      <input 
                        type="text" 
                        class="form-control text-end"
                        v-model="row.aplicar_monto_deposito"
                        @change="aplicaredeposito(row)"
                        @focus="encera(row)"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="row.observacion_deposito"
                      />
                    </td>
                  </tr>
                </template>
              </DatasetItem>
            </table>
            <div class="mt-2">
              <DatasetPager class=""/>
            </div>
          </Dataset>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 text-end">
         <input type="button" class="btn btn-primary" value="Enviar Depósito" @click="enviardeposito()"/>
        </div>
      </div>
    </div>
  </div>           
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import useVuelidate from "@vuelidate/core";
import {
  required,
  decimal,
} from "@vuelidate/validators";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { formatPrice, formatPrice4 } from "@/functions";
const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  dep_fecha: {
    minDate: Date.now(),
    maxDate: Date.now(),
    locale: Spanish,
  },
});

const cols = reactive([
  {
    name: "Factura",
    field: "ECD_DET_NUM_DOC",
    sort: "",
  },
  {
    name: "Fecha Emisión",
    field: "ECD_DET_FECHA_EMISION",
    sort: "",
  },
  {
    name: "Fecha Vencimiento",
    field: "ECD_DET_FECHA_VENCIMIENTO",
    sort: "",
  },
  {
    name: "Monto Original",
    field: "ECD_DET_MONTO_ORIGINAL",
    sort: "",
  },
  {
    name: "Monto Pendiente",
    field: "ECD_DET_SALDO_CLIENTE",
    sort: "",
  },
]);

// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

// On sort th click
function onSort(event, i) {
  let toset;
  const sortEl = cols[i];

  if (!event.shiftKey) {
    cols.forEach((o) => {
      if (o.field !== sortEl.field) {
        o.sort = "";
      }
    });
  }
  if (!sortEl.sort) {
    toset = "asc";
  }
  if (sortEl.sort === "desc") {
    toset = event.shiftKey ? "" : "asc";
  }
  if (sortEl.sort === "asc") {
    toset = "desc";
  }
  sortEl.sort = toset;
}



const store = useStore();
const cobranza = computed(() => store.state.cobranza);
const facturas = computed(() => store.state.facturas);
const bancos_tuval = computed(() => store.state.bancos_tuval);
const ingreso_deposito = computed(() => store.state.ingreso_deposito);

const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

var currentTime = new Date();
var startDateFrom = new Date(currentTime.getFullYear(),currentTime.getMonth(),1);
var d = new Date(today.getFullYear(), today.getMonth(), 0);

function selectDepositoTipo(){
  if(ingreso_deposito.value.tipo == 'DP'){
    flatPickrState.dep_fecha.minDate = startDateFrom;
    flatPickrState.dep_fecha.maxDate = currentTime;
  }else if(ingreso_deposito.value.tipo == 'DA'){
    flatPickrState.dep_fecha.minDate = null;
    flatPickrState.dep_fecha.maxDate = d;
  }else{
    flatPickrState.dep_fecha.minDate = null;
    flatPickrState.dep_fecha.maxDate = currentTime;
  }
}

function verifica(){
  ingreso_deposito.value.monto_original = 0;
}

function validaDeposito(){
  var error = false;
  cobranza.value.ingreso_depositos.map(deposito=>{
      if(bancos_tuval.value[ingreso_deposito.value.banco].CB_ID == deposito.banco && ingreso_deposito.value.dep_comprobante == deposito.dep_comprobante){
        error = true;
      }
    })

     if(error){
      ingreso_deposito.value.dep_comprobante = null,
      swalError('Este depósito ya fué ingresado previamente');
      return;
    }

     const consulta = reactive({
      deposito: ingreso_deposito.value.dep_comprobante,
      banco: bancos_tuval.value[ingreso_deposito.value.banco].CB_ID,
      cliente_id: store.state.currentClienteCobro.id,
    })

    store.dispatch('consultadeposito', consulta).then((res) => {
      if(res.existe){
        ingreso_deposito.value.dep_comprobante = null,
        swalError('Este depósito ya fué ingresado en el cobro '+res.cobro.numero_recibo);
        return;
      }
    })   
}


const rules = computed(() => {
  return {
    tipo: {
      required,
    },
    banco: {
      required,
    },
    monto: {
      required,
      decimal,
    },
    dep_comprobante: {
      required,
    },
    dep_fecha: {
      required,
    },
  };
});

const v$ = useVuelidate(rules, ingreso_deposito);

// On form submission
async function aplicar_deposito() {
  
  if(parseFloat(ingreso_deposito.value.monto) < 0){
    swalWarning('No se pueden ingresar valores negativos');
    ingreso_deposito.value.monto = '';
    return;
  }
  
  facturas.value.data.map(factura=>{
    factura.aplicar_todo_deposito = false;
    factura.aplicar_monto_deposito = 0;
  });

  

  store.commit('calculaSaldoFacturas');
  const result = await v$.value.$validate();
  
  if (!result) {
    // notify user form is invalid
    return;
  }
  ingreso_deposito.value.monto_original = ingreso_deposito.value.monto;
  ingreso_deposito.value.monto_no_aplicado = ingreso_deposito.value.monto;
  v$.value.$reset();
}

function aplicatodo(factura){
  //factura.aplicar_todo_deposito = false;
  if(factura.aplicar_todo_deposito == false){
    factura.aplicar_monto_deposito = 0;
    store.commit('calculaSaldoFacturas');
    return; 
  }
  
  if(parseFloat(ingreso_deposito.value.monto_no_aplicado) > parseFloat(factura.ECD_DET_SALDO_CLIENTE)){
      factura.aplicar_monto_deposito = formatPrice(factura.ECD_DET_SALDO_CLIENTE);
      store.commit('calculaSaldoFacturas');
  }else if(ingreso_deposito.value.monto_no_aplicado == 0){ 
      swalError('Ya no queda monto por aplicar');
      factura.aplicar_todo_deposito = false;
      return;
  }else{
      factura.aplicar_monto_deposito = formatPrice(ingreso_deposito.value.monto_no_aplicado);
      store.commit('calculaSaldoFacturas');
  }
}

function encera(factura){
  factura.aplicar_monto_deposito = 0;
  aplicaredeposito(factura);
}

function aplicaredeposito(factura){
  if(isNaN(factura.aplicar_monto_deposito)){
    
    swalError('Ingresar un número');
    store.commit('calculaSaldoFacturas');
    factura.aplicar_monto_deposito = 0;
    return false;
  }

  if(parseFloat(factura.aplicar_monto_deposito) < 0){
    swalWarning('No se pueden ingresar valores negativos');
    factura.aplicar_monto_deposito = 0;
    return false;
  }

  if(factura.aplicar_monto_deposito == ''){
    factura.aplicar_monto_deposito = 0;
  }
 
  if(parseFloat(factura.ECD_DET_SALDO_CLIENTE) < parseFloat(factura.aplicar_monto_deposito)){
    swalInfo('La cantidad ingresada es mayor al monto pendiente de la factura');
      factura.aplicar_monto_deposito = 0;
      factura.aplicar_todo_deposito = false;
      store.commit('calculaSaldoFacturas');
      return; 
  }
  
  if(parseFloat(factura.aplicar_monto_deposito) == 0){
      store.commit('calculaSaldoFacturas');
      factura.aplicar_todo_deposito = false;
  }else if(parseFloat(ingreso_deposito.value.monto_no_aplicado) >= parseFloat(factura.aplicar_monto_deposito)){
      store.commit('calculaSaldoFacturas');
      factura.aplicar_todo_deposito = true;
  }else if(ingreso_deposito.value.monto_no_aplicado == 0){ 
      swalError('Ya no queda monto por aplicar');
      factura.aplicar_monto_deposito = 0;
      factura.aplicar_todo_deposito = false;
      return;
  }else if(parseFloat(ingreso_deposito.value.monto_no_aplicado) < parseFloat(factura.aplicar_monto_deposito)){
      swalInfo('La cantidad ingresada es mayor al Monto Pendiente');
      factura.aplicar_monto_deposito = formatPrice(parseFloat(ingreso_deposito.value.monto_no_aplicado));
      factura.aplicar_todo_deposito = true;
      store.commit('calculaSaldoFacturas');
  }
  store.commit('calculaSaldoFacturas');
}

function enviardeposito(){

  ingreso_deposito.value.facturas = [];
  facturas.value.data.map(factura=>{
    if(factura.aplicar_monto_deposito > 0){
      const facturadeposito = reactive({
        ECD_DET_NUM_DOC: factura.ECD_DET_NUM_DOC,
        ECD_DET_FECHA_VENCIMIENTO: factura.ECD_DET_FECHA_VENCIMIENTO,
        ECD_DET_MONTO_ORIGINAL: factura.ECD_DET_MONTO_ORIGINAL,
        ECD_DET_SALDO_CLIENTE: formatPrice(factura.ECD_DET_SALDO_CLIENTE - factura.aplicar_monto_deposito),
        aplicar_monto_deposito: factura.aplicar_monto_deposito,
        observacion_deposito: factura.observacion_deposito,
      })
      ingreso_deposito.value.facturas.push(facturadeposito);
    }
  });
  ingreso_deposito.value.banco_nombre = bancos_tuval.value[ingreso_deposito.value.banco].CB_DESCRIPCION;
  ingreso_deposito.value.banco = bancos_tuval.value[ingreso_deposito.value.banco].CB_ID;
  

  cobranza.value.ingreso_depositos.push(ingreso_deposito.value);
  store.commit('enceraDeposito');
  store.commit('checkPermitePedido');
  const collapseDepositos = document.getElementById('collapseDepositos');
  new bootstrap.Collapse(collapseDepositos)
  const collapseResumen = document.getElementById('collapseResumen');
  new bootstrap.Collapse(collapseResumen)
}


let errorMsg = ref('');
const pedidos = computed(() => store.state.pedidos);

function rechazarpedido(cotizacion){
  swalSuccess('Pedido: '+cotizacion.pedido + ' rechazado')
}


</script>