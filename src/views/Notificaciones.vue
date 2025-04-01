<template>
  <!-- Hero -->
  <BasePageHeading
      title="Notificaciones"
      subtitle="Notificaciones y mensajes"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item" aria-current="page">Notificaciones</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <BaseBlock title="Lista de notificaciones">
      <template #options>
        <div class="space-x-1">
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="refrescar()" class="btn btn-success btn-sm"><i class="si si-refresh"></i></button>
          </div>
        </div>
      </template>
      <Dataset
          v-slot="{ ds }"
          :ds-data="notificaciones.data"
          :ds-sortby="sortBy"
          :ds-search-in="['titulo', 'mensaje', 'created_at']"
        >
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLength" class="col-md-8 py-2">
            <DatasetShow />
          </div>
          <div class="col-md-4 py-2">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <hr />
        <div v-if="notificaciones.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
        </div>
        <div class="row" v-if="notificaciones.data.length && !notificaciones.loading">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-hover table-vcenter mb-0">
                <thead>
                <tr>
                  <th
                      v-for="(th, index) in cols"
                      :key="th.field"
                      :class="['sort', th.sort]"
                      @click="onSort($event, index)"
                      class="nowrap"
                  >
                    {{ th.name }} <i class="gg-select float-end"></i>
                  </th>
                </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row }">
                    <tr>
                      <td class="fs-sm">
                        {{  row.titulo }}
                      </td>
                      <td class="fs-sm">
                        {{  row.mensaje }}
                      </td>
                      <td class="fs-sm nowrap">
                        {{  row.created_at }}
                      </td>
                    </tr>
                  </template>
                </DatasetItem>
              </table>
            </div>
          </div>
        </div>
        <div class="d-flex flex-md-row flex-column justify-content-between align-items-center">
          <DatasetInfo class="py-3 fs-sm" />
          <DatasetPager class="flex-wrap py-3 fs-sm" />
        </div>
      </Dataset>
    </BaseBlock>
  </div>
  <!-- END Page Content -->

  <!-- Large Block Modal -->
  <div
      class="modal"
      id="modal-cliente"
      tabindex="-1"
      role="dialog"
      aria-labelledby="modal-cliente"
      aria-hidden="true"
      ref="thisModal"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        test
      </div>
    </div>
  </div>
  <!-- END Large Block Modal -->

</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore} from 'vuex';
import { Modal } from "bootstrap";
import {swalError} from "@/functions/swal-alert";

const store = useStore();
const notificaciones = computed(() => store.state.notificaciones);

refrescar();
function refrescar(){
  store.dispatch('getNotificaciones');
}


const cols = reactive([
  {
    name: "Titulo",
    field: "titulo",
    sort: "",
  },
  {
    name: "Mensaje",
    field: "mensaje",
    sort: "",
  },
  {
    name: "Fecha / hora",
    field: "created_at",
    sort: "",
  },
]);

const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

function onSort(event, i) {
  let toset;
  const sortEl = cols[i];

  if (!event.shiftKey) {
    cols.forEach((o) => {
      if (o.field !== sortEl.field) {
        o.sort = "";
      }
    });
  }
  if (!sortEl.sort) {
    toset = "asc";
  }
  if (sortEl.sort === "desc") {
    toset = event.shiftKey ? "" : "asc";
  }
  if (sortEl.sort === "asc") {
    toset = "desc";
  }
  sortEl.sort = toset;
}

onMounted(() => {
  // Remove labels from
  document.querySelectorAll("#datasetLength label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLength select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";
});

</script>