"use client";

import { useUser } from "@clerk/nextjs";

export default function NewsletterContentfulContentTestingComponent() {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          {isSignedIn
            ? "Receba ofertas exclusivas"
            : "Fique por dentro das novidades"}
        </h3>
        <p className="text-red-700 mb-4">
          Cadastre-se para receber as melhores ofertas e novidades em primeira
          mão
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Seu melhor email"
            className="flex-1 px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            {isSignedIn ? "Inscrever" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
