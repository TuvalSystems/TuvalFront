<template>
  <form @submit.prevent="onSubmit">
    <BaseBlock v-if="currentCliente" :title="'Nueva dirección para '+currentCliente.CLI_RAZON_SOCIAL+' '+currentCliente.CLI_RUC" class="mb-0">
      <template #options>
          <button
            type="button"
            class="btn-block-option"
            data-bs-dismiss="modal"
            aria-label="Close"
            >
            <i class="fa fa-fw fa-times"></i>
          </button>
        </template>
      <template #content>
        <div class="block-content fs-sm pb-4 space-y-2">
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_DIRECCION">Dirección</label>
            <div class="col-sm-9">
              <textarea
                  class="form-control"
                  id="input-CLI_SUC_DIRECCION"
                  v-model="nuevadireccion.CLI_SUC_DIRECCION"
                  placeholder="Dirección completa..."
                  :class="{
                    'is-invalid': v$.CLI_SUC_DIRECCION.$errors.length,
                  }"
                  @blur="v$.CLI_SUC_DIRECCION.$touch"
                  :maxlength="122"></textarea>
                <p
                  v-if="122 - nuevadireccion.CLI_SUC_DIRECCION.length == 0"
                  class="text-danger fs-sm bg-danger-light rounded p-2 mt-2 mb-0"
                >
                  máximo 122 caracteres
                </p>
            </div>
          </div>
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_CONTACTO">Contacto</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="input-CLI_SUC_CONTACTO" name="input-CLI_SUC_CONTACTO" placeholder="Contacto..." 
                v-model="nuevadireccion.CLI_SUC_CONTACTO"
                :class="{
                  'is-invalid': v$.CLI_SUC_CONTACTO.$errors.length,
                }"
                @blur="v$.CLI_SUC_CONTACTO.$touch"
                >
            </div>
          </div>
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_REFERENCIA">Referencia</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="input-CLI_SUC_REFERENCIA" name="input-CLI_SUC_REFERENCIA" placeholder="Referencia..." 
                v-model="nuevadireccion.CLI_SUC_REFERENCIA"
                :class="{
                  'is-invalid': v$.CLI_SUC_REFERENCIA.$errors.length,
                }"
                @blur="v$.CLI_SUC_REFERENCIA.$touch"
                >
            </div>
          </div>
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="select-CLI_SUC_TERRITORIO">Territorio</label>
            <div class="col-sm-9">
              <select
                class="form-select"
                id="select-CLI_SUC_TERRITORIO"
                name="select-CLI_SUC_TERRITORIO"
                v-model="nuevadireccion.CLI_SUC_TERRITORIO"
                :class="{
                  'is-invalid': v$.CLI_SUC_TERRITORIO.$errors.length,
                }"
                @blur="v$.CLI_SUC_TERRITORIO.$touch"
                > 
                <option
                  v-for="(territorio, index) in territorios" :key="index"
                  :value="territorio.TERRITORIO_CODIGO"
                  >{{territorio.TERRITORIO_DESCRIPCION}}</option>
              </select>
            </div>
          </div>
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_PROVINCIA">Provincia</label>
            <div class="col-sm-9" v-if="provincias_ciudades.length">
            <select
                class="form-select"
                id="select-CLI_SUC_PROVINCIA"
                name="select-CLI_SUC_PROVINCIA"
                v-model="nuevadireccion.CLI_SUC_PROVINCIA"
                :class="{
                  'is-invalid': v$.CLI_SUC_PROVINCIA.$errors.length,
                }"
                @blur="v$.CLI_SUC_PROVINCIA.$touch"
                > 
                <option
                  v-for="(provincia, index) in provincias_ciudades" :key="index"
                  :value="index"
                  >{{provincia.provincia}}</option>
              </select>
            </div>
          </div>
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_CIUDAD">Ciudad</label>
            <div class="col-sm-9">
              <select
                class="form-select"
                id="select-CLI_SUC_CIUDAD"
                name="select-CLI_SUC_CIUDAD"
                v-model="nuevadireccion.CLI_SUC_CIUDAD"
                v-if="nuevadireccion.CLI_SUC_PROVINCIA !== ''"
                :class="{
                  'is-invalid': v$.CLI_SUC_CIUDAD.$errors.length,
                }"
                @blur="v$.CLI_SUC_CIUDAD.$touch"
                > 
                <option
                  v-for="(ciudad, index) in provincias_ciudades[nuevadireccion.CLI_SUC_PROVINCIA].ciudades" :key="index"
                  :value="ciudad"
                  >{{ciudad}}</option>
              </select>
            </div>
          </div>
          
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_TELEFONO">Teléfono</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="input-CLI_SUC_TELEFONO" name="input-CLI_SUC_TELEFONO" placeholder="Teléfono..." 
                v-model="nuevadireccion.CLI_SUC_TELEFONO"
                >
            </div>
          </div>
          <div class="row">
            <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUC_CORREO_ELECTRONICO_SRI">Correo electrónico</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="input-CLI_SUC_CORREO_ELECTRONICO_SRI" name="input-CLI_SUC_CORREO_ELECTRONICO_SRI" placeholder="Correo electrónico..." 
                v-model="nuevadireccion.CLI_SUC_CORREO_ELECTRONICO_SRI"
                :class="{
                  'is-invalid': v$.CLI_SUC_CORREO_ELECTRONICO_SRI.$errors.length,
                }"
                @blur="v$.CLI_SUC_CORREO_ELECTRONICO_SRI.$touch"
                >
            </div>
          </div>
        </div>
      </template>
    </BaseBlock>
    <div class="block-content block-content-full text-end bg-body">
      <button  type="submit" class="btn btn-success btn-sm"><i class="fa fa-check"></i> Guardar</button>
      <button  type="button" class="btn btn-secondary btn-sm mx-2" data-bs-dismiss="modal"><i class="fa fa-times"></i> Cancelar</button>
    </div>
  </form>
</template>
<script setup>
import { ref, computed } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

import useVuelidate from "@vuelidate/core";
import {
  required,
  maxLength,
  email,
} from "@vuelidate/validators";



const store = useStore();
const currentCliente = computed(() => store.state.currentCliente);
const territorios = computed(() => store.state.territorios);
const provincias_ciudades = computed(() => store.state.provincias_ciudades);
const nuevadireccion = computed(() => store.state.nuevadireccion);

store.dispatch('territorios')

const rules = computed(() => {
  return {
    CLI_SUC_DIRECCION: {
      required,
      maxLength: maxLength(122),
    },
    CLI_SUC_CONTACTO: {
      required,
      maxLength: maxLength(61),
    },
    CLI_SUC_REFERENCIA: {
      required,
      maxLength: maxLength(100),
    },
    CLI_SUC_TERRITORIO: {
      required,
    },
    CLI_SUC_PROVINCIA: {
      required,
    },
    CLI_SUC_CIUDAD: {
      required,
    },
    CLI_SUC_CORREO_ELECTRONICO_SRI: {
      required,
      maxLength: maxLength(200),
    },
  };
});

// Use vuelidate
const v$ = useVuelidate(rules, nuevadireccion);

async function onSubmit() {
  const result = await v$.value.$validate();
  
  if (!result) {
    return;
  }
  
  nuevadireccion.value.CLI_SUC_PROVINCIA_NOMBRE = provincias_ciudades.value[nuevadireccion.value.CLI_SUC_PROVINCIA].provincia;

  store.dispatch('guardarDireccion', nuevadireccion.value).then((res) => {
      sessionStorage.setItem('CURRENTCLIENTE', JSON.stringify(res.data.cliente));
      store.commit('setCurrentcliente', res.data.cliente);
      emit('guardar');
  })
  .catch(err => {
      swalError(err.response.data.error)
  });
  
}



let errorMsg = ref('');

const emit = defineEmits(["guardar"]);

</script>