import { defineStore } from 'pinia';
import axiosClient from "../../axios";

export const useMotivosStore = defineStore('motivos', {
   
    state: () => ({
        motivos :[],
        loading : false,
        error: null
    }),

    actions:{
        async fetchMotivos(){
            this.loafing = true;
            this.error = null;

            try {
                const response = await axiosClient.get('/cotizaciones/lista-motivos-no-venta');
                this.motivos = response.data.data;
                this.loading = false;
            } catch (error) {
                this.error = error;
            } finally{
                this.loading = false;
            }
        }
    }
    
});