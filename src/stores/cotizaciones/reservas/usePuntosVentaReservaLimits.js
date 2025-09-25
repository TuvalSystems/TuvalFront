import { defineStore } from "pinia";
import axiosClient from "@/axios";

export const usePuntosVentaReservaLimits = defineStore(
  "puntosVentaReservaLimits",
  {
    state: () => ({
      puntosVentaReservaLimits: [],
      loading: false,
      error: null,
    }),

    getters: {
      byPunto: (s) => (ptoId) =>
        s.puntosVentaReservaLimits.filter(
          (p) => String(p.PTO_VTA_ID) === String(ptoId)
        ),
    },

    actions: {
      async fetchPuntosVentaReservaLimits() {
        this.loading = true;
        this.error = null;
        try {
          const response = await axiosClient.get(
            "/bodegas/puntos-venta/reservas/limites"
          );
          const res = response.data;
          this.loading = false;
          this.puntosVentaReservaLimits = res.data;
        } catch (error) {
          console.log("Error al obtener los puntos de venta", error);
          swalError(error.response.data.error);
          return;
        } finally {
          this.loading = false;
        }
      },
    },
  }
);
