import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { findUserByClerkId, updateEntry } from "@/lib/server/contentful-cma";
import { EventData, EventType } from "@/lib/client/event-types";

interface BatchRequest {
  events: EventData[];
}

interface ProcessedEvent {
  id: string;
  nomeDoProduto: string;
  IDdoProduto: string;
  dataDoEvento: string;
  tipoEvento: EventType;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { events }: BatchRequest = await request.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Lista de eventos inválida" },
        { status: 400 }
      );
    }

    // Buscar usuário no Contentful
    const existingUser = await findUserByClerkId(userId);

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado no Contentful" },
        { status: 404 }
      );
    }

    // Preparar dados dos eventos (filtrando produtos com N/A)
    const eventRecords = events
      .filter(
        (event) =>
          event.nomeDoProduto &&
          event.nomeDoProduto !== "N/A" &&
          event.IDdoProduto &&
          event.IDdoProduto !== "N/A" &&
          event.id // Garante que tem ID único
      )
      .map((event) => ({
        id: event.id!,
        nomeDoProduto: event.nomeDoProduto!,
        IDdoProduto: event.IDdoProduto!,
        dataDoEvento: event.dataDoEvento,
        tipoEvento: event.tipoEvento,
      }));

    // Se não há eventos válidos, retorna sucesso
    if (eventRecords.length === 0) {
      return NextResponse.json({
        message: "Nenhum evento válido para processar",
        processedEvents: 0,
      });
    }

    // Obter eventos atuais do usuário com fallbacks seguros
    const currentCliques = existingUser.fields.cliquesEmProdutos || {
      contagem: 0,
      cliques: [],
    };
    const currentMouseovers = existingUser.fields.mouseoversEmProdutos || {
      contagem: 0,
      mouseovers: [],
    };
    const currentImpressoes = existingUser.fields.impressoesDeProdutos || {
      contagem: 0,
      impressoes: [],
    };
    const currentCompras = existingUser.fields.comprasRealizadas || {
      contagem: 0,
      compras: [],
    };

    // Garantir que os arrays existem
    const safeCliques = Array.isArray(currentCliques.cliques)
      ? currentCliques.cliques
      : [];
    const safeMouseovers = Array.isArray(currentMouseovers.mouseovers)
      ? currentMouseovers.mouseovers
      : [];
    const safeImpressoes = Array.isArray(currentImpressoes.impressoes)
      ? currentImpressoes.impressoes
      : [];
    const safeCompras = Array.isArray(currentCompras.compras)
      ? currentCompras.compras
      : [];

    // Agrupar eventos por tipo
    const visualizacoes = eventRecords.filter(
      (event) => event.tipoEvento === EventType.VISUALIZACAO
    );
    const mouseovers = eventRecords.filter(
      (event) => event.tipoEvento === EventType.MOUSEOVER
    );
    const cliques = eventRecords.filter(
      (event) => event.tipoEvento === EventType.CLIQUE
    );
    const compras = eventRecords.filter(
      (event) => event.tipoEvento === EventType.COMPRA
    );

    // Função para remover duplicatas baseadas no ID
    const removeDuplicates = (
      existingEvents: ProcessedEvent[],
      newEvents: ProcessedEvent[]
    ) => {
      const existingIds = new Set(existingEvents.map((e) => e.id));
      const uniqueNewEvents = newEvents.filter((e) => !existingIds.has(e.id));
      return [...existingEvents, ...uniqueNewEvents];
    };

    // Preparar campos atualizados
    const updatedFields: Record<
      string,
      {
        "en-US": {
          contagem: number;
          cliques?: unknown[];
          mouseovers?: unknown[];
          impressoes?: unknown[];
          compras?: unknown[];
        };
      }
    > = {};

    // Atualizar visualizações se houver
    if (visualizacoes.length > 0) {
      console.log(
        `👁️ Processando ${visualizacoes.length} visualizações para usuário ${userId}`
      );
      const uniqueImpressoes = removeDuplicates(safeImpressoes, visualizacoes);
      console.log(
        `👁️ Visualizações únicas: ${uniqueImpressoes.length} (${safeImpressoes.length} existentes + ${visualizacoes.length} novos)`
      );
      updatedFields.impressoesDeProdutos = {
        "en-US": {
          contagem: uniqueImpressoes.length,
          impressoes: uniqueImpressoes,
        },
      };
    }

    // Atualizar mouseovers se houver
    if (mouseovers.length > 0) {
      console.log(
        `🖱️ Processando ${mouseovers.length} mouseovers para usuário ${userId}`
      );
      const uniqueMouseovers = removeDuplicates(safeMouseovers, mouseovers);
      console.log(
        `🖱️ Mouseovers únicos: ${uniqueMouseovers.length} (${safeMouseovers.length} existentes + ${mouseovers.length} novos)`
      );
      updatedFields.mouseoversEmProdutos = {
        "en-US": {
          contagem: uniqueMouseovers.length,
          mouseovers: uniqueMouseovers,
        },
      };
    }

    // Atualizar cliques se houver
    if (cliques.length > 0) {
      console.log(
        `🖱️ Processando ${cliques.length} cliques para usuário ${userId}`
      );
      const uniqueCliques = removeDuplicates(safeCliques, cliques);
      console.log(
        `🖱️ Cliques únicos: ${uniqueCliques.length} (${safeCliques.length} existentes + ${cliques.length} novos)`
      );
      updatedFields.cliquesEmProdutos = {
        "en-US": {
          contagem: uniqueCliques.length,
          cliques: uniqueCliques,
        },
      };
    }

    // Atualizar compras se houver
    if (compras.length > 0) {
      console.log(
        `🛒 Processando ${compras.length} compras para usuário ${userId}`
      );
      const uniqueCompras = removeDuplicates(safeCompras, compras);
      console.log(
        `🛒 Compras únicas: ${uniqueCompras.length} (${safeCompras.length} existentes + ${compras.length} novos)`
      );
      updatedFields.comprasRealizadas = {
        "en-US": {
          contagem: uniqueCompras.length,
          compras: uniqueCompras,
        },
      };
    }

    // Atualizar entrada no Contentful
    if (Object.keys(updatedFields).length > 0) {
      await updateEntry(existingUser.sys.id, updatedFields);
    }

    return NextResponse.json({
      message: "Eventos em batch registrados com sucesso",
      processedEvents: eventRecords.length,
      visualizacoes: visualizacoes.length,
      mouseovers: mouseovers.length,
      cliques: cliques.length,
      compras: compras.length,
    });
  } catch (error) {
    console.error("Erro ao registrar eventos em batch:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
