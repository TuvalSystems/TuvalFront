import { computed, reactive, ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { IA_API_ROUTES } from "@/constants/apiRoutes/sistema/inteligenciaArtificialRoutes";

export function useIaConsumptionTable() {
  const { run } = useApiAction();
  const busy = ref(false);
  const error = ref("");
  const paginaSolicitada = ref(1);
  const reporte = ref(null);
  const paginaUsuarios = ref(1);
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
    if (!busy.value && page >= 1 && page <= reporte.value.ultimaPagina) return consultar(page);
  }
  const fechaLocal = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const hoy = fechaLocal();
  const filtros = reactive({ desde: hoy.slice(0, 7) + "-01", hasta: hoy, userId: "" });
  const opciones = { skipMaintenanceRedirect: true };
  async function consultar(page = 1) {
    paginaSolicitada.value = page;
    const result = await run(() => axiosClient.get(IA_API_ROUTES.CONSUMOS, { ...opciones, params: { ...filtros, userId: filtros.userId || undefined, page } }), { loadingRef: busy, errorRef: error, latestOnly: true, key: "consumos" });
    if (result.ok && !result.stale) {
      reporte.value = result.data;
      paginaUsuarios.value = 1;
    }
    return result;
  }
  return { busy, error, paginaSolicitada, reporte, paginaUsuarios, usuariosPorPagina, columnasUsuarios,
    columnasRegistros, usuarios, paginasUsuarios, usuariosVisibles, cambiarPaginaUsuarios,
    cambiarPaginaRegistros, filtros, consultar };
}
