<template>
  <!-- Page Content -->
  <BasePageHeading title="Cotización Prospecto">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cotización Prospecto</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <BaseBlock title="Datos Cliente" content-full>
      <form @submit.prevent="guardarCotizacion">
        <div class="prospect-form block-content fs-sm pt-2 pb-3">
          <div class="row g-2">
            <div class="col-md-5">
              <label class="form-label prospect-form__label" for="input-CLI_RUC">
                Cédula / RUC <span class="text-danger">*</span>
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-id-card"></i></span>
                <input type="text" class="form-control" id="input-CLI_RUC" v-model="nuevoProspecto.CLI_RUC"
                  placeholder="Ingrese la identificación" :class="{
                    'is-invalid': v$.CLI_RUC.$errors.length,
                  }" @blur="v$.CLI_RUC.$touch" @change="checkRuc" />
              </div>
            </div>

            <div class="col-md-7">
              <label class="form-label prospect-form__label" for="input-CLI_RAZON_SOCIAL">
                Razón social <span class="text-danger">*</span>
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-user"></i></span>
                <input type="text" class="form-control" id="input-CLI_RAZON_SOCIAL"
                  v-model="nuevoProspecto.CLI_RAZON_SOCIAL" placeholder="Apellidos y nombres" :class="{
                    'is-invalid': v$.CLI_RAZON_SOCIAL.$errors.length,
                  }" @blur="v$.CLI_RAZON_SOCIAL.$touch" />
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label prospect-form__label" for="input-CLI_CORREO_ELECT_SRI">
                Correo electrónico
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-envelope"></i></span>
                <input type="text" class="form-control" id="input-CLI_CORREO_ELECT_SRI"
                  placeholder="correo@ejemplo.com" v-model="nuevoProspecto.CLI_CORREO_ELECT_SRI" />
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label prospect-form__label" for="input-CLI_TELEFONO_1">
                Teléfono
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-phone"></i></span>
                <input type="text" class="form-control" id="input-CLI_TELEFONO_1" placeholder="Número de contacto"
                  :class="{
                    'is-invalid': v$.CLI_TELEFONO_1.$errors.length,
                  }" @blur="v$.CLI_TELEFONO_1.$touch" v-model="nuevoProspecto.CLI_TELEFONO_1" />
              </div>
            </div>

            <div class="col-12">
              <label class="form-label prospect-form__label" for="input-CLI_DIRECCION">Dirección</label>
              <textarea class="form-control form-control-sm prospect-form__textarea" id="input-CLI_DIRECCION"
                v-model="nuevoProspecto.CLI_DIRECCION" placeholder="Ingrese la dirección completa"
                :maxlength="122"></textarea>
              <div class="text-end mt-1">
                <small class="text-muted">{{ nuevoProspecto.CLI_DIRECCION.length }}/122</small>
              </div>
              <p v-if="122 - nuevoProspecto.CLI_DIRECCION.length == 0"
                class="text-danger fs-sm bg-danger-light rounded p-2 mt-2 mb-0">
                Máximo 122 caracteres
              </p>
            </div>
          </div>

          <div class="prospect-form__delivery mt-3">
            <div class="row g-2 align-items-end">
              <div class="col-lg-5">
                <label for="select-bodega-despacho" class="form-label prospect-form__label">
                  <i class="fa fa-warehouse me-1"></i> Bodega
                </label>
              <select class="form-select form-select-sm" id="select-bodega-despacho" name="select-bodega-despacho"
                v-model="bodegaFacturacion">
                <option v-for="(bodega, index) in bodegas" :key="index" :value="bodega.PTO_VTA_BOD_REL_BODEGA">
                  {{ bodega.PTO_VTA_BOD_REL_BODEGA }}
                </option>
              </select>
              </div>

              <div class="col-lg-7">
                <span class="form-label prospect-form__label d-block">Tipo de entrega</span>
                <div class="prospect-form__dispatch-options">
                  <label class="prospect-form__dispatch-option" :class="{
                    'prospect-form__dispatch-option--active': despacho === 'Retiro en bodega',
                  }" for="despacho-punto">
                    <input class="form-check-input" type="radio" id="despacho-punto" value="Retiro en bodega"
                      v-model="despacho" />
                    <i class="fa fa-box me-1"></i>
                    <span>Retiro en bodega</span>
                  </label>
                  <label v-if="bodega_selected?.PERMITE_DESPACHO" class="prospect-form__dispatch-option" :class="{
                    'prospect-form__dispatch-option--active': despacho === 'Despacho en ruta',
                  }" for="despacho-ruta">
                    <input class="form-check-input" type="radio" id="despacho-ruta" value="Despacho en ruta"
                      v-model="despacho" />
                    <i class="fa fa-truck me-1"></i>
                    <span>Despacho en ruta</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseBlock>

    <BaseBlock title="Cotizacion" class="pb-4">
      <form class="row row-cols-lg-auto g-3 align-items-center">
        <div>
          <button type="button" @click="buscararticulo" class="btn btn-primary">Buscar Artículo</button>
        </div>
      </form>
      <div v-if="cotizacion.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="table-responsive">
        <table v-if="cotizacion.data.length && !cotizacion.loading"
          class="table table-hover table-sm table-vcenter mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>CTL</th>
              <th>UDM</th>
              <th>Cantidad</th>
              <!-- <th class="text-end"></th> -->
              <th class="text-end">Precio</th>
              <th class="text-end">Descuento</th>
              <th class="text-end">Total</th>
              <th></th>
            </tr>
          </thead>

          <draggable v-model="cotizacion.data" tag="tbody" item-key="orden" handle=".handle">
            <template #item="{ element, index }">
              <tr>
                <td class="fs-sm">{{ index + 1 }}</td>
                <td class="fs-sm">
                  {{ element.ART_CODIGO }}
                </td>
                <td class="fs-sm">
                  {{ element.ART_DESCRIPCION }}
                </td>
                <td class="fs-sm">
                  {{ element.ART_CODIGO_TRES_LETRAS }}
                </td>
                <td class="fs-sm">
                  {{ element.ART_PLAN_UMEDIDA }}
                </td>
                <td class="fs-sm col-1">
                  <input type="text" :id="`updatecantidad-${element.id}`" class="form-control text-end"
                    placeholder="Cantidad" :class="element.errorCantidad || element.ART_CANTIDAD == 0
                      ? 'is-invalid'
                      : ''
                      " :value="element.ART_CANTIDAD" @change="updateCantidad($event, element, index)"
                    :tabindex="index + 1" />
                </td>
                <!-- <td class="fs-sm text-end">
                  {{ element.ART_STOCK }}
                </td> -->

                <td class="fs-sm text-end col-1">
                  ${{ format(parseFloat(element.ART_VALOR)) }}
                </td>
                <td class="fs-sm text-end col-1">
                  {{ format(parseFloat(element.descuento)) }}%
                </td>
                <td class="fs-sm text-end">${{ format(parseFloat(element.subtotal || 0)) }}</td>
                <td class="fs-sm text-end nowrap">
                  <button type="button" class="btn btn-danger btn-sm mx-1"
                    @click="confirmeliminarArticulo(element, index)">
                    <i class="fa fa-trash-can"></i>
                  </button>
                  <a class="btn btn-primary btn-sm handle mx-1" style="cursor: move"><i
                      class="fa fa-arrows-up-down-left-right"></i></a>
                  <button class="btn btn-success btn-sm mx-1" v-if="element.imagenes && element.imagenes.length"
                    href="javascript:void(0)" @click="showPhoto(element.imagenes)">
                    <i class="fa fa-search"></i>
                  </button>
                </td>
              </tr>
            </template>
          </draggable>
          <tr>
            <th colspan="8" class="fs-sm text-end">Subtotal sin descuento</th>
            <th class="fs-sm text-end">${{ format(subtotal + descuento) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">Descuento</th>
            <th class="fs-sm text-end">${{ format(descuento) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">Subtotal - descuento </th>
            <th class="fs-sm text-end">${{ format(subtotal) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">IVA</th>
            <th class="fs-sm text-end">${{ format(iva) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">Total</th>
            <th class="fs-sm text-end">${{ format(parseFloat(total)) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">&nbsp;</th>
            <th class="fs-sm text-end"></th>
            <th></th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">Peso total</th>
            <th class="fs-sm text-end">{{ format(peso) }}Kg</th>
            <th></th>
          </tr>
        </table>
      </div>
      <div class="row" v-if="cotizacion.data.length > 0">
        <div class="col-md-12">
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label for="prospect-condicion-pago" class="form-label">Condición de pago</label>
              <input id="prospect-condicion-pago" class="form-control" :value="condiciondepago_id" disabled />
            </div>
            <div class="col-md-4">
              <label for="prospect-forma-pago" class="form-label">Forma de pago</label>
              <input id="prospect-forma-pago" class="form-control" value="CONTADO-EFECTIVO" disabled />
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-md-4">
              <div class="row">
                <div class="col-sm-6">
                  <label for="orden-de-compra" class="col-auto col-form-label text-right">Orden de compra:</label>
                  <div class="input-group">
                    <input v-model="orden_de_compra" type="text" id="orden-de-compra" class="form-control"
                      placeholder="Orden de compra" :maxlength="max_length" />
                    <span v-if="orden_de_compra" class="input-group-text">{{ max_length - orden_de_compra.length
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <label for="nota-cliente" class="col-auto col-form-label text-right">Nota cliente:</label>
              <div class="col-auto">
                <textarea class="form-control" v-model="nota_cliente" maxlength="300"></textarea>
              </div>
            </div>
            <div class="col-md-4">
              <label for="nota-interna" class="col-auto col-form-label text-right">Nota interna:</label>
              <div class="col-auto">
                <textarea class="form-control" v-model="nota_interna" maxlength="300"></textarea>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 text-left">
              <button type="button" class="btn btn-danger" @click="limpiarCotizacion">
                Limpiar cotización
              </button>
            </div>
            <div class="col-md-6 text-end">
              <button type="button" class="btn btn-success mx-4" :disabled="saving || !validaCantidad" @click="guardarCotizacion">
                Guardar Cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseBlock>
  </div>
  <div class="modal" id="modal-articulo" tabindex="-1" aria-hidden="true" ref="articuloModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="max-width: 90vw;">
      <div class="modal-content">
        <verModalBuscarArticulos
          v-if="dataSearchItem"
          :form="dataSearchItem"
          @closeModal="closeModalSearchItem"
          @select-item="handleItemSelected"
        ></verModalBuscarArticulos>
      </div>
    </div>
  </div>
  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
</template>
<script setup>
import verModalBuscarArticulos from "./crear-cotizacion/modals/verModalBuscarArticulos.vue";
import draggable from "vuedraggable";
import VueEasyLightbox from "vue-easy-lightbox";
import { format } from "@/functions";
import { useProspectQuotation } from "@/composables/venta/cotizaciones/prospecto/useProspectQuotation";
const { nuevoProspecto, despacho, bodegas, bodega_selected, bodegaFacturacion, cotizacion, subtotal, descuento, iva, total, peso, orden_de_compra, nota_interna, nota_cliente, condiciondepago_id, max_length, v$, gallery, showPhoto, handleHide, articuloModal, dataSearchItem, closeModalSearchItem, handleItemSelected, buscararticulo, updateCantidad, confirmeliminarArticulo, limpiarCotizacion, guardarCotizacion, checkRuc, validaCantidad, saving } = useProspectQuotation();
</script>

<style scoped>
.prospect-form {
  max-width: 1180px;
  margin: 0 auto;
}

.prospect-form__label {
  margin-bottom: 0.2rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.prospect-form__control .input-group-text {
  width: 2.25rem;
  justify-content: center;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  background-color: var(--tuval-surface-muted, var(--bs-body-bg));
}

.prospect-form__control .form-control,
.prospect-form__textarea,
.prospect-form__delivery .form-select {
  border-color: var(--tuval-border, var(--bs-border-color));
}

.prospect-form__control:focus-within .input-group-text {
  color: var(--tuval-primary, var(--bs-primary));
  border-color: var(--tuval-primary, var(--bs-primary));
}

.prospect-form__textarea {
  min-height: 58px;
  resize: vertical;
}

.prospect-form__delivery {
  padding: 0.65rem 0.75rem;
  background-color: var(--tuval-surface-muted, var(--bs-body-bg));
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: 0.5rem;
}

.prospect-form__dispatch-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.prospect-form__dispatch-option {
  display: inline-flex;
  flex: 1 1 11rem;
  align-items: center;
  justify-content: center;
  min-height: 31px;
  padding: 0.3rem 0.6rem;
  margin: 0;
  color: var(--tuval-text, var(--bs-body-color));
  background-color: var(--tuval-surface, var(--bs-body-bg));
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: 0.375rem;
  cursor: pointer;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.prospect-form__dispatch-option:hover,
.prospect-form__dispatch-option--active {
  color: var(--tuval-primary, var(--bs-primary));
  background-color: var(--tuval-primary-soft, var(--bs-body-bg));
  border-color: var(--tuval-primary, var(--bs-primary));
}

.prospect-form__dispatch-option .form-check-input {
  flex: 0 0 auto;
  margin: 0 0.5rem 0 0;
}

@media (max-width: 575.98px) {
  .prospect-form__delivery {
    padding: 0.65rem;
  }

  .prospect-form__dispatch-option {
    flex-basis: 100%;
    justify-content: flex-start;
  }
}
</style>
