<template>
  <!-- Hero -->
  <BasePageHeading title="Aprobaciones Comerciales Consulta">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Aprobaciones</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Comerciales</li>
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
            <button class="nav-link active" id="btabs-alt-static-cotizaciones-tab" data-bs-toggle="tab"
              data-bs-target="#btabs-alt-static-cotizaciones" role="tab" aria-controls="btabs-alt-static-cotizaciones"
              aria-selected="false">
              Cotizaciones <code>({{ countQuotesConsult }})</code>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="btabs-alt-static-pedidos-tab" data-bs-toggle="tab"
              data-bs-target="#btabs-alt-static-pedidos" role="tab" aria-controls="btabs-alt-static-pedidos"
              aria-selected="true">
              Pedidos <code>({{ countOrdersConsult }})</code>
            </button>
          </li>

        </ul>
        <div class="block-content tab-content">
          <div class="tab-pane active" id="btabs-alt-static-cotizaciones" role="tabpanel"
            aria-labelledby="btabs-alt-static-cotizaciones-tab">
            <AprobacionComercialCotizaciones></AprobacionComercialCotizaciones>
          </div>
          <div class="tab-pane" id="btabs-alt-static-pedidos" role="tabpanel"
            aria-labelledby="btabs-alt-static-pedidos-tab">
            <AprobacionComercialPedidos></AprobacionComercialPedidos>
          </div>

        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import AprobacionComercialPedidos from "./tablas/consulta/AprobacionComercialPedidosConsultaTab.vue";
import AprobacionComercialCotizaciones from "./tablas/consulta/AprobacionComercialCotizacionesConsultaTab.vue";
import { useApprovalOrder } from "@/composables/aprobaciones/pedidos/useApprovalOrder";
import { useApprovalQuote } from "@/composables/aprobaciones/cotizaciones/useApprovalQuote";

const {
countQuotesConsult
} = useApprovalQuote();
const {
  countOrdersConsult
} = useApprovalOrder();
</script>