<template>
  <!-- Hero -->
  <BasePageHeading
    title="Dashboard"
    subtitle="Lista de pendientes"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Dashboard</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero --> 

   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <div class="row items-push">
      <div v-for="(section, index) in dashboard_sections" :key="index" class="col-sm-6 col-xxl-3">
        <!-- Recibos de compra L -->
        <BaseBlock class="d-flex flex-column h-100 mb-0">
          <template #content>
            <div
              class="block-content block-content-full flex-grow-1 d-flex justify-content-between align-items-center"
            >
              <dl class="mb-0">
                <dt class="fs-3 fw-bold">{{ section.total }}</dt>
                <dd class="fs-sm fw-medium fs-sm fw-medium text-muted mb-0" >
                  {{ section.name }}
                </dd>
              </dl>
              <router-link :to="{ name: section.to }">
                <div class="item item-rounded-lg bg-body-light">
                  <i class=" fs-3 text-primary" :class="section.icon"></i>
                </div>
              </router-link>
            </div>
            <div class="bg-body-light rounded-bottom">
              <router-link :to="{ name: section.to }">
                <a
                  class="block-content block-content-full block-content-sm fs-sm fw-medium d-flex align-items-center justify-content-between"
                  href="javascript:void(0)"
                >
                  <span>Ver más</span>
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
    </div>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'

const store = useStore();
const dashboard_sections = computed(() => store.state.dashboard_sections);
let errorMsg = ref('');

store.dispatch('bodegasDashboard')
store.dispatch('bodegasDashboardInterval');

onBeforeUnmount(() => {
  store.dispatch('bodegasDashboardStop');
});

</script>