<template>
  <BasePageHeading title="Consultas" subtitle="Todo lo procesado por bodegas">
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
            <button @click="setActiveTab('despacho')" class="nav-link" :class="{ 'active': activeTab === 'despacho' }"
              id="btabs-alt-static-despachos-tab" data-bs-toggle="tab" data-bs-target="#btabs-alt-static-despachos"
              role="tab" aria-controls="btabs-alt-static-despachos" aria-selected="true">
              Despacho Pedidos
            </button>
          </li>
          <li class="nav-item">
            <button @click="setActiveTab('transferencias-enviadas')"
              :class="{ 'active': activeTab === 'transferencias-enviadas' }" class="nav-link"
              id="btabs-alt-static-traslados-tab" data-bs-toggle="tab" data-bs-target="#btabs-alt-static-traslados"
              role="tab" aria-controls="btabs-alt-static-traslados" aria-selected="true">
              Transferencias enviadas
            </button>
          </li>
          <li class="nav-item">
            <button @click="setActiveTab('transferencias-recibidas')"
              :class="{ 'active': activeTab === 'transferencias-recibidas' }" class="nav-link"
              id="btabs-alt-static-recibidos-tab" data-bs-toggle="tab" data-bs-target="#btabs-alt-static-recibidos"
              role="tab" aria-controls="btabs-alt-static-recibidos" aria-selected="true">
              Transferencias recibidas
            </button>
          </li>
          <li class="nav-item">
            <button @click="setActiveTab('reposiciones-enviadas')"
              :class="{ 'active': activeTab === 'reposiciones-enviadas' }" class="nav-link"
              id="btabs-alt-static-reposicion-enviada-tab" data-bs-toggle="tab"
              data-bs-target="#btabs-alt-static-reposicion-enviada" role="tab"
              aria-controls="btabs-alt-static-reposicion-enviada" aria-selected="true">
              Reposiciones Enviadas
            </button>
          </li>
          <li class="nav-item">
            <button @click="setActiveTab('reposiciones-recibidas')"
              :class="{ 'active': activeTab === 'reposiciones-recibidas' }" class="nav-link"
              id="btabs-alt-static-reposicion-recibida-tab" data-bs-toggle="tab"
              data-bs-target="#btabs-alt-static-reposicion-recibida" role="tab"
              aria-controls="btabs-alt-static-reposicion-recibida" aria-selected="true">
              Reposiciones Recibidas
            </button>
          </li>
        </ul>

        <div class="block-content  tab-content">
          <DespachoPedidos v-if="activeTab === 'despacho'"></DespachoPedidos>
          <TransferenciasEnviadas v-if="activeTab === 'transferencias-enviadas'"></TransferenciasEnviadas>
          <TransferenciasRecibidas v-if="activeTab === 'transferencias-recibidas'"></TransferenciasRecibidas>
          <ReposicionesEnviadas v-if="activeTab === 'reposiciones-enviadas'"></ReposicionesEnviadas>
          <ReposicionesRecibidas v-if="activeTab === 'reposiciones-recibidas'"></ReposicionesRecibidas>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
</template>
<script setup>
import { ref } from "vue";
import DespachoPedidos from "./consultas/DespachoPedidos.vue";
import TransferenciasEnviadas from "./consultas/TransferenciasEnviadas.vue";
import TransferenciasRecibidas from "./consultas/TransferenciasRecibidas.vue";
import ReposicionesEnviadas from "./consultas/ReposicionesEnviadas.vue";
import ReposicionesRecibidas from "./consultas/ReposicionesRecibidas.vue";

const activeTab = ref("despacho");

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

</script>