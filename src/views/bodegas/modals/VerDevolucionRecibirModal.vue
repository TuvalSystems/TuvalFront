<template>
  <BaseBlock title="Recibir devolución" class="mb-0">
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
        <CabeceraDevolucion :verdevolucion="verdevolucion"></CabeceraDevolucion>
        <div class="col-sm-12 text-end">
          <button type="button" class="btn btn-sm btn-primary" @click="seleccionartodos()">
            <i class="fa fa-hand-pointer"></i> Seleccionar todos
          </button>
        </div>
        <div class="table-responsive">
          <div v-if="detalledevolucion.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
          </div>
          <table v-if="detalledevolucion.data.length && !detalledevolucion.loading" class="table table-hover table-sm table-vcenter mt-4 ">
            <thead>
            <tr>
              <th class="">#</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>CTL</th>
              <th>UDM</th>
              <th class="text-end">Solicitado</th>
              <th class="text-end"></th>
              <th class="text-end">Recibir</th>
              <th class="text-end">Compartimiento</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(articulo, index) in detalledevolucion.data" :key="index">
              <tr>
                <td class="fs-sm">{{index+1}}</td>
                <td class="fs-sm">
                  {{ articulo.ART_CODIGO }}

                </td>
                <td class="fs-sm">
                  {{ articulo.ART_DESCRIPCION }}
                </td>
                <td class="fs-sm">
                  {{ articulo.ART_CODIGO_TRES_LETRAS }}
                </td>
                <td class="fs-sm">
                  {{ articulo.ART_PLAN_UMEDIDA }}
                </td>
                <td class="fs-sm text-end">
                  <b>{{ articulo.seleccionado }}</b>
                </td>
                <td style="width: 31px" class="text-center">
                  <input
                      v-if="articulo.seleccionado > 0"
                      type="checkbox"
                      class="form-check-input"
                      v-model="articulo.aplicar_todo"
                      @change="aplicatodo(articulo)"

                  />
                </td>
                <td style="width: 80px">
                  <input
                      v-if="articulo.seleccionado > 0"
                      type="text"
                      class="form-control text-end form-control-sm"
                      v-model="articulo.devuelto"
                      @change="aplicardevolucion(articulo)"

                  />
                </td>
                <td>
                  <select class="form-select form-select-sm" v-model="articulo.compartimiento">
                    <option
                        v-for="(compartimiento, index) in articulo.compartimientos" :key="index"
                        :value="compartimiento.Compartimento"
                    >{{ compartimiento.Compartimento }}</option>
                  </select>
                </td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full bg-body">
    <div class="row">
      <div class="col-sm-12 text-end">
        <button ref="botonRecibir" :disabled="!generar" type="button" class="btn btn-warning btn-sm mx-1" @click="imprimirOrden(verdevolucion)"><i class="fa fa-print"></i> Orden de almacenamiento</button>
        <button ref="botonRecibir" :disabled="!generar" type="button" class="btn btn-success btn-sm mx-1" @click="recibirDevolucion(verdevolucion)"><i class="fa fa-check"></i> Recibir</button>
        <button  type="button" class="btn btn-danger btn-sm mx-1" @click="emit('rechazar')"><i class="fa fa-times"></i> Rechazar</button>
        <button  type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal"> Cerrar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { formatPrice} from "@/functions";
import CabeceraDevolucion from "@/components/CabeceraDevolucion.vue";
import {useStore} from "vuex";
import {swalError, swalSuccess} from "@/functions/swal-alert";
const store = useStore();
const detalledevolucion = computed(() => store.state.detalledevolucion);
const { verdevolucion } = defineProps({
  verdevolucion: Object,
})
const emit = defineEmits(["recibir", "rechazar"]);
const generar = computed(() => store.state.generar);
const botonRecibir = ref('botonRecibir');

function aplicatodo(articulo) {
  if (articulo.aplicar_todo == false) {
    articulo.devuelto = "";
    checkgenerardevolucion();
    return;
  }
  articulo.devuelto = articulo.seleccionado;
  checkgenerardevolucion();
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function aplicardevolucion(articulo) {

  if(!isInt(articulo.devuelto) && articulo.ART_DECIMAL_CANTIDAD === 0){
    swalError('Ingresar un número entero');
    articulo.devuelto = 0;
    articulo.aplicar_todo = false;
    checkgenerardevolucion();
    return false;
  }

  if (isNaN(articulo.devuelto)) {
    swalError("Ingresar un número");
    articulo.devuelto = 0;
    articulo.aplicar_todo = false;
    checkgenerardevolucion();
    return false;
  }

  if (parseFloat(articulo.devuelto) == 0) {
    articulo.aplicar_todo = false;
  } else if (parseFloat(articulo.devuelto) <= parseFloat(articulo.seleccionado)) {
    articulo.aplicar_todo = true;
  } else if (parseFloat(articulo.devuelto) > parseFloat(articulo.seleccionado)) {
    swalError("El número ingresado es mayor a la cantidad disponible");
    articulo.devuelto = articulo.seleccionado;
    articulo.aplicar_todo = true;
  } else {
    articulo.aplicar_todo = true;
  }
  checkgenerardevolucion();
}

function checkgenerardevolucion() {
  let check = false;

  detalledevolucion.value.data.map((articulo) => {
    if (articulo.devuelto > 0) {
      check = true;
    }
  });
  if (check) {
    store.commit("setGenerar", true);
  } else {
    store.commit("setGenerar", false);
  }

}

function seleccionartodos() {
  detalledevolucion.value.data.map((articulo) => {
    articulo.devuelto = articulo.seleccionado;
    articulo.aplicar_todo = true;
  });
  checkgenerardevolucion();
}


function recibirDevolucion(verpedido){

  botonRecibir.value.classList.add('hide');

  const data = reactive({
    devolucion: verpedido,
    detalledevolucion: detalledevolucion.value.data,
  });

  store.dispatch('recibirDevolucion', data).then( (res) => {
    if(res.success == true){
      swalSuccess(res.message);
      botonRecibir.value.classList.remove('hide');
      emit('recibir');
    }
  }).catch(err => {
    //console.log(err.response);
    swalError(err.response.data.error)
    botonRecibir.value.classList.remove('hide');
    emit('recibir');
  });
}

function imprimirOrden(guia){

  const data = reactive({
    devolucion: guia,
    detalledevolucion: detalledevolucion.value.data,
  });

  store.dispatch('imprimirordendevolucion', data)
      .then((response) => {
        if(response.status == 200){
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'orden-almacenamiento-'+guia.devolucion+'.pdf');
          document.body.appendChild(link);
          link.click();
        }
      });
}

</script>