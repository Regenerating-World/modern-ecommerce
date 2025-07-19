"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { UserData } from "@/types/user";

export default function AuthComponent() {
  const { isSignedIn, user } = useUser();
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  const syncUserToContentful = async () => {
    if (!user) return;

    setIsSyncing(true);
    setSyncStatus("Sincronizando usuário com Contentful...");

    try {
      const userData: UserData = {
        id: user.id,
        nome:
          user.fullName ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress ||
          "Usuário",
        email: user.emailAddresses[0]?.emailAddress || "",
        telefone: user.phoneNumbers[0]?.phoneNumber || undefined,
        userObject: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          phone: user.phoneNumbers[0]?.phoneNumber,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          emailVerified:
            user.emailAddresses[0]?.verification?.status === "verified",
          phoneVerified:
            user.phoneNumbers[0]?.verification?.status === "verified",
          externalAccounts: user.externalAccounts,
          publicMetadata: user.publicMetadata,
        },
      };

      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        setSyncStatus(`✅ ${result.message}`);
      } else {
        const error = await response.json();
        setSyncStatus(`❌ Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      setSyncStatus("❌ Erro ao sincronizar usuário");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Tracking
          </h1>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">
                  Olá,{" "}
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <button
                  onClick={syncUserToContentful}
                  disabled={isSyncing}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSyncing ? "Sincronizando..." : "Sincronizar"}
                </button>
                <SignOutButton />
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
        {syncStatus && (
          <div className="pb-4">
            <div className="text-sm text-blue-600">{syncStatus}</div>
          </div>
        )}
      </div>
    </header>
  );
}
