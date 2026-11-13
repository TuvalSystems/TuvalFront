<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
const { run } = useApiAction();
const busy = ref(false);
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
const error = ref("");
const aviso = ref("");
const config = ref(null);
const reporte = ref(null);
const paginaUsuarios = ref(1);
const paginaPerfiles = ref(1);
const perfiles = computed(() => config.value?.perfiles ?? []);
const paginasPerfiles = computed(() => Math.max(1, Math.ceil(perfiles.value.length / 10)));
const perfilesVisibles = computed(() => perfiles.value.slice((paginaPerfiles.value - 1) * 10, paginaPerfiles.value * 10));
const porcentajeAsignado = computed(() => perfiles.value.reduce((total, perfil) => total + Math.round(Number(perfil.porcentaje || 0) * 100), 0) / 100);
const columnasPerfiles = [
  { key: "nombre", label: "Perfil" },
  { key: "porcentaje", label: "Porcentaje de la bolsa" },
  { key: "limiteDiario", label: "Límite diario", align: "text-end" },
  { key: "limiteMensual", label: "Límite mensual", align: "text-end" },
  { key: "consumoDiario", label: "Consumo hoy", align: "text-end" },
  { key: "consumoMensual", label: "Consumo del mes", align: "text-end" },
];
function cuotaPerfil(perfil, presupuesto) {
  return Math.floor(Number(presupuesto || 0) * Math.round(Number(perfil.porcentaje || 0) * 100) / 10000);
}
function cambiarPaginaPerfiles(page) {
  if (!busy.value && page >= 1 && page <= paginasPerfiles.value) paginaPerfiles.value = page;
}
const usuariosPorPagina = 10;
const columnasTokens = [
  { key: "inputTokens", label: "Entrada", align: "text-end" },
  { key: "outputTokens", label: "Salida", align: "text-end" },
  { key: "accountedTokens", label: "Contabilizado", align: "text-end" },
];
const columnasUsuarios = [
  { key: "usuario", label: "Usuario" },
  { key: "llamadas", label: "Llamadas", align: "text-end" },
  ...columnasTokens,
];
const columnasRegistros = [
  { key: "fecha", label: "Fecha" },
  { key: "perfil", label: "Perfil" },
  { key: "usuario", label: "Usuario" },
  { key: "operacion", label: "Operación / modelo" },
  { key: "estado", label: "Estado" },
  ...columnasTokens,
];
const usuarios = computed(() => reporte.value?.usuarios ?? []);
const paginasUsuarios = computed(() => Math.max(1, Math.ceil(usuarios.value.length / usuariosPorPagina)));
const usuariosVisibles = computed(() => usuarios.value.slice(
  (paginaUsuarios.value - 1) * usuariosPorPagina, paginaUsuarios.value * usuariosPorPagina
));
function cambiarPaginaUsuarios(page) {
  if (!busy.value && page >= 1 && page <= paginasUsuarios.value) paginaUsuarios.value = page;
}
function cambiarPaginaRegistros(page) {
  if (!busy.value && page >= 1 && page <= reporte.value.ultimaPagina) consultar(page);
}
const fechaLocal = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const hoy = fechaLocal();
const filtros = reactive({ desde: hoy.slice(0, 7) + "-01", hasta: hoy, userId: "" });
const campos = [
  { key: "limiteDiarioGlobal", label: "Presupuesto diario global", min: 0, max: 1000000000 },
  { key: "limiteMensualGlobal", label: "Presupuesto mensual global", min: 0, max: 2000000000 },
  { key: "maxEntrada", label: "Máximo de entrada por llamada", min: 1000, max: 100000 },
  { key: "maxSalida", label: "Máximo de salida por llamada", min: 256, max: 6000 },
];
const base = "sistemas/inteligencia-artificial";
const opciones = { skipMaintenanceRedirect: true };
async function cargar() {
  const result = await run(() => axiosClient.get(`${base}/configuracion`, opciones), { loadingRef: busy });
  if (result.ok) config.value = result.data;
  else error.value = result.message;
}
async function guardar() {
  if (busy.value) return;
  error.value = ""; aviso.value = "";
  const campoInvalido = campos.find(c => !Number.isInteger(config.value[c.key]) || config.value[c.key] < c.min || config.value[c.key] > c.max);
  if (campoInvalido || config.value.limiteMensualGlobal < config.value.limiteDiarioGlobal) {
    tabActual.value = "general";
    error.value = campoInvalido ? `Revise el valor de ${campoInvalido.label}.` : "El presupuesto mensual no puede ser menor al diario.";
    return;
  }
  const perfilInvalido = perfiles.value.find(p => typeof p.porcentaje !== "number" || !Number.isFinite(p.porcentaje) || p.porcentaje < 0 || p.porcentaje > 100 || Math.abs(p.porcentaje * 100 - Math.round(p.porcentaje * 100)) > 0.000001);
  if (perfilInvalido) {
    tabActual.value = "perfiles";
    paginaPerfiles.value = Math.floor(perfiles.value.indexOf(perfilInvalido) / 10) + 1;
    error.value = `Revise el porcentaje de ${perfilInvalido.nombre}: use de 0 a 100, con hasta dos decimales.`;
    return;
  }
  if (porcentajeAsignado.value > 100) {
    tabActual.value = "perfiles";
    error.value = "La suma de porcentajes no puede superar el 100%.";
    return;
  }
  const body = Object.fromEntries(["habilitado", ...campos.map(c => c.key)].map(k => [k, config.value[k]]));
  body.perfiles = perfiles.value.map(({ perfilId, porcentaje }) => ({ perfilId, porcentaje }));
  const result = await run(() => axiosClient.put(`${base}/configuracion`, body, opciones), { loadingRef: busy });
  if (result.ok) { config.value = result.data; aviso.value = "Configuración guardada. Se aplica a las nuevas llamadas."; }
  else error.value = result.message;
}
async function consultar(page = 1) {
  error.value = "";
  const result = await run(() => axiosClient.get(`${base}/consumos`, { ...opciones, params: { ...filtros, userId: filtros.userId || undefined, page } }), { loadingRef: busy });
  if (result.ok) {
    reporte.value = result.data;
    paginaUsuarios.value = 1;
  }
  else error.value = result.message;
}
onMounted(async () => { await cargar(); if (config.value) await consultar(); });
</script>
<template>
  <BasePageHeading title="Inteligencia artificial" subtitle="Sistemas · Límites de tokens y consumo por usuario" />
  <div class="content ai-page">
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="aviso" class="alert alert-success" role="status">{{ aviso }}</div>
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
