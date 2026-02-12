<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useStore } from "vuex";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
import { useGetSegmentClients } from "@/composables/venta/cotizaciones/useGetSegmentClients";
import useVuelidate from "@vuelidate/core";
import { required, maxLength, email } from "@vuelidate/validators";

const store = useStore();
const templateStore = useTemplateStore();
const territorios = computed(() => store.state.territorios);
const provincias_ciudades = computed(() => store.state.provincias_ciudades);
const grupos_subgrupos = computed(() => store.state.grupos_subgrupos);
const nuevoCliente = computed(() => store.state.nuevoCliente);
const cotizacion_id = ref(store.state.cotizacion_id);
const router = useRouter();
const {
  segmentos,
  subsegmentos,
  loadingSegmentos,
  loadingSubSegmentos,
  fetchSegmentos,
  fetchSubSegmentos,
} = useGetSegmentClients();

store.dispatch("territorios");

const tipos = reactive([
  { tipo: "04", nombre: "RUC" },
  { tipo: "05", nombre: "CÉDULA" },
  { tipo: "06", nombre: "PASAPORTE" },
  { tipo: "08", nombre: "IDENTIFICACIÓN DEL EXTERIOR" },
]);

const rules = computed(() => {
  return {
    CLI_RUC: {
      required,
      maxLength: maxLength(15),
    },
    CLI_RAZON_SOCIAL: {
      required,
      maxLength: maxLength(65),
    },
    CLI_NOMBRE_CORTO: {
      required,
      maxLength: maxLength(30),
    },
    CLI_CONTACTO: {
      required,
      maxLength: maxLength(30),
    },
    CLI_DIRECCION: {
      required,
      maxLength: maxLength(122),
    },
    CLI_TERRITORIO: {
      required,
    },
    CLI_PROVINCIA: {
      required,
    },
    CLI_CIUDAD: {
      required,
    },
    CLI_TELEFONO_1: {
      required,
      maxLength: maxLength(21),
    },
    CLI_TELEFONO_2: {
      maxLength: maxLength(21),
    },
    CLI_TELEFONO_3: {
      maxLength: maxLength(21),
    },
    CLI_TELEFONO_4: {
      maxLength: maxLength(21),
    },
    CLI_CORREO_ELECT_SRI: {
      required,
      email,
      maxLength: maxLength(200),
    },
    CLI_CORREO_ELECT_NOTIFICACION_INTERNA: {
      //email,
      maxLength: maxLength(200),
    },
    CLI_SEGMENTO_ID: {
      required,
    },
    CLI_SUBSEGMENTO_ID: {
      required,
    },
  };
});

// Use vuelidate
const v$ = useVuelidate(rules, nuevoCliente);

let noprospecto = ref(true);

function checkRuc() {
  if (
    nuevoCliente.value.CLI_TIPO_ID === "04" &&
    nuevoCliente.value.CLI_RUC.length !== 13
  ) {
    swalError("El RUC debe tener 13 dígitos");
    return;
  }
  if (
    nuevoCliente.value.CLI_TIPO_ID === "05" &&
    nuevoCliente.value.CLI_RUC.length !== 10
  ) {
    swalError("La CÉDULA debe tener 10 dígitos");
    return;
  }

  store
    .dispatch("checkRucProspecto", nuevoCliente.value)
    .then((res) => {
      if (res.prospecto) {
        nuevoCliente.value.CLI_RAZON_SOCIAL = res.prospecto.CLI_RAZON_SOCIAL;
        nuevoCliente.value.CLI_CORREO_ELECT_SRI =
          res.prospecto.CLI_CORREO_ELECT_SRI;
        nuevoCliente.value.CLI_DIRECCION = res.prospecto.CLI_DIRECCION;
        nuevoCliente.value.CLI_TELEFONO_1 = res.prospecto.CLI_TELEFONO_1;
      } else if (res.cliente) {
        confirmCliente(res.cliente);
      } else {
        return;
      }
    })
    .catch((err) => {
      swalError(err.response.data.error);
    });
}

function confirmCliente(cliente) {
  swalInfo(
    "El cliente " +
    cliente.CLI_RAZON_SOCIAL +
    " ya existe, se ha cargado la ventana de pedido regular"
  );
  cargarCliente(cliente);
}

function cargarCliente(cliente) {
  store.commit("setCurrentcliente", cliente);
  store.commit("setCurrentSucursal", cliente.sucursales[0].id);
  setTimeout(() => {
    location.href = "/ventas/crearcotizacion";
  }, 1000);
}

async function onSubmit() {
  const result = await v$.value.$validate();

  if (
    nuevoCliente.value.CLI_TIPO_ID === "04" &&
    nuevoCliente.value.CLI_RUC.length !== 13
  ) {
    swalError("El RUC debe tener 13 dígitos");
    return;
  }
  if (
    nuevoCliente.value.CLI_TIPO_ID === "05" &&
    nuevoCliente.value.CLI_RUC.length !== 10
  ) {
    swalError("La CÉDULA debe tener 10 dígitos");
    return;
  }

  if (!result) {
    return;
  }

  templateStore.pageLoader({ mode: "on" });
  nuevoCliente.value.CLI_PROVINCIA_NOMBRE =
    provincias_ciudades.value[nuevoCliente.value.CLI_PROVINCIA].provincia;
  nuevoCliente.value.CLI_GRUPO_NOMBRE = "";


  if (nuevoCliente.value.CLI_GRUPO)
    nuevoCliente.value.CLI_GRUPO_NOMBRE =
      grupos_subgrupos.value[nuevoCliente.value.CLI_GRUPO].GRUPO_CODIGO;

  try {
    // 4. Guarda cliente
    const res = await store.dispatch('guardarCliente', { ...nuevoCliente.value })

    // 5. Actualiza sesión y estado
    const cliente = res.data

    sessionStorage.setItem('CURRENTCLIENTE', JSON.stringify(cliente))
    store.commit('setCurrentcliente', cliente)
    // 6. llena prospecto si aplica
    if (store.state.cotizacion_serial) {
      noprospecto.value = false
      // Usa un objeto plano; el action debe hacer commit antes de resolverse
      const payloadProspecto = {
        cliente_id: cliente.id,
        PTO_VTA_ID: store.state.puntodeventaselect,
        id: store.state.cotizacion_id,
      }

      await store.dispatch('llenarcotizacionProspecto', payloadProspecto)
    }
    // 7. Apaga loader y redirige
    templateStore.pageLoader({ mode: 'off' })

    // console.log('Navegando a crear cotización…')
    await router.push({ name: 'ventas-crearcotizacion' })
    // console.log('¡Redirección completada!')

  } catch (error) {
    templateStore.pageLoader({ mode: 'off' })

    if (error.name === 'NavigationDuplicated') {
      console.log('Ya estabas en ventas-crearcotizacion, nada mal.')
    } else {
      // console.error('Error en onSubmit:', error)
      swalError(error.response?.data?.error || error.message)
    }
  }
}

let errorMsg = ref("");

onMounted(() => {
  fetchSegmentos();
}),
  onBeforeUnmount(() => {
    if (noprospecto) {
      store.commit("resetNuevoCliente");
      store.commit("resetCotizacion");
    }
  });
</script>
<template>
  <!-- Hero -->
  <BasePageHeading title="Crear Cliente">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Crear Cliente</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <BaseBlock title="Crear cliente" content-full>
      <form @submit.prevent="onSubmit">
        <div v-if="store.state.cotizacion_serial"
          class="alert alert-warning d-flex align-items-center justify-content-between" role="alert">
          <div class="flex-grow-1 me-3">
            <p class="mb-0">
              Nuevo cliente para cotización
              <a class="alert-link" href="javascript:void(0)">{{
                store.state.cotizacion_serial
              }}</a>
            </p>
          </div>
          <div class="flex-shrink-0">
            <i class="fa fa-fw fa-exclamation-circle"></i>
          </div>
        </div>
        <div class="block-content fs-sm pb-4 space-y-2">
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TIPO_ID">Tipo identificacion</label>
                <div class="col-sm-9">
                  <select class="form-select" id="select-CLI_TIPO_ID" name="select-CLI_TIPO_ID"
                    v-model="nuevoCliente.CLI_TIPO_ID">
                    <option v-for="(tipo, index) in tipos" :key="index" :value="tipo.tipo">
                      {{ tipo.nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_RUC">Identificación</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_RUC" v-model="nuevoCliente.CLI_RUC" :class="{
                    'is-invalid': v$.CLI_RUC.$errors.length,
                  }" @blur="v$.CLI_RUC.$touch" @change="checkRuc" />
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_RAZON_SOCIAL">Razón Social</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_RAZON_SOCIAL"
                    v-model="nuevoCliente.CLI_RAZON_SOCIAL" placeholder="Apellidos y Nombres" :class="{
                      'is-invalid': v$.CLI_RAZON_SOCIAL.$errors.length,
                    }" @blur="v$.CLI_RAZON_SOCIAL.$touch" />
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_NOMBRE_CORTO">Nombre corto</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_NOMBRE_CORTO"
                    v-model="nuevoCliente.CLI_NOMBRE_CORTO" placeholder="Nombre Corto" :class="{
                      'is-invalid': v$.CLI_NOMBRE_CORTO.$errors.length,
                    }" @blur="v$.CLI_NOMBRE_CORTO.$touch" />
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_CONTACTO">Contacto</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_CONTACTO" v-model="nuevoCliente.CLI_CONTACTO"
                    placeholder="Contacto" :class="{
                      'is-invalid': v$.CLI_CONTACTO.$errors.length,
                    }" @blur="v$.CLI_CONTACTO.$touch" />
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_DIRECCION">Dirección</label>
                <div class="col-sm-9">
                  <textarea class="form-control" id="input-CLI_DIRECCION" v-model="nuevoCliente.CLI_DIRECCION"
                    placeholder="Dirección completa..." :class="{
                      'is-invalid': v$.CLI_DIRECCION.$errors.length,
                    }" @blur="v$.CLI_DIRECCION.$touch" :maxlength="122"></textarea>
                  <p v-if="122 - nuevoCliente.CLI_DIRECCION.length == 0"
                    class="text-danger fs-sm bg-danger-light rounded p-2 mt-2 mb-0">
                    máximo 122 caracteres
                  </p>
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TERRITORIO">Territorio</label>
                <div class="col-sm-9">
                  <select class="form-select" id="select-CLI_TERRITORIO" name="select-CLI_TERRITORIO"
                    v-model="nuevoCliente.CLI_TERRITORIO" :class="{
                      'is-invalid': v$.CLI_TERRITORIO.$errors.length,
                    }" @blur="v$.CLI_TERRITORIO.$touch">
                    <option v-for="(territorio, index) in territorios" :key="index"
                      :value="territorio.TERRITORIO_CODIGO">
                      {{ territorio.TERRITORIO_DESCRIPCION }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_PROVINCIA">Provincia</label>
                <div class="col-sm-9" v-if="provincias_ciudades.length">
                  <select class="form-select" id="select-CLI_PROVINCIA" name="select-CLI_PROVINCIA"
                    v-model="nuevoCliente.CLI_PROVINCIA" :class="{
                      'is-invalid': v$.CLI_PROVINCIA.$errors.length,
                    }" @blur="v$.CLI_PROVINCIA.$touch">
                    <option v-for="(provincia, index) in provincias_ciudades" :key="index" :value="index">
                      {{ provincia.provincia }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_CIUDAD">Ciudad</label>
                <div class="col-sm-9">
                  <select class="form-select" id="select-CLI_CIUDAD" name="select-CLI_CIUDAD"
                    v-model="nuevoCliente.CLI_CIUDAD" v-if="nuevoCliente.CLI_PROVINCIA !== ''" :class="{
                      'is-invalid': v$.CLI_CIUDAD.$errors.length,
                    }" @blur="v$.CLI_CIUDAD.$touch">
                    <option v-for="(ciudad, index) in provincias_ciudades[
                      nuevoCliente.CLI_PROVINCIA
                    ].ciudades" :key="index" :value="ciudad">
                      {{ ciudad }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TELEFONO_1">Teléfono 1</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_TELEFONO_1"
                    v-model="nuevoCliente.CLI_TELEFONO_1" placeholder="Teléfono 1" :class="{
                      'is-invalid': v$.CLI_TELEFONO_1.$errors.length,
                    }" @blur="v$.CLI_TELEFONO_1.$touch" />
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TELEFONO_2">Teléfono 2</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_TELEFONO_2"
                    v-model="nuevoCliente.CLI_TELEFONO_2" placeholder="Teléfono 2" :class="{
                      'is-invalid': v$.CLI_TELEFONO_2.$errors.length,
                    }" @blur="v$.CLI_TELEFONO_2.$touch" />
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TELEFONO_3">Teléfono 3</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_TELEFONO_3"
                    v-model="nuevoCliente.CLI_TELEFONO_3" placeholder="Teléfono 3" :class="{
                      'is-invalid': v$.CLI_TELEFONO_3.$errors.length,
                    }" @blur="v$.CLI_TELEFONO_3.$touch" />
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TELEFONO_4">Teléfono 4</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_TELEFONO_4"
                    v-model="nuevoCliente.CLI_TELEFONO_4" placeholder="Teléfono 4" :class="{
                      'is-invalid': v$.CLI_TELEFONO_4.$errors.length,
                    }" @blur="v$.CLI_TELEFONO_4.$touch" />
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-12">
              <div class="row">
                <label class="col-sm-2 col-form-label text-end" for="input-CLI_CORREO_ELECT_SRI">Correo electrónico
                  SRI</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="input-CLI_CORREO_ELECT_SRI"
                    placeholder="Correo electrónico..." v-model="nuevoCliente.CLI_CORREO_ELECT_SRI" :class="{
                      'is-invalid': v$.CLI_CORREO_ELECT_SRI.$errors.length,
                    }" @blur="v$.CLI_CORREO_ELECT_SRI.$touch" />
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-12">
              <div class="row">
                <label class="col-sm-2 col-form-label text-end" for="input-CLI_CORREO_ELECT_NOTIFICACION_INTERNA">Correo
                  electrónico contacto</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="input-CLI_CORREO_ELECT_NOTIFICACION_INTERNA"
                    placeholder="Correo electrónico..." v-model="nuevoCliente.CLI_CORREO_ELECT_NOTIFICACION_INTERNA"
                    :class="{
                      'is-invalid':
                        v$.CLI_CORREO_ELECT_NOTIFICACION_INTERNA.$errors.length,
                    }" @blur="v$.CLI_CORREO_ELECT_NOTIFICACION_INTERNA.$touch" />
                </div>
              </div>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_GRUPO">Grupo</label>
                <div class="col-sm-9" v-if="grupos_subgrupos.length">
                  <select class="form-select" id="select-CLI_GRUPO" name="select-CLI_GRUPO"
                    v-model="nuevoCliente.CLI_GRUPO">
                    <option v-for="(grupo, index) in grupos_subgrupos" :key="index" :value="index">
                      {{ grupo.GRUPO_DESCRIPCION }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUBGRUPO">Subgrupo</label>
                <div class="col-sm-9">
                  <select class="form-select" id="select-CLI_SUBGRUPO" name="select-CLI_SUBGRUPO"
                    v-model="nuevoCliente.CLI_SUBGRUPO" v-if="nuevoCliente.CLI_GRUPO !== ''">
                    <option v-for="(subgrupo, index) in grupos_subgrupos[
                      nuevoCliente.CLI_GRUPO
                    ].subgrupos" :key="index" :value="subgrupo.SUBGRUPO_CODIGO">
                      {{ subgrupo.SUBGRUPO_DESCRIPCION }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_SEGMENTO">Segmento</label>
                <div class="col-sm-9" v-if="segmentos.length">
                  <select class="form-select" id="select-CLI_SEGMENTO" name="select-CLI_SEGMENTO"
                    v-model="nuevoCliente.CLI_SEGMENTO_ID" @change="fetchSubSegmentos($event.target.value)"
                    :disabled="loadingSegmentos" :class="{
                      'is-invalid': v$.CLI_SEGMENTO_ID.$errors.length,
                    }" @blur="v$.CLI_SEGMENTO_ID.$touch">
                    <option v-for="(seg, index) in segmentos" :key="index" :value="seg.coAtrPadre">
                      {{ seg.segmento }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_SUBSEGMENTO">SubSegmento</label>
                <div class="col-sm-9" v-if="subsegmentos.length">
                  <select class="form-select" id="select-CLI_SUBSEGMENTO" name="select-CLI_SUBSEGMENTO"
                    v-model="nuevoCliente.CLI_SUBSEGMENTO_ID" :disabled="loadingSubSegmentos" :class="{
                      'is-invalid': v$.CLI_SUBSEGMENTO_ID.$errors.length,
                    }" @blur="v$.CLI_SUBSEGMENTO_ID.$touch">
                    <option v-for="(seg, index) in subsegmentos" :key="index" :value="seg.coAtrHijo">
                      {{ seg.subsegmento }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-md-12 text-end">
              <button type="submit" class="btn btn-success btn-sm">
                <i class="fa fa-check"></i> Guardar
              </button>
              <router-link :to="{ name: 'ventas-crearcotizacion' }">
                <button type="button" class="btn btn-secondary btn-sm mx-2">
                  <i class="fa fa-times"></i> Cancelar
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </form>
    </BaseBlock>
  </div>
  <!-- END Page Content -->
</template>
