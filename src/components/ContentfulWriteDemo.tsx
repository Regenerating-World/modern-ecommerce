"use client";

import { useState } from "react";

export default function ContentfulWriteDemo() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contentful-cma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          contentType: "user",
          fields: {
            name: {
              "en-US": name,
            },
          },
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Criar Nova Entrada no Contentful
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nome:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Digite o título"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar Entrada"}
        </button>
      </div>

      {result && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
          <pre className="bg-gray-600 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
