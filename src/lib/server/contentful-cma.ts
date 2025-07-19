import { createClient } from "contentful-management";

if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
  throw new Error("CONTENTFUL_MANAGEMENT_TOKEN must be set");
}

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

export default client;

// Funções para salvar dados
export async function createEntry(
  contentType: string,
  fields: Record<string, unknown>
) {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || "master"
    );

    const entry = await environment.createEntry(contentType, {
      fields: fields,
    });

    // Publicar a entrada automaticamente
    await entry.publish();

    return entry;
  } catch (error) {
    console.error("Erro ao criar entrada:", error);
    throw error;
  }
}

export async function updateEntry(
  entryId: string,
  fields: Record<string, unknown>
) {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || "master"
    );

    const entry = await environment.getEntry(entryId);

    // Atualizar campos
    Object.keys(fields).forEach((key) => {
      entry.fields[key] = fields[key];
    });

    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    return updatedEntry;
  } catch (error) {
    console.error("Erro ao atualizar entrada:", error);
    throw error;
  }
}

export async function deleteEntry(entryId: string) {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || "master"
    );

    const entry = await environment.getEntry(entryId);
    await entry.unpublish();
    await entry.delete();

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar entrada:", error);
    throw error;
  }
}

// Função para buscar usuário por Clerk ID
export async function findUserByClerkId(clerkId: string) {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || "master"
    );

    const entries = await environment.getEntries({
      content_type: "user",
      "fields.clerkId": clerkId,
      limit: 1,
    });

    return entries.items[0] || null;
  } catch (error) {
    console.error("Erro ao buscar usuário por Clerk ID:", error);
    return null;
  }
}
