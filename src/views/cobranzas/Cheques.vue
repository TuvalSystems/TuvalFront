<template>
  <form @submit.prevent="ingresar_cheque()">
    <div class="row">
      <div class="col-sm-10 offset-1">
        <table class="table table-bordered table-condensed fs-sm">
          <thead>
            <tr>
              <th colspan="3">Ingreso de Cheques</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-sm-4">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Banco:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <select 
                        id="banco" 
                        name="banco" 
                        class="form-select fs-sm"
                        v-model="ingreso_cheque.banco"
                       
                        :class="{
                          'is-invalid': v$.banco.$errors.length,
                        }"
                        @blur="v$.banco.$touch"
                        >
                           <option v-for="(banco, index) in bancos_cliente" :key="index"
                          :value="index"
                          >{{banco.CB_DESCRIPCION}}</option> 
                      </select>
                    </div>
                  </div>
                </div>
              </td>
              <td class="col-sm-4">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end nowrap" for="fecha_emision">F. emisión:</label>
                  <div class="col-sm-8">
                    <div class="input-group date" style="max-width: 155px;">
                      <span class="input-group-text"><i class="far fa-calendar"></i></span>
                      <input class="form-control fs-sm" id="fecha_emision" name="fecha_emision" v-model="ingreso_cheque.fecha_emision" type="text" readonly=""
                        :class="{
                          'is-invalid': v$.fecha_emision.$errors.length,
                        }"
                        @blur="v$.fecha_emision.$touch"
                      />
                        
                    </div>
                  </div>
                </div>
              </td>
              <td class="col-sm-4">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end nowrap" for="fecha_vencimiento">F. vencimiento:</label>
                  <div class="col-sm-8">
                    <div class="input-group date" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-calendar"></i></span>
                      <flat-pickr
                        id="fecha_vencimiento" 
                        name="fecha_vencimiento" 
                        class="form-control fs-sm"
                        placeholder="Y-m-d"
                        v-model="ingreso_cheque.fecha_vencimiento"
                        :config="flatPickrState.fecha_vencimiento"
                        :class="{
                          'is-invalid': v$.fecha_vencimiento.$errors.length,
                        }"
                        @blur="v$.fecha_vencimiento.$touch"
                      />
                        
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="cuenta">#Cuenta:</label>
                  <div class="col-sm-8">
                      <input 
                        type="text" 
                        name="cuenta" 
                        id="cuenta" 
                        v-model="ingreso_cheque.cuenta"
                        class="form-control fs-sm"
                        :class="{
                          'is-invalid': v$.cuenta.$errors.length,
                        }"
                        @blur="v$.cuenta.$touch"
                        style="max-width: 180px;"
                      />
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="cheque">#Cheque:</label>
                  <div class="col-sm-8">
                      <input 
                        type="text" 
                        name="cheque" 
                        id="cheque" 
                        v-model="ingreso_cheque.cheque"
                        class="form-control fs-sm"
                        :class="{
                          'is-invalid': v$.cheque.$errors.length,
                        }"
                        @blur="v$.cheque.$touch"
                        style="max-width: 180px;"
                        @change="validaCheque()"
                        
                      />
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
                        v-model="ingreso_cheque.monto"
                        :class="{
                          'is-invalid': v$.monto.$errors.length,
                        }"
                        @blur="v$.monto.$touch"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" >Comentario:</label>
                  <div class="col-sm-8">
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="ingreso_cheque.comentario"
                    />
                  </div>
                </div>
              </td>
              <td class="text-end v-align-m">
                <input type="submit" class="btn btn-primary" value="Ingresar cheque" id="ingresar_cheque"/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  </form>
  <div v-if="ingreso_cheque.cheques.length > 0" class="row">
    <div class="col-sm-12">
      <table class="table table-bordered table-sm fs-sm">
        <thead>
            <tr>
                <th colspan="8">Cheques</th>
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
            <th></th>
          </tr>

          <tr v-for="(cheque, index) in ingreso_cheque.cheques" :key="index">
            <td>{{ cheque.banco_nombre }}</td>
            <td>{{ cheque.cuenta }}</td>
            <td>{{ cheque.cheque }}</td>
            <td class="text-end">${{ cheque.monto }}</td>
            <td>{{ cheque.fecha_emision }}</td>
            <td>{{ cheque.fecha_vencimiento }}</td>
            <td>{{ cheque.comentario }}</td>
            <td><a class="pull-end pointer" @click="eliminarcheque(index)"><i class="fa fa-trash"></i></a></td>
          </tr>
          <tr>
            <th colspan="4" class="text-end">TOTAL </th>
            <th class="text-end">${{ ingreso_cheque.monto_original }}</th>
            <th colspan="3"></th>
          </tr>
        </tbody>
      </table>
      <div class="row">
        <div class="col-sm-6 offset-3"> 
          <table class="table table-bordered table-sm fs-sm">
            <thead>
              <tr>
                <th class="text-end">Monto original</th>
                <th class="text-end">${{ formatPrice(ingreso_cheque.monto_original) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto no aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_cheque.monto_no_aplicado) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_cheque.monto_aplicado) }}</th>
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
                    @click="onSort($event, index, cols)"
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
                    <td style="width: 90px;" class="text-end">${{ formatPrice(row.ECD_DET_SALDO_CLIENTE) }}</td>
                    <td style="width: 31px;" class="text-center">
                        <input type="checkbox" class="form-check-input" v-model="row.aplicar_todo_cheque" @change="aplicatodo(row)"/>
                    </td>
                    <td style="width: 120px;">
                      <input 
                        type="text" 
                        class="form-control text-end"
                        v-model="row.aplicar_monto_cheque"
                        @change="aplicarecheque(row)"
                        @focus="encera(row)"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="row.observacion_cheque"
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
         <input type="button" class="btn btn-primary" value="Enviar Cheques" @click="checkSaldoCheques()"/>
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
import { onSort, formatPrice } from '@/functions';
import {
  required,
  decimal,
  numeric,
} from "@vuelidate/validators";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"

const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  fecha_vencimiento: {
    minDate: Date.now(),
    locale: Spanish,
    monthSelectorType: "static",
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

const store = useStore();
const cobranza = computed(() => store.state.cobranza);
const facturas = computed(() => store.state.facturas);
const bancos_cliente = computed(() => store.state.bancos_cliente);
const ingreso_cheque = computed(() => store.state.ingreso_cheque);

const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
ingreso_cheque.value.fecha_emision = date;

var currentTime = new Date();
var startDateFrom = new Date(currentTime.getFullYear(),currentTime.getMonth(),1);
var d = new Date(today.getFullYear(), today.getMonth(), 0);




const rules = computed(() => {
  return {
    banco: {
      required,
    },
    cuenta: {
      required,
      numeric,
    },
    cheque: {
      required,
      numeric,
    },
    fecha_emision: {
      required,
    },
    fecha_vencimiento: {
      required,
    },
    monto: {
      required,
      decimal,
    },
  };
});

const v$ = useVuelidate(rules, ingreso_cheque);

// On form submission
async function ingresar_cheque() {
  if(parseFloat(ingreso_cheque.value.monto) < 0){
    swalWarning('No se pueden ingresar valores negativos');
    ingreso_cheque.value.monto = '';
    return;
  }

  facturas.value.data.map(factura=>{
    factura.aplicar_todo_cheque = false;
    factura.aplicar_monto_cheque = 0;
  });

  

  store.commit('calculaSaldoFacturas');
  const result = await v$.value.$validate();
  
  if (!result) {
    // notify user form is invalid
    return;
  }

  const cheque = reactive({
    banco: ingreso_cheque.value.banco,
    banco_nombre: bancos_cliente.value[ingreso_cheque.value.banco].CB_DESCRIPCION,
    banco_id: bancos_cliente.value[ingreso_cheque.value.banco].CB_ID,
    cuenta: ingreso_cheque.value.cuenta,
    cheque: ingreso_cheque.value.cheque,
    monto: formatPrice(ingreso_cheque.value.monto),
    fecha_emision: ingreso_cheque.value.fecha_emision,
    fecha_vencimiento: ingreso_cheque.value.fecha_vencimiento,
    comentario: ingreso_cheque.value.comentario,
  })
  ingreso_cheque.value.cheques.push(cheque);
  ingreso_cheque.value.banco = "";
  ingreso_cheque.value.cuenta = "";
  ingreso_cheque.value.cheque = "";
  ingreso_cheque.value.monto = "";
  ingreso_cheque.value.fecha_emision = date;
  ingreso_cheque.value.comentario = "";
  store.commit('calculaSaldoFacturas');
  v$.value.$reset();
}

function eliminarcheque(index){
  store.commit('eliminarCheque', index);
  store.commit('calculaSaldoFacturas');
}

function aplicatodo(factura){
  //factura.aplicar_todo_cheque = false;
  if(factura.aplicar_todo_cheque == false){
    factura.aplicar_monto_cheque = 0;
    store.commit('calculaSaldoFacturas');
    return; 
  }
  
  if(parseFloat(ingreso_cheque.value.monto_no_aplicado) > parseFloat(factura.ECD_DET_SALDO_CLIENTE)){
      factura.aplicar_monto_cheque = formatPrice(factura.ECD_DET_SALDO_CLIENTE);
      store.commit('calculaSaldoFacturas');
  }else if(ingreso_cheque.value.monto_no_aplicado == 0){ 
      swalError('Ya no queda monto por aplicar');
      factura.aplicar_todo_cheque = false;
      return;
  }else{
      factura.aplicar_monto_cheque = formatPrice(ingreso_cheque.value.monto_no_aplicado);
      store.commit('calculaSaldoFacturas');
  }
}

function encera(factura){
  factura.aplicar_monto_cheque = 0;
  aplicarecheque(factura);
}

function aplicarecheque(factura){
  if(isNaN(factura.aplicar_monto_cheque)){
    
    swalError('Ingresar un número');
    store.commit('calculaSaldoFacturas');
    factura.aplicar_monto_cheque = 0;
    return false;
  }

  if(parseFloat(factura.aplicar_monto_cheque) < 0){
    swalWarning('No se pueden ingresar valores negativos');
    factura.aplicar_monto_cheque = 0;
    return false;
  }
  
  if(factura.aplicar_monto_cheque == ''){
    factura.aplicar_monto_cheque = 0;
  }
 
  if(parseFloat(factura.ECD_DET_SALDO_CLIENTE) < parseFloat(factura.aplicar_monto_cheque)){
    swalInfo('La cantidad ingresada es mayor al monto pendiente de la factura');
      factura.aplicar_monto_cheque = 0;
      factura.aplicar_todo_cheque = false;
      store.commit('calculaSaldoFacturas');
      return; 
  }
  
  if(parseFloat(factura.aplicar_monto_cheque) == 0){
      store.commit('calculaSaldoFacturas');
      factura.aplicar_todo_cheque = false;
  }else if(parseFloat(ingreso_cheque.value.monto_no_aplicado) >= parseFloat(factura.aplicar_monto_cheque)){
      store.commit('calculaSaldoFacturas');
      factura.aplicar_todo_cheque = true;
  }else if(ingreso_cheque.value.monto_no_aplicado == 0){ 
      swalError('Ya no queda monto por aplicar');
      factura.aplicar_monto_cheque = 0;
      factura.aplicar_todo_cheque = false;
      return;
  }else if(parseFloat(ingreso_cheque.value.monto_no_aplicado) < parseFloat(factura.aplicar_monto_cheque)){
      swalInfo('La cantidad ingresada es mayor al Monto Pendiente');
      factura.aplicar_monto_cheque = formatPrice(parseFloat(ingreso_cheque.value.monto_no_aplicado));
      factura.aplicar_todo_cheque = true;
      store.commit('calculaSaldoFacturas');
  }
  store.commit('calculaSaldoFacturas');
  
}

function checkSaldoCheques(){
  if(parseFloat(ingreso_cheque.value.monto_no_aplicado) > 0){
    confirmenviarcheques()
  }else{
    enviarcheques()
  }
}

function confirmenviarcheques() {
  toast
    .fire({
      title: "Estás seguro?",
      text: "Existen cheques sin aplicar",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, enviar al resumen",
      cancelButtonText: "Cancelar",
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
        enviarcheques();
      }
    });
}


function enviarcheques(){

  ingreso_cheque.value.facturas = [];
  facturas.value.data.map(factura=>{
    if(factura.aplicar_monto_cheque > 0){
      const facturacheques = reactive({
        ECD_DET_NUM_DOC: factura.ECD_DET_NUM_DOC,
        ECD_DET_FECHA_VENCIMIENTO: factura.ECD_DET_FECHA_VENCIMIENTO,
        ECD_DET_MONTO_ORIGINAL: factura.ECD_DET_MONTO_ORIGINAL,
        ECD_DET_SALDO_CLIENTE: formatPrice(factura.ECD_DET_SALDO_CLIENTE),
        aplicar_monto_cheque: factura.aplicar_monto_cheque,
        observacion_cheque: factura.observacion_cheque,
      })
      ingreso_cheque.value.facturas.push(facturacheques);
    }
  });

  cobranza.value.ingreso_cheques = ingreso_cheque.value;
  store.commit('enceraCheque');
  store.commit('checkPermitePedido');
  const collapseCheques = document.getElementById('collapseCheques');
  new bootstrap.Collapse(collapseCheques)
  const collapseResumen = document.getElementById('collapseResumen');
  new bootstrap.Collapse(collapseResumen)
}

function validaCheque(){
  var error = false;
  ingreso_cheque.value.cheques.map(cheque=>{
      if(ingreso_cheque.value.cheque == cheque.cheque && ingreso_cheque.value.cuenta == cheque.cuenta){
        error = true;
      }
    })

    if(error){
      ingreso_cheque.value.cheque = null,
      swalError('Este cheque ya fué ingresado previamente');
      return;
    }

    const consulta = reactive({
      cheque: ingreso_cheque.value,
      cliente_id: store.state.currentClienteCobro.id,
    })

    store.dispatch('consultacheque', consulta).then((res) => {
      if(res.existe){
        ingreso_cheque.value.cheque = null,
        swalError('Este cheque ya fué ingresado en otro cobro');
        return;
      }
    }) 
}

let errorMsg = ref('');
const pedidos = computed(() => store.state.pedidos);

function rechazarpedido(cotizacion){
  swalSuccess('Pedido: '+cotizacion.pedido + ' rechazado')
}


</script>