<template>
  <BaseBlock :title="transportista.id ? 'Editar Transportista':'Nuevo Transportista'" class="mb-0">
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
      <div class="block-content fs-sm ">
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="nombre">Nombre</label>
          <div class="col-sm-9">
            <input
              type="text"
              class="form-control"
              id="nombre"
              v-model="transportista.nombre"
              :class="{
                'is-invalid': v$.nombre.$errors.length,
              }"
              @blur="v$.nombre.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="tipo_identificacion"
            >Tipo identificacion</label
          >
          <div class="col-sm-9">
            <select
              class="form-select"
              v-model="transportista.tipo_identificacion"
              id="tipo_identificacion"
              :class="{
                'is-invalid': v$.tipo_identificacion.$errors.length,
              }"
              @blur="v$.tipo_identificacion.$touch"
              >
              <option value="04">RUC</option>
              <option value="05">Cédula</option>
              <option value="06">Pasaporte</option>
            </select>
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="identificacion"># Identificacion</label>
          <div class="col-sm-9">
            <input
              type="text"
              class="form-control"
              id="identificacion"
              v-model="transportista.identificacion"
              :class="{
                'is-invalid': v$.identificacion.$errors.length,
              }"
              @blur="v$.identificacion.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="tipo_licencia">Tipo Licencia</label>
          <div class="col-sm-9">
            <select
              class="form-select"
              v-model="transportista.tipo_licencia"
              id="tipo_licencia"
              :class="{
                'is-invalid': v$.tipo_licencia.$errors.length,
              }"
              @blur="v$.tipo_licencia.$touch"
              >
              <option value="Tipo A">Tipo A</option>
              <option value="Tipo B">Tipo B</option>
              <option value="Tipo C">Tipo C</option>
              <option value="Tipo E">Tipo E</option>
            </select>
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="telefono">Teléfono</label>
          <div class="col-sm-9">
            <input
              type="text"
              class="form-control"
              id="telefono"
              v-model="transportista.telefono"
              :class="{
                'is-invalid': v$.telefono.$errors.length,
              }"
              @blur="v$.telefono.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="telefono">Dirección</label>
          <div class="col-sm-9">
            <textarea class="form-control"
              id="telefono"
              v-model="transportista.direccion"
              :class="{
                'is-invalid': v$.direccion.$errors.length,
              }"
              @blur="v$.direccion.$touch"
              ></textarea>
          </div>
        </div>
        
      </div>
      <div class="block-content block-content-full text-end ">
        <button  type="button" class="btn btn-secondary btn-sm mx-2" data-bs-dismiss="modal"><i class="fa fa-times"></i> Cancelar</button>
        <button  type="button" class="btn btn-success btn-sm" @click="guardarTransportista()"><i class="fa fa-check"></i> Guardar</button>
      </div>
    </template>
  </BaseBlock>
</template>
<script setup>
import { computed } from "vue";
import { useStore} from 'vuex';
import useVuelidate from "@vuelidate/core";
import {
  required,
  maxLength,
} from "@vuelidate/validators";

const store = useStore();
const transportista = computed(() => store.state.transportista);
const vehiculos = computed(() => store.state.vehiculos);
const emit = defineEmits(["guardarTransportista"]);

const rules = computed(() => {
  return {
    nombre: {
      required,
      maxLength: maxLength(300),
    },
    tipo_identificacion: {
      required,
    },
    identificacion: {
      required,
      maxLength: maxLength(20),
    },
    tipo_licencia: {
      required,
    },
    direccion: {
      required,
      maxLength: maxLength(300),
    },
    telefono: {
      required,
      maxLength: maxLength(20),
    },
  };
});

const v$ = useVuelidate(rules, transportista);

async function guardarTransportista(){

  const result = await v$.value.$validate();
  
  if (!result) {
    return;
  }

  emit('guardarTransportista')
}
</script>