<template>
  <BaseBlock :title="vehiculo.id ? 'Editar Vehículo':'Nuevo Vehículo'" class="mb-0">
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
              v-model="vehiculo.nombre"
              :class="{
                'is-invalid': v$.nombre.$errors.length,
              }"
              @blur="v$.nombre.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="marca">Marca</label>
          <div class="col-sm-9">
            <input
              type="text"
              class="form-control"
              id="marca"
              v-model="vehiculo.marca"
              :class="{
                'is-invalid': v$.marca.$errors.length,
              }"
              @blur="v$.marca.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="modelo">Modelo</label>
          <div class="col-sm-9">
            <input
              type="text"
              class="form-control"
              id="modelo"
              v-model="vehiculo.modelo"
              :class="{
                'is-invalid': v$.modelo.$errors.length,
              }"
              @blur="v$.modelo.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="placa">Placa</label>
          <div class="col-sm-9">
            <input
              type="text"
              class="form-control"
              id="placa"
              v-model="vehiculo.placa"
              :class="{
                'is-invalid': v$.placa.$errors.length,
              }"
              @blur="v$.placa.$touch"
            />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="transportista_id">Transportista asignado</label>
          <div class="col-sm-9">
            <select
              class="form-select"
              id="transportista_id"
              name="transportista_id"
              aria-label="Transportista"
              v-model="vehiculo.transportista_id"
              > 
              <option
                v-for="transportista in transportistas" :key="vehiculo.id"
                :value="transportista.id"
                >{{ transportista.nombre }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="block-content block-content-full text-end ">
        <button  type="button" class="btn btn-secondary btn-sm mx-2" data-bs-dismiss="modal"><i class="fa fa-times"></i> Cancelar</button>
        <button  type="button" class="btn btn-success btn-sm" @click="guardarVehiculo()"><i class="fa fa-check"></i> Guardar</button>
      </div>
    </template>
  </BaseBlock>
</template>
<script setup>
import { computed } from "vue";
import { useStore} from 'vuex'
import useVuelidate from "@vuelidate/core";
import {
  required,
  maxLength,
} from "@vuelidate/validators";

const store = useStore();
const vehiculo = computed(() => store.state.vehiculo);
const transportistas = computed(() => store.state.transportistas);
const emit = defineEmits(["guardarVehiculo"]);

const rules = computed(() => {
  return {
    nombre: {
      required,
      maxLength: maxLength(200),
    },
    marca: {
      required,
      maxLength: maxLength(50),
    },
    modelo: {
      required,
      maxLength: maxLength(50),
    },
    placa: {
      required,
      maxLength: maxLength(10),
    },
  };
});

const v$ = useVuelidate(rules, vehiculo);

async function guardarVehiculo(){

  const result = await v$.value.$validate();
  
  if (!result) {
    return;
  }

  emit('guardarVehiculo');
}
</script>