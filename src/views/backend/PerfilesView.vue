<template>
  <!-- Hero -->
  <BasePageHeading title="Perfiles de usuario" subtitle="Administración de perfiles y accesos por usuario">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Administracion</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Perfiles de usuario</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <div class="row">
      <div class="col-md-6">
        <!-- Default Table -->
        <BaseBlock title="Lista de perfiles">

          <template #options>
            <div class="block-options-item">
              <button type="button" class="btn btn-success" @click="crearperfil">Crear perfil</button>
            </div>
          </template>
          <div class="table-responsive">
            <table class="table table-vcenter">
              <thead>
                <tr>
                  <th class="text-center" style="width: 50px">#</th>
                  <th>Nombre</th>
                  <th class="d-none d-sm-table-cell" style="width: 15%">
                    Estado
                  </th>
                  <th class="text-center" style="width: 100px">Herramientas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(perfil, index) in perfiles.data" :key="index">
                  <th class="text-center" scope="row">
                    {{ index + 1 }}
                  </th>
                  <td class="fw-semibold fs-sm">
                    <a href="javascript:void(0)">{{ perfil.name }}</a>
                  </td>
                  <td class="d-none d-sm-table-cell">
                    <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                      :class="perfil.state == 'active' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">
                      {{ perfil.state == 'active' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-alt-secondary" @click="editPerfil(perfil)">
                        <i class="fa fa-fw fa-pencil-alt"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-alt-secondary" @click="swalConfirm(perfil)">
                        <i class="fa fa-fw fa-times"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseBlock>
        <!-- END Default Table -->
      </div>
      <!-- END Full Table -->
      <div class="col-md-6">
        <BaseBlock :title="currentPerfil.name ? 'Editar Perfil' : 'Crear Perfil'" bordered v-if="currentPerfil">
          <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>
          <form @submit.prevent="onSubmit">
            <div class="row">
              <div class="col-lg-12 col-xl-12">
                <div class="form-floating mb-4">
                  <input type="hidden" class="form-control" id="id" name="id" v-model="currentPerfil.id" />
                  <input type="text" class="form-control" id="example-text-input-floating"
                    name="example-text-input-floating" placeholder="Nombre" v-model="currentPerfil.name" />
                  <label for="example-text-input-floating">Nombre</label>
                </div>
                <div class="form-floating mb-4">
                  <select class="form-select" id="example-select-floating" name="example-select-floating"
                    aria-label="Estado" v-model="currentPerfil.state">
                    <option v-for="option in optionstate" :key="option.id" :value="option.value"
                      :selected="option.value == currentPerfil.state">{{ option.name }}</option>
                  </select>
                  <label for="example-select-floating">Estado</label>
                </div>
                <div class="mb-4 d-md-flex justify-content-md-end">
                  <button type="button" v-on:click="guardarperfil" class="btn btn-primary ">Guardar</button>
                </div>
              </div>
            </div>
          </form>
        </BaseBlock>
      </div>
    </div>
    <div v-if="perfilPrevio" class="row">
      <div class="col-md-12">
        <BaseBlock :title="'Secciones del perfil ' + currentPerfil.name">

          <p class="fs-sm text-muted">
            Secciones a las que el usuario tiene permiso
          </p>

          <div class="row items-push">
            <div class="col-md-6">
              <ul class="list-unstyled" style="width: 100%;">
                <li class="mb-3" v-for="(seccion, index) in sections.data" :key="`seccion-${index}`">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value=""
                      :id="`botonseccion-${seccion.id}-${currentPerfil.id}`" name="example-checkbox-default1"
                      :checked="currentPerfil.sections[seccion.id]"
                      @change="selectseccionperfil(seccion.id, currentPerfil.id)" />
                    <label class="form-check-label" :for="`botonseccion-${seccion.id}-${currentPerfil.id}`">
                      {{ seccion.name }}
                    </label>
                  </div>
                  <ul v-if="seccion.sub" class="list-unstyled mx-4 mt-3" style="width: 100%;">
                    <li v-for="(subseccion, indexsub) in seccion.sub" :key="`seccion-${indexsub}`" class="mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" value=""
                          :id="`botonseccion-${subseccion.id}-${currentPerfil.id}`" name="example-checkbox-default1"
                          :checked="currentPerfil.sections[subseccion.id]"
                          @change="selectseccionperfil(subseccion.id, currentPerfil.id)" />
                        <label class="form-check-label" :for="`botonseccion-${subseccion.id}-${currentPerfil.id}`">
                          {{ subseccion.name }}</label>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </BaseBlock>
      </div>
    </div>
  </div>
  <!-- END Page Content -->
</template>
<script setup>

import { ref, computed } from "vue";
import { useStore } from 'vuex';
import { swalSuccess, toast } from "@/functions/swal-alert.js";



function swalConfirm(perfil) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "Si eliminas el perfil " + perfil.name + " no podrá ser recuperado",
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
        deletePerfil(perfil)
      }
    });
}


let errorMsg = ref('');

const currentPerfil = ref();
const perfilPrevio = ref(false);

function editPerfil(perfil) {
  perfilPrevio.value = true;
  errorMsg = ref('')
  currentPerfil.value = perfil;
}

const store = useStore();
const sections = computed(() => store.state.sections);

const perfiles = computed(() => store.state.perfiles);
store.dispatch("getPerfiles");

const optionstate = store.state.optionstate;



function deletePerfil(perfil) {
  store.dispatch("deletePerfil", perfil.id).then((res) => {
    swalSuccess(res.data.message)
  });
}

async function guardarperfil(ev) {
  ev.preventDefault();
  store.dispatch('updatePerfil', currentPerfil.value).then((res) => {
    swalSuccess(res.data.message)
  })
    .catch(err => {
      errorMsg.value = err.response.data.error
    });
}
function crearperfil() {
  perfilPrevio.value = false;
  currentPerfil.value = ref({
    id: null,
    name: "",
    state: "",
    sections: {},
  });
}

const dataperfil = ref();
function selectseccionperfil(seccion, perfil) {
  dataperfil.value = {
    section_id: seccion,
    perfil_id: perfil,
  };
  store.dispatch('updatePerfilSection', dataperfil.value)
    .catch(err => {
      errorMsg.value = err.response.data.error
    });
}













</script>
