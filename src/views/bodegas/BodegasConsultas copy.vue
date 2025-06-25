<template>
  <BasePageHeading
    title="Consultas"
    subtitle="Todo lo procesado por bodegas"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Consultas</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <!-- Full Table -->
    <BaseBlock>
      <template #content>
        <ul class="nav nav-tabs nav-tabs-alt" role="tablist">
          <li class="nav-item">
            <button
              class="nav-link active"
              id="btabs-alt-static-despachos-tab"
              data-bs-toggle="tab"
              data-bs-target="#btabs-alt-static-despachos"
              role="tab"
              aria-controls="btabs-alt-static-despachos"
              aria-selected="true"
            >
              Despacho Pedidos
            </button>
          </li>
          <li class="nav-item">
            <button
                class="nav-link"
                id="btabs-alt-static-traslados-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-alt-static-traslados"
                role="tab"
                aria-controls="btabs-alt-static-traslados"
                aria-selected="true"
            >
              Transferencias enviadas
            </button>
          </li>
          <li class="nav-item">
            <button
                class="nav-link"
                id="btabs-alt-static-recibidos-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-alt-static-recibidos"
                role="tab"
                aria-controls="btabs-alt-static-recibidos"
                aria-selected="true"
            >
              Transferencias recibidas
            </button>
          </li>
          <li class="nav-item">
            <button
                class="nav-link"
                id="btabs-alt-static-reposicion-enviada-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-alt-static-reposicion-enviada"
                role="tab"
                aria-controls="btabs-alt-static-reposicion-enviada"
                aria-selected="true"
            >
              Reposiciones Enviadas
            </button>
          </li>
          <li class="nav-item">
            <button
                class="nav-link"
                id="btabs-alt-static-reposicion-recibida-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-alt-static-reposicion-recibida"
                role="tab"
                aria-controls="btabs-alt-static-reposicion-recibida"
                aria-selected="true"
            >
              Reposiciones Recibidas
            </button>
          </li>
        </ul>
        <div class="block-content tab-content">
          <div
            class="tab-pane active"
            id="btabs-alt-static-despachos"
            role="tabpanel"
            aria-labelledby="btabs-alt-static-despachos-tab"
          >
            <DespachoPedidos></DespachoPedidos>
          </div>
          <div
              class="tab-pane"
              id="btabs-alt-static-traslados"
              role="tabpanel"
              aria-labelledby="btabs-alt-static-traslados-tab"
          >
            <TransferenciasEnviadas></TransferenciasEnviadas>
          </div>
          <div
              class="tab-pane"
              id="btabs-alt-static-recibidos"
              role="tabpanel"
              aria-labelledby="btabs-alt-static-recibidos-tab"
          >
            <TransferenciasRecibidas></TransferenciasRecibidas>
          </div>
          <div
              class="tab-pane"
              id="btabs-alt-static-reposicion-enviada"
              role="tabpanel"
              aria-labelledby="btabs-alt-static-reposicion-enviada-tab"
          >
            <ReposicionesEnviadas></ReposicionesEnviadas>
          </div>
          <div
              class="tab-pane"
              id="btabs-alt-static-reposicion-recibida"
              role="tabpanel"
              aria-labelledby="btabs-alt-static-reposicion-recibida-tab"
          >
            <ReposicionesRecibidas></ReposicionesRecibidas>
          </div>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import DespachoPedidos from "./consultas/DespachoPedidos.vue";
import TransferenciasEnviadas from "./consultas/TransferenciasEnviadas.vue";
import TransferenciasRecibidas from "./consultas/TransferenciasRecibidas.vue";
import ReposicionesEnviadas from "./consultas/ReposicionesEnviadas.vue";
import ReposicionesRecibidas from "./consultas/ReposicionesRecibidas.vue";

const store = useStore();

refrescar();

function refrescar() {
  store.dispatch("guiasProcesadas");
}
</script>