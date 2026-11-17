import { ref } from "vue";
import { downloadFileFromApi } from "@/utils/fileDownload";
import { useApiAction } from "@/composables/core/useApiAction";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useQuotationPrint(onPrinted) {
  const { run, loading: printing } = useApiAction();
  const printError = ref("");
  const routes = {
    quote: QUOTE_API_ROUTES.QUOTES.PRINT,
    images: QUOTE_API_ROUTES.QUOTES.PRINT_IMAGES,
    prospect: QUOTE_API_ROUTES.PROSPECTS.PRINT,
  };

  function printQuotation(quote, variant = "quote") {
    return run(
      async () => {
        const filename = await downloadFileFromApi({
          url: `${routes[variant]}/${quote.id}`,
          method: "GET",
          filenameFallback: `cotizacion-${quote.cotizacion}.pdf`,
        });
        return { data: { success: true, data: filename } };
      },
      {
        errorRef: printError,
        onSuccess: onPrinted,
      }
    );
  }

  return { printing, printError, printQuotation };
}
