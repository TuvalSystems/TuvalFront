<template>
  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Cliente" class="pb-4">
      <form class="row row-cols-lg-auto g-3 align-items-center" @submit.prevent="buscarclientes">
        <div class="col-12">
          <label class="visually-hidden" for="buscar-cliente">Buscar cliente...</label>
          <input type="text" class="form-control" :class="errorbuscarcliente ? 'is-invalid' : ''" id="buscar-cliente"
            name="buscar-cliente" placeholder="Buscar cliente..." @keyup.enter="buscarclientes"
            v-model="buscarcliente.busqueda" />
        </div>
        <div>
          <button type="button" v-on:click="buscarclientes" class="btn btn-primary">Buscar</button>
          <router-link :to="{ name: 'ventas-crearcliente' }">
            <button type="button" class="mx-4 btn btn-success float-end">Crear cliente</button>
          </router-link>
        </div>
      </form>
      <div v-if="clientes.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <BaseBlock v-if="verclientes && !clientes.loading && clientes.data.length" class="mb-0">

        <div class="table-responsive">
          <table class="table table-hover table-sm table-vcenter">
            <thead>
              <tr>
                <th>RUC</th>
                <th>Razón Social</th>
                <th>Contacto</th>
                <th>Ciudad</th>
                <th>Provincia</th>
                <th>Teléfono</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cliente, index) in clientes.data" :key="index">
                <td class="">
                  <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{ cliente.CLI_RUC }} </a>
                </td>
                <td class="fs-sm">
                  <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{ cliente.CLI_RAZON_SOCIAL }} </a>
                </td>
                <td class="fs-sm">
                  {{ cliente.CLI_CONTACTO }}
                </td>
                <td class="fs-sm">
                  {{ cliente.CLI_CIUDAD }}
                </td>
                <td class="fs-sm">
                  {{ cliente.CLI_PROVINCIA }}
                </td>
                <td class="fs-sm">
                  {{ cliente.CLI_TELEFONO_1 }}
                </td>
                <td class="fs-sm">
                  <a :href="'mailto:' + cliente.CLI_CORREO_ELECT_SRI">{{ cliente.CLI_CORREO_ELECT_SRI }}</a>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>
      <BaseBlock v-if="currentCliente && !verclientes" class="mt-4 mb-0">
        <template #content>
          <div class="table-responsive">
            <table class="table table-striped table-sm table-vcenter">
              <tbody>
                <tr>
                  <th class="fs-sm">RUC</th>
                  <td class="fs-sm">{{ currentCliente.CLI_RUC }}</td>
                  <th class="fs-sm">Razón Social</th>
                  <td class="fs-sm">{{ currentCliente.CLI_RAZON_SOCIAL }}</td>
                  <th class="fs-sm">Descuento Comercial</th>
                  <td class="fs-sm">{{ currentCliente.CLI_DSTO_COMERCIAL }}%</td>

                </tr>
                <tr>
                  <th class="fs-sm">Ciudad</th>
                  <td class="fs-sm">{{ currentCliente.CLI_CIUDAD }}</td>

                  <th class="fs-sm">Provincia</th>
                  <td class="fs-sm">{{ currentCliente.CLI_PROVINCIA }}</td>

                  <th class="fs-sm">Condición de pago</th>
                  <td class="fs-sm">
                    {{ condiciondepago_print }}
                    <span class="badge bg-info" v-if="currentCliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{
                      currentCliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
                  </td>
                </tr>
                <tr>

                  <th class="fs-sm">Suspendido</th>
                  <td class="fs-sm">
                    <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                      :class="currentCliente.suspendido === 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">{{
                        currentCliente.suspendido
                          === 1 ? 'Si' : 'No' }}</span>

                  </td>
                  <th class="fs-sm">Cupo Asignado</th>
                  <td class="fs-sm">${{ currentCliente.cupo_asignado }}</td>
                  <th class="fs-sm">Cupo Disponible</th>
                  <td class="fs-sm" :class="parseFloat(currentCliente.cupo_disponible) < 0 ? 'text-danger' : ''">
                    ${{ currentCliente.cupo_disponible }}</td>
                </tr>
                <tr v-if="segmentocliente && segmentocliente.data &&
                  Object.keys(segmentocliente.data).length">
                  <th>Segmento</th>
                  <td>{{ segmentocliente.data.segmento }}</td>
                  <th>Subsegmento</th>
                  <td colspan="3">{{ segmentocliente.data.subsegmento }}</td>
                </tr>
                <tr v-else>
                  <td colspan="6" class="text-muted">
                    Sin segmento para este cliente
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
          <div class="row mb-4">

            <label for="select-sucursal-facturacion" class="col-sm-2 col-form-label text-left">Dirección de
              facturación:</label>
            <div class="col-sm-7">
              <div class="row">
                <div class="col-sm-9">
                  <select class="form-select" id="select-sucursal-facturacion" name="select-sucursal-facturacion"
                    v-model="sucursal_facturacion_id" @change="cambiacoordenadas()">
                    <option v-for="(sucursalfac, index) in currentCliente.sucursalesfacturacion" :key="index"
                      :value="sucursalfac.id">{{ sucursalfac.CLI_SUC_ID_DIRECCION }} - {{ sucursalfac.CLI_SUC_DIRECCION
                      }}
                    </option>
                  </select>
                </div>
                <div class="col-sm-2 text-center" v-if="coordenadas">
                  <p class="m-0" style="font-size: 10px;">Coordenadas</p>
                  <img src="/assets/images/earth.png" alt="Tiene coordenadas" class="img-fluid"
                    style="max-width: 25px;">
                </div>
                <div class="col-sm-2 text-center" v-else>
                  <p class="m-0" style="font-size: 10px;">Coordenadas</p>
                  <img src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                    style="max-width: 25px;">
                </div>
              </div>


            </div>
            <div class="col-sm-3 text-end"><button @click="crearDireccion" class="btn btn-sm btn-primary">Crear
                Dirección</button></div>
          </div>
          <div class="row items-push hide">
            <div class="col-md-4" v-for="(sucursal, index) in currentCliente.sucursales" :key="index">
              <div class="form-check form-block">
                <input type="radio" class="form-check-input" :id="`sucursal-${sucursal.id}`" name="example-radio-block"
                  @click="selectsucursal(sucursal.id)" :checked="sucursal.id === currentSucursal" />
                <label class="form-check-label" :for="`sucursal-${sucursal.id}`" :id="`label-sucursal-${sucursal.id}`">
                  <span class="d-block fw-normal text-center my-3 mb-0">
                    <span class="fs-6 fw-semibold">{{ sucursal.CLI_SUC_ID_DIRECCION }}</span>
                    <span class="d-block mb-2">{{ sucursal.CLI_SUC_DIRECCION }}</span>

                    <span class="d-block fs-6 fw-light py-3 m-3 bg-body-light rounded">{{ sucursal.CLI_SUC_PROVINCIA }}
                      <small> {{ sucursal.CLI_SUC_CIUDAD }}</small></span>
                    <small class="fs-sm mb-0 text-muted">{{ sucursal.VEND_NOMBRES }} {{ sucursal.VEND_APELLIDOS
                    }}</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <label for="select-bodega-despacho" class="col-sm-1 col-form-label text-left">Bodega:</label>
            <div class="col-sm-4">
              <select class="form-select" id="select-bodega-despacho" name="select-bodega-despacho"
                v-model="bodegaFacturacion" @change="changebodega()">
                <option v-for="(bodega, index) in bodegas" :key="index" :value="bodega.PTO_VTA_BOD_REL_BODEGA">
                  {{ bodega.PTO_VTA_BOD_REL_BODEGA }}</option>
              </select>
            </div>
            <div class="col-sm-7 text-end">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="despacho-punto" value="Retiro en bodega"
                  v-model="despacho">
                <label class="form-check-label" for="despacho-punto">Retiro en bodega</label>
              </div>
              <div v-if="bodega_selected.PERMITE_DESPACHO" class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="despacho-ruta" value="Despacho en ruta"
                  v-model="despacho">
                <label class="form-check-label" for="despacho-ruta">Despacho en ruta</label>
              </div>
            </div>
          </div>
          <div class="row mb-4" v-if="despacho === 'Despacho en ruta'">
            <label for="fecha_entrega" class="col-sm-2 col-form-label">
              Fecha de entrega: {{ fecha_entrega }}
            </label>
            <div class="col-sm-3">
              <flat-pickr id="fecha_entrega" class="form-control" v-model="fecha_entrega" :config="flatPickrState" />
            </div>
          </div>
          <div class="row mb-4" v-if="despacho === 'Despacho en ruta'">

            <label for="select-sucursal-entrega" class="col-sm-2 col-form-label text-left">Dirección de entrega:</label>
            <div class="col-sm-7">
              <div class="row">
                <div class="col-sm-9">
                  <select class="form-select" id="select-sucursal-entrega" name="select-sucursal-entrega"
                    v-model="sucursalEnvio" @change="cambiacoordenadasdeentrega()">
                    <option v-for="(sucursalfac, index) in currentCliente.sucursalesfacturacion" :key="index"
                      :value="sucursalfac.id">{{ sucursalfac.CLI_SUC_ID_DIRECCION }} - {{ sucursalfac.CLI_SUC_DIRECCION
                      }}
                    </option>
                  </select>
                </div>
                <div class="col-sm-2 text-center" v-if="coordenadasdeentrega">
                  <p class="m-0" style="font-size: 10px;">Coordenadas</p>
                  <img src="/assets/images/earth.png" alt="Tiene coordenadas" class="img-fluid"
                    style="max-width: 25px;">
                </div>
                <div class="col-sm-2 text-center" v-else>
                  <p class="m-0" style="font-size: 10px;">Coordenadas</p>
                  <img src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                    style="max-width: 25px;">
                </div>
              </div>
            </div>
          </div>
        </template>
      </BaseBlock>
    </BaseBlock>
    <BaseBlock v-if="currentSucursal && verCotizacion" title="Cotizacion" class="pb-4">
      <div v-if="store.state.cotizacion_serial"
        class="alert alert-warning d-flex align-items-center justify-content-between" role="alert">
        <div class="flex-grow-1 me-3">
          <p class="mb-0"> Editando Cotización <a class="alert-link" href="javascript:void(0)">{{
            store.state.cotizacion_serial }}</a></p>
        </div>
        <div class="flex-shrink-0">
          <i class="fa fa-fw fa-exclamation-circle"></i>
        </div>
      </div>
      <form class="row row-cols-lg-auto g-3 align-items-center">
        <div>
          <button type="button" @click="buscararticulo" class="btn btn-primary">Buscar Artículo</button>
          <button type="button" @click="actualizarStockPorLote" class="btn btn-success mx-4">Stock <i
              class="fa fa-refresh"></i></button>
        </div>
      </form>
      <div v-if="cotizacion.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="table-responsive">
        <table v-if="cotizacion.data.length && !cotizacion.loading"
          class="table table-hover table-sm table-vcenter mt-4">
          <thead>
            <tr class="text-center">
              <th>#</th>
              <th>Código</th>
              <th style="width:250px">Descripción</th>
              <th style="width:50px"> <!-- boton para listar descripciones alternativas --> </th>
              <th style="width:50px;text-align: center">ALT</th>
              <th>CTL</th>
              <th>UDM</th>
              <th></th>
              <th>Cantidad</th>
              <th></th>
              <th>Stock</th>
              <th>Mod %</th>
              <th class="text-end">Precio</th>
              <th class="text-end">% Desc.</th>
              <th class="text-end">T. con Desc.</th>
            </tr>
          </thead>
          <draggable v-model="cotizacion.data" tag="tbody" item-key="orden" handle=".handle" @end="guardarOrden">
            <template #item="{ element, index }">

              <tr class="text-center">
                <!-- id -->
                <td class="fs-sm">{{ index + 1 }}</td>
                <!-- codigo -->
                <td class="fs-sm">
                  {{ element.ART_CODIGO }}
                </td>
                <!-- descripcion -->
                <td class="fs-sm">
                  <a v-if="!element.cambiar_descripcion" @click="cambiarDescripcion(index)" href="javascript:void(0)"
                    title="Cambiar Descripción" :class="{
                      'text-danger': (element.ART_DESCRIPCION != element.ART_DESCRIPCION_ORIGINAL && element.ART_TIPO_COMPRA != 'L') || (element.ART_DESCRIPCION == element.ART_DESCRIPCION_ORIGINAL && element.ART_TIPO_COMPRA == 'L'),
                    }">{{ element.ART_DESCRIPCION }}
                    <span v-if="element.CHECK_ALTERNATIVO == 1" class="text-warning"> (Alternativa)</span></a>
                  <input v-else type="text" :id="`updatedescripcion-${element.id}`" class="form-control"
                    :class="element.errorDescripcion ? 'is-invalid' : ''" placeholder="Descripción"
                    :value="element.ART_DESCRIPCION" @change="updateDescripcion($event, element, index)"
                    @keyup.enter="updateDescripcion($event, element, index)">
                </td>

                <!-- obtener listado de descripciones -->
                <td>
                  <button type="button" @click="obtenerListaDescripcionAlternativas($event, element, index)"
                    class="btn btn-sm btn-info mx-1"><i class="fa fa-search"></i></button>
                </td>
                <!-- check alternativo -->
                <td style="text-align: center;">
                  <input class="form-check-input" type="checkbox" :id="`checkAlternativo-${element.id}`"
                    v-model="element.CHECK_ALTERNATIVO" :true-value="1" :false-value="0"
                    @click="updateCheckAlternative($event, element, index)">
                </td>
                <!-- codigo 3 letras -->
                <td class="fs-sm">
                  {{ element.ART_CODIGO_TRES_LETRAS }}
                </td>
                <!-- unidad de medida UDM -->
                <td class="fs-sm">
                  {{ element.ART_PLAN_UMEDIDA }}
                </td>

                <!-- abrir modal de proveedores -->
                <td class="fs-sm">
                  <div v-if="element.ART_TIPO_COMPRA == 'L'">
                    <button class="btn btn-sm" :class="element.proveedoreslistos ? 'btn-success' : 'btn-danger'"
                      title="Seleccionar Proveedor" @click="openModalProveedor(index, element)">
                      <i class="fa fa-people-arrows-left-right"></i>
                    </button>
                  </div>
                </td>
                <!-- final del modal de stock  -->


                <!-- cantidad -->
                <td class="fs-sm col-1">
                  <input type="text" :id="`updatecantidad-${element.id}`" class="form-control text-end"
                    placeholder="Cantidad" style="width: 6.25rem"
                    :class="element.errorCantidad || element.ART_CANTIDAD == 0 ? 'is-invalid' : ''"
                    :value="element.ART_CANTIDAD" @change="updateCantidad($event, element, index)" :tablindex="index">
                </td>

                <!-- modal para abrir stock de bodega -->
                <td>
                  <div v-if="element.ART_TIPO_COMPRA != 'L' && element.ART_TIPO_COMPRA != 'SERV'">
                    <button class="btn btn-sm" :class="element.stockListo ? 'btn-success' : 'btn-warning'"
                      title="Seleccionar stock por bodega" @click="openModalBodegas(index, element)"
                      :disabled="element.disableOpenModal || element.stockLoading">
                      <i v-if="element.stockLoading || element.disableOpenModal" class="fa fa-spinner fa-spin"></i>
                      <i v-else class="fa fa-boxes-packing"></i>
                    </button>
                  </div>
                  <div v-else>
                    <button class="btn btn-sm btn-info" title="Peso de artículo" @click="openModalPeso(index, element)">
                      <i class="fa fa-weight-hanging"></i>
                    </button>
                  </div>
                </td>
                <!-- stock -->
                <td class="fs-sm text-end">
                  <span v-if="element.ART_TIPO_COMPRA != 'L' && element.ART_TIPO_COMPRA != 'SERV'">{{ element.ART_STOCK
                  }}</span>
                </td>


                <!-- modificador -->
                <td class="fs-sm">
                  <input type="text" v-if="element.ART_TIPO_COMPRA != 'L'" :id="`modificador-${element.id}`"
                    class="form-control text-end" placeholder="Modificador Precio" :value="element.modificador"
                    @change="updateModificador($event, element, index)" style="width:6.25rem;">

                </td>

                <!-- precio -->
                <td class="fs-sm text-end col-1">
                  <a v-if="!element.cambiar_valor" @click="cambiarValor(index)" href="javascript:void(0)"
                    title="Cambiar Precio"
                    :class="element.ART_VALOR != element.ART_VALOR_ORIGINAL && element.ART_TIPO_COMPRA != 'L' ? 'text-danger' : ''">${{
                      formatPrice4(element.ART_VALOR) }}
                  </a>
                  <input v-else type="text" :id="`updateValor-${element.id}`" class="form-control text-end"
                    :class="element.errorDescuento ? 'is-invalid' : ''" placeholder="Precio"
                    :value="format4(formatPrice4(element.ART_VALOR))" @change="updateValor($event, element, index)"
                    @keyup.enter="updateValor($event, element, index)">
                </td>

                <!-- descuento con opcion de cambiar descuento-->
                <td class="fs-sm text-end col-1">
                  <a v-if="!element.cambiar_descuento" @click="cambiarDescuentoArticulo(index)"
                    href="javascript:void(0)" title="Cambiar Porcentaje de descuento"
                    :class="element.descuento != element.descuento_original ? 'text-danger' : ''">{{
                      format(element.descuento) }}%
                  </a>
                  <input v-else type="text" :id="`updateDescuento-${element.id}`" class="form-control text-end"
                    :class="element.errorDescuento ? 'is-invalid' : ''" placeholder="Descuento"
                    :value="element.descuento" @change="updateDescuentoArticulo($event, element, index)"
                    @keyup.enter="updateDescuentoArticulo($event, element, index)">
                </td>


                <!-- total con descuento -->
                <td class="fs-sm text-end">
                  ${{ (element.subtotal) }}
                </td>
                <!-- botones -->
                <td class="fs-sm nowrap">
                  <button type="button" class="btn btn-danger btn-sm mx-1"
                    @click="confirmeliminarArticulo(element, index)"><i class="fa fa-trash-can"></i></button>
                  <a class="btn btn-primary btn-sm handle mx-1" style="cursor: move;"><i
                      class="fa fa-arrows-up-down-left-right "></i></a>
                  <button class="btn btn-success btn-sm mx-1" v-if="element.imagenes && element.imagenes.length"
                    href="javascript:void(0)" @click="showPhoto(element.imagenes)">
                    <i class="fa fa-search"></i>
                  </button>


                </td>
              </tr>
            </template>

          </draggable>
          <tr>
            <th colspan="15" class="fs-sm text-end">Subtotal sin descuento</th>
            <th class="fs-sm text-end">${{ format(subtotal + descuento) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="15" class="fs-sm text-end">Descuento</th>
            <th class="fs-sm text-end">${{ format(descuento) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="15" class="fs-sm text-end">Subtotal - descuento </th>
            <th class="fs-sm text-end">${{ format(subtotal) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="15" class="fs-sm text-end">IVA</th>
            <th class="fs-sm text-end">${{ format(iva) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="15" class="fs-sm text-end">Total</th>
            <th class="fs-sm text-end">${{ format(parseFloat(total)) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="15" class="fs-sm text-end">&nbsp;</th>
            <th class="fs-sm text-end"></th>
            <th></th>
          </tr>
          <tr>
            <th colspan="15" class="fs-sm text-end">Peso total</th>
            <th class="fs-sm text-end">{{ format(peso) }}Kg</th>
            <th></th>
          </tr>
        </table>
      </div>
      <div class="row" v-if="cotizacion.data.length > 0">
        <div class="col-md-12">
          <!-- Dia de facutación -->
          <div class="row g-3 align-items-end mt-2">
            <div class="col-12 col-xl-3 order-1 order-xl-2 ms-xl-auto">
              <div v-if="alerta_facturar && alerta_facturar != '' && alerta_facturar != 'null'"
                class="alert alert-warning py-0 px-0 mb-0 w-auto d-inline-flex align-items-center">
                <span class="fw-semibold">{{ alerta_facturar }}</span>
              </div>
              <div v-if="pregunta_facturar == 1">
                <p class="alert alert-warning">Último día de facturación: {{
                  currentCliente.CLI_DIA_MAXIMO_MES_FACTURACION
                }}</p>
                <div class="form-check form-switch form-check-inline float-end">
                  <input class="form-check-input" type="checkbox" id="example-switch-default2"
                    name="example-switch-default2" v-model="facturarahora" @change="facturarahorachange($event)" />
                  <label class="form-check-label" for="example-switch-default2">Facturar ahora</label>
                </div>
              </div>
            </div>
            <div class="col-12 col-xl-5 order-2 order-xl-1 mb-0">

            </div>
            <!-- condicion de pago  -->
            <div class="col-12 col-xl-5 order-2 order-xl-2 mb-4">
              <label class="form-label">Condición de pago</label>
              <select class="form-select form-select-alt" id="select-condicion-pago" name="select-condicion-pago"
                v-model="condiciondepago_id" @change="selectcondicionpago($event)"
                :disabled="currentCliente.suspendido == 1">
                <option v-for="(condicion, index) in condiciondepago" :key="index" :value="condicion.COND_ID">{{
                  condicion.COND_ID }}</option>
              </select>
            </div>
            <!-- forma de pago -->
            <div class="col-12 col-xl-5 order-2 order-xl-3">
              <label class="form-label d-flex justify-content-between">
                <span><span>Forma de pago </span>
                  <span v-if="condiciondepago_id !== currentCliente.CLI_CONDICION_PAGO"
                    class="fs-xs fw-semibold d-inline-block py-1 px-2 rounded-pill bg-danger-light text-danger">Condición
                    diferente</span>
                </span>
              </label>
              <select class="form-select" v-model="formadepago_id" @change="selectformapago($event)">
                <option v-for="(pago, index) in formadepago" :key="index" :value="pago.DESC_FORMA_PAGO_CODIGO">{{
                  pago.DESC_FORMA_PAGO_TIPO_CREDITO }}</option>
              </select>
              <code>Descuento:
            <span v-if="!cambiardescuento">
              <a href="javascript:void(0)" @click="cambiarDescuento()"
                :class="descuentooriginal != descuentoarticulo ? 'text-danger' : ''">{{ descuentoarticulo }}%</a>
            </span>
            <input v-else type="text" id="updateDescuento" class="form-control text-end"
              :class="errorDescuento ? 'is-invalid' : ''" placeholder="Descuento" :value="descuentoarticulo"
              @change="updateDescuento($event)" @keyup.enter="updateDescuento($event)">
          </code>
            </div>

          </div>

          <div class="row g-1 align-items-end mb-3">
            <!-- Descuento general PVP -->
            <div class="col-12 col-md-6 col-xl-3">
              <label for="modificador-general" class="form-label">Descuento general PVP</label>
              <div class="input-group ">
                <input id="modificador-general" type="number" min="0" max="100" step="0.01"
                  class="form-control text-end" placeholder="0.00" v-model.number="modificador_general"
                  @change="modificadorgeneral()" />
                <span class="input-group-text input-group-text-alt">%</span>
              </div>

            </div>

            <!-- Orden de compra con contador -->
            <div class="col-12 col-md-6 col-xl-3">
              <label for="orden-de-compra" class="form-label d-flex justify-content-between">
                <span>Orden de compra</span>
              </label>
              <div class="input-group">
                <input id="orden-de-compra" type="text" class="form-control " placeholder="Opcional"
                  v-model="orden_de_compra" :maxlength="max_length" />
                <span v-if="orden_de_compra" class="input-group-text input-group-text-alt">{{ max_length -
                  orden_de_compra.length
                }}</span>

              </div>
            </div>
          </div>
          <div class="row g-2 align-items-end mb-3">
            <!-- Nota cliente -->
            <div class="col-12 col-lg-6">
              <label for="nota-cliente" class="form-label">Nota cliente</label>
              <div class="input-group">

                <textarea id="nota-cliente" class="form-control" rows="3" :maxlength="max_length_nota"
                  v-model.trim="nota_cliente"></textarea>
                <span v-if="nota_cliente" class="input-group-text input-group-text-alt">{{ max_length_nota -
                  nota_cliente.length
                }}</span>
              </div>
            </div>
            <!-- Nota interna -->
            <div class="col-12 col-lg-6">
              <label for="nota-interna" class="form-label">Nota interna</label>
              <textarea id="nota-interna" class="form-control " rows="3" v-model.trim="nota_interna"></textarea>
            </div>
          </div>

          <!-- BOTONERA -->
          <div class="d-flex flex-wrap gap-2 mt-2">
            <button type="button" class="btn btn-danger" @click="limpiarCotizacion">
              Limpiar cotización
            </button>

            <div class="ms-auto">
              <button type="button" class="btn btn-success me-2"
                :disabled="!(validaCantidad && validaPrecio && validaDescripcion && validaProveedores && btnDisabledStore)"
                @click="guardarCotizacion">
                Guardar Cotización
              </button>

              <button type="button" class="btn btn-warning" v-if="store.state.cotizacion_serial"
                :disabled="!(validaCantidad && validaPrecio && validaDescripcion && validaProveedores && validaStock && btnDisabledStore && btnStoreOrder)"
                @click="confirmGuardarPedido">
                Guardar Pedido
              </button>
            </div>
          </div>

          <!-- fin de pruebas -->
        </div>
      </div>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
  <!-- Large Block Modal -->
  <div class="modal" id="modal-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-cliente" aria-hidden="true"
    ref="articuloModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="max-width: 90vw;">
      <div class="modal-content">

        <ArticulosModal @verificarProveedores="verificarProveedores()" @verificarStock="verificarStock()"
          @calcTotales="calcTotales()"></ArticulosModal>

        <div class="block-content block-content-full text-end bg-body">
          <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- END Large Block Modal -->
  <div class="modal fade" id="modal-block-proveedor" tabindex="-1" role="dialog" aria-labelledby="modal-block-proveedor"
    data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" ref="proveedorModal">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <ProveedorModal @calculaTotalProveedor="calculaTotalProveedor" @verificarProveedores="verificarProveedores()">
        </ProveedorModal>
      </div>
    </div>
  </div>
  <!-- Large Block Modal -->
  <div class="modal" id="modal-crear-direccion" tabindex="-1" role="dialog" aria-labelledby="modal-crear-direccion"
    aria-hidden="true" ref="crearDireccionModal">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <CrearDireccionModal @guardar="cerrarModalDireccion"></CrearDireccionModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-bodegas" tabindex="-1" role="dialog" aria-labelledby="modal-bodegas" aria-hidden="true"
    ref="bodegasModal">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <BodegasModal :indexbodegas="indexbodegas" :verbodegas="verbodegas" @cerrar="cerrarBodegasModal()"
          @calcTotales="calcTotales()" @verificarstoc="verificarStock()">
        </BodegasModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-peso" tabindex="-1" role="dialog" aria-labelledby="modal-peso" aria-hidden="true"
    ref="pesoModal">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <PesoModal :indexArticulo="indexArticulo" :modArticulo="modArticulo" @cerrar="cerrarPesoModal()"
          @calcTotales="calcTotales()">
        </PesoModal>
      </div>
    </div>
  </div>
  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />

  <!-- Modal para listar y asignar item alternativo -->
  <div class="modal" id="modal-item-alternativo" tabindex="-1" role="dialog" aria-labelledby="modal-item-alternativo"
    aria-hidden="true" ref="verItemAlternativo">
    <div class="modal-dialog modal-sm modal-dialog-centered" role="document" style="max-width: 400px">
      <div class="modal-content">
        <ItemAlternativoComponent v-if="itemAlternativo" :item="itemAlternativo.item"
          @seleccionarAlternativa="onSelectItemAlternativo">
        </ItemAlternativoComponent>
      </div>
    </div>
  </div>


  <!-- modal para actualizacion de segmento -->
  <div class="modal" id="modal-segmento" tabindex="-1" role="dialog" aria-labelledby="modal-segmento" aria-hidden="true"
    ref="verModalActualizarSegmento">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <actualizarSegmentoClienteComponent v-if="datosCliente" :cliente="datosCliente"
          @updated="procesoDeSelectCliente">
        </actualizarSegmentoClienteComponent>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex'
import { Modal } from "bootstrap";
import { useTemplateStore } from "@/stores/template";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { formatPrice, formatPrice4, formatPrice3, formatPriceClean, format, format4 } from "@/functions";

import draggable from 'vuedraggable'
import CrearDireccionModal from "../modals/CrearDireccionModal.vue";
import BodegasModal from "../modals/BodegasModal.vue";
import PesoModal from "../modals/PesoModal.vue";
import ArticulosModal from "../modals/ArticulosModal.vue";
import ProveedorModal from "../modals/ProveedorModal.vue";
import VueEasyLightbox from "vue-easy-lightbox";
import ItemAlternativoComponent from "../modals/ItemAlternativoModal.vue";
import { useCheckClientSegment } from "../../../composables/venta/cotizaciones/useCheckClientSegment";
import actualizarSegmentoClienteComponent from "../modals/actualizarSegmentoClienteModal.vue";
const { loadingCheck, fetchCheckSegmentoClient } = useCheckClientSegment();


const store = useStore();
const templateStore = useTemplateStore();

const gallery = reactive({
  visible: false,
  index: 0,
  photos: [],
});

function showPhoto(imagenes) {
  gallery.index = 0;
  gallery.visible = true;
  gallery.photos = imagenes;
}

// Helper function to hide the lightbox
function handleHide() {
  gallery.visible = false;
}


const buscarcliente = reactive({
  busqueda: null,
});

const router = useRouter();

let errorMsg = ref('');

const verclientes = ref(false);
const verCotizacion = ref(false);

const verproveedor = computed(() => store.state.verproveedor);
const verbodegas = ref(false);
const indexproveedor = computed(() => store.state.indexproveedor);
const indexbodegas = ref(null);
const indexArticulo = ref(null);
const modArticulo = ref(null);
const formadepago_id = ref(store.state.formadepago_id);
const despacho = ref(store.state.despacho);

const condiciondepago_id = ref(store.state.condiciondepago_id);
const condiciondepago_print = ref(store.state.condiciondepago_print);
const currentCliente = computed(() => store.state.currentCliente);
const bodegas = computed(() => store.state.bodegas);
const clientes = computed(() => store.state.clientes);
const registro_copia = computed(() => store.state.registro_copia);
const currentSucursal = computed(() => store.state.currentSucursal);
const currentTest = computed(() => store.state.currentTest);
const sucursalFacturacion = ref(store.state.sucursal_facturacion_id);
const sucursalEnvio = ref(store.state.currentSucursal);
const pregunta_facturar = ref(store.state.pregunta_facturar);
const facturarahora = ref(false);
const factura_posterior_despacho = ref(store.state.factura_posterior_despacho);
const factura_a_demanda = ref(store.state.factura_a_demanda);
const factura_siguiente_mes = ref(store.state.factura_siguiente_mes);
const alerta_facturar = ref(store.state.alerta_facturar);
const bodega_selected = ref(bodegas.value[0]);
const bodegaFacturacion = ref(store.state.bodegaFacturacion);
const nota_interna = ref(store.state.nota_interna);
const sucursal_facturacion_id = ref(store.state.sucursal_facturacion_id);
const coordenadas = ref(null);
const coordenadasdeentrega = ref(null);
const nota_cliente = ref(store.state.nota_cliente);
const orden_de_compra = ref(store.state.orden_de_compra);
const max_length = ref(20);
const max_length_nota = ref(300);

const modificador_general = ref(0);
const cotizacion = computed(() => store.state.cotizacion);

const descuentoarticulo = computed(() => store.state.descuentoarticulo);
const descuentooriginal = computed(() => store.state.descuentooriginal);
const formadepago = computed(() => store.state.formadepago);
const condiciondepago = ref(store.state.condiciondepago);

const subtotal = ref(store.state.subtotal);
const peso = ref(store.state.peso);
const descuento = ref(store.state.descuento);
const iva = ref(store.state.iva);
const total = ref(store.state.total);
const today = new Date();
let errorbuscarcliente = ref(false);
const fecha_entrega = ref(store.state.fecha_entrega);
const flatPickrState = reactive({
  minDate: Date.now(),
  monthSelectorType: "static",
  locale: Spanish,
});

const segmentocliente = computed(() => store.state.segmentocliente);




if (fecha_entrega.value === '') {
  fecha_entrega.value = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
}

function changebodega() {
  bodega_selected.value = bodegas.value.find(item => item.PTO_VTA_BOD_REL_BODEGA === bodegaFacturacion.value);
}

async function buscarclientes(ev) {
  if (buscarcliente.busqueda.length < 3) {
    errorbuscarcliente.value = true;
    return;
  }

  errorbuscarcliente.value = false;
  store.commit('nullCurrentcliente');
  store.commit('setCurrentSucursal', null);
  verCotizacion.value = false;
  store.commit('setVerProveedor', false);
  verbodegas.value = false;
  store.commit('setDescuentoArticulo', 0);
  store.commit('setDescuentoOriginal', 0);
  verclientes.value = true;
  ev.preventDefault();
  store.dispatch('buscarclientes', buscarcliente)
    .catch(err => {
      verclientes.value = false;
      errorMsg.value = err.response.data.error
    });
}

const verModalActualizarSegmento = ref(null)
let verModalActualizarSegmentoObj = null

const datosCliente = ref(null)
async function selectcliente(cliente) {
  try {
    const result = await fetchCheckSegmentoClient(cliente);
    if (result.exists === false) {
      if (cliente !== null) {
        datosCliente.value = cliente;
        verModalActualizarSegmentoObj.show();
      }
    } else {
      procesoDeSelectCliente(cliente);
    }

  } catch (error) {
    console.log(error);

  }

}
function procesoDeSelectCliente(cliente) {
  store.dispatch('cupoDisponible', cliente.CLI_RUC).then((cupo) => {
    store.commit('resetCotizacion');
    store.commit('resetRegistroCopia');
    store.commit('setDespacho', 'Retiro en bodega');
    verclientes.value = false;
    verCotizacion.value = false;
    store.commit('setCurrentSucursal', null);
    sucursalFacturacion.value = cliente.sucursales[0].id;
    sucursalEnvio.value = cliente.sucursales[0].id;
    store.commit('setVerProveedor', false);
    verbodegas.value = false;
    store.commit('setIndexProveedor', null);
    indexbodegas.value = null;

    cliente.suspendido = cupo.suspendido;
    cliente.cupo_disponible = cupo.cupo_disponible;
    cliente.cupo_asignado = cupo.cupo_asignado;
    sessionStorage.setItem('CURRENTCLIENTE', JSON.stringify(cliente));
    store.commit('setCurrentcliente', cliente);
    store.commit('setDescuentoArticulo', currentCliente.value.CLI_DSTO_COMERCIAL);
    store.commit('setDescuentoOriginal', currentCliente.value.CLI_DSTO_COMERCIAL);
    condiciondepago_id.value = currentCliente.value.CLI_CONDICION_PAGO;
    condiciondepago_print.value = currentCliente.value.CLI_CONDICION_PAGO;
    sessionStorage.setItem('CONDICIONDEPAGOPRINT', currentCliente.value.CLI_CONDICION_PAGO)
    if (currentCliente.value.suspendido == 1)
      condiciondepago_id.value = 'CONTADO';

    bodegaFacturacion.value = bodegas.value[0].PTO_VTA_BOD_REL_BODEGA;
    sucursal_facturacion_id.value = cliente.sucursales[0].id;
    coordenadas.value = cliente.sucursales[0].coordenadas;
    coordenadasdeentrega.value = cliente.sucursales[0].coordenadas;

    store.commit('llenaformadepago', condiciondepago_id);
    store.commit('setNuevadireccion');
    formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
    alerta_facturar.value = '';
    factura_siguiente_mes.value = 0;
    factura_a_demanda.value = 0;
    pregunta_facturar.value = 0;
    factura_posterior_despacho.value = 0;
    if (currentCliente.value.CLI_FACTURA_POSTERIOR_AL_DESPACHO == 'SI') {
      if (currentCliente.value.CLI_DIA_MAXIMO_MES_FACTURACION == 1) {
        factura_posterior_despacho.value = 1;
        factura_a_demanda.value = 1;
        alerta_facturar.value = 'Factura a demanda posterior al despacho';
      } else if (today.getDate() <= currentCliente.value.CLI_DIA_MAXIMO_MES_FACTURACION) {
        factura_posterior_despacho.value = 1;
      } else {
        factura_posterior_despacho.value = 1;
        pregunta_facturar.value = 1;
        factura_siguiente_mes.value = 1;
      }
    }
    sessionStorage.setItem('factura_posterior_despacho', factura_posterior_despacho.value);
    sessionStorage.setItem('factura_a_demanda', factura_a_demanda.value);
    sessionStorage.setItem('factura_siguiente_mes', factura_siguiente_mes.value);
    sessionStorage.setItem('alerta_facturar', alerta_facturar.value);
    sessionStorage.setItem('pregunta_facturar', pregunta_facturar.value);

    store.commit('setCurrentSucursal', cliente.sucursales[0].id);

    verCotizacion.value = true;
    store.commit('setVerProveedor', false);
    verbodegas.value = false;
    //llenarcotizacion();

    setTimeout(() => {
      const elem = document.getElementById('label-sucursal-' + currentSucursal.value);
      if (elem)
        elem.click();
    }, "100")
  })
}

function cambiacoordenadas() {
  currentCliente.value.sucursales.map(item => {
    if (item.id === sucursal_facturacion_id.value)
      coordenadas.value = item.coordenadas
  })
}

function cambiacoordenadasdeentrega() {
  currentCliente.value.sucursales.map(item => {
    if (item.id === sucursalEnvio.value)
      coordenadasdeentrega.value = item.coordenadas
  })
}


function facturarahorachange(event) {
  if (facturarahora.value) {
    factura_siguiente_mes.value = 0;
  } else {
    factura_siguiente_mes.value = 1;
  }
}

function selectsucursal(sucursal) {
  verCotizacion.value = true;
  store.commit('setCurrentSucursal', sucursal);
  store.commit('setVerProveedor', false);
  verbodegas.value = false;
  llenarcotizacion();
}

function buscararticulo() {
  store.commit('resetArticulo');
  store.commit('limpiarBusqueda');
  articuloModalObj.show();
}

let btnDisabledStore = ref(true);
async function actualizarStockPorLote() {

  cotizacion.value.data.forEach((item) => {
    item.stockLoading = true; // todos inician deshabilitados
    btnDisabledStore.value = false;
  });

  for (let i = 0; i < cotizacion.value.data.length; i++) {

    const item = cotizacion.value.data[i];
    if (item.ART_TIPO_COMPRA === 'L') {
      item.stockLoading = false;
      continue;
    }
    try {
      const consulta = {
        articulo: item,
        bodega: store.state.puntodeventaselect,
        'tipo': 'LOTE',
        'cotizacion_id': store.state.cotizacion_id
      }
      const res = await store.dispatch('getArticuloStockPorBodega', consulta);

      if (res.success == true && res.data) {
        let stockItem = res.data;
        item.stock = stockItem.stock;
        item.ART_STOCK = stockItem.ART_STOCK;
        item.stockListo = stockItem.stockListo;
        item.stockLoading = false;
        btnDisabledStore.value = false;
        calcTotales();
      } else {
        item.errorStock = true
      }
    } catch (error) {
      item.errorStock = true
    }
    item.stockLoading = false;
  }
  // 🔍 Esperar a que todos estén actualizados
  const interval = setInterval(() => {
    const allUpdated = cotizacion.value.data.every(item => item.stockLoading === false);
    if (allUpdated) {
      btnDisabledStore.value = true;
      clearInterval(interval);
    }
  }, 100); // chequea cada 100ms si terminó
}

async function llenarcotizacion() {
  if (currentSucursal.value && currentCliente.value) {
    if (condiciondepago_id.value == null) {
      condiciondepago_id.value = currentCliente.value.CLI_CONDICION_PAGO;
      condiciondepago_print.value = currentCliente.value.CLI_CONDICION_PAGO;
      sessionStorage.setItem('CONDICIONDEPAGOPRINT', currentCliente.value.CLI_CONDICION_PAGO)
    }

    if (currentCliente.value.suspendido === 1) {
      condiciondepago_id.value = 'CONTADO';
    }

    if (bodegaFacturacion.value == null) {
      bodegaFacturacion.value = bodegas.value[0].PTO_VTA_BOD_REL_BODEGA;
    }
    if (sucursal_facturacion_id.value == null) {
      sucursal_facturacion_id.value = currentCliente.value.sucursales[0].id;
    }
    changebodega();

    store.commit('llenaformadepago', condiciondepago_id);
    store.commit('setNuevadireccion');
    if (formadepago_id.value == null)
      formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;

    if (currentCliente.value.suspendido == 1) {
      formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
    }
    const restardescuento = formadepago.value.find(item => item.DESC_FORMA_PAGO_CODIGO === formadepago_id.value).DESC_FORMA_PAGO_PORCENTAJE_REBAJAR
    store.commit('setDescuentoArticulo', parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento));
    store.commit('setDescuentoOriginal', parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento));
    const consulta = reactive({
      sucursal_id: currentSucursal.value,
      cliente_id: currentCliente.value.id,
      puntodeventa_id: store.state.puntodeventaselect,
      serial: store.state.cotizacion_serial,
      registro_copia: registro_copia.value,
      test: currentTest.value,
    })
    store.dispatch('llenarcotizacion', consulta).then(() => {
      calcTotales();
    });
    cambiacoordenadas()
    cambiacoordenadasdeentrega()
  }
}
function selectformapago() {


  const restardescuento = formadepago.value.find(item => item.DESC_FORMA_PAGO_CODIGO === formadepago_id.value).DESC_FORMA_PAGO_PORCENTAJE_REBAJAR
  formadepago_id.value = formadepago.value.find(item => item.DESC_FORMA_PAGO_CODIGO === formadepago_id.value).DESC_FORMA_PAGO_CODIGO;

  store.commit('setDescuentoArticulo', parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento));
  store.commit('setDescuentoOriginal', parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento));

  cotizacion.value.data.map(articulo => {
    articulo.descuento_original = parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento);
    articulo.descuento = parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento);
  })

  if (descuentoarticulo.value < 0) {
    swalWarning('Descuento menor que cero');
    return;
  }
  calcTotales();
}

function selectcondicionpago(event) {
  store.commit('llenaformadepago', condiciondepago_id);
  const primeraFormaPago = formadepago.value[0];
  formadepago_id.value = primeraFormaPago?.DESC_FORMA_PAGO_CODIGO;

  const rebaja = parseFloat(primeraFormaPago?.DESC_FORMA_PAGO_PORCENTAJE_REBAJAR) || 0;
  const descuentoBase = parseFloat(currentCliente.value.CLI_DSTO_COMERCIAL) || 0;
  const nuevoDescuentoTotal = descuentoBase + rebaja;

  store.commit('setDescuentoArticulo', nuevoDescuentoTotal);
  store.commit('setDescuentoOriginal', nuevoDescuentoTotal);

  cotizacion.value.data.forEach(articulo => {
    articulo.descuento = nuevoDescuentoTotal;
    articulo.descuento_original = nuevoDescuentoTotal;
  });

  // 6. Recalcular
  calcTotales();
}

let articuloModal = ref(null);
let articuloModalObj = null;

let proveedorModal = ref(null);
let proveedorModalObj = null;

let bodegasModal = ref(null);
let bodegasModalObj = null;

let pesoModal = ref(null);
let pesoModalObj = null;

let crearDireccionModal = ref(null);
let crearDireccionModalObj = null;

//llenarcotizacion();



function confirmeliminarArticulo(articulo, index) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar el producto " + articulo.ART_CODIGO + "",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, eliminarlo!",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        eliminarArticulo(articulo, index)
      }
    });
}

async function eliminarArticulo(articulo, index) {
  store.commit('setVerProveedor', false);
  verbodegas.value = false;
  store.dispatch('eliminarArticulo', articulo).then(() => {
    cotizacion.value.data.splice(index, 1);
    calcTotales();
  });
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}
function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function updateCantidad(event, articulo, index) {
  if (!isInt(event.target.value) && articulo.ART_DECIMAL_CANTIDAD == 0) {
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número entero');
    return false;
  } else if (articulo.ART_DECIMAL_CANTIDAD > 0 && isNaN(event.target.value)) {
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número');
    return false;
  }

  /* if(articulo.ART_TIPO_COMPRA != 'L' && (parseFloat(cotizacion.value.data[index].ART_STOCK)<parseFloat(event.target.value))){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('No hay stock suficiente');
    return false;
  } */

  if (articulo.ART_DECIMAL_CANTIDAD > 0) {
    event.target.value = formatPrice4(event.target.value);
  }

  const updatecantidad = reactive({
    articulo: articulo.id,
    cantidad: event.target.value,
  })
  store.dispatch('updateCantidad', updatecantidad).then(() => {
    cotizacion.value.data[index].errorCantidad = false;
    cotizacion.value.data[index].ART_CANTIDAD = event.target.value;
    calcTotales();
  });
}

function updateModificador(event, articulo, index) {
  if (isNaN(event.target.value)) {
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número');
    return false;
  }

  const updatemodificador = reactive({
    articulo: articulo.id,
    modificador: event.target.value,
  })
  store.dispatch('updateModificador', updatemodificador).then(() => {
    cotizacion.value.data[index].modificador = event.target.value;
    calcTotales();
  });
}

function modificadorgeneral() {
  cotizacion.value.data.map(articulo => {
    articulo.modificador = formatPrice4(modificador_general.value);

    const updatemodificador = reactive({
      articulo: articulo.id,
      modificador: articulo.modificador,
    })
    store.dispatch('updateModificador', updatemodificador)
  })
  calcTotales();
}

function cambiarDescripcion(index) {
  cotizacion.value.data[index].cambiar_descripcion = true;
}

function updateDescripcion(event, articulo, index) {
  if (event.target.value.length < 5) {
    cotizacion.value.data[index].errorDescripcion = true;
    return;
  }
  cotizacion.value.data[index].errorDescripcion = false;
  cotizacion.value.data[index].ART_DESCRIPCION = event.target.value;
  cotizacion.value.data[index].cambiar_descripcion = false;
  const updatedescripcion = reactive({
    articulo: articulo.id,
    ART_DESCRIPCION: event.target.value,
  })
  store.dispatch('updateDescripcion', updatedescripcion);
  calcTotales();
}

function cambiarValor(index) {
  cotizacion.value.data[index].cambiar_valor = true;
}
function cambiarDescuentoArticulo(index) {
  cotizacion.value.data[index].cambiar_descuento = true;
}
function updateValor(event, articulo, index) {

  if (isNaN(event.target.value)) {
    cotizacion.value.data[index].errorValor = true;
    swalError('Ingresar un número');
    return false;
  }

  if (cotizacion.value.data[index].ART_TIPO_COMPRA != 'L') {
    var modificador = (((formatPrice4(event.target.value) / cotizacion.value.data[index].ART_VALOR_ORIGINAL) - 1) * (-100));
  } else {
    var modificador = 0;
  }

  const updatevalor = reactive({
    articulo: articulo.id,
    ART_VALOR: formatPrice4(event.target.value),
    modificador: modificador
  })
  store.dispatch('updateValor', updatevalor).then(() => {

    cotizacion.value.data[index].errorValor = false;
    cotizacion.value.data[index].ART_VALOR = updatevalor.ART_VALOR,
      cotizacion.value.data[index].modificador = updatevalor.modificador,
      cotizacion.value.data[index].cambiar_valor = false;
    calcTotales();
  });
}

function updateDescuentoArticulo(event, articulo, index) {

  if (isNaN(event.target.value)) {
    cotizacion.value.data[index].errorDescuento = true;
    swalError('Ingresar un número');
    return false;
  }

  const updateDescuento = reactive({
    articulo: articulo.id,
    descuento: formatPrice4(event.target.value),
  })
  store.dispatch('updateDescuento', updateDescuento).then(() => {
    cotizacion.value.data[index].errorDescuento = false;
    cotizacion.value.data[index].descuento = parseFloat(event.target.value),
      cotizacion.value.data[index].cambiar_descuento = false;
    calcTotales();
  });
}
let cambiardescuento = ref(false);
let errorDescuento = ref(false);
function cambiarDescuento() {
  cambiardescuento.value = true;
}
function updateDescuento(event) {
  if (isNaN(event.target.value)) {
    errorDescuento.value = true;
    swalError('Ingresar un número');
    return false;
  }
  errorDescuento.value = false;
  store.commit('setDescuentoArticulo', event.target.value);

  let envio = {};

  cotizacion.value.data.map(articulo => {
    articulo.descuento = parseFloat(event.target.value);


    envio.articulo = articulo.id;
    envio.descuento = articulo.descuento;

    store.dispatch('updateDescuento', envio).then(() => {
      articulo.errorDescuento = false;
      articulo.cambiar_descuento = false;
    });
  })

  calcTotales();
  cambiardescuento.value = false;
}



let validaCantidad = ref(true);
let validaPrecio = ref(true);
let validaDescripcion = ref(true);

function calcTotales1() {
  subtotal.value = 0;
  descuento.value = 0;
  iva.value = 0;
  total.value = 0;
  peso.value = 0;
  validaCantidad.value = true;
  validaPrecio.value = true;
  validaDescripcion.value = true;
  cotizacion.value.data.map(articulo => {

    if (articulo.ART_TIPO_COMPRA == 'L' && (articulo.ART_DESCRIPCION == articulo.ART_DESCRIPCION_ORIGINAL)) {
      validaDescripcion.value = false;
    }

    if (articulo.ART_TIPO_COMPRA != 'L') {
      articulo.ART_VALOR = formatPrice4(articulo.ART_VALOR_ORIGINAL - (articulo.ART_VALOR_ORIGINAL * parseFloat(articulo.modificador) / 100));
      articulo.ART_VALOR_ORIGINAL = formatPrice4(articulo.ART_VALOR_ORIGINAL);
    }
    articulo.ART_DESCUENTO = formatPrice4((articulo.ART_VALOR * (articulo.descuento / 100))) //formatPrice3
    articulo.subtotal = formatPrice(formatPrice4((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD))
    subtotal.value += articulo.subtotal;
    descuento.value += formatPrice(articulo.ART_DESCUENTO * articulo.ART_CANTIDAD);
    articulo.ART_IVA = formatPrice(formatPrice4((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD)) * (articulo.ART_IMP_VTA / 100)
    iva.value = Math.round((iva.value + articulo.ART_IVA + Number.EPSILON) * 100) / 100;
    if (articulo.ART_CANTIDAD == 0) {
      validaCantidad.value = false;
    }
    if (articulo.ART_VALOR == 0) {
      validaPrecio.value = false;
    }
    peso.value += formatPrice(articulo.ART_PESO) * articulo.ART_CANTIDAD;

    articulo.subtotal = format(articulo.subtotal);

  })
  total.value = formatPrice(subtotal.value + iva.value);
  verificarProveedores(false);
  verificarStock();
}

function calcTotales() {
  // 1.- Reiniciar acumuladores
  let tempSubtotal = 0;
  let tempDescuento = 0;
  let tempIva = 0;
  let tempPeso = 0;

  // 2.- Reiniciar validaciones
  validaCantidad.value = true;
  validaPrecio.value = true;
  validaDescripcion.value = true;

  // 3 .- usar foreach para iterar
  cotizacion.value.data.forEach(art => {

    // logica de validaciones
    if (art.ART_TIPO_COMPRA == 'L' && (art.ART_DESCRIPCION == art.ART_DESCRIPCION_ORIGINAL)) {
      validaDescripcion.value = false;
    }

    if (art.ART_CANTIDAD <= 0) {
      validaCantidad.value = false;
    }

    // logica de precios

    // Si no es tipo 'L', aplicamos modificador al precio original
    if (art.ART_TIPO_COMPRA !== 'L') {
      let valorUnitario = parseFloat(art.ART_VALOR_ORIGINAL);
      const modificador = parseFloat(art.modificador) || 0;
      valorUnitario = valorUnitario - ((valorUnitario * modificador) / 100);
      art.ART_VALOR = redondear(valorUnitario, 4);
    } else {
      art.ART_VALOR = redondear(parseFloat(art.ART_VALOR), 4);
    }

    if (art.ART_VALOR === 0) {
      validaPrecio.value = false;
    }


    // --- Cálculos Matemáticos (Todo Numérico) ---
    const precioParaCalculo = art.ART_VALOR;
    const descuentoPorcentaje = parseFloat(art.descuento) || 0;
    const cantidad = parseFloat(art.ART_CANTIDAD) || 0;

    //calcular descuento unitario
    const descuentoUnitario = precioParaCalculo * (descuentoPorcentaje / 100);
    art.ART_DESCUENTO = descuentoUnitario;

    //calcular SUBTOTAL de la linea (precio - descuento) * cantidad
    const precioConDescuento = precioParaCalculo - descuentoUnitario;
    const subtotalLinea = redondear(precioConDescuento * cantidad, 2);

    //guardamos el valor numerico crudo para calculos
    // art.subTotalRaw = subtotalLinea;
    art.subtotal = subtotalLinea;

    //Acumuladores Globales
    tempSubtotal += subtotalLinea;
    tempDescuento += (descuentoUnitario * cantidad);

    //calculo del IVA
    const ivaPorcentaje = parseFloat(art.ART_IMP_VTA) || 0;
    const ivaLinea = subtotalLinea * (ivaPorcentaje / 100);

    art.ART_IVA = ivaLinea;
    tempIva += ivaLinea;
    //calculo del peso
    tempPeso += (parseFloat(art.ART_PESO) || 0) * cantidad;
  });

  subtotal.value = redondear(tempSubtotal, 2);
  descuento.value = redondear(tempDescuento, 2);
  iva.value = redondear(tempIva, 2);
  peso.value = redondear(tempPeso, 2);

  total.value = redondear(subtotal.value + iva.value, 2);


  // 4. Verificaciones externas
  verificarProveedores(false);
  verificarStock();

}

function redondear(num, decimales = 2) {
  const factor = Math.pow(10, decimales);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

async function openModalProveedor(index, element) {
  store.commit('setVerProveedor', true);
  store.commit('setIndexProveedor', index);
  const data = reactive({
    articulo: element,
  });

  try {
    const res = await store.dispatch('getMargenFotItemL', data);
    if (res.success == false) {
      swalError(res.message);
      return;
    }
    if (res.success == true) {

      proveedorModalObj.show();
    }
  } catch (error) {
    console.log(error, 'error al abrir modal de bodegas');
  }
}

async function openModalBodegas(index, element) {
  verbodegas.value = true;
  indexbodegas.value = index;
  bodegasModalObj.show();
}

function openModalPeso(index, articulo) {
  indexArticulo.value = index
  modArticulo.value = articulo;
  pesoModalObj.show();
}

function calculaTotalProveedor(index) {
  if (isNaN(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO)) {
    swalError('Ingresar un número');
    return false;
  }
  if (cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO) {
    cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO = formatPrice4(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO);
  }
  if (cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO && cotizacion.value.data[indexproveedor.value].proveedores[index].CANTIDAD) {
    cotizacion.value.data[indexproveedor.value].proveedores[index].TOTAL = formatPrice4(parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO) * formatPrice(cotizacion.value.data[indexproveedor.value].proveedores[index].CANTIDAD));
    cotizacion.value.data[indexproveedor.value].proveedores[index].IMPUESTO = formatPrice4((parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO) * formatPrice(cotizacion.value.data[indexproveedor.value].proveedores[index].CANTIDAD)) * (cotizacion.value.data[indexproveedor.value].ART_IMP_VTA / 100));
    cotizacion.value.data[indexproveedor.value].proveedores[index].TOTALCONIMPUESTO = formatPrice(parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].TOTAL) + parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].IMPUESTO));
  }
  cotizacion.value.data[indexproveedor.value].ART_VALOR = formatPrice4((
    cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO
    / (1 - (parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].MARGEN) / 100))) / (1 - cotizacion.value.data[indexproveedor.value].descuento / 100))
  calcTotales();
}

let validaProveedores = ref(true);

function verificarProveedores(cerrar = true) {
  validaProveedores.value = true;
  let cantidadproveedores = 0;
  cotizacion.value.data.map(articulo => {
    articulo.proveedoreslistos = true;
    cantidadproveedores = parseFloat(articulo.ART_CANTIDAD);
    articulo.proveedores.map(proveedor => {
      cantidadproveedores -= parseFloat(proveedor.CANTIDAD);
    })
    if (cantidadproveedores != 0) {
      articulo.proveedoreslistos = false;
    }
    if (articulo.ART_TIPO_COMPRA == 'L' && parseFloat(cantidadproveedores) != 0) {
      validaProveedores.value = false;
    }
  })
  if (cerrar) {
    proveedorModalObj.hide();
  }

}

let validaStock = ref(true);

function verificarStock() {
  validaStock.value = true;
  let stockDoble = null;
  let cantidadStock = 0;
  let arraCantidad = [];
  cotizacion.value.data.map(articulo => {
    articulo.stockListo = true;
    cantidadStock = parseFloat(articulo.ART_CANTIDAD);
    articulo.stock.map(stock => {
      cantidadStock -= parseFloat(stock.seleccionado);
      arraCantidad[articulo.ART_CODIGO + stock.STO_ART_BODEGA] = 0;

      if (parseFloat(stock.seleccionado) > parseFloat(stock.STO_ART_STOCK_DISPONIBLE)) {
        articulo.stockListo = false;
      }

    })
    if (cantidadStock != 0) {
      articulo.stockListo = false;
    }
    if (articulo.ART_TIPO_COMPRA != 'L' && articulo.ART_TIPO_COMPRA != 'SERV' && cantidadStock != 0) {
      validaStock.value = false;
    }

  });
  cotizacion.value.data.map(articulo => {
    articulo.stock.map(stock => {
      arraCantidad[articulo.ART_CODIGO + stock.STO_ART_BODEGA] += parseFloat(stock.seleccionado);
    })
  });
  cotizacion.value.data.map(articulo => {
    articulo.stock.map(stock => {
      if (stock.STO_ART_STOCK_DISPONIBLE < arraCantidad[articulo.ART_CODIGO + stock.STO_ART_BODEGA]) {
        stockDoble = articulo.ART_CODIGO;
      }
    })
  });
  if (stockDoble) {
    swalWarning('El producto ' + stockDoble + ' supera el stock disponible');
    validaStock.value = false;
  }
}

function guardarCotizacion() {
  templateStore.pageLoader({ mode: "on" });
  const infocotizacion = reactive({
    sucursal_id: sucursalEnvio.value,
    sucursal_facturacion_id: sucursal_facturacion_id.value,
    cliente_id: currentCliente.value.id,
    factura_posterior_despacho: factura_posterior_despacho.value,
    factura_a_demanda: factura_a_demanda.value,
    factura_siguiente_mes: factura_siguiente_mes.value,
    PTO_VTA_ID: store.state.puntodeventaselect,
    bodega_facturacion: bodegaFacturacion.value,
    porcentage_descuentooriginal: descuentooriginal.value,
    porcentage_descuento: descuentoarticulo.value,
    DESC_FORMA_PAGO_CODIGO: formadepago_id.value,
    CLI_RUC: currentCliente.value.CLI_RUC,
    COND_ID: condiciondepago_id.value,
    COND_ID_ORIGINAL: currentCliente.value.CLI_CONDICION_PAGO,
    CLI_RAZON_SOCIAL: currentCliente.value.CLI_RAZON_SOCIAL,
    CLI_CORREO_ELECT_SRI: currentCliente.value.CLI_CORREO_ELECT_SRI,
    VEND_ID: currentCliente.value.vendedor.VEND_ID,
    VEND_NOMBRES: currentCliente.value.vendedor.VEND_NOMBRES,
    VEND_APELLIDOS: currentCliente.value.vendedor.VEND_APELLIDOS,
    subtotal: subtotal.value,
    descuento: descuento.value,
    iva: iva.value,
    total: total.value,
    cotizacion: cotizacion.value.data,
    despacho: despacho.value,
    nota_interna: nota_interna.value,
    nota_cliente: nota_cliente.value,
    orden_de_compra: orden_de_compra.value,
    cotizacion_id: store.state.cotizacion_id,
    fecha_entrega: fecha_entrega.value,
    registro_copia: registro_copia.value,
  })
  store.dispatch('guardarCotizacion', infocotizacion).then((res) => {
    templateStore.pageLoader({ mode: "off" });
    swalSuccess(res.data.message);
    router.push({
      name: 'ventas-cotizaciones'
    })
  })
    .catch(err => {
      templateStore.pageLoader({ mode: "off" });
      swalError(err.response.data.error)
    });
}

function limpiarCotizacion() {

  const consulta = reactive({
    sucursal_id: currentSucursal.value,
    cliente_id: currentCliente.value.id,
    puntodeventa_id: store.state.puntodeventaselect,
  })
  store.dispatch('limpiarcotizacion', consulta).then((res) => {
    store.commit('resetCotizacion');
    verclientes.value = false;
    verCotizacion.value = false;
    store.commit('setCurrentSucursal', null);
  })
    .catch(err => {
      errorMsg.value = err.response.data.error
    });



}

const btnStoreOrder = ref(true);
function confirmGuardarPedido() {
  btnStoreOrder.value = false;
  toast
    .fire({
      title: "Estás seguro?",
      text: "El pedido se despachará desde la bodega " + bodegaFacturacion.value + "",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, guardarlo",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        guardarPedido()
      } else {
        btnStoreOrder.value = true;
      }
    });
}

function guardarPedido() {
  templateStore.pageLoader({ mode: "on" });
  const infopedido = reactive({
    sucursal_id: sucursalEnvio.value,
    sucursal_facturacion_id: sucursal_facturacion_id.value,
    cliente_id: currentCliente.value.id,
    factura_posterior_despacho: factura_posterior_despacho.value,
    factura_a_demanda: factura_a_demanda.value,
    factura_siguiente_mes: factura_siguiente_mes.value,
    PTO_VTA_ID: store.state.puntodeventaselect,
    bodega_facturacion: bodegaFacturacion.value,
    porcentage_descuentooriginal: descuentooriginal.value,
    porcentage_descuento: descuentoarticulo.value,
    DESC_FORMA_PAGO_CODIGO: formadepago_id.value,
    CLI_RUC: currentCliente.value.CLI_RUC,
    COND_ID: condiciondepago_id.value,
    COND_ID_ORIGINAL: currentCliente.value.CLI_CONDICION_PAGO,
    CLI_RAZON_SOCIAL: currentCliente.value.CLI_RAZON_SOCIAL,
    CLI_CORREO_ELECT_SRI: currentCliente.value.CLI_CORREO_ELECT_SRI,
    VEND_ID: currentCliente.value.vendedor.VEND_ID,
    VEND_NOMBRES: currentCliente.value.vendedor.VEND_NOMBRES,
    VEND_APELLIDOS: currentCliente.value.vendedor.VEND_APELLIDOS,
    subtotal: subtotal.value,
    descuento: descuento.value,
    iva: iva.value,
    total: total.value,
    cotizacion: cotizacion.value.data,
    despacho: despacho.value,
    fecha_entrega: fecha_entrega.value,
    nota_interna: nota_interna.value,
    nota_cliente: nota_cliente.value,
    orden_de_compra: orden_de_compra.value,
    cotizacion_id: store.state.cotizacion_id,
  })

  setTimeout(function () {
    store.dispatch('guardarPedido', infopedido).then((res) => {
      templateStore.pageLoader({ mode: "off" });
      swalSuccess(res.data.message);
      btnStoreOrder.value = true;
      router.push({
        name: 'ventas-pedidos'
      })
    })
      .catch(err => {
        templateStore.pageLoader({ mode: "off" });
        btnStoreOrder.value = true;
        swalError(err.response.data.error)
      });
  })
    .catch(err => {
      templateStore.pageLoader({ mode: "off" });
      btnStoreOrder.value = true;
      swalError(err.response.data.error)
    });
  // }, Math.floor(Math.random() * 2000));
}

function crearDireccion() {
  store.commit('setNuevadireccion');
  crearDireccionModalObj.show();
}
function cerrarModalDireccion() {
  crearDireccionModalObj.hide();
}
async function guardarOrden() {
  await store.dispatch('guardarOrdenPedido');
}

function cerrarBodegasModal() {
  verificarStock();
  bodegasModalObj.hide();
}

function cerrarPesoModal() {
  pesoModalObj.hide();
}

/**
 *  function para obtener la lista de descripciones alternativas de un articulo
 */


let verItemAlternativo = ref({});
let verItemAlternativoObj = null;
const itemAlternativo = reactive({
  index: null,
  item: ''
});
function obtenerListaDescripcionAlternativas(event, articulo, index) {
  const item = reactive({
    item: articulo.ART_CODIGO,
  });
  store.dispatch('getListaItemsAlternativos', item).then((res) => {
    if (res.success == false) {
      swalError(res.message);
      return;
    } else {
      itemAlternativo.index = index;
      itemAlternativo.item = articulo.ART_CODIGO;
      verItemAlternativoObj.show();
    }
  });
}

function onSelectItemAlternativo(descripcion) {

  const index = itemAlternativo.index;
  cotizacion.value.data[index].cambiar_descripcion = false;
  cotizacion.value.data[index].ART_DESCRIPCION = descripcion;
  cotizacion.value.data[index].ART_DESCRIPCION_ORIGINAL = descripcion;
  verItemAlternativoObj.hide();
}


function updateCheckAlternative(event, articulo, index) {

  const value = event.target.checked ? 1 : 0;
  const itemUpdate = reactive({
    articulo: articulo.id,
    CHECK_ALTERNATIVO: value,
  });
  store.dispatch('updateCheckAlternative', itemUpdate).then(() => {
    cotizacion.value.data[index].CHECK_ALTERNATIVO = value;
    calcTotales();
  });
}

onMounted(() => {
  articuloModalObj = new Modal(articuloModal.value);
  bodegasModalObj = new Modal(bodegasModal.value);
  proveedorModalObj = new Modal(proveedorModal.value);
  pesoModalObj = new Modal(pesoModal.value);
  verItemAlternativoObj = new Modal(verItemAlternativo.value);
  crearDireccionModalObj = new Modal(crearDireccionModal.value);
  verModalActualizarSegmentoObj = new Modal(verModalActualizarSegmento.value);
  const elem = document.getElementById('label-sucursal-' + currentSucursal.value);
  if (elem)
    elem.click();
});

</script>

<style scoped>
@media (min-width: 1200px) {
  .billing-sticky {
    position: sticky;
    top: .75rem;
  }
}
</style>