<template>

  <BasePageHeading
    title="Copiar Pedido"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Copiar Pedido</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock v-if="currentSucursal && verCotizacion" title="Cotizacion" class="pb-4">
      <form
        class="row row-cols-lg-auto g-3 align-items-center"
        @submit.prevent="onSubmit"
        >
        <div class="col-12">
          <label class="visually-hidden" for="buscar-articulo"
              >Buscar artículo...</label
          >
          <input
              type="text"
              class="form-control"
              :class="errorbuscararticulo ? 'is-invalid':''"
              id="buscar-articulo"
              name="buscar-articulo"
              placeholder="Buscar artículo..."
              @keyup.enter="buscararticulo"
              v-model="articulo"
              ref="inputbuscararticulo"
          />
        </div>
        <div>
          <button type="button" v-on:click="buscararticulo" class="btn btn-primary">Buscar</button>
        </div>
      </form>
      <div v-if="cotizacion.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>
      <div class="table-responsive">
        <table v-if="cotizacion.data.length && !cotizacion.loading" class="table table-hover table-sm table-vcenter mt-4">      
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descripción</th>
              <th></th>
              <th>CTL</th>
              <th>UDM</th>
              <th>Cantidad</th>
              <th></th>
              <th class="text-end">Stock</th>
              <th class="text-end">Precio</th>
              <th v-if="descuentoarticulo > 0" class="text-end">Descuento</th>
              <th class="text-end">Total</th>
              <th></th>
            </tr>
          </thead>
          
            <draggable v-model="cotizacion.data" tag="tbody" item-key="orden" handle=".handle" @end="guardarOrden">
              <template #item="{ element, index }">
                <tr>
                  <td class="fs-sm">{{index+1}}</td>
                  <td class="fs-sm">
                    {{ element.ART_CODIGO }}
                  </td>
                  <td class="fs-sm">
                    <a 
                      v-if="!element.cambiar_descripcion" 
                      @click="cambiarDescripcion(index)" 
                      href="javascript:void(0)" 
                      title="Cambiar Descripción"
                      :class="element.ART_DESCRIPCION !== element.ART_DESCRIPCION_ORIGINAL ? 'text-danger':''"
                      >{{ element.ART_DESCRIPCION }}</a>
                    <input v-else type="text" 
                      :id="`updatedescripcion-${ element.id }`"
                      class="form-control" 
                      :class="element.errorDescripcion ? 'is-invalid':''"
                      placeholder="Descripción" 
                      :value="element.ART_DESCRIPCION"
                      @change="updateDescripcion($event, element, index)"
                      @keyup.enter="updateDescripcion($event, element, index)"
                      >
                  </td>
                  <td class="fs-sm" >
                    <div v-if="element.ART_TIPO_COMPRA === 'L'">
                      <button 
                        class="btn btn-sm" 
                        :class="element.proveedoreslistos ? 'btn-success':'btn-danger'"
                        title="Seleccionar Proveedor" 
                        @click="openModalProveedor(index)"
                        >
                        <i class="fa fa-people-arrows-left-right"></i>
                      </button>
                    </div>
                  </td>
                  <td class="fs-sm">
                      {{ element.ART_CODIGO_TRES_LETRAS }}
                  </td>
                  <td class="fs-sm">
                      {{ element.ART_PLAN_UMEDIDA }}
                  </td>
                  <td class="fs-sm col-1">
                      <input type="text" 
                      :id="`updatecantidad-${ element.id }`"
                      class="form-control text-end" 
                      placeholder="Cantidad" 
                      :class="element.errorCantidad || element.ART_CANTIDAD === 0 ? 'is-invalid':''"
                      :value="element.ART_CANTIDAD"
                      @change="updateCantidad($event, element, index)"
                      :tablindex="index"
                      >
                  </td>
                  <td>
                    <div v-if="element.ART_TIPO_COMPRA !== 'L'">
                      <button 
                        class="btn btn-sm btn-warning" 
                        title="Seleccionar Proveedor" 
                        @click="openModalBodegas(index)"
                        >
                        <i class="fa fa-boxes-packing"></i>
                      </button>
                    </div>
                  </td>
                  <td class="fs-sm text-end">
                    {{ element.ART_STOCK }}
                  </td>
                  <td class="fs-sm text-end col-1">
                      <a 
                      v-if="!element.cambiar_valor" 
                      @click="cambiarValor(index)" 
                      href="javascript:void(0)" 
                      title="Cambier Precio"
                      :class="element.ART_VALOR !== element.ART_VALOR_ORIGINAL ? 'text-danger':''"
                      >${{ formatPrice(element.ART_VALOR * 1) }}
                      </a>
                      <input v-else type="text" 
                      :id="`updateValor-${ element.id }`"
                      class="form-control" 
                      :class="element.errorValor ? 'is-invalid':''"
                      placeholder="Precio" 
                      :value="element.ART_VALOR"
                      @change="updateValor($event, element, index)"
                      @keyup.enter="updateValor($event, element, index)"
                      >
                  </td>
                  <td v-if="descuentoarticulo > 0" class="fs-sm text-end">
                  ${{ formatPrice(element.ART_VALOR * (descuentoarticulo / 100)) }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{ formatPrice((element.ART_VALOR - (element.ART_VALOR * (descuentoarticulo / 100))) * element.ART_CANTIDAD)  }}
                  </td>
                  <td class="fs-sm text-end">
                    <button type="button" class="btn btn-danger btn-sm mx-2" @click="confirmeliminarArticulo(element, index)"><i class="fa fa-trash-can"></i></button>
                    <a class="btn btn-primary btn-sm handle mx-2" style="cursor: move;"><i class="fa fa-arrows-up-down-left-right "></i></a>
                  </td>
                </tr>
              </template>
            </draggable>
            <tr>
              <th :colspan="descuentoarticulo > 0 ? '11':'10'" class="fs-sm text-end">Subtotal</th>
              <th class="fs-sm text-end">${{ formatPrice(subtotal + descuento) }}</th>
              <th></th>
            </tr>
            <tr>
              <th :colspan="descuentoarticulo > 0 ? '11':'10'" class="fs-sm text-end">Descuento</th>
              <th class="fs-sm text-end">${{ formatPrice(descuento) }}</th>
              <th></th>
            </tr>
            <tr>
              <th :colspan="descuentoarticulo > 0 ? '11':'10'" class="fs-sm text-end">Subtotal - descuento</th>
              <th class="fs-sm text-end">${{ formatPrice(subtotal) }}</th>
              <th></th>
            </tr>
            <tr>
              <th :colspan="descuentoarticulo > 0 ? '11':'10'" class="fs-sm text-end">IVA</th>
              <th class="fs-sm text-end">${{ formatPrice(iva) }}</th>
              <th></th>
            </tr>
            <tr>
              <th :colspan="descuentoarticulo > 0 ? '11':'10'" class="fs-sm text-end">Total</th>
              <th class="fs-sm text-end">${{ formatPrice(total) }}</th>
              <th></th>
            </tr>
        </table>
      </div>
      <div class="row" v-if="cotizacion.data.length > 0">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-4">
              <label for="select-condicion-pago" class="col-auto col-form-label text-right">Condición de pago:</label>
              <div class="col-auto">
                <select
                  class="form-select"
                  id="select-condicion-pago"
                  name="select-condicion-pago"
                  v-model="condiciondepago_id"
                  @change="selectcondicionpago()"
                  > 
                  <option
                    v-for="(condicion, index) in condiciondepago" :key="index"
                    :value="condicion.COND_ID"
                    >{{ condicion.COND_ID }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <label for="select-forma-pago" class="col-auto col-form-label text-right">Forma de pago:</label>
              <div class="col-auto">
                <select
                  class="form-select"
                  id="select-forma-pago"
                  name="select-forma-pago"
                  @change="selectformapago($event)"
                  > 
                  <option
                    v-for="(pago, index) in formadepago" :key="index"
                    :value="index"
                    :selected="pago.DESC_FORMA_PAGO_TIPO_CREDITO === 'Contado'"
                    >{{ pago.DESC_FORMA_PAGO_TIPO_CREDITO }}</option>
                </select>
                <code>Descuento: 
                  <span v-if="!cambiardescuento">
                  <a
                    href="javascript:void(0)"
                    @click="cambiarDescuento()"
                    :class="descuentooriginal !== descuentoarticulo ? 'text-danger':''"
                    >{{descuentoarticulo}}%</a>
                  </span>
                  <input v-else type="text" 
                  id="updateDescuento"
                  class="form-control" 
                  :class="errorDescuento ? 'is-invalid':''"
                  placeholder="Descuento" 
                  :value="descuentoarticulo"
                  @change="updateDescuento($event)"
                  @keyup.enter="updateDescuento($event)"
                  >
                </code>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-md-4 offset-4">
              <label for="nota-cliente" class="col-auto col-form-label text-right">Nota cliente:</label>
              <div class="col-auto">
                <textarea class="form-control" v-model="notaCliente"></textarea>
              </div>
            </div>
            <div class="col-md-4">
              <label for="nota-interna" class="col-auto col-form-label text-right">Nota interna:</label>
              <div class="col-auto">
                <textarea class="form-control" v-model="notaInterna"></textarea>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 text-end">
              <button type="button" class="btn btn-success mx-4"
              :disabled="!(validaCantidad && validaProveedores)"
              @click="guardarCotizacion"
              >Guardar Cotización</button>
              <button type="button" class="btn btn-warning"
              :disabled="!(validaCantidad && validaProveedores)" 
              @click="guardarPedido"
              >Guardar Pedido</button>
            </div>
          </div>
        </div>
       
        
      </div>
    </BaseBlock>
    <BaseBlock title="Cliente" class="pb-4">
      <form
          class="row row-cols-lg-auto g-3 align-items-center"
          @submit.prevent="onSubmit"
          >
          <div class="col-12">
              <label class="visually-hidden" for="buscar-cliente"
                  >Buscar cliente...</label
              >
              <input
                  type="text"
                  class="form-control"
                  :class="errorbuscarcliente ? 'is-invalid':''"
                  id="buscar-cliente"
                  name="buscar-cliente"
                  placeholder="Buscar cliente..."
                  @keyup.enter="buscarclientes"
                  v-model="buscarcliente.busqueda"
              />
          </div>
          <div>
              <button type="button" v-on:click="buscarclientes" class="btn btn-primary">Buscar</button>
              <router-link :to="{ name: 'ventas-crearcliente' }">
                <button type="button" class="mx-4 btn btn-success float-end">Crear cliente</button>
              </router-link>
          </div>
          
      </form>
      
      <div v-if="clientes.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>
      <BaseBlock v-if="verclientes && clientes.data.length" class="mb-0">
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
                    <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{  cliente.CLI_RAZON_SOCIAL }} </a>
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
                    <a :href="'mailto:' + cliente.CLI_CORREO_ELECT_SRI">{{cliente.CLI_CORREO_ELECT_SRI}}</a>
                </td>
                
            </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>
      <BaseBlock  v-if="currentCliente && !verclientes" class="mt-4 mb-0">
        <template #content>
          <div class="table-responsive">
            <table class="table table-striped table-sm table-vcenter">
              <tbody>
                <tr>
                    <th class="fs-sm">RUC</th>
                    <td class="fs-sm">{{currentCliente.CLI_RUC}}</td>
                    <th class="fs-sm">Razón Social</th>
                    <td class="fs-sm">{{currentCliente.CLI_RAZON_SOCIAL}}</td>
                
                    <th class="fs-sm">Dirección</th>
                    <td class="fs-sm">{{currentCliente.CLI_DIRECCION}}</td>
                </tr>
                <tr>
                    <th class="fs-sm">Ciudad</th>
                    <td class="fs-sm">{{currentCliente.CLI_CIUDAD}}</td>
                
                    <th class="fs-sm">Provincia</th>
                    <td class="fs-sm">{{currentCliente.CLI_PROVINCIA}}</td>
                
                    <th class="fs-sm">Territorio</th>
                    <td class="fs-sm">{{currentCliente.CLI_TERRITORIO}}</td>
                </tr>
                <tr>
                    <th class="fs-sm">Estado</th>
                    <td class="fs-sm">
                        <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                        :class="currentCliente.CLI_ESTADO === 'ACTIVO' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'"
                        >{{currentCliente.CLI_ESTADO}}</span>
                    </td>
                
                    <th class="fs-sm">Suspendido</th>
                    <td class="fs-sm">{{currentCliente.CLI_SUSPENDIDO}}</td>
              
                    <th class="fs-sm">Descuento Comercial</th>
                    <td class="fs-sm text-danger">{{currentCliente.CLI_DSTO_COMERCIAL}}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row mb-4">
            
              <label for="select-sucursal-facturacion" class="col-sm-2 col-form-label text-left">Dirección de facturación:</label>
              <div class="col-sm-5">
                <select
                  class="form-select"
                  id="select-sucursal-facturacion"
                  name="select-sucursal-facturacion"
                  @change="selectsucursalfacturacion($event)"
                  > 
                  <option
                     v-for="(sucursalfac, index) in currentCliente.sucursalesfacturacion" :key="index"
                    :value="sucursalfac.id"
                    >{{sucursalfac.CLI_SUC_ID_DIRECCION}} - {{sucursalfac.CLI_SUC_DIRECCION}}</option>
                </select>
             
            </div>
            <div class="col-sm-5 text-end"><button @click="crearDireccion" class="btn btn-sm btn-primary">Crear Dirección</button></div>
          </div>
          <div class="row items-push">
            <div class="col-md-4" v-for="(sucursal, index) in currentCliente.sucursales" :key="index">
              <div class="form-check form-block">
                <input
                  type="radio"
                  class="form-check-input"
                  :id="`sucursal-${ sucursal.id }`"
                  name="example-radio-block"
                  @click="selectsucursal(sucursal.id)"
                  :selected="sucursal.id === currentSucursal"
                />
                <label class="form-check-label" :for="`sucursal-${ sucursal.id }`" :id="`label-sucursal-${ sucursal.id }`">
                  <span class="d-block fw-normal text-center my-3">
                    <span class="fs-6 fw-semibold">{{sucursal.CLI_SUC_ID_DIRECCION}}</span>
                    <span class="d-block mb-2">{{sucursal.CLI_SUC_DIRECCION}}</span>
                    <span class="d-block mb-2" v-if="sucursal.CLI_SUC_TELEFONO">{{sucursal.CLI_SUC_TELEFONO}}</span>
                    <span class="d-block mb-2">{{sucursal.CLI_SUC_CORREO_ELECTRONICO_SRI}}</span>
                    <span
                      class="d-block fs-6 fw-light py-3 m-3 bg-body-light rounded"
                      >{{sucursal.CLI_SUC_PROVINCIA}} <small> {{sucursal.CLI_SUC_CIUDAD}}</small> </span>
                  </span>
                </label>
              </div>
            </div>
            <div class="space-x-2 text-end">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="despacho-punto" value="En punto" v-model="despacho">
                <label class="form-check-label" for="despacho-punto">Retiro en bodega</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="despacho-ruta" value="En ruta" v-model="despacho">
                <label class="form-check-label" for="despacho-ruta">Despacho en ruta</label>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            
              <label for="select-sucursal-facturacion" class="col-sm-1 col-form-label text-left">Bodega:</label>
              <div class="col-sm-4">
                <select
                  class="form-select"
                  id="select-sucursal-facturacion"
                  name="select-sucursal-facturacion"
                  @change="selectbodegafacturacion($event)"
                  > 
                  <option
                     v-for="(bodega, index) in bodegas" :key="index"
                    :value="bodega.PTO_VTA_BOD_REL_BODEGA"
                    >{{bodega.PTO_VTA_BOD_REL_BODEGA}}</option>
                </select>
             
            </div>
          </div>
        </template>
      </BaseBlock>
    </BaseBlock>
    
    <!-- END Full Table -->
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
    ref="articuloModal"
    >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        
        <div v-if="articulos.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
        </div>
        <BaseBlock title="Seleccionar artículo" v-if="verarticulos && !articulos.loading" class="mb-0">
          <template #options>
              <button
                type="button"
                class="btn-block-option"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i class="fa fa-fw fa-times"></i>
              </button>
            </template>
          <template #content>
            <div class="block-content fs-sm">
              <Dataset
                v-slot="{ ds }"
                :ds-data="articulos.data"
                :ds-sortby="sortBy"
                :ds-search-in="['ART_CODIGO', 'ART_DESCRIPCION', 'ART_CODIGO_TRES_LETRAS', 'ART_PLAN_UMEDIDA', 'ART_STOCK', 'ART_VALOR']"
                >
                <div class="row" :data-page-count="ds.dsPagecount">
                  <div id="datasetLengthPedidos" class="col-md-8 py-2">
                    <DatasetShow />
                  </div>
                  <div class="col-md-4 py-2">
                    <DatasetSearch ds-search-placeholder="Buscar..." />
                  </div>
                </div>
                <hr />
                <!-- <div v-if="pedidos.loading" class="text-center">
                  <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
                </div> -->
                <div class="row" v-if="articulos.data.length">
                  <div class="col-md-12">
                    <div class="table-responsive">
                      <table class="table table-sm table-hover table-vcenter mb-0">
                        <thead>
                          <tr>
                            <th
                              v-for="(th, index) in cols"
                              :key="th.field"
                              :class="['sort', th.sort]"
                              @click="onSort($event, index)"
                            >
                              {{ th.name }} <i class="gg-select float-end"></i>
                            </th>
                          </tr>
                        </thead>
                        <DatasetItem tag="tbody" class="fs-sm">
                          <template #default="{ row }">
                            <tr>
                              <td class="fs-sm">
                                <a v-if="(row.ART_TIPO_COMPRA === 'L' && row.disponible) || (row.ART_TIPO_COMPRA !== 'L' && row.ART_STOCK)" @click="selectArticulo(row)" href="javascript:void(0)">{{ row.ART_CODIGO }}</a>
                                <span v-else>{{ row.ART_CODIGO }}</span>
                              </td>
                              <td class="fs-sm">
                                <a v-if="(row.ART_TIPO_COMPRA === 'L' && row.disponible) || (row.ART_TIPO_COMPRA !== 'L' && row.ART_STOCK)" @click="selectArticulo(row)" href="javascript:void(0)">{{ row.ART_DESCRIPCION }}</a>
                                <span v-else>{{ row.ART_DESCRIPCION }}</span>
                              </td>
                              <td class="fs-sm">
                                  {{ row.ART_CODIGO_TRES_LETRAS }}
                              </td>
                              <td class="fs-sm">
                                  {{ row.ART_PLAN_UMEDIDA }}
                              </td>
                              <td class="fs-sm fw-medium text-muted mb-0 text-right">
                                <div v-if="(row.ART_TIPO_COMPRA !== 'L' && row.ART_STOCK)">
                                  <code v-for="stock in row.stock" :key="stock.id">{{ stock.STO_ART_BODEGA }} - {{ stock.STO_ART_STOCK_DISPONIBLE }}<br></code>
                                </div>

                              </td>
                              <td class="text-end">
                                  ${{ row.ART_VALOR }}
                              </td>
                            </tr>
                          </template>
                        </DatasetItem>
                      </table>
                    </div>
                  </div>
                </div>
                <div
                  class="d-flex flex-md-row flex-column justify-content-between align-items-center"
                >
                  <DatasetInfo class="py-3 fs-sm" />
                  <DatasetPager class="flex-wrap py-3 fs-sm" />
                </div>
              </Dataset>
            </div>
          </template>
        </BaseBlock>
        <div class="block-content block-content-full text-end bg-body">
          <button
            type="button"
            class="btn btn-sm btn-alt-secondary me-1"
            data-bs-dismiss="modal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- END Large Block Modal -->
  <div
    class="modal"
    id="modal-block-proveedor"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-block-proveedor"
    aria-hidden="true"
    ref="proveedorModal" 
    >
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <BaseBlock v-if="verproveedor" 
          :title="'Proveedor: '+cotizacion.data[indexproveedor].ART_DESCRIPCION+' $'+cotizacion.data[indexproveedor].ART_VALOR" 
          transparent class="mb-0">
          <template #options>
            Cantidad: <span class="text-danger">{{ cotizacion.data[indexproveedor].ART_CANTIDAD }} </span>
          </template>

          <template #content>
            <div class="block-content fs-sm">
              <div class="text-end">
                <button class="btn btn-sm btn-success" @click="addProveedor(indexproveedor)">Agregar Proveedor</button>
              </div>
            </div>
            <div class="block-content fs-sm pb-4">
              <BaseBlock
                v-for="(proveedor, index) in cotizacion.data[indexproveedor].proveedores" :key="index"
                title="Proveedor"
                themed
                bordered
                class="pb-4"
                >
                <template #options>
                  <button type="button" class="btn-block-option" @click="eliminarProveedor(index)">
                    <i class="fa fa-trash"></i>
                  </button>
                </template>
                <div class="row mb-2">
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-proveedor-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Proveedor:
                      </label>
                      <div class="col-sm-8">

                        <VueSelect
                          v-model="proveedor.ID_PROVEEDOR"
                          :options="proveedores"
                          :reduce="(option) => option.id"
                          placeholder="Buscar.."
                          label="PROV_RAZON_SOCIAL"
                          @search="buscarproveedores($event)"
                          ></VueSelect>
                        
                        
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Descripción:
                      </label>
                      <div class="col-sm-8">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="proveedor.DESCRIPCION_ARTICULO" 
                          />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Cantidad:
                      </label>
                      <div class="col-sm-8">
                        <input 
                          type="text" 
                          class="form-control text-end" 
                          v-model="proveedor.CANTIDAD"
                          @change="validaCantidadProveedor($event, index);calculaTotalProveedor(index)"
                          />
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Costo unitario:
                      </label>
                      <div class="col-sm-8">
                        <div class="input-group">
                          <span class="input-group-text">$</span>
                          <input 
                          type="text" 
                          class="form-control text-end" 
                          v-model="proveedor.COSTO_UNITARIO"
                          @change="calculaTotalProveedor(index)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Total:
                      </label>
                      <div class="col-sm-8">
                        <div class="input-group">
                          <span class="input-group-text">$</span>
                          <input 
                          type="text" 
                          class="form-control text-end" 
                          readonly
                          v-model="proveedor.TOTAL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Impuesto IVA:
                      </label>
                      <div class="col-sm-8">
                        <div class="input-group">
                          <span class="input-group-text">$</span>
                          <input 
                          type="text" 
                          class="form-control text-end" 
                          v-model="proveedor.IMPUESTO"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                
                <div class="row mb-2">
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Fecha de entrega:
                      </label>
                      <div class="col-sm-8">
                        <flat-pickr
                          
                          class="form-control" 
                          v-model="proveedor.FECHA_ENTREGA"
                          />
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="row">
                      <label
                        :for="'select-descripción-'+index"
                        class="col-sm-4 col-form-label text-right"
                        >
                        Nota:
                      </label>
                      <div class="col-sm-8">
                        <textarea 
                          type="text" 
                          class="form-control" 
                          v-model="proveedor.NOTA" 
                          ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row mb-2" v-if="proveedor.TOTAL < 300">
                  <p class="alert alert-warning">El pedido debe superar los $300</p>
                </div>
              </BaseBlock>
            </div>
            <div class="block-content block-content-full text-end bg-body">
              <button
                type="button"
                class="btn btn-sm btn-alt-secondary me-1"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary"
                data-bs-dismiss="modal"
                @click="guardarProveedor()"
                >
                Guardar
              </button>
            </div>
          </template>
        </BaseBlock>
      </div>
    </div>
  </div>
  <!-- Large Block Modal -->
  <div
    class="modal"
    id="modal-crear-direccion"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-crear-direccion"
    aria-hidden="true"
    ref="crearDireccionModal"
    >
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <CrearDireccionModal
          @guardar="cerrarModalDireccion"
          ></CrearDireccionModal>
      </div>
    </div>
  </div>
  <div
    class="modal"
    id="modal-bodegas"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-bodegas"
    aria-hidden="true"
    ref="bodegasModal"
    
    >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <BodegasModal
          :indexbodegas="indexbodegas"
          :verbodegas="verbodegas"
          @cerrar="cerrarBodegasModal()"
          >
        </BodegasModal>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore} from 'vuex'
import { Modal } from "bootstrap";
import { swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import VueSelect from "vue-select";
import CrearDireccionModal from "../modals/CrearDireccionModal.vue";
import BodegasModal from "../modals/BodegasModal.vue";
import draggable from 'vuedraggable'
import flatPickr from 'vue-flatpickr-component';
import {formatPrice, formatPrice4} from "@/functions";

const store = useStore();

const buscarcliente = reactive({
  busqueda: null,
});

const router = useRouter();

let errorMsg = ref('');

const verclientes = ref(false);
const verCotizacion = ref(false);
const articulo = ref('');
const verarticulos = ref(false);
const verproveedor = ref(false);
const verbodegas = ref(false);
const indexproveedor = ref(null);
const indexbodegas = ref(null);
const formadepago_id = ref(null);
const despacho = ref('En punto');
const condiciondepago_id =  ref(store.state.condiciondepago_id);

const articulos = computed(() => store.state.articulos);
const currentCliente = computed(() => store.state.currentCliente);
const bodegas = computed(() => store.state.bodegas);
const clientes = computed(() => store.state.clientes);
const currentSucursal = ref(store.state.currentSucursal);
const sucursalFacturacion = ref('');
const bodegaFacturacion = ref('');
const notaInterna = ref('');
const notaCliente = ref('');
const cotizacion = computed(() => store.state.cotizacion);
const descuentoarticulo = ref(store.state.descuentoarticulo);
const descuentooriginal = ref(store.state.descuentooriginal);
const formadepago = computed(() => store.state.formadepago);
const condiciondepago = ref(store.state.condiciondepago);
const proveedores = ref(store.state.proveedores);
const subtotal = ref(store.state.subtotal);
const descuento = ref(store.state.descuento);
const iva = ref(store.state.iva);
const total = ref(store.state.total);

let errorbuscarcliente = ref(false);

async function buscarclientes(ev){
  if(buscarcliente.busqueda.length < 3){
    errorbuscarcliente.value = true;
    return;
  }
  
  errorbuscarcliente.value = false;
  store.commit('nullCurrentcliente');
  currentSucursal.value = null;
  verCotizacion.value = false;
  verproveedor.value = false;
  verbodegas.value = false;
  descuentoarticulo.value = 0;
  descuentooriginal.value = 0;
  verclientes.value = true;
  ev.preventDefault();
  store.dispatch('buscarclientes', buscarcliente)
  .catch(err => {
      verclientes.value = false;
      errorMsg.value = err.response.data.error
  });
}

function selectcliente(cliente){
  verclientes.value = false;
  verCotizacion.value = false;
  currentSucursal.value = null;
  sucursalFacturacion.value = cliente.sucursales[0].id;
  verproveedor.value = false;
  verbodegas.value = false;
  indexproveedor.value = null;
  indexbodegas.value = null;
  sessionStorage.setItem('CURRENTCLIENTE', JSON.stringify(cliente));
  store.commit('setCurrentcliente', cliente);
  descuentoarticulo.value = currentCliente.value.CLI_DSTO_COMERCIAL;
  descuentooriginal.value = currentCliente.value.CLI_DSTO_COMERCIAL;
  condiciondepago_id.value = currentCliente.value.CLI_CONDICION_PAGO;
  store.commit('llenaformadepago', condiciondepago_id);
  store.commit('setNuevadireccion');
  formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
}

function selectsucursal(sucursal){
  verCotizacion.value = true;
  sessionStorage.setItem('CURRENTSUCURSAL', sucursal)
  verproveedor.value = false;
  verbodegas.value = false;
  currentSucursal.value = sucursal;
  llenarcotizacion();
}
function selectsucursalfacturacion(event){
  sucursalFacturacion.value = event.target.value;
}
function selectbodegafacturacion(event){
  bodegaFacturacion.value = event.target.value;
}
let errorbuscararticulo = ref(false);

async function buscararticulo(ev){

  if(articulo.value.length < 3){
    errorbuscararticulo.value = true;
    return;
  }
  errorbuscararticulo.value = false;
  articuloModalObj.show();
  verarticulos.value = true;
  const consulta = reactive({
      busqueda: articulo,
      puntodeventaselect: store.state.puntodeventaselect,
      nivel_precio: currentCliente.value.CLI_NIVEL_PRECIO
  })
  ev.preventDefault();
  store.dispatch('buscararticulo', consulta).then(() => {
      
    articulo.value = null;
    document.querySelectorAll("#datasetLengthPedidos label").forEach((el) => {
    el.remove();
    });

    // Replace select classes
    let selectLength = document.querySelector("#datasetLengthPedidos select");

    selectLength.classList = "";
    selectLength.classList.add("form-select");
    selectLength.style.width = "80px";
  })
  .catch(err => {
      verarticulos.value = false;
      errorMsg.value = err.response.data.error
  });
}

let inputbuscararticulo= ref(null);

async function selectArticulo(articulo){
  
  const consulta = reactive({
      articulo: articulo,
      sucursal_id: currentSucursal.value,
      cliente_id: currentCliente.value.id,
      puntodeventa_id: store.state.puntodeventaselect,
  })
  store.dispatch('selectarticulo', consulta).then(() => {
    inputbuscararticulo.value.focus();
    calcTotales();
  })
  .catch(err => {
    errorMsg.value = err.response.data.error
  });
  verificarProveedores();
}

async function llenarcotizacion(){
  if(currentSucursal.value && currentCliente.value){
    descuentoarticulo.value = currentCliente.value.CLI_DSTO_COMERCIAL;
    descuentooriginal.value = currentCliente.value.CLI_DSTO_COMERCIAL;
    condiciondepago_id.value = currentCliente.value.CLI_CONDICION_PAGO;
    sucursalFacturacion.value = currentCliente.value.sucursales[0].id;
    store.commit('llenaformadepago', condiciondepago_id);
    store.commit('setNuevadireccion');
    formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
    const consulta = reactive({
          sucursal_id: currentSucursal.value,
          cliente_id: currentCliente.value.id,
          puntodeventa_id: store.state.puntodeventaselect,
      })
    store.dispatch('llenarcotizacion', consulta).then(() => {
      calcTotales();
      verificarProveedores();
    });
  }
}
function selectformapago(event){
  descuentoarticulo.value = currentCliente.value.CLI_DSTO_COMERCIAL;
  descuentooriginal.value = currentCliente.value.CLI_DSTO_COMERCIAL;
  const restardescuento = formadepago.value[event.target.value].DESC_FORMA_PAGO_PORCENTAJE_REBAJAR
  formadepago_id.value = formadepago.value[event.target.value].DESC_FORMA_PAGO_CODIGO;
  descuentoarticulo.value = parseFloat(descuentoarticulo.value) + parseFloat(restardescuento)
  descuentooriginal.value = parseFloat(descuentooriginal.value) + parseFloat(restardescuento)
  if(descuentoarticulo.value < 0){
    swalWarning('Descuento menor que cero');
    return;
  }
  calcTotales();
}

function selectcondicionpago(){
  descuentoarticulo.value = currentCliente.value.CLI_DSTO_COMERCIAL;
  descuentooriginal.value = currentCliente.value.CLI_DSTO_COMERCIAL;
  store.commit('llenaformadepago', condiciondepago_id);
  formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
}

let articuloModal= ref(null);
let articuloModalObj = null;

let proveedorModal= ref(null);
let proveedorModalObj = null;

let bodegasModal= ref(null);
let bodegasModalObj = null;

let crearDireccionModal= ref(null);
let crearDireccionModalObj = null;

//llenarcotizacion();

function confirmeliminarArticulo(articulo, index) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar el producto "+articulo.ART_CODIGO +"",
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

async function eliminarArticulo(articulo, index){
  verproveedor.value = false;
  verbodegas.value = false;
  store.dispatch('eliminarArticulo', articulo).then(() => {
      cotizacion.value.data.splice(index, 1);
      verificarProveedores();
      calcTotales();
  });
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function updateCantidad(event, articulo, index){
  if(!isInt(event.target.value) && articulo.ART_DECIMAL_CANTIDAD === 0){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número entero');
    return false;
  }else if(articulo.ART_DECIMAL_CANTIDAD > 0 && isNaN(event.target.value)){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número');
    return false;
  }

  if(articulo.ART_TIPO_COMPRA !== 'L' && (parseFloat(cotizacion.value.data[index].ART_STOCK)<parseFloat(event.target.value))){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('No hay stock suficiente');
    return false;
  }

  if(articulo.ART_DECIMAL_CANTIDAD > 0){
    event.target.value = parseFloat(event.target.value).toFixed(2);
  }

  const updatecantidad = reactive({
        articulo: articulo.id,
        cantidad: event.target.value,
    })
  store.dispatch('updateCantidad', updatecantidad).then(() => {
      cotizacion.value.data[index].errorCantidad = false;
      cotizacion.value.data[index].ART_CANTIDAD = event.target.value;
      calcTotales();
      verificarProveedores();
  });
}

function cambiarDescripcion(index){
  cotizacion.value.data[index].cambiar_descripcion = true;
}

function updateDescripcion(event, articulo, index){
  if(event.target.value.length < 5){
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
}

function cambiarValor(index){
  cotizacion.value.data[index].cambiar_valor = true;
}

function updateValor(event, articulo, index){

  if(isNaN(event.target.value)){
    cotizacion.value.data[index].errorValor = true;
    swalError('Ingresar un número');
    return false;
  }
  
  const updatevalor = reactive({
    articulo: articulo.id,
    ART_VALOR: formatPrice(event.target.value),
  })
  store.dispatch('updateValor', updatevalor).then(() => {
    cotizacion.value.data[index].errorValor = false;
    cotizacion.value.data[index].ART_VALOR = formatPrice(event.target.value);
    cotizacion.value.data[index].cambiar_valor = false;
    calcTotales();
  });
}

let cambiardescuento = ref(false);
let errorDescuento = ref(false);
function cambiarDescuento(){
  cambiardescuento.value = true;
}
function updateDescuento(event){
  if(isNaN(event.target.value)){
    errorDescuento.value = true;
    swalError('Ingresar un número');
    return false;
  }
  errorDescuento.value = false;
  descuentoarticulo.value = event.target.value;
  calcTotales();
  cambiardescuento.value = false;
}

let validaCantidad = ref(true);

function calcTotales(){
  subtotal.value = 0;
  descuento.value = 0;
  iva.value = 0;
  total.value = 0;
  validaCantidad.value = true;
  cotizacion.value.data.map(articulo=>{
    subtotal.value +=  ((articulo.ART_VALOR - (articulo.ART_VALOR * (descuentoarticulo.value / 100))) * articulo.ART_CANTIDAD)
    descuento.value +=  (((articulo.ART_VALOR * (descuentoarticulo.value / 100))) * articulo.ART_CANTIDAD)
    iva.value += ((articulo.ART_VALOR - (articulo.ART_VALOR * (descuentoarticulo.value / 100))) * articulo.ART_CANTIDAD) * (articulo.ART_IMP_VTA / 100)
    if(articulo.ART_CANTIDAD === 0){
      validaCantidad.value = false;
    }
  })
  total.value = subtotal.value + iva.value;
 }

function openModalProveedor(index){
  verproveedor.value = true;
  indexproveedor.value = index;
  proveedorModalObj.show();
}

function openModalBodegas(index){
  verbodegas.value = true;
  indexbodegas.value = index;
  bodegasModalObj.show();
}

function addProveedor(index) {
  const newProveedor = {
    ID_PROVEEDOR: "",
    DESCRIPCION_ARTICULO: cotizacion.value.data[indexproveedor.value].ART_DESCRIPCION,
    FECHA_ENTREGA: "",
    CANTIDAD: "",
    COSTO_UNITARIO: "",
    IMPUESTO: "",
    TOTAL: "",
    TOTALCONIMPUESTO: "",
    NOTA: "",
  };
  cotizacion.value.data[index].proveedores.push(newProveedor);
}

function eliminarProveedor(index) {
  cotizacion.value.data[indexproveedor.value].proveedores.splice(index, 1);
}

function calculaTotalProveedor(index) {
  if(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO){
    cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO = parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO).toFixed(2);
  }
  if(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO && cotizacion.value.data[indexproveedor.value].proveedores[index].CANTIDAD){
    cotizacion.value.data[indexproveedor.value].proveedores[index].TOTAL = formatPrice4(parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO) * parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].CANTIDAD));
    cotizacion.value.data[indexproveedor.value].proveedores[index].IMPUESTO = formatPrice4((parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].COSTO_UNITARIO) * parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].CANTIDAD)) * (cotizacion.value.data[indexproveedor.value].ART_IMP_VTA / 100));
    cotizacion.value.data[indexproveedor.value].proveedores[index].TOTALCONIMPUESTO = parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].TOTAL) + parseFloat(cotizacion.value.data[indexproveedor.value].proveedores[index].IMPUESTO);
  }
}

function validaCantidadProveedor(event, index){
  if(!isInt(event.target.value) && cotizacion.value.data[indexproveedor.value].ART_DECIMAL_CANTIDAD === 0){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número entero');
    return false;
  }else if(cotizacion.value.data[indexproveedor.value].ART_DECIMAL_CANTIDAD > 0 && isNaN(event.target.value)){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número');
    return false;
  }
}

function guardarProveedor(){
  store.dispatch('saveProveedor', cotizacion.value.data[indexproveedor.value]).then(() => {
    verificarProveedores();
  });
}

let validaProveedores = ref(true);

function verificarProveedores(){
  validaProveedores.value = true;
  let cantidadproveedores = 0;
  cotizacion.value.data.map(articulo=>{
    articulo.proveedoreslistos = true;
    cantidadproveedores = parseFloat(articulo.ART_CANTIDAD);
    articulo.proveedores.map(proveedor=>{
      cantidadproveedores -= parseFloat(proveedor.CANTIDAD);
    })
    if(cantidadproveedores > 0){
      articulo.proveedoreslistos = false;
    }
    if(articulo.ART_TIPO_COMPRA === 'L' && cantidadproveedores > 0){
      validaProveedores.value = false;
    }
  })

}

function guardarCotizacion(){
  const infocotizacion = reactive({
      sucursal_id: currentSucursal.value,
      sucursal_facturacion_id: sucursalFacturacion.value,
      cliente_id: currentCliente.value.id,
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
      nota_interna: notaInterna.value,
      nota_cliente: notaCliente.value,
  })
  store.dispatch('guardarCotizacion', infocotizacion).then((res) => {
      swalSuccess(res.data.message); 
      router.push({
        name: 'ventas-cotizaciones'
      })
  })
  .catch(err => {
      swalError(err.response.data.error)
  });
}

function buscarproveedores(event){
  
}

function guardarPedido(){
  const infopedido = reactive({
      sucursal_id: currentSucursal.value,
      sucursal_facturacion_id: sucursalFacturacion.value,
      cliente_id: currentCliente.value.id,
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
      nota_interna: notaInterna.value,
      nota_cliente: notaCliente.value,
  })
  store.dispatch('guardarPedido', infopedido).then((res) => {
      swalSuccess(res.data.message);     
      router.push({
        name: 'ventas-pedidos',
      }) 
  })
  .catch(err => {
      swalError(err.response.data.error)
  });
}

function crearDireccion(){
  crearDireccionModalObj.show();
}
function cerrarModalDireccion(){
  crearDireccionModalObj.hide();
}
async function guardarOrden(){
  store.dispatch('guardarOrdenPedido'); 
}

function cerrarBodegasModal(){
  bodegasModalObj.hide();
}

const cols = reactive([
  {
    name: "Código",
    field: "ART_CODIGO",
    sort: "",
  },
  {
    name: "Descripción",
    field: "ART_DESCRIPCION",
    sort: "",
  },
  {
    name: "CTL",
    field: "ART_CODIGO_TRES_LETRAS",
    sort: "",
  },
  {
    name: "U. medida",
    field: "ART_PLAN_UMEDIDA",
    sort: "",
  },
  {
    name: "Stock bodega",
    field: "ART_STOCK",
    sort: "",
  },
  {
    name: "Precio",
    field: "ART_VALOR",
    sort: "",
  },
]);

// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

// On sort th click
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
  articuloModalObj = new Modal(articuloModal.value);
  proveedorModalObj = new Modal(proveedorModal.value);
  bodegasModalObj = new Modal(bodegasModal.value);
  crearDireccionModalObj = new Modal(crearDireccionModal.value);
  const elem = document.getElementById('label-sucursal-'+currentSucursal.value);
  if(elem)
    elem.click();
});

</script>