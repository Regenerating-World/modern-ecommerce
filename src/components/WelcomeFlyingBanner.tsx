"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ContentAsset } from "@/types/ecommerce";

interface WelcomeFlyingBannerProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export default function WelcomeFlyingBanner({
  isOpen,
  onClose,
}: WelcomeFlyingBannerProps) {
  const { isSignedIn } = useUser();
  const [banner, setBanner] = useState<ContentAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchBanner();
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

  const fetchBanner = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando flyingBanners do Contentful...");

      // Buscar flyingBanners do Contentful via Components API
      const response = await fetch(
        "/api/content/components?type=flyingBanners"
      );
      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        console.error(
          "❌ Response não ok:",
          response.status,
          response.statusText
        );
        throw new Error("Falha ao buscar flyingBanners do Contentful");
      }

      const flyingBanners: ContentAsset[] = await response.json();
      console.log("📦 FlyingBanners recebidos:", flyingBanners);

      // Filtrar flyingBanners ativos e pegar o primeiro (maior prioridade)
      const activeFlyingBanners = flyingBanners.filter(
        (banner) => banner.isActive
      );
      console.log("✅ FlyingBanners ativos:", activeFlyingBanners);

      if (activeFlyingBanners.length > 0) {
        setBanner(activeFlyingBanners[0]);
        console.log("🎯 FlyingBanner selecionado:", activeFlyingBanners[0]);
      } else {
        console.log("⚠️ Nenhum flyingBanner ativo encontrado");
      }
    } catch (error) {
      console.error("💥 Erro ao buscar flyingBanner:", error);
      // Não faz nada em caso de erro - simplesmente não mostra o flyingBanner
    } finally {
      setLoading(false);
    }
  };

  // Não renderiza nada se não estiver aberto, ainda carregando ou não houver flyingBanner
  if (!isOpen || loading || !banner) {
    return null;
  }

  const handleClose = () => onClose();
  const handleCloseWithPreference = () => onClose(true);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
        style={{
          background:
            (banner.content.backgroundColor as string) ||
            "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        }}
      >
        {/* Header com botão de fechar */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black rounded-full p-2 backdrop-blur-sm transition-all"
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
        </div>

        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* Conteúdo do banner */}
          <div className="flex-1 p-8 md:p-12 text-white flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {banner.title}
            </h1>

            {banner.content.subtitle && (
              <h2 className="text-lg md:text-xl mb-6 opacity-90">
                {banner.content.subtitle}
              </h2>
            )}

            <p className="text-base md:text-lg mb-8 opacity-80 leading-relaxed">
              {banner.content.text}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {banner.content.ctaText && (
                <button
                  onClick={() => {
                    if (banner.content.ctaUrl) {
                      window.open(banner.content.ctaUrl, "_blank");
                    } else {
                      handleClose();
                    }
                  }}
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {banner.content.ctaText}
                </button>
              )}

              <button
                onClick={handleClose}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                {isSignedIn ? "Continuar navegando" : "Explorar site"}
              </button>
            </div>

            {/* Opção para não mostrar mais */}
            <div className="mt-6 pt-4 border-t border-white border-opacity-20">
              <button
                onClick={handleCloseWithPreference}
                className="w-full bg-red-500 bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  />
                </svg>
                <span>Não desejo mais ver este conteúdo nesta sessão</span>
              </button>
            </div>
          </div>

          {/* Imagem do banner */}
          <div className="flex-1 relative min-h-[300px] md:min-h-[400px]">
            {banner.content.imageUrl ? (
              <img
                src={banner.content.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            ) : (
              // Placeholder com gradiente e ícones
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🌱</div>
                  <div className="text-2xl font-bold">{banner.title}</div>
                  <div className="text-sm opacity-80">
                    Conteúdo do Contentful
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
