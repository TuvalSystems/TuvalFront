<template>
  <!-- Hero -->
  <BasePageHeading
    title="Recepción de compras tipo L"
    subtitle="Recepcion de devoluciones"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Recibo de compras L</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock>
      <template #content>
        <ul class="nav nav-tabs nav-tabs-alt" role="tablist">
          <li class="nav-item">
            <button
              class="nav-link active"
              id="btabs-alt-static-nuevos-tab"
              data-bs-toggle="tab"
              data-bs-target="#btabs-alt-static-nuevos"
              role="tab"
              aria-controls="btabs-alt-static-nuevos"
              aria-selected="true"
            >
              Nuevos 
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
              aria-selected="false"
            >
              Recibidos 
            </button>
          </li>
          <li class="nav-item">
            <button
                class="nav-link"
                id="btabs-alt-static-eliminados-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-alt-static-eliminados"
                role="tab"
                aria-controls="btabs-alt-static-eliminados"
                aria-selected="false"
            >
              Eliminados
            </button>
          </li>
        </ul>
        <div class="block-content tab-content">
          <div
            class="tab-pane active"
            id="btabs-alt-static-nuevos"
            role="tabpanel"
            aria-labelledby="btabs-alt-static-nuevos-tab"
          >
            <RecibosDeCompraGenerados></RecibosDeCompraGenerados>
          </div>
          <div
            class="tab-pane"
            id="btabs-alt-static-recibidos"
            role="tabpanel"
            aria-labelledby="btabs-alt-static-recibidos-tab"
          >
          <RecibosDeCompraRecibidos></RecibosDeCompraRecibidos>
          </div>
          <div
              class="tab-pane"
              id="btabs-alt-static-eliminados"
              role="tabpanel"
              aria-labelledby="btabs-alt-static-eliminados-tab"
          >
            <RecibosDeCompraEliminados></RecibosDeCompraEliminados>
          </div>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>

import { useStore} from 'vuex'

import RecibosDeCompraGenerados from "./tablas/RecibosDeCompraGenerados.vue";
import RecibosDeCompraRecibidos from "./tablas/RecibosDeCompraRecibidos.vue";
import RecibosDeCompraEliminados from "./tablas/RecibosDeCompraEliminados.vue";

const store = useStore();

store.dispatch('bodegasBandejaRecibosdecompraL');
</script>
