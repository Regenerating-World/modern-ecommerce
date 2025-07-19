"use client";

import { useUser } from "@clerk/nextjs";

export default function FeatureContentfulContentTestingComponent() {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="bg-green-500 text-white p-2 rounded-full mr-3">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-800">
          {isSignedIn ? "Benefícios Exclusivos" : "Por que escolher nós?"}
        </h3>
      </div>
      <ul className="space-y-2 text-green-700">
        <li className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Entrega rápida e segura
        </li>
        <li className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Qualidade garantida
        </li>
        <li className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Suporte 24/7
        </li>
      </ul>
    </div>
  );
}
