import { computed, ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { IA_API_ROUTES } from "@/constants/apiRoutes/sistema/inteligenciaArtificialRoutes";

export function useIaConfiguration() {
  const { run } = useApiAction();
  const busy = ref(false);
  const errorCarga = ref("");
  const config = ref(null);
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
  const campos = [
    { key: "limiteDiarioGlobal", label: "Presupuesto diario global", min: 0, max: 1000000000 },
    { key: "limiteMensualGlobal", label: "Presupuesto mensual global", min: 0, max: 2000000000 },
    { key: "maxEntrada", label: "Máximo de entrada por llamada", min: 1000, max: 100000 },
    { key: "maxSalida", label: "Máximo de salida por llamada", min: 256, max: 32000 },
  ];
  const opciones = { skipMaintenanceRedirect: true };
  async function cargar() {
    const result = await run(() => axiosClient.get(IA_API_ROUTES.CONFIGURACION, opciones), { loadingRef: busy, errorRef: errorCarga });
    if (result.ok) config.value = result.data;
    return result;
  }
  async function guardar() {
    if (busy.value) return;
    const campoInvalido = campos.find(c => !Number.isInteger(config.value[c.key]) || config.value[c.key] < c.min || config.value[c.key] > c.max);
    if (campoInvalido || config.value.limiteMensualGlobal < config.value.limiteDiarioGlobal) {
      const message = campoInvalido ? `Revise el valor de ${campoInvalido.label}.` : "El presupuesto mensual no puede ser menor al diario.";
      return { ok: false, status: 422, tab: "general", message };
    }
    const perfilInvalido = perfiles.value.find(p => typeof p.porcentaje !== "number" || !Number.isFinite(p.porcentaje) || p.porcentaje < 0 || p.porcentaje > 100 || Math.abs(p.porcentaje * 100 - Math.round(p.porcentaje * 100)) > 0.000001);
    if (perfilInvalido) {
      paginaPerfiles.value = Math.floor(perfiles.value.indexOf(perfilInvalido) / 10) + 1;
      const message = `Revise el porcentaje de ${perfilInvalido.nombre}: use de 0 a 100, con hasta dos decimales.`;
      return { ok: false, status: 422, tab: "perfiles", message };
    }
    if (porcentajeAsignado.value > 100) {
      const message = "La suma de porcentajes no puede superar el 100%.";
      return { ok: false, status: 422, tab: "perfiles", message };
    }
    const body = Object.fromEntries(["habilitado", ...campos.map(c => c.key)].map(k => [k, config.value[k]]));
    body.perfiles = perfiles.value.map(({ perfilId, porcentaje }) => ({ perfilId, porcentaje }));
    const result = await run(() => axiosClient.put(IA_API_ROUTES.CONFIGURACION, body, opciones), { loadingRef: busy });
    if (result.ok) config.value = result.data;
    return result;
  }
  return { busy, errorCarga, config, paginaPerfiles, perfiles, paginasPerfiles,
    perfilesVisibles, porcentajeAsignado, columnasPerfiles, cuotaPerfil, cambiarPaginaPerfiles,
    campos, cargar, guardar };
}
