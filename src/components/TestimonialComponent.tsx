"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ContentAsset } from "@/types/ecommerce";

export default function TestimonialComponent() {
  const { isSignedIn } = useUser();
  const [testimonials, setTestimonials] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/content/components?type=testimonials");

      if (!response.ok) {
        throw new Error("Falha ao buscar depoimentos");
      }

      const data: ContentAsset[] = await response.json();
      setTestimonials(
        data.filter((testimonial) => testimonial.isActive).slice(0, 3)
      ); // Pegar até 3 depoimentos ativos
    } catch (error) {
      console.error("Erro ao buscar depoimentos:", error);
      setError("Erro ao carregar depoimentos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 bg-yellow-300 rounded-full mr-3"></div>
            <div>
              <div className="h-6 bg-yellow-300 rounded mb-2 w-48"></div>
              <div className="h-4 bg-yellow-300 rounded mb-2 w-64"></div>
              <div className="h-3 bg-yellow-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg"
        >
          <div className="flex items-start mb-4">
            <div className="bg-yellow-500 text-white p-2 rounded-full mr-3">
              {testimonial.content.customerImage &&
              typeof testimonial.content.customerImage === "string" ? (
                <img
                  src={testimonial.content.customerImage}
                  alt={
                    typeof testimonial.content.customerName === "string"
                      ? testimonial.content.customerName
                      : "Cliente"
                  }
                  className="w-6 h-6 rounded-full"
                />
              ) : (
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {isSignedIn ? "O que nossos clientes dizem" : "Depoimentos"}
              </h3>

              {testimonial.content.rating &&
                typeof testimonial.content.rating === "number" && (
                  <div className="flex mb-2">
                    {[
                      ...Array(
                        Math.max(
                          0,
                          Math.min(5, Math.floor(testimonial.content.rating))
                        )
                      ),
                    ].map((_, i) => (
                      <span key={i} className="text-yellow-500">
                        ⭐
                      </span>
                    ))}
                  </div>
                )}

              <p className="text-yellow-700 italic mb-2">
                &quot;
                {testimonial.content.text ||
                  testimonial.content.testimonialText}
                &quot;
              </p>

              <div className="text-yellow-600 text-sm">
                <p>- {testimonial.content.customerName || testimonial.title}</p>
                {testimonial.content.customerLocation &&
                  typeof testimonial.content.customerLocation === "string" && (
                    <p>{testimonial.content.customerLocation}</p>
                  )}
                {testimonial.content.productPurchased &&
                  typeof testimonial.content.productPurchased === "string" && (
                    <p className="text-xs">
                      Produto: {testimonial.content.productPurchased}
                    </p>
                  )}
              </div>

              <div className="text-xs text-yellow-600 mt-2 opacity-60">
                🎯 Depoimento real do Contentful
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
