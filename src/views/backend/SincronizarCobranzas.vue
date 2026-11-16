<template>
  <!-- Hero -->
  <BasePageHeading
    title="Sincronizar Cobranzas"
    subtitle="SIncronización de datos desde Dynamics GP"
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


// Used to reference test blocks

let serverResponse = ref('Esperando respuesta del servidor');

</script>
