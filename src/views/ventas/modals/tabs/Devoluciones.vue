<template>
  <div class="table-responsive mb-4">
    <table class="table table-sm fs-sm table-hover table-vcenter mb-0">
      <thead>
        <tr>
          <th>Devolución</th>
          <th>Nota de Crédito</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Usuario</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(devolucion, index) in devoluciones" :key="index">
          <td>{{ devolucion.devolucion }}</td>
          <td>{{ devolucion.DOC_GENERADO }}</td>
          <td>{{ devolucion.tipo_devolucion }}</td>
          <td>
            <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill "
              :class="
                devolucion.estado === 'procesado' ? 'bg-success-light text-success': '' ||
                devolucion.estado === 'aprobado' ? 'bg-success-light text-success': '' ||
                devolucion.estado === 'solicitado' ? 'bg-info-light text-info': '' ||
                devolucion.estado === 'recibido' ? 'bg-info-light text-info': '' ||
                devolucion.estado === 'espera' ? 'bg-warning-light text-warning': '' ||
                devolucion.estado === 'rechazado' ? 'bg-danger-light text-danger': '' ||
                devolucion.estado === 'anulada' ? 'bg-danger-light text-danger': '' ||
                devolucion.estado === 'no_procesado' ? 'bg-light text-secondary': ''">
                        {{ devolucion.estado }}</span>
          </td>
          <td>{{ devolucion.created_at }}</td>
          <td>{{ devolucion.USERID }}</td>
          <td class="text-end">
            <button v-if="devolucion.estado === 'procesado'" type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirDevolucion(devolucion)"><i class="fa fa-print"></i> Imprimir</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useStore} from 'vuex'


const store = useStore();
const devoluciones = computed(() => store.state.devoluciones_pedido);

async function imprimirDevolucion(devolucion){
  store.dispatch('imprimir', '/devoluciones/imprimirdevolucion/'+devolucion.id)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'nota-de-credito-'+devolucion.devolucion+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}
</script>
