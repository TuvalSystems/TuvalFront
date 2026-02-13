<template>
  <div class="table-responsive mb-4">
    <table class="table table-sm fs-sm table-hover table-vcenter mb-0">
      <thead>
        <tr>
          <th>Orden de despacho</th>
          <th>Bodega</th>
          <th>Estado</th>
          
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {{ orden_despacho.orden }}
          </td>
          <td>
            {{ orden_despacho.BOD_BODEGA }}
          </td>
          <td>
            {{ orden_despacho.estado }}
          </td>
        </tr>
      </tbody>
    </table>
    
  </div>
  <div v-if="!['pendiente', 'cancelada', 'despachada'].includes(orden_despacho.estado)" class="fs-sm text-end py-2">
    <button class="btn btn-sm btn-success" @click="imprimirOrdendespacho(orden_despacho.id)"><i class="fa fa-print"></i> Imprimir Orden de Despacho</button>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import Swal from "sweetalert2";

const store = useStore();
const orden_despacho = computed(() => store.state.orden_despacho);

async function imprimirOrdendespacho(id){
  store.dispatch('imprimir', '/despachos/imprimirordendespacho/'+id)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'orden-despacho-'+id+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}
</script>