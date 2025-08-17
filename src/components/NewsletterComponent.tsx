"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ContentAsset } from "@/types/ecommerce";
import { toast } from "react-toastify";

export default function NewsletterComponent() {
  const { isSignedIn } = useUser();
  const [newsletters, setNewsletters] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/content/components?type=newsletter");

      if (!response.ok) {
        throw new Error("Falha ao buscar newsletter");
      }

      const data: ContentAsset[] = await response.json();
      setNewsletters(
        data.filter((newsletter) => newsletter.isActive).slice(0, 1)
      ); // Pegar apenas o primeiro newsletter ativo
    } catch (error) {
      console.error("Erro ao buscar newsletter:", error);
      setError("Erro ao carregar newsletter");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.warning("⚠️ Por favor, insira um email válido", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setSubscribing(true);
    try {
      // Aqui você pode implementar a lógica de inscrição no newsletter
      // Por exemplo, enviar para uma API ou serviço de email marketing

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulação
      toast.success("✅ Obrigado por se inscrever!", {
        position: "top-right",
        autoClose: 4000,
      });
      setEmail("");
    } catch (error) {
      console.error("Erro ao inscrever no newsletter:", error);
      toast.error("❌ Erro ao inscrever. Tente novamente.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <div className="animate-pulse text-center">
          <div className="h-6 bg-red-300 rounded mb-2 w-48 mx-auto"></div>
          <div className="h-4 bg-red-300 rounded mb-4 w-64 mx-auto"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-red-300 rounded"></div>
            <div className="h-10 bg-red-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || newsletters.length === 0) {
    return null;
  }

  const newsletter = newsletters[0];

  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          {newsletter.title ||
            (isSignedIn
              ? "Receba ofertas exclusivas"
              : "Fique por dentro das novidades")}
        </h3>

        <p className="text-red-700 mb-4">
          {newsletter.content.text ||
            "Cadastre-se para receber as melhores ofertas e novidades em primeira mão"}
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor email"
            className="flex-1 px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {subscribing
              ? "..."
              : newsletter.content.ctaText &&
                typeof newsletter.content.ctaText === "string"
              ? newsletter.content.ctaText
              : isSignedIn
              ? "Inscrever"
              : "Cadastrar"}
          </button>
        </div>

        <div className="text-xs text-red-600 mt-2 opacity-60">
          🎯 Newsletter configurada via Contentful
        </div>
      </div>
    </div>
  );
}
