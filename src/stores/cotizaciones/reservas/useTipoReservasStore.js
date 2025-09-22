import { defineStore } from 'pinia';
import axiosClient from "@/axios";

export const useTipoReservasStore = defineStore('tipoReservas',{

    state: () => ({
        'tipoReservas': [],
        'loading': false,
        'error': null
    }),

    actions:{
        async fetchListTypeReserved() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosClient.get( "/cotizaciones/reserva/lista-tipo-reservas");
                const res = response.data;
                this.loading = false;
                this.tipoReservas = res.data;
            } catch (error) {
                console.log("Error al obtener los tipos de reservas", error);
                swalError(error.response.data.error);
                return;
            } finally {
                this.loading = false;
            }
        }
    }

});