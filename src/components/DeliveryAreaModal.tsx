"use client";

import { useState, useEffect } from "react";
import { DeliveryArea } from "@/types/ecommerce";

interface DeliveryAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeliveryAreaModal({
  isOpen,
  onClose,
}: DeliveryAreaModalProps) {
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchDeliveryAreas();
      // Bloquear scroll do fundo
      document.body.classList.add("modal-open");
    } else {
      // Remover bloqueio de scroll
      document.body.classList.remove("modal-open");
    }

    // Cleanup: remover classe quando componente desmonta
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  const fetchDeliveryAreas = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando áreas de entrega do Contentful...");

      const response = await fetch("/api/content/entrega");

      if (!response.ok) {
        throw new Error("Falha ao buscar áreas de entrega");
      }

      const data = await response.json();
      console.log("📦 Dados de entrega recebidos:", data);

      // A API agora retorna diretamente o array de áreas de entrega
      if (Array.isArray(data) && data.length > 0) {
        setDeliveryAreas(data);
        console.log("✅ Áreas de entrega carregadas:", data.length);
      } else {
        console.log("⚠️ Nenhuma área de entrega encontrada");
        setDeliveryAreas([]);
      }
    } catch (error) {
      console.error("💥 Erro ao buscar áreas de entrega:", error);
      setError("Erro ao carregar áreas de entrega");
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = deliveryAreas.filter((area) =>
    area.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-black rounded-full p-2 backdrop-blur-sm transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-2">ÁREA DE ENTREGA</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <svg
              className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg font-semibold mb-2">
                Erro ao carregar
              </div>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 text-lg font-semibold mb-2">
                {searchTerm
                  ? "Nenhuma área encontrada"
                  : "Nenhuma área disponível"}
              </div>
              {searchTerm && (
                <p className="text-gray-500">Tente buscar com outros termos</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map((area) => (
                <div
                  key={area.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start">
                    <div className="bg-red-500 text-white p-1 rounded-full mr-2 flex-shrink-0">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 font-medium text-sm">
                        {area.nome} •{" "}
                        <span className="text-red-600 font-bold">
                          R$ {area.precoFrete.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && filteredAreas.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              📍 Mostrando {filteredAreas.length} área
              {filteredAreas.length !== 1 ? "s" : ""} de entrega
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
