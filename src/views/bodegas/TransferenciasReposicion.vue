<template>
  <!-- Hero -->
  <BasePageHeading title="Transferencias por Reposición">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Transferencias por Reposición</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- <BaseBlock class="d-flex flex-column h-100 mb-4 pb-3">
      <form class="row row-cols-lg-auto g-3 align-items-center" @submit.prevent="onSubmit">
        <div class="col-12">
          <div class="row">
            <label class="col-sm-4 col-form-label text-end" for="fecha">Fecha:</label>
            <div class="col-sm-8">
              <div class="input-group date" style="max-width: 180px;">
                <span class="input-group-text"><i class="far fa-calendar"></i></span>
                <flat-pickr class="form-control fs-sm" placeholder="Y-m-d" v-model="set_fecha"
                  :config="flatPickrState.fecha" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <button type="button" v-on:click="consultarreposicion(set_fecha)" class="btn btn-primary">Consultar</button>
        </div>
      </form>
    </BaseBlock> -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div v-if="!transferencias_reposicion" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <!-- Full Table -->
    <div class="row items-push">
      <div v-for="(bodega, index) in transferencias_reposicion" :key="index" class="col-sm-6 col-xxl-3">
        <!-- Recibos de compra L -->
        <BaseBlock class="d-flex flex-column h-100 mb-0">
          <template #content>
            <div class="block-content block-content-full flex-grow-1 d-flex justify-content-between align-items-center">
              <dl class="mb-0">
                <dt class="fs-3 fw-bold">{{ bodega.traslados.length }}</dt>
                <dd class="fs-sm fw-medium fs-sm fw-medium text-muted mb-0">
                  <router-link :to="{ name: 'bodegas-transferenciasreposicionbodega', params: { id: index } }"> {{
                    bodega.bodega }}</router-link>
                </dd>
              </dl>
              <router-link :to="{ name: 'bodegas-transferenciasreposicionbodega', params: { id: index } }">
                <div class="item item-rounded-lg bg-body-light">
                  <i class=" fs-3 text-primary fa fa-warehouse"></i>
                </div>
              </router-link>
            </div>
            <div class="bg-body-light rounded-bottom">
              <router-link :to="{ name: 'bodegas-transferenciasreposicionbodega', params: { id: index } }">
                <a class="block-content block-content-full block-content-sm fs-sm fw-medium d-flex align-items-center justify-content-between"
                  href="javascript:void(0)">
                  <span>Ver más</span>
                  <span
                    class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-danger mx-1"
                    title="No despachada">
                    <i class="fa fa-weight-hanging"></i> {{ formatPrice(bodega.peso_total / 1000) }} Tn
                  </span>
                  <i class="fa fa-arrow-alt-circle-right ms-1 opacity-25 fs-base"></i>
                </a>
              </router-link>
            </div>
          </template>
        </BaseBlock>
        <!-- END Pending Orders -->
      </div>
    </div>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { useStore } from 'vuex'




import { formatPrice } from "../../functions";




const store = useStore();
const transferencias_reposicion = computed(() => store.state.transferencias_reposicion);


const today = new Date();
today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();


const loading = ref(false);

store.dispatch('transferenciasReposicion')
//store.dispatch('transferenciasReposicionInterval');



onBeforeUnmount(() => {
  //store.dispatch('transferenciasReposicionStop');
});
</script>
