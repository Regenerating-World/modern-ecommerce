export enum EventType {
  CLIQUE = "clique",
  MOUSEOVER = "mouseover",
  VISUALIZACAO = "visualizacao",
  COMPRA = "compra",
}

export interface EventData {
  id?: string; // ID único para o evento
  nomeDoProduto?: string;
  IDdoProduto?: string;
  dataDoEvento: string;
  tipoEvento: EventType;
}

export interface UserEvents {
  cliquesEmProdutos: {
    contagem: number;
    cliques: EventData[];
  };
  mouseoversEmProdutos: {
    contagem: number;
    mouseovers: EventData[];
  };
  impressoesDeProdutos: {
    contagem: number;
    impressoes: EventData[];
  };
  comprasRealizadas: {
    contagem: number;
    compras: EventData[];
  };
}
