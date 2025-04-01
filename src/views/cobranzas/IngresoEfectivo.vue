<template>
  <form @submit.prevent="aplicar_efectivo()">
    <div class="row">
      <div class="col-sm-10 offset-1">
        <table class="table table-bordered table-condensed">
          <thead>
            <tr>
              <th colspan="2">Ingreso de Efectivo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Efectivo recibido:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-usd"></i></span>
                      <input 
                        type="text" 
                        class="form-control text-end" 
                        v-model="ingreso_efectivo.efectivo_recibido"
                        :class="{
                          'is-invalid': v$.efectivo_recibido.$errors.length,
                        }"
                        @blur="v$.efectivo_recibido.$touch"
                        @keyup="verifica()"
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="efe_fecha">Fecha:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 155px;">
                        <input class="form-control fs-sm" id="efe_fecha" name="efe_fecha" :value="date" type="text" readonly="">
                        <span class="input-group-text"><i class="far fa-calendar"></i></span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-text-end v-align-m" colspan="2">
                <input type="submit" class="btn btn-primary" value="Aplicar" id="aplicar_efectivo"/>
              </td>
            </tr>
            <tr>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Monto a cobrar:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-usd"></i></span>
                      <input 
                        type="text" 
                        class="form-control text-end" 
                        v-model="ingreso_efectivo.monto"
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
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Vuelto:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-usd"></i></span>
                      <input 
                        type="text" 
                        class="form-control text-end" 
                        disabled="disabled"
                        :value="formatPrice(ingreso_efectivo.efectivo_recibido - ingreso_efectivo.monto)"
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </form>
  <div v-if="ingreso_efectivo.monto_original" class="row">
    <div class="col-sm-12">
      <div class="row">
        <div class="col-sm-6 offset-3"> 
          <table class="table table-bordered table-sm fs-sm">
            <thead>
              <tr>
                <th class="text-end">Monto original</th>
                <th class="text-end">${{ formatPrice(ingreso_efectivo.monto_original) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto no aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_efectivo.monto_no_aplicado) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_efectivo.monto_aplicado) }}</th>
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
                    <td style="width: 90px;" class="text-end">${{ formatPrice(row.ECD_DET_SALDO_CLIENTE) }}</td>
                    <td style="width: 31px;" class="text-center">
                        <input type="checkbox" class="form-check-input" v-model="row.aplicar_todo_efectivo" @change="aplicatodo(row)"/>
                    </td>
                    <td style="width: 120px;">
                      <input 
                        type="text" 
                        class="form-control text-end"
                        v-model="row.aplicar_monto_efectivo"
                        @change="aplicarefectivo(row)"
                        @focus="encera(row)"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="row.observacion_efectivo"
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
         <input type="button" class="btn btn-primary" value="Enviar Efectivo" @click="enviarefectivo()"/>
        </div>
      </div>
    </div>
  </div>           
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { formatPrice } from "@/functions";
import useVuelidate from "@vuelidate/core";
import {
  required,
  decimal,
} from "@vuelidate/validators";

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
const ingreso_efectivo = computed(() => store.state.ingreso_efectivo);
const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();


const rules = computed(() => {
  return {
    monto: {
      required,
      decimal,
    },
    efectivo_recibido: {
      decimal,
    },
  };
});

const v$ = useVuelidate(rules, ingreso_efectivo);

function verifica(){
  ingreso_efectivo.value.monto_original = 0;
}
// On form submission
async function aplicar_efectivo() {
  
  if(ingreso_efectivo.value.efectivo_recibido == '' || parseFloat(ingreso_efectivo.value.efectivo_recibido) < parseFloat(ingreso_efectivo.value.monto)){
    swalWarning('El efectivo recibido no puede ser menor al monto a cobrar');
    return;
  }

  if(parseFloat(ingreso_efectivo.value.efectivo_recibido) < 0 || parseFloat(ingreso_efectivo.value.monto) < 0){
    swalWarning('No se pueden ingresar valores negativos');

    ingreso_efectivo.value.efectivo_recibido = '';
    ingreso_efectivo.value.monto = '';
    return;
  }

  facturas.value.data.map(factura=>{
    factura.aplicar_todo_efectivo = false;
    factura.aplicar_monto_efectivo = 0;
  });

  store.commit('calculaSaldoFacturas');
  const result = await v$.value.$validate();
  
  if (!result) {
    // notify user form is invalid
    return;
  }
  ingreso_efectivo.value.monto_original = ingreso_efectivo.value.monto;
  ingreso_efectivo.value.monto_no_aplicado = ingreso_efectivo.value.monto;
  v$.value.$reset();
}

function aplicatodo(factura){
  //factura.aplicar_todo_efectivo = false;
  if(factura.aplicar_todo_efectivo == false){
    factura.aplicar_monto_efectivo = 0;
    store.commit('calculaSaldoFacturas');
    return; 
  }
  
  if(parseFloat(ingreso_efectivo.value.monto_no_aplicado) > parseFloat(factura.ECD_DET_SALDO_CLIENTE)){
      factura.aplicar_monto_efectivo = formatPrice(factura.ECD_DET_SALDO_CLIENTE);
      store.commit('calculaSaldoFacturas');
  }else if(ingreso_efectivo.value.monto_no_aplicado == 0){ 
      swalError('Ya no queda monto por aplicar');
      factura.aplicar_todo_efectivo = false;
      return;
  }else{
      factura.aplicar_monto_efectivo = formatPrice(ingreso_efectivo.value.monto_no_aplicado);
      store.commit('calculaSaldoFacturas');
  }
}
function encera(factura){
  factura.aplicar_monto_efectivo = 0;
  aplicarefectivo(factura);
}

function aplicarefectivo(factura){
  if(isNaN(factura.aplicar_monto_efectivo)){
    
    swalError('Ingresar un número');
    store.commit('calculaSaldoFacturas');
    factura.aplicar_monto_efectivo = 0;
    return false;
  }

  if(parseFloat(factura.aplicar_monto_efectivo) < 0){
    swalWarning('No se pueden ingresar valores negativos');
    factura.aplicar_monto_efectivo = 0;
    return false;
  }

  if(factura.aplicar_monto_deposito == ''){
    factura.aplicar_monto_deposito = 0;
  }

  if(parseFloat(factura.ECD_DET_SALDO_CLIENTE) < parseFloat(factura.aplicar_monto_efectivo)){
    swalInfo('La cantidad ingresada es mayor al monto pendiente de la factura');
      factura.aplicar_monto_efectivo = 0;
      factura.aplicar_todo_efectivo = false;
      store.commit('calculaSaldoFacturas');
      return;
  }
  
  if(parseFloat(factura.aplicar_monto_efectivo) == 0){
      store.commit('calculaSaldoFacturas');
      factura.aplicar_todo_efectivo = false;
  }else if(parseFloat(ingreso_efectivo.value.monto_no_aplicado) >= parseFloat(factura.aplicar_monto_efectivo)){
      store.commit('calculaSaldoFacturas');
      factura.aplicar_todo_efectivo = true;
      
  }else if(ingreso_efectivo.value.monto_no_aplicado == 0){ 
      swalError('Ya no queda monto por aplicar');
      factura.aplicar_monto_efectivo = 0;
      factura.aplicar_todo_efectivo = false;
      return;
  }else if(parseFloat(ingreso_efectivo.value.monto_no_aplicado) < parseFloat(factura.aplicar_monto_efectivo)){
      swalInfo('La cantidad ingresada es mayor al monto no aplicado');
      factura.aplicar_monto_efectivo = formatPrice(parseFloat(ingreso_efectivo.value.monto_no_aplicado));
      factura.aplicar_todo_efectivo = true;
      store.commit('calculaSaldoFacturas');
  }
  store.commit('calculaSaldoFacturas');
}

function enviarefectivo(){
  cobranza.value.ingreso_efectivo = ingreso_efectivo.value;
  cobranza.value.ingreso_efectivo.facturas = [];
  facturas.value.data.map(factura=>{
    if(factura.aplicar_monto_efectivo > 0){
      const facturaefectivo = reactive({
        ECD_DET_NUM_DOC: factura.ECD_DET_NUM_DOC,
        ECD_DET_FECHA_VENCIMIENTO: factura.ECD_DET_FECHA_VENCIMIENTO,
        ECD_DET_MONTO_ORIGINAL: factura.ECD_DET_MONTO_ORIGINAL,
        ECD_DET_SALDO_CLIENTE: factura.ECD_DET_SALDO_CLIENTE,
        aplicar_monto_efectivo: factura.aplicar_monto_efectivo,
        observacion_efectivo: factura.observacion_efectivo,
      })
      cobranza.value.ingreso_efectivo.facturas.push(facturaefectivo);
    }
  });
  store.commit('checkPermitePedido');

  const collapseEfectivo = document.getElementById('collapseEfectivo');
  new bootstrap.Collapse(collapseEfectivo)
  const collapseResumen = document.getElementById('collapseResumen');
  new bootstrap.Collapse(collapseResumen)
}

let errorMsg = ref('');
const pedidos = computed(() => store.state.pedidos);

function rechazarpedido(cotizacion){
  swalSuccess('Pedido: '+cotizacion.pedido + ' rechazado')
}


</script>