import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  findUserByClerkId,
  createEntry,
  updateEntry,
} from "@/lib/server/contentful-cma";
import { UserData } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userData: UserData = await request.json();

    // Buscar usuário existente no Contentful
    const existingUser = await findUserByClerkId(userId);

    if (existingUser) {
      // Atualizar usuário existente
      const fields = {
        nome: {
          "en-US": userData.nome,
        },
        email: {
          "en-US": userData.email,
        },
        telefone: {
          "en-US": userData.telefone || "",
        },
        userData: {
          "en-US": JSON.stringify(userData.userObject),
        },
      };

      await updateEntry(existingUser.sys.id, fields);

      return NextResponse.json({
        message: "Usuário atualizado com sucesso",
        userId: existingUser.sys.id,
      });
    } else {
      // Criar novo usuário
      const fields = {
        clerkId: {
          "en-US": userId,
        },
        nome: {
          "en-US": userData.nome,
        },
        email: {
          "en-US": userData.email,
        },
        telefone: {
          "en-US": userData.telefone || "",
        },
        userData: {
          "en-US": JSON.stringify(userData.userObject),
        },
        cliquesEmProdutos: {
          "en-US": {
            contagem: 0,
            cliques: [],
          },
        },
        mouseoversEmProdutos: {
          "en-US": {
            contagem: 0,
            mouseovers: [],
          },
        },
        impressoesDeProdutos: {
          "en-US": {
            contagem: 0,
            impressoes: [],
          },
        },
        comprasRealizadas: {
          "en-US": {
            contagem: 0,
            compras: [],
          },
        },
      };

      const newUser = await createEntry("user", fields);

      return NextResponse.json({
        message: "Usuário criado com sucesso",
        userId: newUser.sys.id,
      });
    }
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
