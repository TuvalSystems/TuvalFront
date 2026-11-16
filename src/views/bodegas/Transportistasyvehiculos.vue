<template>
  <!-- Hero -->
  <BasePageHeading
    title="Transportistas y Vehículos"
    subtitle="Lista de pendientes"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Transportistas y Vehículos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero --> 

   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <div class="row items-push">
      
      <div class="col-sm-6">
        <BaseBlock title="Vehículos" class="d-flex flex-column h-100 mb-0">
          <template #options>
            <button type="button" class="btn btn-sm btn-primary" @click="crearVehiculo">Nuevo Vehículo</button>
          </template>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Placa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(vehiculo, index) in vehiculos" :key="index">
                <td>{{ vehiculo.nombre }}</td>
                <td>{{ vehiculo.marca }}</td>
                <td>{{ vehiculo.modelo }}</td>
                <td>{{ vehiculo.placa }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-secondary" @click="editVehiculo(vehiculo)"> Editar</button>
                  <button class="btn btn-sm btn-outline-secondary mx-1" @click="confirmeliminarVehiculo(vehiculo)"> Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </BaseBlock>
      </div>
      <div class="col-sm-6">
        <BaseBlock title="Transportistas" class="d-flex flex-column h-100 mb-0">
          <template #options>
            <button type="button" class="btn btn-sm btn-primary" @click="crearTransportista">Nuevo Transportista</button>
          </template>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Identificacion</th>
                <th>Tipo Licencia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(chofer, index) in transportistas" :key="index">
                <td>{{ chofer.nombre }}</td>
                <td>{{ chofer.identificacion }}</td>
                <td>{{ chofer.tipo_licencia }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-secondary mx-1" @click="editTransportista(chofer)"> Editar</button>
                  <button class="btn btn-sm btn-outline-secondary mx-1" @click="confirmeliminarTransportista(chofer)"> Eliminar</button>
                  
                </td>
              </tr>
            </tbody>
          </table>
        </BaseBlock>
      </div>
    </div>
    <!-- END Full Table -->
  </div>
  <div
    class="modal"
    id="modal-transportista"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-transportista"
    aria-hidden="true"
    ref="transportistaModal"
    >
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <Transportista
          @guardarTransportista="onguardarTransportista()"
          ></Transportista>
      </div>
    </div>
  </div> 
  <div
    class="modal"
    id="modal-vehiculo"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-vehiculo"
    aria-hidden="true"
    ref="vehiculoModal"
    >
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <Vehiculo
          @guardarVehiculo="onguardarVehiculo()"
          ></Vehiculo>
      </div>
    </div>
  </div> 
</template>
<script setup>
import { ref, computed, onMounted  } from "vue";
import { useStore} from 'vuex'
import { swalSuccess, swalError, toast } from "@/functions/swal-alert.js";
import { Modal } from "bootstrap";
import Transportista from "./modals/Transportista.vue"
import Vehiculo from "./modals/Vehiculo.vue"


const store = useStore();
const transportistas = computed(() => store.state.transportistas);
const transportista = computed(() => store.state.transportista);
const vehiculos = computed(() => store.state.vehiculos);
const vehiculo = computed(() => store.state.vehiculo);


let transportistaModal= ref(null);
let transportistaModalObj = null;
let vehiculoModal= ref(null);
let vehiculoModalObj = null;

store.dispatch('getTransportistas');

function crearTransportista(){
  store.commit('resetTransportista')
  transportistaModalObj.show();
}

function editTransportista(transportista){
  store.commit('setTransportista', transportista)
  transportistaModalObj.show();
}

function confirmeliminarTransportista(chofer) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar al transportista "+chofer.nombre +"",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, eliminarlo",
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
        eliminarTransportista(chofer.id);
      }
    });
}

function eliminarTransportista(id){
  store.dispatch('deleteTransportista', id).then((res) => {
    swalSuccess(res.data.message)
  })
  .catch(err => {
    swalError(err.response.data.message)
  });
}

function confirmeliminarVehiculo(vehiculo) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar al vehiculo "+vehiculo.nombre +"",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, eliminarlo",
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
        eliminarVehiculo(vehiculo.id);
      }
    });
}

function eliminarVehiculo(id){
  store.dispatch('deleteVehiculo', id).then((res) => {
    swalSuccess(res.data.message)
  })
  .catch(err => {
    swalError(err.response.data.message)
  });
}

function onguardarTransportista(){
  transportistaModalObj.hide();
  store.dispatch('saveTransportista', transportista.value).then((res) => {
    swalSuccess(res.data.message)
  })
  .catch(err => {
    swalError(err.response.data.message)
  });
}

function crearVehiculo(){
  store.commit('resetVehiculo')
  vehiculoModalObj.show();
}

function editVehiculo(vehiculo){
  store.commit('setVehiculo', vehiculo)
  vehiculoModalObj.show();
}

function onguardarVehiculo(){
  vehiculoModalObj.hide();
  store.dispatch('saveVehiculo', vehiculo.value).then((res) => {
    swalSuccess(res.data.message)
  })
  .catch(err => {
    swalError(err.response.data.message)
  });
}

onMounted(() => {
  transportistaModalObj = new Modal(transportistaModal.value, {
    focus: false
  });
  vehiculoModalObj = new Modal(vehiculoModal.value, {
    focus: false
  });
});
</script>
