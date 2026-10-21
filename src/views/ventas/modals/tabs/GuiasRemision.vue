<template>
  <div class="table-responsive mb-4">
    <table class="table table-sm fs-sm table-hover table-vcenter mb-0">
      <thead>
        <tr>
          <th>No. de Guía</th>
          <th>Fecha</th>
          <th>Transportista</th>
          <th>Vehículo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="guia in guias_remision" :key="guia.id">
          <td>{{ guia.GUI_REM_GUIA_REMISION }}</td>
          <td>{{ guia.GUI_REM_FECHA_INICIO }}</td>
          <td>{{ guia.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
          <td>{{ guia.GUI_REM_PLACA }}</td>
          <td class="text-end">
            <GuiaArchivosConsulta :guide="guia" :type="guia.tipo" @print="imprimirGuia(guia)" />
          </td>
        </tr>
      </tbody>
    </table>
    
  </div>
</template>
<script setup>
import { computed } from "vue";
import GuiaArchivosConsulta from "@/views/bodegas/consultas/GuiaArchivosConsulta.vue";
import { useStore} from 'vuex'

const store = useStore();
const guias_remision = computed(() => store.state.guias_remision);

async function imprimirGuia(guia){
  store.dispatch('imprimir', '/bodegas/guiasderemision/imprimirguia/'+guia.id)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'guia-'+guia.GUI_REM_GUIA_REMISION+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}
</script>