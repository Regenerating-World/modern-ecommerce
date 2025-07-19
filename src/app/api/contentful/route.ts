import { NextRequest, NextResponse } from "next/server";
import { getEntries, getEntry, getEntryBySlug } from "@/lib/server/contentful";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const contentType = searchParams.get("contentType");
    const entryId = searchParams.get("entryId");
    const slug = searchParams.get("slug");
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");
    const order = searchParams.get("order");

    if (!action) {
      return NextResponse.json(
        {
          error:
            "Ação não especificada. Use ?action=getEntries, getEntry, ou getEntryBySlug",
        },
        { status: 400 }
      );
    }

    switch (action) {
      case "getEntries":
        if (!contentType) {
          return NextResponse.json(
            { error: "contentType é obrigatório para getEntries" },
            { status: 400 }
          );
        }

        const options: {
          limit?: number;
          skip?: number;
          order?: string;
        } = {};
        if (limit) options.limit = parseInt(limit);
        if (skip) options.skip = parseInt(skip);
        if (order) options.order = order;

        const entries = await getEntries(contentType, options);
        return NextResponse.json(entries);

      case "getEntry":
        if (!entryId) {
          return NextResponse.json(
            { error: "entryId é obrigatório para getEntry" },
            { status: 400 }
          );
        }

        const entry = await getEntry(entryId);
        return NextResponse.json(entry);

      case "getEntryBySlug":
        if (!contentType || !slug) {
          return NextResponse.json(
            {
              error: "contentType e slug são obrigatórios para getEntryBySlug",
            },
            { status: 400 }
          );
        }

        const entryBySlug = await getEntryBySlug(contentType, slug);
        return NextResponse.json(entryBySlug);

      default:
        return NextResponse.json(
          { error: "Ação não reconhecida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na API route:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contentType, entryId, slug, options } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Ação não especificada" },
        { status: 400 }
      );
    }

    switch (action) {
      case "getEntries":
        if (!contentType) {
          return NextResponse.json(
            { error: "contentType é obrigatório para getEntries" },
            { status: 400 }
          );
        }

        const entries = await getEntries(contentType, options);
        return NextResponse.json(entries);

      case "getEntry":
        if (!entryId) {
          return NextResponse.json(
            { error: "entryId é obrigatório para getEntry" },
            { status: 400 }
          );
        }

        const entry = await getEntry(entryId);
        return NextResponse.json(entry);

      case "getEntryBySlug":
        if (!contentType || !slug) {
          return NextResponse.json(
            {
              error: "contentType e slug são obrigatórios para getEntryBySlug",
            },
            { status: 400 }
          );
        }

        const entryBySlug = await getEntryBySlug(contentType, slug);
        return NextResponse.json(entryBySlug);

      default:
        return NextResponse.json(
          { error: "Ação não reconhecida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na API route:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
