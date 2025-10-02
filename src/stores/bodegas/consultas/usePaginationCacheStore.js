import { defineStore } from "pinia";
import { reactive } from "vue";

export const usePaginationCacheStore = defineStore("paginationCache", {
  state: () => ({
    tables: {}, // cacheKey -> { items, pagination, etc }
  }),

  actions: {
    initTable(cacheKey) {
      if (!this.tables[cacheKey]) {
        this.tables[cacheKey] = reactive({
          items: [],
          currentPage: 1,
          totalPage: 0,
          totalItems: 0,
          searchTerm: "",
          perPage: "10",
          sortField: "",
          sortOrder: "desc",
          fecha_desde: null,
          fecha_hasta: null,
          cliente: null,
          ptovta: null,
        });
      }
    },

    getTable(cacheKey) {
      return this.tables[cacheKey] || null;
    },

     clearTable(cacheKey) {
      delete this.tables[cacheKey];
    }
  },
});
