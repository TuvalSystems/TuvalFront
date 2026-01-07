<script setup>

/** nuevos imports */
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
const { errorSearchClient, dataSearch, loadingSearch, searchClients } = useClientSearch();


</script>

<template>
  <div class="content">
    <BaseBlock title="Crear Cotización" content-full rounded>
      <div class="row row-cols-lg-auto g-3 align-items-center">
        <div class="col-12">
          <label class="visually-hidden" for="buscar-cliente">Buscar cliente...</label>
          <input type="text" class="form-control" :class="errorSearchClient ? 'is-invalid' : ''" id="buscar-cliente"
            name="buscar-cliente" placeholder="Buscar cliente..." @keyup.enter="buscarclientes"
            v-model="dataSearch.search" />
        </div>

        <div class="col-12">
          <button type="button" @click="buscarclientes" class="btn btn-primary">
            Buscar
          </button>

          <router-link :to="{ name: 'ventas-crearcliente' }">
            <button type="button" class="mx-4 btn btn-success float-end">
              Crear cliente
            </button>
          </router-link>
        </div>
      </div>

    </BaseBlock>
  </div>
</template>

<style scoped>
@media (min-width: 1200px) {
  .billing-sticky {
    position: sticky;
    top: .75rem;
  }
}
</style>