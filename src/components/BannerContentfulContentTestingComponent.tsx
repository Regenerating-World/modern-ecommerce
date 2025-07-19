"use client";

import { useUser } from "@clerk/nextjs";

export default function BannerContentfulContentTestingComponent() {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        {isSignedIn ? "Bem-vindo de volta!" : "Bem-vindo ao nosso site!"}
      </h2>
      <p className="text-lg mb-4">
        Descubra nossos produtos incríveis com descontos especiais
      </p>
      <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
        Ver Ofertas
      </button>
    </div>
  );
}
