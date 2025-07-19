"use client";

import { useUser } from "@clerk/nextjs";
import { useEventTracking } from "@/lib/client/event-tracking";
import { useRef } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
}

export default function ProductCardContentfulContentTestingComponent({
  product,
}: ProductCardProps) {
  const { isSignedIn } = useUser();
  const { trackClick, trackMouseOver } = useEventTracking();
  const lastMouseEnterTime = useRef<number>(0);

  const handleClick = () => {
    console.log(`🖱️ Click detectado para produto: ${product.name}`);
    trackClick({
      nomeDoProduto: product.name,
      IDdoProduto: product.id,
    });
  };

  const handleMouseEnter = () => {
    const now = Date.now();
    // Evita eventos duplicados em menos de 1 segundo
    if (now - lastMouseEnterTime.current < 1000) {
      console.log(
        `🚫 MouseEnter ignorado (muito recente) para produto: ${product.name}`
      );
      return;
    }

    lastMouseEnterTime.current = now;
    console.log(
      `🖱️ MouseEnter detectado para produto: ${
        product.name
      } - ${new Date().toISOString()}`
    );
    trackMouseOver({
      nomeDoProduto: product.name,
      IDdoProduto: product.id,
    });
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-gray-500 text-sm">{product.image}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-green-600">
          R$ {product.price.toFixed(2)}
        </span>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          onClick={handleClick}
        >
          {isSignedIn ? "Comprar" : "Ver Detalhes"}
        </button>
      </div>
    </div>
  );
}
