<template>
  <!-- Hero -->
  <BasePageHeading
    title="Sincronizar"
    subtitle="Sincronización de datos desde Dynamics GP"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Administracion</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Sincronizar</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">

    <BaseBlock title="Procesos">
      <div class="row items-push">
        <div class="col-md-6">
          <div class="table-responsive">
            <table class="table table-bordered table-hover table-vcenter mb-0">
              <thead>
                <tr>
                  <th style="width: 25%">Acción</th>
                  <th style="min-width: 160px">Llamada API</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2" class="text-muted">Enviar a facturar los pedidos con "Factura a siguiente mes" del mes pasado</td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGPprocesos(procesosBlock,'/facturarsiguientemes')"
                      :disabled="isDisabled"
                    >
                      Procesar "Factura a siguiente mes"
                    </button>
                  </td>
                  <td>
                    <code>/api/facturarsiguientemes()</code>
                  </td>
                </tr> 
                
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-md-6">
          <BaseBlock
            ref="procesosBlock"
            title="Respuesta de procesos"
            bordered
          >
            <p>
              {{ serverResponseProcesos }}
            </p>
            <p v-if="errorMsg" class="alert alert-danger">{{errorMsg}}</p>
          </BaseBlock>
        </div>
      </div>
    </BaseBlock>

    <BaseBlock title="Métodos de sincronizacion">
      <p class="text-muted">
        Utilizar estos métodos cuando necesitamos actualizar la información que se obtiene desde <strong>Dynamics GP</strong> para cargar en la web
        
      </p>
      <div class="row items-push">
        <div class="col-md-6">
          <div class="table-responsive">
            <table class="table table-bordered table-hover table-vcenter mb-0">
              <thead>
                <tr>
                  <th style="width: 25%">Acción</th>
                  <th style="min-width: 160px">Llamada API</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenausuariosgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Usuarios
                    </button>
                  </td>
                  <td>
                    <code>/api/llenausuariosgp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenabodegasgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Bodegas
                    </button>
                  </td>
                  <td>
                    <code>/api/llenabodegasgp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenacondicionpagogp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Condicion Pago
                    </button>
                  </td>
                  <td>
                    <code>/api/llenacondicionpagogp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenaarticulosgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Artículos
                    </button>
                  </td>
                  <td>
                    <code>/api/llenaarticulosgp()</code>
                  </td>
                </tr>
                <!-- <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenaclientesgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Clientes
                    </button>
                  </td>
                  <td>
                    <code>/api/llenaclientesgp()</code>
                  </td>
                </tr> -->
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenapuntodeventaycajasgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar puntos de venta, cajas, bancos y unidad de medida
                    </button>
                  </td>
                  <td>
                    <code>/api/llenapuntosdeventagp()</code><br>
                    <code>/api/llenacajasgp()</code><br>
                    <code>/api/llenaunidadmedidasgp()</code><br>
                    <code>/api/llenacajabancos()</code><br>
                    <code>/api/llenaudatositemsl()</code>
                  </td>
                </tr>
                <!-- <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenaclientesucursalgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Sucursales de clientes
                    </button>
                  </td>
                  <td>
                    <code>/api/llenaclientesucursalgp()</code>
                  </td>
                </tr> -->
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenadescuentoformapagogp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar descuentos por forma de pago
                    </button>
                  </td>
                  <td>
                    <code>/api/llenadescuentoformapagogp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenarelacionesgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar relaciones de datos
                    </button>
                  </td>
                  <td>
                    <code>/api/llenarelacionpuntodeventabodegagp()</code><br>
                    <code>/api/llenarelacionpuntodeventabodegarelacionadagp()</code><br>
                    <code>/api/llenarelacionpuntodeventacajagp()</code><br>
                    <code>/api/llenarelacionpuntodeventaidventagp()</code><br>
                    <code>/api/llenarelacionusuariopuntoventagp()</code><br>
                    <code>/api/llenarelacionusuariocajagp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenavendedorgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Vendedores
                    </button>
                  </td>
                  <td>
                    <code>/api/llenavendedorgp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenaproveedorgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Proveedores
                    </button>
                  </td>
                  <td>
                    <code>/api/llenaproveedorgp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenaclaseclientegp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Clases de Clientes
                    </button>
                  </td>
                  <td>
                    <code>/api/llenaclaseclientegp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenagrupoysubgrupogp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar Grupos de Clientes
                    </button>
                  </td>
                  <td>
                    <code>/api/llenagrupoclientegp()</code><br>
                    <code>/api/llenasubgrupoclientegp()</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary w-100"
                      @click="sincronizaDataGP(testBlock,'/llenapaisesyterritoriosgp')"
                      :disabled="isDisabled"
                    >
                      Sincronizar paises y territorios
                    </button>
                  </td>
                  <td>
                    <code>/api/llenapaisgp()</code><br>
                    <code>/api/llenaterritoriogp()</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-md-6">
          <BaseBlock
            ref="testBlock"
            title="Respuesta"
            bordered
          >
            <p>
              {{ serverResponse }}
            </p>
            <p v-if="errorMsg" class="alert alert-danger">{{errorMsg}}</p>
          </BaseBlock>
        </div>
      </div>
    </BaseBlock>
    <!-- END Blocks API -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref } from "vue";
import { useStore} from 'vuex'

let errorMsg = ref('');
const store = useStore();
const testBlock = ref(null);
const procesosBlock = ref(null);
const isDisabled = ref(null);

function sincronizaDataGP(testBlock, path){
  errorMsg.value = null;
  isDisabled.value = true;
  testBlock.statusLoading()
  store.dispatch('sincronizaDataGP', path)
  .then((response) => {
      errorMsg.value = null;
      testBlock.statusNormal()
      serverResponse.value = response.data.message;
      isDisabled.value = false;
  })
  .catch(err => {
    isDisabled.value = false;
    testBlock.statusNormal()
    errorMsg.value = err.response.data.message
  }); 
}

function sincronizaDataGPprocesos(procesosBlock, path){
  errorMsg.value = null;
  isDisabled.value = true;
  procesosBlock.statusLoading()
  store.dispatch('sincronizaDataGP', path)
  .then((response) => {
      errorMsg.value = null;
      procesosBlock.statusNormal()
      serverResponseProcesos.value = response.data.message;
      isDisabled.value = false;
  })
  .catch(err => {
    isDisabled.value = false;
    procesosBlock.statusNormal()
    errorMsg.value = err.response.data.message
  }); 
}
// Used to reference test blocks

let serverResponse = ref('Esperando respuesta del servidor');
let serverResponseProcesos = ref('Esperando respuesta del servidor');
</script>