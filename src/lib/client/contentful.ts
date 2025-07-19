// Utilitário para usar a API route do Contentful
const API_BASE = "/api/contentful";

export interface ContentfulApiOptions {
  limit?: number;
  skip?: number;
  order?: string;
}

export async function fetchContentfulEntries(
  contentType: string,
  options?: ContentfulApiOptions
) {
  const params = new URLSearchParams({
    action: "getEntries",
    contentType,
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.skip && { skip: options.skip.toString() }),
    ...(options?.order && { order: options.order }),
  });

  const response = await fetch(`${API_BASE}?${params}`);

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();
}

export async function fetchContentfulEntry(entryId: string) {
  const params = new URLSearchParams({
    action: "getEntry",
    entryId,
  });

  const response = await fetch(`${API_BASE}?${params}`);

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();
}

export async function fetchContentfulEntryBySlug(
  contentType: string,
  slug: string
) {
  const params = new URLSearchParams({
    action: "getEntryBySlug",
    contentType,
    slug,
  });

  const response = await fetch(`${API_BASE}?${params}`);

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();
}

// Versão POST para casos mais complexos
export async function postContentfulRequest(body: {
  action: string;
  contentType?: string;
  entryId?: string;
  slug?: string;
  options?: ContentfulApiOptions;
}) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();
}
