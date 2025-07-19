import { useUser } from "@clerk/nextjs";
import { useEventBatchManager } from "./event-batch-manager";
import { EventData, EventType } from "./event-types";

// Hook para tracking de eventos com batch manager
export function useEventTracking() {
  const { isSignedIn } = useUser();
  const { addEvent, clearEvents, getStats } = useEventBatchManager();

  const trackEvent = (eventData: Omit<EventData, "dataDoEvento" | "id">) => {
    if (!isSignedIn) return false;

    // Valida se o produto é válido
    if (
      !eventData.nomeDoProduto ||
      eventData.nomeDoProduto === "N/A" ||
      !eventData.IDdoProduto ||
      eventData.IDdoProduto === "N/A"
    ) {
      console.warn("Evento ignorado - produto inválido:", eventData);
      return false;
    }

    const fullEventData: EventData = {
      ...eventData,
      id: `${eventData.tipoEvento}-${eventData.nomeDoProduto}-${
        eventData.IDdoProduto
      }-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataDoEvento: new Date().toISOString().replace("T", ":").split(".")[0],
    };

    addEvent(fullEventData);
    return true;
  };

  const trackClick = (productData?: {
    nomeDoProduto: string;
    IDdoProduto: string;
  }) => {
    return trackEvent({
      tipoEvento: EventType.CLIQUE,
      ...productData,
    });
  };

  const trackMouseOver = (productData?: {
    nomeDoProduto: string;
    IDdoProduto: string;
  }) => {
    return trackEvent({
      tipoEvento: EventType.MOUSEOVER,
      ...productData,
    });
  };

  const trackView = (productData?: {
    nomeDoProduto: string;
    IDdoProduto: string;
  }) => {
    return trackEvent({
      tipoEvento: EventType.VISUALIZACAO,
      ...productData,
    });
  };

  const trackPurchase = (productData?: {
    nomeDoProduto: string;
    IDdoProduto: string;
  }) => {
    return trackEvent({
      tipoEvento: EventType.COMPRA,
      ...productData,
    });
  };

  return {
    trackClick,
    trackMouseOver,
    trackView,
    trackPurchase,
    clearEvents,
    getStats,
    isSignedIn,
  };
}
