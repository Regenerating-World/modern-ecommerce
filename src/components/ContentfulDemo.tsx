"use client";

import { useEffect, useState } from "react";

interface ContentfulResponse {
  items: Array<{
    sys: {
      id: string;
      createdAt: string;
      updatedAt: string;
    };
    fields: {
      [key: string]: unknown;
    };
  }>;
  total: number;
  skip: number;
  limit: number;
}

export default function ContentfulDemo() {
  const [data, setData] = useState<ContentfulResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);

        // Usando a API route diretamente
        const response = await fetch(
          "/api/contentful?action=getEntries&contentType=user&limit=5"
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError("Erro ao carregar conteúdo do Contentful");
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">
          Carregando dados do Contentful...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h3 className="text-xl font-semibold mb-2">Erro</h3>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Verifique se as variáveis de ambiente do Contentful estão
            configuradas.
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.items?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-yellow-600 text-center">
          <h3 className="text-xl font-semibold mb-2">
            Nenhum conteúdo encontrado
          </h3>
          <p>Não foram encontradas entradas no Contentful.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <pre className="bg-gray-600 p-6 rounded-lg overflow-auto text-sm font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
