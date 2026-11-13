<script setup>
import { computed, onMounted, ref } from "vue";
import { swalError, swalWarning, swalSuccess } from "@/functions/swal-alert";
import BaseTable from "@/components/BaseTable.vue";
import { useIaConfiguration } from "@/composables/sistemas/inteligencia-artificial/useIaConfiguration";
import { useIaConsumptionTable } from "@/composables/sistemas/inteligencia-artificial/useIaConsumptionTable";

const {
  busy: loadingConfig, config, paginaPerfiles, perfiles,
  paginasPerfiles, perfilesVisibles, porcentajeAsignado, columnasPerfiles,
  cuotaPerfil, cambiarPaginaPerfiles, campos, cargar, guardar: guardarConfiguracion,
} = useIaConfiguration();
const {
  busy: loadingConsumo, reporte, paginaUsuarios,
  usuariosPorPagina, columnasUsuarios, columnasRegistros, usuarios, paginasUsuarios,
  usuariosVisibles, cambiarPaginaUsuarios, cambiarPaginaRegistros: cambiarPaginaConsumo, filtros, consultar: consultarConsumo,
} = useIaConsumptionTable();
const busy = computed(() => loadingConfig.value || loadingConsumo.value);
const tabActual = ref("consumo");
const tabs = [
  { id: "consumo", nombre: "Consumo", icon: "fa fa-chart-column" },
  { id: "perfiles", nombre: "Límites por perfil", icon: "fa fa-users" },
  { id: "general", nombre: "Configuración general", icon: "fa fa-sliders" },
];
function navegarTabs(event, index) {
  let siguiente = index;
  if (event.key === "ArrowRight") siguiente = (index + 1) % tabs.length;
  else if (event.key === "ArrowLeft") siguiente = (index + tabs.length - 1) % tabs.length;
  else if (event.key === "Home") siguiente = 0;
  else if (event.key === "End") siguiente = tabs.length - 1;
  else return;
  event.preventDefault();
  tabActual.value = tabs[siguiente].id;
  document.getElementById(`ia-tab-${tabActual.value}`)?.focus();
}

async function guardar() {
  if (busy.value) return;
  const result = await guardarConfiguracion();
  if (result?.tab) tabActual.value = result.tab;
  if (result?.ok) swalSuccess("Configuración guardada. Se aplica a las nuevas llamadas.");
  else mostrarError(result);
}
function mostrarError(result) {
  if (!result || result.ok || result.handled || result.canceled || result.stale) return;
  (result.status >= 500 ? swalError : swalWarning)(result.message);
}
async function consultar(page = 1) {
  mostrarError(await consultarConsumo(page));
}
async function cambiarPaginaRegistros(page) {
  mostrarError(await cambiarPaginaConsumo(page));
}
onMounted(async () => {
  mostrarError(await cargar());
  if (config.value) await consultar();
});
</script>
<template>
  <BasePageHeading title="Inteligencia artificial" subtitle="Sistemas · Límites de tokens y consumo por usuario" />
  <div class="content ai-page">
    <ul v-if="config" class="nav nav-tabs nav-tabs-alt mb-3" role="tablist" aria-label="Gestión de inteligencia artificial">
      <li v-for="(tab, index) in tabs" :key="tab.id" class="nav-item" role="presentation">
        <button :id="`ia-tab-${tab.id}`" type="button" class="nav-link"
          :class="{ active: tabActual === tab.id }" role="tab"
          :aria-selected="tabActual === tab.id" :aria-controls="`ia-panel-${tab.id}`"
          :tabindex="tabActual === tab.id ? 0 : -1" @click="tabActual = tab.id" @keydown="navegarTabs($event, index)">
          <i :class="tab.icon" class="me-1" aria-hidden="true"></i>{{ tab.nombre }}
        </button>
      </li>
    </ul>
    <section v-show="tabActual === 'general'" id="ia-panel-general" role="tabpanel" aria-labelledby="ia-tab-general" tabindex="0">
    <BaseBlock v-if="config" title="Configuración general" content-full>
      <form id="ia-config-form" novalidate @submit.prevent="guardar">
        <div class="form-check form-switch mb-3"><input id="ia-habilitada" v-model="config.habilitado" type="checkbox" class="form-check-input" :disabled="busy" /><label class="form-check-label" for="ia-habilitada">Permitir nuevas llamadas a IA</label></div>
        <div class="row g-2 mb-3">
          <div v-for="campo in campos" :key="campo.key" class="col-md-6 col-xl-4 mb-3">
            <label :for="campo.key" class="form-label">{{ campo.label }}</label>
            <input :id="campo.key" v-model.number="config[campo.key]" type="number" step="1" :min="campo.min" :max="campo.max" required class="form-control form-control-sm" :disabled="busy" />
          </div>
        </div>
        <p class="text-muted fs-sm">Las cuotas suman entrada y salida. Antes de generar se reserva la entrada contada más el máximo de salida; luego se ajusta al consumo informado. Un valor de cuota 0 bloquea el uso. Los períodos siguen la zona horaria del servidor TUVAL.</p>
        <p class="text-muted fs-sm">Los límites incluyen la lectura de imágenes. Una reserva de consumo desconocido se mantiene para evitar exceder el cupo. No representa necesariamente el consumo facturado.</p>

      </form>
    </BaseBlock>
    </section>
    <section v-show="tabActual === 'perfiles'" id="ia-panel-perfiles" role="tabpanel" aria-labelledby="ia-tab-perfiles" tabindex="0">
    <BaseBlock v-if="config" title="Límites por perfil" content-full>
      <p class="text-muted fs-sm">Cada perfil comparte una bolsa entre todos sus usuarios. El porcentaje se aplica al presupuesto diario y mensual global. Un perfil con 0% no puede consumir tokens.</p>
      <div class="d-flex flex-wrap gap-3 mb-3" :class="{ 'text-danger': porcentajeAsignado > 100 }">
        <span>Asignado: <strong>{{ porcentajeAsignado }}%</strong></span>
        <span>Disponible: <strong>{{ Math.max(0, 100 - porcentajeAsignado).toFixed(2) }}%</strong></span>
      </div>
      <BaseTable :columns="columnasPerfiles" :data="perfilesVisibles" :loading="busy"
        perPage="10" :totalItems="perfiles.length" :currentPage="paginaPerfiles"
        :totalPage="paginasPerfiles" @onPageChange="cambiarPaginaPerfiles">
        <template #cell-nombre="{ row }">{{ row.nombre }} <span v-if="row.estado !== 'active'" class="badge bg-body-light text-muted">Inactivo</span></template>
        <template #cell-porcentaje="{ row }">
          <div class="input-group input-group-sm" style="min-width: 110px; max-width: 150px">
            <input v-model.number="row.porcentaje" form="ia-config-form" type="number" min="0" max="100" step="0.01" required
              class="form-control form-control-sm text-end" :aria-label="`Porcentaje para ${row.nombre}`" :disabled="busy" />
            <span class="input-group-text">%</span>
          </div>
        </template>
        <template #cell-limiteDiario="{ row }">{{ cuotaPerfil(row, config.limiteDiarioGlobal) }}</template>
        <template #cell-limiteMensual="{ row }">{{ cuotaPerfil(row, config.limiteMensualGlobal) }}</template>
        <template #empty>No hay perfiles web disponibles.</template>
      </BaseTable>
      <p class="text-muted fs-sm">Los cambios no reinician el consumo acumulado. Los tokens ya utilizados permanecen en el perfil que los consumió.</p>
    </BaseBlock>
    </section>
    <div v-if="config && tabActual !== 'consumo'" class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <button form="ia-config-form" type="submit" class="btn btn-primary" :disabled="busy">Guardar configuración</button>
      <span class="text-muted fs-sm">Guarda el presupuesto general y la distribución por perfiles.</span>
    </div>
    <section v-show="tabActual === 'consumo'" id="ia-panel-consumo" role="tabpanel" aria-labelledby="ia-tab-consumo" tabindex="0">
    <BaseBlock v-if="config" title="Consumo por usuario" content-full>
      <form class="row align-items-end mb-3" @submit.prevent="consultar(1)">
        <div class="col-md-3 mb-2"><label for="ia-desde" class="form-label">Desde</label><input id="ia-desde" v-model="filtros.desde" type="date" class="form-control form-control-sm" required /></div>
        <div class="col-md-3 mb-2"><label for="ia-hasta" class="form-label">Hasta</label><input id="ia-hasta" v-model="filtros.hasta" type="date" class="form-control form-control-sm" required /></div>
        <div class="col-md-3 mb-2"><label for="ia-usuario" class="form-label">ID de usuario (opcional)</label><input id="ia-usuario" v-model="filtros.userId" type="number" min="1" class="form-control form-control-sm" /></div>
        <div class="col-md-3 mb-2"><button class="btn btn-alt-primary" :disabled="busy">Consultar</button></div>
      </form>
      <template v-if="reporte">
        <div class="token-summary">
          <div class="token-summary-item"><span>Tokens de entrada</span><strong>{{ reporte.totales.inputTokens }}</strong></div>
          <div class="token-summary-item"><span>Tokens de salida</span><strong>{{ reporte.totales.outputTokens }}</strong></div>
          <div class="token-summary-item"><span>Contabilizado para límites</span><strong>{{ reporte.totales.accountedTokens }}</strong></div>
        </div>
        <h3 class="h6">Resumen por usuario (hasta 200 usuarios con mayor consumo)</h3>
        <BaseTable
          :columns="columnasUsuarios" :data="usuariosVisibles" :loading="busy"
          :perPage="String(usuariosPorPagina)" :totalItems="usuarios.length"
          :currentPage="paginaUsuarios" :totalPage="paginasUsuarios"
          @onPageChange="cambiarPaginaUsuarios"
        >
          <template #cell-usuario="{ row }">{{ row.usuario || 'Usuario' }} ({{ row.userId }})</template>
          <template #cell-inputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #cell-outputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #empty>No hay consumo registrado en este período.</template>
        </BaseTable>
        <h3 class="h6 mt-4">Detalle de llamadas</h3>
        <BaseTable
          :columns="columnasRegistros" :data="reporte.registros" :loading="busy"
          perPage="30" :totalItems="reporte.totalRegistros ?? 0"
          :currentPage="reporte.pagina" :totalPage="reporte.ultimaPagina"
          @onPageChange="cambiarPaginaRegistros"
        >
          <template #cell-usuario="{ row }">{{ row.usuario || 'Usuario' }} ({{ row.userId }})</template>
          <template #cell-operacion="{ row }">{{ row.operacion }}<br />{{ row.modelo }}</template>
          <template #cell-inputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #cell-outputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #empty>No hay consumo registrado en este período.</template>
        </BaseTable>
      </template>
    </BaseBlock>
    </section>
  </div>
</template>

<style scoped lang="scss" src="@/assets/scss/ai-views.scss"></style>
