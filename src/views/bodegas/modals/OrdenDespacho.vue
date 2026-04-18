<template>
  <BaseBlock :title="'Orden de despacho ' + currentOrden.orden" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <ul class="nav nav-tabs nav-tabs-alt">
        <li class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'detalle' }"
            @click="tabActual = 'detalle'">
            Detalle
          </button>
        </li>
        <li v-if="documentosPedidos && documentosPedidos.length" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'documentos_pdf' }"
            @click="tabActual = 'documentos_pdf'">
            Documento(s)
          </button>
        </li>
        <li v-if="direccionEnvio && direccionEnvio.id" class="nav-item">
          <button type="button" class="nav-link" :class="{ 'active': tabActual === 'direccion_envio' }"
            @click="tabActual = 'direccion_envio'">
            Dirección Envío
          </button>
        </li>
      </ul>
      <div class="block-content tab-content fs-sm">
        <div class="tab-pane fade" :class="{ 'active show': tabActual === 'detalle' }">
          <div class="table-responsive">
            <table class="table table-striped table-sm table-vcenter">
              <tbody>
                <tr v-if="verpedido.factura != ''">
                  <th scope class="fs-sm">Factura</th>
                  <td class="fs-sm">{{ verpedido.factura }}</td>
                  <th scope v-if="verpedido.cotizacion" class="fs-sm">Cotización Origen</th>
                  <td v-if="verpedido.cotizacion" class="fs-sm" colspan="3">{{ verpedido.cotizacion }}</td>
                  <td v-if="!verpedido.cotizacion" class="fs-sm" colspan="4"></td>
                </tr>
                <tr>
                  <th scope class="fs-sm">Pedido</th>
                  <td class="fs-sm">{{ verpedido.pedido }}</td>
                  <th scope class="fs-sm">RUC</th>
                  <td class="fs-sm">{{ verpedido.CLI_RUC }}</td>
                  <th scope class="fs-sm">Razón Social</th>
                  <td class="fs-sm">{{ verpedido.CLI_RAZON_SOCIAL }}</td>
                </tr>
                <tr>
                  <th scope class="fs-sm">Bodega</th>
                  <td class="fs-sm">
                    {{ verpedido.BOD_BODEGA }}
                  </td>
                  <th scope class="fs-sm">Fecha/hora</th>
                  <td class="fs-sm">
                    {{ verpedido.created_at }}
                  </td>
                  <th scope class="fs-sm">Usuario</th>
                  <td class="fs-sm">{{ verpedido.USERID }}</td>

                </tr>
                <tr>
                  <th scope class="fs-sm">Nota Operaciones</th>
                  <td class="fs-sm">
                    {{ verpedido.nota_operaciones }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="detalle_orden_despacho_loading" class="text-center">
            <div class="spinner-border text-primary mt-4">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div class="table-responsive">
            <table v-if="detalle_orden_despacho.orden && !detalle_orden_despacho_loading"
              class="table table-striped table-sm table-vcenter fs-sm">
              <thead>
                <tr>
                  <th scope>Código</th>
                  <th scope>3L</th>
                  <th scope>Descripción</th>
                  <th scope class="text-end">Cantidad</th>
                  <th scope>Bodega</th>
                  <th scope>Compartimiento</th>
                  <th scope class="text-end">Peso</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(articulo, index) in detalle_orden_despacho.orden.detalle" :key="index">
                  <tr>
                    <td class="fs-sm">
                      {{ articulo.ART_CODIGO }}
                    </td>
                    <td class="fs-sm">
                      {{ articulo.ART_CODIGO_TRES_LETRAS }}
                    </td>
                    <td class="fs-sm">
                      {{ articulo.ART_DESCRIPCION }}
                    </td>
                    <td class="fs-sm text-end">
                      {{ articulo.ART_CANTIDAD }}
                    </td>
                    <td>
                      {{ verpedido.BOD_BODEGA }}
                    </td>
                    <td>
                      {{ articulo.compartimiento }}
                    </td>
                    <td class="text-end">
                      {{ articulo.ART_PESO_TOTAL }}
                    </td>
                  </tr>
                </template>
                <tr>
                  <th scope colspan="7">&nbsp;</th>
                </tr>
                <tr>
                  <th scope colspan="6" class="fs-sm text-end">Peso total del despacho</th>
                  <th scope class="fs-sm text-end">{{ formatPrice(detalle_orden_despacho.orden.peso) }}Kg</th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="documentosPedidos && documentosPedidos.length" class="tab-pane fade flex-wrap gap-2 p-3"
          :class="{ 'active show': tabActual === 'documentos_pdf' }">
          <DocumentosPdf v-if="documentosPedidos" :documentos="documentosPedidos"></DocumentosPdf>
        </div>
        <div v-if="direccionEnvio && direccionEnvio.id" class="tab-pane fade flex-wrap gap-2 p-3"
          :class="{ 'active show': tabActual === 'direccion_envio' }">
          <DireccionEnvioOrd v-if="direccionEnvio" :direccion="direccionEnvio"></DireccionEnvioOrd>
        </div>
      </div>
      <div class="block-content block-content-full text-end bg-body">
        <button type="button" class="btn btn-success btn-sm mx-2" @click="imprimirOrdendespacho(currentOrden.id)"><i
            class="fa fa-print"></i> Imprimir</button>
        <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cerrar</button>
      </div>

      
    </template>

  </BaseBlock>
</template>
<script setup>
import { computed, ref } from "vue";
import { useStore } from 'vuex'
import { formatPrice } from "@/functions";
import DocumentosPdf from "@/views/ventas/modals/tabs/DocumentosPdf.vue";
import DireccionEnvioOrd from "@/views/ventas/modals/tabs/DireccionEnvioOrd.vue";

const store = useStore();
const picking = computed(() => store.state.picking);
const detalle_orden_despacho = computed(() => store.state.detalle_orden_despacho);
const detalle_orden_despacho_loading = computed(() => store.state.detalle_orden_despacho_loading);
const direccionEnvio = computed(() => store.state.detalle_orden_despacho?.orden?.sucursal);
const pesototal = ref(0);
const { verpedido, currentOrden, documentosPedidos } = defineProps({
  verpedido: Object,
  currentOrden: Object,
  documentosPedidos: Array
});
const tabActual = ref('detalle');
async function imprimirOrdendespacho(id) {
  store.dispatch('imprimir', '/despachos/imprimirordendespacho/' + id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'orden-despacho-' + id + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

</script>