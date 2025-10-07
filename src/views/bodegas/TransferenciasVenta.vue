<template>
  <!-- Hero -->
  <BasePageHeading
    title="Transferencias por Venta"
    >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Transferencias por Venta</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

   <!-- Page Content -->
  <div class="content">

    <div v-if="transferencias_venta_loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <!-- Full Table -->
    <div class="row items-push">
      <div v-for="(bodega, index) in transferencias_venta" :key="index" class="col-sm-6 col-xxl-3">
        <!-- Recibos de compra L -->
        <BaseBlock class="d-flex flex-column h-100 mb-0">
          <template #content>
            <div
              class="block-content block-content-full flex-grow-1 d-flex justify-content-between align-items-center"
            >
              <dl class="mb-0">
                <dt class="fs-3 fw-bold">{{ bodega.traslados.length }}</dt>
                <dd class="fs-sm fw-medium fs-sm fw-medium text-muted mb-0" >
                  <router-link :to="{ name: 'bodegas-transferenciasventabodega', params: { id: index } }"> {{ bodega.bodega }}</router-link><br>
                </dd>
              </dl>
              <router-link :to="{ name: 'bodegas-transferenciasventabodega', params: { id: index } }">
                <div class="item item-rounded-lg bg-body-light">
                  <i class=" fs-3 text-primary fa fa-warehouse"></i>
                </div>
              </router-link>

            </div>

            <div class="bg-body-light rounded-bottom">
              <router-link :to="{ name: 'bodegas-transferenciasventabodega', params: { id: index } }">
                <a
                  class="block-content block-content-full block-content-sm fs-sm fw-medium d-flex align-items-center justify-content-between"
                  href="javascript:void(0)"
                >
                  <span>Ver más</span>
                  <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-danger mx-1" title="No despachada">
                    <i class="fa fa-weight-hanging"></i> {{ formatPrice(bodega.peso_total / 1000) }} Tn
                  </span>
                  <i
                    class="fa fa-arrow-alt-circle-right ms-1 opacity-25 fs-base"
                  ></i>
                </a>
              </router-link>
            </div>
          </template>
        </BaseBlock>
        <!-- END Pending Orders -->
      </div>
      <p v-if="!transferencias_venta_loading && !transferencias_venta" class="text-center">No existen resultados</p>
    </div>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount  } from "vue";
import { useStore} from 'vuex'
import { useRouter, useRoute } from "vue-router";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import {formatPrice} from "../../functions";


const store = useStore();
const transferencias_venta = computed(() => store.state.transferencias_venta);
const transferencias_venta_loading = ref(true);
const route = useRoute();

store.dispatch('transferenciasVenta').then( () => {
  transferencias_venta_loading.value = false;
}).catch( err => {
  transferencias_venta_loading.value = false;
})
// store.dispatch('transferenciasVentaInterval');

onBeforeUnmount(() => {
  store.dispatch('transferenciasVentaStop');
});
</script>