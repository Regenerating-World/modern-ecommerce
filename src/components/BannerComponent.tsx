"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ContentAsset } from "@/types/ecommerce";

export default function BannerComponent() {
  const { isSignedIn } = useUser();
  const [banners, setBanners] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/content/components?type=banners");

      if (!response.ok) {
        throw new Error("Falha ao buscar banners");
      }

      const data: ContentAsset[] = await response.json();
      setBanners(data.filter((banner) => banner.isActive).slice(0, 1)); // Pegar apenas o primeiro banner ativo
    } catch (error) {
      console.error("Erro ao buscar banners:", error);
      setError("Erro ao carregar banners");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse text-white p-8 rounded-lg shadow-lg">
        <div className="h-8 bg-white/20 rounded mb-4 w-2/3"></div>
        <div className="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
        <div className="h-10 bg-white/20 rounded w-32"></div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const banner = banners[0];

  return (
    <div
      className="text-white p-8 rounded-lg shadow-lg"
      style={{
        background:
          typeof banner.content.backgroundColor === "string"
            ? banner.content.backgroundColor
            : "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
      }}
    >
      <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>

      {banner.content.subtitle && (
        <h3 className="text-xl mb-4 opacity-90">{banner.content.subtitle}</h3>
      )}

      <p className="text-lg mb-6 opacity-80">{banner.content.text}</p>

      <div className="flex gap-4">
        {banner.content.ctaText && (
          <button
            onClick={() => {
              if (banner.content.ctaUrl) {
                window.open(banner.content.ctaUrl, "_blank");
              }
            }}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {banner.content.ctaText}
          </button>
        )}
      </div>
    </div>
  );
}
