"use client";

import { useUser } from "@clerk/nextjs";

export default function TestimonialContentfulContentTestingComponent() {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
      <div className="flex items-start mb-4">
        <div className="bg-yellow-500 text-white p-2 rounded-full mr-3">
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
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            {isSignedIn ? "O que nossos clientes dizem" : "Depoimentos"}
          </h3>
          <p className="text-yellow-700 italic">
            "Excelente serviço e produtos de qualidade. Recomendo para todos!"
          </p>
          <p className="text-yellow-600 text-sm mt-2">- Maria Silva</p>
        </div>
      </div>
    </div>
  );
}
