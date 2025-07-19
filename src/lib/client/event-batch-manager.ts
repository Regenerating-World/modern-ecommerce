import { EventData, EventType } from "./event-types";

// Tipos de eventos que podem ser enviados juntos
const BATCHABLE_EVENTS = [EventType.VISUALIZACAO, EventType.MOUSEOVER];

// Tipos de eventos que devem ser enviados separadamente
const NON_BATCHABLE_EVENTS = [EventType.CLIQUE, EventType.COMPRA];

interface BatchQueue {
  batchable: EventData[];
  nonBatchable: EventData[];
}

class EventBatchManager {
  private queue: BatchQueue = {
    batchable: [],
    nonBatchable: [],
  };

  private batchableTimeout: NodeJS.Timeout | null = null;
  private nonBatchableTimeout: NodeJS.Timeout | null = null;
  private isProcessingNonBatchable = false;
  private nonBatchableQueue: EventData[] = [];
  private lastEventTime: Map<string, number> = new Map(); // Para evitar eventos duplicados

  private readonly DEBOUNCE_DELAY = 800; // 800ms
  private readonly DUPLICATE_THRESHOLD = 1000; // 1 segundo para evitar duplicatas

  /**
   * Verifica se um evento é válido (tem produto válido)
   */
  private isValidEvent(eventData: EventData): boolean {
    return !!(
      eventData.nomeDoProduto &&
      eventData.nomeDoProduto !== "N/A" &&
      eventData.IDdoProduto &&
      eventData.IDdoProduto !== "N/A"
    );
  }

  /**
   * Adiciona um evento à fila apropriada
   */
  addEvent(eventData: EventData): void {
    console.log(
      `📥 Evento recebido no batch manager: ${eventData.tipoEvento} - ${
        eventData.nomeDoProduto
      } - ${new Date().toISOString()}`
    );

    // Só adiciona eventos válidos
    if (!this.isValidEvent(eventData)) {
      console.warn("Evento ignorado - produto inválido:", eventData);
      return;
    }

    // Verifica se é um evento duplicado recente
    const eventKey = `${eventData.tipoEvento}-${eventData.nomeDoProduto}-${eventData.IDdoProduto}`;
    const now = Date.now();
    const lastTime = this.lastEventTime.get(eventKey);

    if (lastTime && now - lastTime < this.DUPLICATE_THRESHOLD) {
      console.log(
        `🚫 Evento duplicado ignorado: ${eventData.tipoEvento} - ${
          eventData.nomeDoProduto
        } (último: ${now - lastTime}ms atrás)`
      );
      return;
    }

    // Atualiza o timestamp do último evento
    this.lastEventTime.set(eventKey, now);

    if (BATCHABLE_EVENTS.includes(eventData.tipoEvento)) {
      console.log(
        `📦 Adicionando evento batchable: ${eventData.tipoEvento} - ${eventData.nomeDoProduto}`
      );
      this.addToBatchableQueue(eventData);
    } else if (NON_BATCHABLE_EVENTS.includes(eventData.tipoEvento)) {
      console.log(
        `📦 Adicionando evento não-batchable: ${eventData.tipoEvento} - ${eventData.nomeDoProduto}`
      );
      this.addToNonBatchableQueue(eventData);
    }
  }

  /**
   * Adiciona evento à fila de eventos que podem ser enviados juntos
   */
  private addToBatchableQueue(eventData: EventData): void {
    console.log(
      `📦 Adicionando à fila batchable: ${eventData.tipoEvento} - ${eventData.nomeDoProduto} - Fila atual: ${this.queue.batchable.length}`
    );
    this.queue.batchable.push(eventData);

    // Cancela timeout anterior se existir
    if (this.batchableTimeout) {
      console.log(`⏰ Cancelando timeout anterior`);
      clearTimeout(this.batchableTimeout);
    }

    // Agenda novo envio
    this.batchableTimeout = setTimeout(() => {
      console.log(
        `⏰ Timeout disparado - enviando ${this.queue.batchable.length} eventos`
      );
      this.sendBatchableEvents();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Adiciona evento à fila de eventos que devem ser enviados separadamente
   */
  private addToNonBatchableQueue(eventData: EventData): void {
    this.nonBatchableQueue.push(eventData);

    // Se não está processando, inicia o processamento
    if (!this.isProcessingNonBatchable) {
      this.processNonBatchableEvents();
    }
  }

  /**
   * Envia eventos que podem ser enviados juntos
   */
  private async sendBatchableEvents(): Promise<void> {
    if (this.queue.batchable.length === 0) return;

    const eventsToSend = [...this.queue.batchable];
    this.queue.batchable = []; // Limpa a fila

    try {
      // Envia todos os eventos em uma única requisição
      const response = await fetch("/api/register-events-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: eventsToSend,
        }),
      });

      if (!response.ok) {
        console.error("Erro ao enviar eventos em batch:", response.statusText);
        // Recoloca os eventos na fila para tentar novamente
        this.queue.batchable.unshift(...eventsToSend);
      } else {
        console.log(`✅ ${eventsToSend.length} eventos enviados em batch`);
      }
    } catch (error) {
      console.error("Erro ao enviar eventos em batch:", error);
      // Recoloca os eventos na fila para tentar novamente
      this.queue.batchable.unshift(...eventsToSend);
    }
  }

  /**
   * Processa eventos que devem ser enviados separadamente
   * Agora também usa a API de batch, mas com apenas um evento
   */
  private async processNonBatchableEvents(): Promise<void> {
    if (this.nonBatchableQueue.length === 0) {
      this.isProcessingNonBatchable = false;
      return;
    }

    this.isProcessingNonBatchable = true;
    const eventToSend = this.nonBatchableQueue.shift()!;

    // Cancela timeout anterior se existir
    if (this.nonBatchableTimeout) {
      clearTimeout(this.nonBatchableTimeout);
    }

    // Agenda envio com debouncing
    this.nonBatchableTimeout = setTimeout(async () => {
      try {
        // Usa a API de batch mesmo para eventos individuais
        const response = await fetch("/api/register-events-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            events: [eventToSend], // Array com apenas um evento
          }),
        });

        if (!response.ok) {
          console.error(
            "Erro ao enviar evento não-batchable:",
            response.statusText
          );
          // Recoloca o evento na fila para tentar novamente
          this.nonBatchableQueue.unshift(eventToSend);
        } else {
          console.log(
            `✅ Evento ${eventToSend.tipoEvento} enviado via batch API`
          );
        }
      } catch (error) {
        console.error("Erro ao enviar evento não-batchable:", error);
        // Recoloca o evento na fila para tentar novamente
        this.nonBatchableQueue.unshift(eventToSend);
      }

      // Processa próximo evento após um pequeno delay
      setTimeout(() => {
        this.processNonBatchableEvents();
      }, 100);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Limpa todas as filas e timeouts
   */
  clear(): void {
    this.queue.batchable = [];
    this.queue.nonBatchable = [];
    this.nonBatchableQueue = [];
    this.lastEventTime.clear(); // Limpa o mapa de eventos duplicados

    if (this.batchableTimeout) {
      clearTimeout(this.batchableTimeout);
      this.batchableTimeout = null;
    }

    if (this.nonBatchableTimeout) {
      clearTimeout(this.nonBatchableTimeout);
      this.nonBatchableTimeout = null;
    }

    this.isProcessingNonBatchable = false;
  }

  /**
   * Retorna estatísticas das filas
   */
  getStats(): {
    batchable: number;
    nonBatchable: number;
    isProcessing: boolean;
  } {
    return {
      batchable: this.queue.batchable.length,
      nonBatchable: this.nonBatchableQueue.length,
      isProcessing: this.isProcessingNonBatchable,
    };
  }
}

// Instância singleton do gerenciador
export const eventBatchManager = new EventBatchManager();

// Hook para usar o batch manager
export function useEventBatchManager() {
  const addEvent = (eventData: EventData) => {
    eventBatchManager.addEvent(eventData);
  };

  const clearEvents = () => {
    eventBatchManager.clear();
  };

  const getStats = () => {
    return eventBatchManager.getStats();
  };

  return {
    addEvent,
    clearEvents,
    getStats,
  };
}
