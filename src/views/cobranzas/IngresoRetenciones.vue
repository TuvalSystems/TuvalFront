<template>
  <form @submit.prevent="onSubmit()">
    <table class="table table-striped table-sm fs-sm">
      <thead>
        <tr>
          <th colspan="4">Ingreso de Retención</th>
        </tr>
      </thead>
        <tbody>
          <tr>
            <td class="v-align-m text-end" colspan="2">
              <div class="row">
                
                <label class="col-sm-2 col-form-label text-end" for="ret_factura">Factura:</label>
                <div class="col-sm-9">
                  <div class="input-group" >
                    <VueSelect
                    style="width: calc(100% - 40px);"
                    v-model="ret_selected"
                    
                    :options="facturas_retenciones.data"
                    :reduce="(option) => option.ECD_DET_NUM_DOC"
                    placeholder="Buscar.."
                    label="ECD_DET_NUM_DOC"
                    ></VueSelect>
                    <button type="button" class="btn btn-sm btn-success" @click="selectFacturaBuscar(ret_selected)" style="width: 40px;"><i class="fa fa-upload"></i></button>
                  </div>
                </div>
                <input type="hidden" name="ret_factura" id="ret_factura" v-model="nuevaRetencion.ret_factura"/>
              </div>
            </td>
            <td class="v-align-m text-end">
              <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_fecha_emision">Emisión:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                        <span class="input-group-text"><i class="far fa-calendar"></i></span>
                        <input type="text" 
                          class="form-control text-end fs-sm" 
                          id="ret_fecha_emision" 
                          name="ret_fecha_emision" 
                          v-model="nuevaRetencion.ret_fecha_emision"
                          readonly=""
                        />
                    </div>
                  </div>
              </div>
            </td>
            <td class="v-align-m text-end">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_fecha_vencimiento">Vencimiento:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                        <span class="input-group-text"><i class="far fa-calendar"></i></span>
                        <input 
                          type="text" 
                          class="form-control text-end fs-sm" 
                          id="ret_fecha_vencimiento" 
                          name="ret_fecha_vencimiento" 
                          v-model="nuevaRetencion.ret_fecha_vencimiento"
                          readonly=""
                        />
                    </div>
                  </div>
                </div>
            </td>
            </tr>
            <tr>
              <td>
                <div class="row">
                    <label class="col-sm-4 col-form-label text-end" for="ret_subtotal_factura">Subtotal:</label>
                    <div class="col-sm-8">
                      <div class="input-group" style="max-width: 150px;">
                          <span class="input-group-text"><i class="far fa-usd"></i></span>
                          <input 
                            type="text" 
                            class="form-control text-end" 
                            id="ret_subtotal_factura" 
                            name="ret_subtotal_factura" 
                            v-model="nuevaRetencion.ret_subtotal_factura"
                            readonly=""
                          />
                      </div>
                    </div>  
                  </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_iva_factura">IVA:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                        <span class="input-group-text"><i class="far fa-usd"></i></span>
                        <input 
                          type="text" 
                          class="form-control text-end" 
                          id="ret_iva_factura" 
                          name="ret_iva_factura" 
                          v-model="nuevaRetencion.ret_iva_factura"
                          readonly=""
                        />
                    </div>
                  </div>  
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_original_factura">Total:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                        <span class="input-group-text"><i class="far fa-usd"></i></span>
                        <input 
                          type="text" 
                          class="form-control text-end" 
                          id="ret_original_factura" 
                          name="ret_original_factura" 
                          v-model="nuevaRetencion.ret_original_factura"
                          readonly=""
                        />
                    </div>
                  </div>  
                </div>
              </td>
              <td>
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_saldo_factura">Saldo:</label>
                  <div class="col-sm-8">
                    <div class="input-group" style="max-width: 150px;">
                        <span class="input-group-text"><i class="far fa-usd"></i></span>
                        <input 
                          type="text" 
                          class="form-control text-end" 
                          id="ret_saldo_factura" 
                          name="ret_saldo_factura" 
                          v-model="nuevaRetencion.ret_saldo_factura"
                          readonly=""
                        />
                    </div>
                  </div>  
                </div>
              </td>
            </tr>
            <tr>
              <td class="v-align-m text-end">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_emision">F. emisión:</label>
                  <div class="col-sm-8">
                    <div class="input-group date" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-calendar"></i></span>
                      <flat-pickr
                        id="ret_emision" 
                        name="ret_emision" 
                        class="form-control fs-sm"
                        placeholder="Y-m-d"
                        v-model="nuevaRetencion.ret_emision"
                        :config="flatPickrState.emision"
                        :class="{
                          'is-invalid': v$.ret_emision.$errors.length,
                        }"
                        @blur="v$.ret_emision.$touch"
                      />
                        
                    </div>
                  </div>
                </div>
              </td>
              <td colspan="3" class="v-align-m text-end">
                <div class="row">
                  <label class="col-sm-2 col-form-label text-end" for="ret_iva">Ret. IVA:</label>
                  <div class="col-sm-4">
                    <div class="row">
                      <div class="col-sm-5 px-0">
                        <div class="input-group" style="max-width: 100px;">
                            
                            <input 
                              type="text" 
                              class="form-control text-end" 
                              id="ret_porcentaje_iva" 
                              name="ret_porcentaje_iva" 
                              v-model="nuevaRetencion.ret_porcentaje_iva"
                              :class="{
                                'is-invalid': v$.ret_porcentaje_iva.$errors.length,
                              }"
                              @blur="v$.ret_porcentaje_iva.$touch"
                              @change="cambiaPorcentajeIva"
                            />
                            <span class="input-group-text">%</span>
                        </div>
                      </div>
                      <div class="col-sm-7 px-0">
                        <div class="input-group" style="max-width: 120px;">
                            <span class="input-group-text"><i class="far fa-usd"></i></span>
                            <input 
                              type="text" 
                              class="form-control text-end" 
                              id="ret_iva" 
                              name="ret_iva" 
                              v-model="nuevaRetencion.ret_iva"
                              :class="{
                                'is-invalid': v$.ret_iva.$errors.length,
                              }"
                              @blur="v$.ret_iva.$touch"
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                  <label class="col-sm-2 col-form-label text-end" for="ret_renta">Ret. Renta:</label>
                  <div class="col-sm-4">
                    <div class="row">
                      <div class="col-sm-5 px-0">
                        <div class="input-group" style="max-width: 100px;">
                            
                            <input 
                              type="text" 
                              class="form-control text-end" 
                              id="ret_porcentaje_renta" 
                              name="ret_porcentaje_renta" 
                              v-model="nuevaRetencion.ret_porcentaje_renta"
                              :class="{
                                'is-invalid': v$.ret_porcentaje_renta.$errors.length,
                              }"
                              @blur="v$.ret_porcentaje_renta.$touch"
                              @change="cambiaPorcentajeRenta"
                            />
                            <span class="input-group-text">%</span>
                        </div>
                      </div>
                      <div class="col-sm-7 px-0">
                        <div class="input-group" style="max-width: 120px;">
                          <span class="input-group-text"><i class="far fa-usd"></i></span>
                          <input 
                            type="text" 
                            class="form-control text-end required" 
                            id="ret_renta" 
                            name="ret_renta" 
                            v-model="nuevaRetencion.ret_renta"
                            :class="{
                              'is-invalid': v$.ret_renta.$errors.length,
                            }"
                            @blur="v$.ret_renta.$touch"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td>
              </td>
            </tr>
            <tr>
              <td class="v-align-m text-end">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_caducidad">F. caducidad:</label>
                  <div class="col-sm-8">
                    <div class="input-group date" style="max-width: 150px;">
                      <span class="input-group-text"><i class="far fa-calendar"></i></span>
                      <flat-pickr
                        id="ret_caducidad" 
                        name="ret_caducidad" 
                        class="form-control fs-sm"
                        placeholder="Y-m-d"
                        v-model="nuevaRetencion.ret_caducidad"
                        :config="flatPickrState.caducidad"
                        :class="{
                          'is-invalid': v$.ret_caducidad.$errors.length,
                        }"
                        @blur="v$.ret_caducidad.$touch"
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td colspan="3" class="v-align-m text-end">
                <div class="row">
                  <label class="col-sm-2 col-form-label text-end" for="ret_iva">Ret. IVA SRV:</label>
                  <div class="col-sm-4">
                    <div class="row">
                      <div class="col-sm-5 px-0">
                        <div class="input-group" style="max-width: 100px;">
                            
                            <input 
                              type="text" 
                              class="form-control text-end" 
                              id="ret_porcentaje_iva_srv" 
                              name="ret_porcentaje_iva_srv" 
                              v-model="nuevaRetencion.ret_porcentaje_iva_srv"
                              :class="{
                                'is-invalid': v$.ret_porcentaje_iva_srv.$errors.length,
                              }"
                              @blur="v$.ret_porcentaje_iva_srv.$touch"
                            />
                            <span class="input-group-text">%</span>
                        </div>
                      </div>
                      <div class="col-sm-7 px-0">
                        <div class="input-group" style="max-width: 120px;">
                            <span class="input-group-text"><i class="far fa-usd"></i></span>
                            <input 
                              type="text" 
                              class="form-control text-end" 
                              id="ret_iva" 
                              name="ret_iva" 
                              v-model="nuevaRetencion.ret_iva_srv"
                              :class="{
                                'is-invalid': v$.ret_iva_srv.$errors.length,
                              }"
                              @blur="v$.ret_iva_srv.$touch"
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                  <label class="col-sm-2 col-form-label text-end" for="ret_renta">Ret. Renta SRV:</label>
                  <div class="col-sm-4">
                    <div class="row">
                      <div class="col-sm-5 px-0">
                        <div class="input-group" style="max-width: 100px;">
                            
                            <input 
                              type="text" 
                              class="form-control text-end" 
                              id="ret_porcentaje_renta_srv" 
                              name="ret_porcentaje_renta_srv" 
                              v-model="nuevaRetencion.ret_porcentaje_renta_srv"
                              :class="{
                                'is-invalid': v$.ret_porcentaje_renta_srv.$errors.length,
                              }"
                              @blur="v$.ret_porcentaje_renta_srv.$touch"
                            />
                            <span class="input-group-text">%</span>
                        </div>
                      </div>
                      <div class="col-sm-7 px-0">
                        <div class="input-group" style="max-width: 120px;">
                          <span class="input-group-text"><i class="far fa-usd"></i></span>
                          <input 
                            type="text" 
                            class="form-control text-end required" 
                            id="ret_renta" 
                            name="ret_renta" 
                            v-model="nuevaRetencion.ret_renta_srv"
                            :class="{
                              'is-invalid': v$.ret_renta_srv.$errors.length,
                            }"
                            @blur="v$.ret_renta_srv.$touch"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td>
              </td>
            </tr>
            <tr>
              <td class="v-align-m text-end">
              </td>
              <td class="v-align-m text-end" colspan="2">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_comprobante">Número de comprobante:</label>
                  <div class="col-sm-8">
                      <input 
                        type="text" 
                        name="ret_comprobante" 
                        id="ret_comprobante" 
                        v-model="nuevaRetencion.ret_comprobante"
                        @change="checkComprobante()"
                        class="form-control" 
                        placeholder="" 
                        style="width: 400px;"
                        v-maska="'###-###-#########'"
                        :class="{
                          'is-invalid': v$.ret_comprobante.$errors.length,
                        }"
                        @blur="v$.ret_comprobante.$touch"
                      />
                  </div>
                </div>
              </td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td class="v-align-m text-end" colspan="2">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end" for="ret_autorizacion">Número de autorización:</label>
                  <div class="col-sm-8">
                    <input 
                      type="text" 
                      name="ret_autorizacion" 
                      id="ret_autorizacion"
                      v-model="nuevaRetencion.ret_autorizacion" 
                      class="form-control" 
                      placeholder="" 
                      style="width: 400px;"
                      :class="{
                            'is-invalid': v$.ret_autorizacion.$errors.length,
                          }"
                          @blur="v$.ret_autorizacion.$touch"
                    />
                  </div>
                </div>
              </td>
                <td class="text-center v-align-m">
                    <input type="submit" class="btn btn-primary" value="Ingresar" id="ingresar_retencion"/>
                </td>
            </tr>
        </tbody>
    </table>
  </form>
  <div class="row">
    <div class="col-sm-10 offset-1">
      <div class="table-responsive">
        <table class="table table-bordered table-condensed table-sm fs-sm" v-for="(retencion, index) in cobranza.retenciones" :key="index">   
          <tbody>
            <tr>
                <th colspan="5">Comprobante de Retención: {{ retencion.ret_comprobante }}</th>
                <th class="text-center"><button class="btn btn-warning btn-sm" @click="confirmeliminarretencion(index, retencion)"><i class="fa fa-trash"></i></button></th>
            </tr>
            <tr>
                <th>Comprobante</th>
                <th>Número</th>
                <th>Fecha Emisión</th>
                <th>Impuesto</th>
                <th class="text-end">% Retención</th>
                <th class="text-end">Valor Retenido</th>
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
                <td>{{ retencion.ret_emision }}</td>
                
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
                <td colspan="7" class="text-end"><b>Total Retenido ${{ formatPrice(retencion.total) }}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>           
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import useVuelidate from "@vuelidate/core";
import VueSelect from "vue-select";
import {
  required,
  maxLength,
  minLength,
  decimal,
} from "@vuelidate/validators";

import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { formatPrice, formatPrice4 } from "@/functions";
const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  emision: {
    minDate: Date.now(),
    maxDate: Date.now(),
    locale: Spanish,
  },
  caducidad: {
    minDate: Date.now(),
    locale: Spanish,
  },
});


const store = useStore();
const facturas_retenciones = computed(() => store.state.facturas_retenciones);
const nuevaRetencion = computed(() => store.state.nuevaRetencion);
const cobranza = computed(() => store.state.cobranza);
const ret_selected = ref(store.state.ret_selected);

function checkComprobante(){
  var error = false;
  cobranza.value.retenciones.map(retencion=>{
      if(nuevaRetencion.value.ret_comprobante == retencion.ret_comprobante){
        error = true;
      }
    })

    if(error){
      nuevaRetencion.value.ret_comprobante = null,
      swalError('Este comprobante ya fué ingresado previamente');
      return;
    }

    const consulta = reactive({
      comprobante: nuevaRetencion.value.ret_comprobante,
      cliente_id: store.state.currentClienteCobro.id,
    })

    store.dispatch('consultaretencion', consulta).then((res) => {
      if(res.existe){
        nuevaRetencion.value.ret_comprobante = null,
        swalError('Este comprobante ya fué ingresado en otro cobro');
        return;
      }
    })
}

function selectFacturaBuscar(ret_selected) {
  if(ret_selected){
    var factura = facturas_retenciones.value.data.find(item => item.ECD_DET_NUM_DOC === ret_selected);
    selectFacturaRetencion(factura);
  }else{
    store.commit('enceraRetencion');
  }
}

function selectFacturaRetencion(factura){
  v$.value.$reset();
    var error = false;
    cobranza.value.retenciones.map(retencion=>{
      if(factura.ECD_DET_NUM_DOC == retencion.ret_factura){
        error = true;
      }
    })
    
    if(error){
      ret_selected.value = null;
      store.commit('enceraRetencion');
      swalError('Esta factura ya tiene una retención ingresada');
      return;
    }

    var dt = new Date(factura.ECD_DET_FECHA_EMISION);
    var mesfactura = dt.getMonth();
    var anofactura = dt.getFullYear();
    var fechaActual = new Date();
    
    
    
    if(parseInt(fechaActual.getFullYear()) == parseInt(anofactura) && parseInt(fechaActual.getMonth()) == parseInt(mesfactura)){
        dt.setDate(dt.getDate() + 6);
    }else if((parseInt(fechaActual.getMonth())-1) == parseInt(mesfactura) && parseInt(fechaActual.getFullYear()) == parseInt(anofactura)){
        var x = new Date();
        var primerdiadelmesactual = new Date(x.getFullYear(), x.getMonth(), 1);
        primerdiadelmesactual.setDate(primerdiadelmesactual.getDate() + 4);
        dt = primerdiadelmesactual;
    }else if(parseInt(fechaActual.getFullYear() - 1) == parseInt(anofactura) && mesfactura == 11){
        var x = new Date();
        var primerdiadelmesactual = new Date(x.getFullYear(), x.getMonth(), 1);
        primerdiadelmesactual.setDate(primerdiadelmesactual.getDate() + 30); //4
        dt = primerdiadelmesactual;
    }else{
      ret_selected.value = null;
      store.commit('enceraRetencion');
        swalError('No puede ingresar una retención de hace más de un mes');
        return;
    }
    //factura.index = event.target.value;
    store.commit('asignaRetencion',factura);
    flatPickrState.emision.minDate = Date.parse(factura.ECD_DET_FECHA_EMISION);
    flatPickrState.emision.maxDate = dt;
    flatPickrState.caducidad.minDate = Date.parse(factura.ECD_DET_FECHA_EMISION);
    
}

const rules = computed(() => {
  return {
    ret_emision: {
      required,
    },
    ret_iva: {
      required,
      decimal,
    },
    ret_renta: {
      required,
      decimal,
    },
    ret_caducidad: {
      required,
    },
    ret_comprobante: {
      required,
      minLength: minLength(17),
    },
    ret_autorizacion: {
      required,
      minLength: minLength(10),
    },
    ret_porcentaje_iva: {
      required,
      decimal,
    },
    ret_porcentaje_renta: {
      required,
      decimal,
    },
    ret_iva_srv: {
      decimal,
    },
    ret_renta_srv: {
      decimal,
    },
    ret_porcentaje_iva_srv: {
      decimal,
    },
    ret_porcentaje_renta_srv: {
      decimal,
    },
  };
});

const v$ = useVuelidate(rules, nuevaRetencion);

// On form submission
async function onSubmit() {
  
  const result = await v$.value.$validate();
  
  if (!result) {
    // notify user form is invalid
    return;
  }
  
  if (nuevaRetencion.value.ret_autorizacion.length != 10 && nuevaRetencion.value.ret_autorizacion.length != 49) {
      swalError("El número de autorización debe ser de 10 caracteres en caso de ser física y de 49 caracteres en caso de se electrónica");
      return false;
  }

  if(!nuevaRetencion.value.ret_iva_srv){
    nuevaRetencion.value.ret_iva_srv = 0;
  }
  if(!nuevaRetencion.value.ret_renta_srv){
    nuevaRetencion.value.ret_renta_srv = 0;
  }
  
  nuevaRetencion.value.total = formatPrice(parseFloat(nuevaRetencion.value.ret_iva) + parseFloat(nuevaRetencion.value.ret_iva_srv) + parseFloat(nuevaRetencion.value.ret_renta) + parseFloat(nuevaRetencion.value.ret_renta_srv));

  cobranza.value.retenciones.push(nuevaRetencion.value);
  v$.value.$reset();
  ret_selected.value = null;
  store.commit('enceraRetencion');
  store.commit('calculaSaldoFacturas');

  const collapseRetenciones = document.getElementById('collapseRetenciones');
  new bootstrap.Collapse(collapseRetenciones)
  const collapseResumen = document.getElementById('collapseResumen');
  new bootstrap.Collapse(collapseResumen)

}

function cambiaPorcentajeIva(){
  nuevaRetencion.value.ret_iva = formatPrice(nuevaRetencion.value.ret_iva_factura * (nuevaRetencion.value.ret_porcentaje_iva / 100));
}
function cambiaPorcentajeRenta(){
  nuevaRetencion.value.ret_renta = formatPrice(nuevaRetencion.value.ret_subtotal_factura * (nuevaRetencion.value.ret_porcentaje_renta / 100));
}
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
}

</script>