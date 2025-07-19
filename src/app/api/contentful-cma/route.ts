import { NextRequest, NextResponse } from "next/server";
import {
  createEntry,
  updateEntry,
  deleteEntry,
} from "@/lib/server/contentful-cma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contentType, entryId, fields } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Ação não especificada. Use create, update, ou delete" },
        { status: 400 }
      );
    }

    switch (action) {
      case "create":
        if (!contentType || !fields) {
          return NextResponse.json(
            { error: "contentType e fields são obrigatórios para create" },
            { status: 400 }
          );
        }

        const newEntry = await createEntry(contentType, fields);
        return NextResponse.json(newEntry);

      case "update":
        if (!entryId || !fields) {
          return NextResponse.json(
            { error: "entryId e fields são obrigatórios para update" },
            { status: 400 }
          );
        }

        const updatedEntry = await updateEntry(entryId, fields);
        return NextResponse.json(updatedEntry);

      case "delete":
        if (!entryId) {
          return NextResponse.json(
            { error: "entryId é obrigatório para delete" },
            { status: 400 }
          );
        }

        const result = await deleteEntry(entryId);
        return NextResponse.json(result);

      default:
        return NextResponse.json(
          { error: "Ação não reconhecida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na API route de escrita:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
