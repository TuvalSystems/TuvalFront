<template>
  <!-- Hero -->
  <BasePageHeading
    title="Lista de secciones"
    subtitle="Módulos y secciones accesibles para los usuarios"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Administracion</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Lista de secciones</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Secciones">
      <template #options>
        <div class="block-options-item">
          <button type="button" class="btn btn-success"  @click="crearseccion">Crear seccion</button>
        </div>
      </template>
      <p class="fs-sm text-muted">
        Lista de secciones para la administración del sistema
      </p>
      <div class="row items-push">
        <div class="col-md-6">
          <ul class="list-unstyled" style="width: 100%;">
            <li class="mb-1" v-for="(seccion, index) in sections.data" :key="`seccion-${index}`">
              <button class="btn btn-toggle align-items-center rounded collapsed boton-seccion" data-bs-toggle="collapse"
              :data-bs-target="`#seccion-${ seccion.id }`" aria-expanded="false" @click="selectseccion(seccion)"
              :id="`botonseccion-${ seccion.id }`"
              :class="{ 'selected': seccion.clicked }"
              >
                {{ seccion.name }}  <code> ({{ seccion.id }})</code>
              </button> 
              <div class="collapse" :id="`seccion-${ seccion.id }`" style="">
                <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                  <li v-for="(subseccion, indexsub) in seccion.sub" :key="`seccion-${indexsub}`">
                    <a class="link-dark rounded cursor-pointer boton-seccion" @click="selectseccion(subseccion)" 
                    :id="`botonseccion-${ subseccion.id }`"
                    :class="{ 'selected': subseccion.clicked }"
                    >{{ subseccion.name }} <code>({{ subseccion.id }})</code></a> 
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <div class="col-md-6">
          
          
          <BaseBlock title="Configuración" bordered v-if="serverResponse">
          <p v-if="errorMsg" class="alert alert-danger">{{errorMsg}}</p>
            <form @submit.prevent="onSubmit">
              <div class="row">
                <div class="col-lg-12 col-xl-12">
                  <div class="form-floating mb-4">
                     <input
                      type="hidden"
                      class="form-control"
                      id="id"
                      name="id"
                      
                      v-model="serverResponse.id"
                    />
                    <input
                      type="text"
                      class="form-control"
                      id="example-text-input-floating"
                      name="example-text-input-floating"
                      placeholder="Nombre"
                    
                      v-model="serverResponse.name"
                    />
                    <label for="example-text-input-floating">Nombre</label>
                  </div>
                  <div class="form-floating mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="url"
                      name="url"
                      placeholder="URL"
                     
                      v-model="serverResponse.url"
                    />
                    <label for="example-text-input-floating">URL</label>
                  </div>
                  <div class="form-floating mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="to"
                      name="to"
                      placeholder="to"
                      
                      v-model="serverResponse.to"
                    />
                    <label for="example-text-input-floating">Función</label>
                  </div>
                  <div class="form-floating mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="icon"
                      name="icon"
                      placeholder="icon"
                    
                      v-model="serverResponse.icon"
                    />
                    <label for="example-text-input-floating">Ícono</label>
                  </div>
                  
                  <div class="form-floating mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="parent_id"
                      name="parent_id"
                      placeholder="parent_id"
                     
                      v-model="serverResponse.parent_id"
                    />
                    <label for="example-text-input-floating">Padre</label>
                  </div>
                  <div class="form-floating mb-4">
                    <input
                      type="text"
                      class="form-control"
                      id="order"
                      name="order"
                      placeholder="order"
                     
                      v-model="serverResponse.order"
                    />
                    <label for="example-text-input-floating">Orden</label>
                  </div>
                  <div class="mb-4 d-md-flex justify-content-md-end">
                    <button type="button" v-on:click="guardarseccion" class="btn btn-primary ">Guardar</button>
                  </div>
                </div>
              </div>
            </form>
          </BaseBlock>
        </div>
      </div>
    </BaseBlock>
    <!-- END Full Table -->

    
  </div>
  <!-- END Page Content -->
</template>
<script setup>

import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex';
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";




const store = useStore();

const sections = computed(() => store.state.sections);
store.dispatch("getSecciones");


function selectseccion(seccion){
  errorMsg = ref('')
  serverResponse.value = seccion;
}


function crearseccion(){
  serverResponse.value = ref({
    id: "",
    url: "",
    name: "",
    icon: "",
    order: 0,
    parent_id: "",
    to: "",
  });
}


let serverResponse = ref('');

let errorMsg = ref('');
let doneMsg = ref('');

async function guardarseccion(ev) {
  ev.preventDefault();
  store.dispatch('updateseccion', serverResponse.value)
    .then((res) => {
      store.dispatch("getSecciones");
      swalSuccess(res.data.message)
    })
    .catch(err => {
      errorMsg.value = err.response.data.error
    });
}
</script>