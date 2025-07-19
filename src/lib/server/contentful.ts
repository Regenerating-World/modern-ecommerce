import { createClient } from "contentful";

if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
  throw new Error(
    "CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set"
  );
}

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
});

export default client;

// Funções utilitárias para buscar dados
export async function getEntries(
  contentType: string,
  options?: {
    limit?: number;
    skip?: number;
    order?: string;
    "fields.slug"?: string;
  }
) {
  const query = {
    content_type: contentType,
    ...options,
  };

  return await client.getEntries(query);
}

export async function getEntry(entryId: string) {
  return await client.getEntry(entryId);
}

export async function getEntryBySlug(contentType: string, slug: string) {
  try {
    const response = await getEntries(contentType, {
      "fields.slug": slug,
      limit: 1,
    });

    return response.items[0] || null;
  } catch (error) {
    console.error("Erro ao buscar entrada por slug:", error);
    return null;
  }
}
