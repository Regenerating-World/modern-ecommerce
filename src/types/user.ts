import { UserEvents } from "@/lib/client/event-types";

// Tipos para dados do usuário do Clerk
export interface ClerkUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  externalAccounts?: ClerkExternalAccount[];
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
}

// Tipo para contas externas (Google, GitHub, etc.)
export interface ClerkExternalAccount {
  id: string;
  provider: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
}

// Tipo para entrada no Contentful
export interface ContentfulUserEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    clerkId: string;
    name: string;
    email: string;
    telefone: string;
    userData: ClerkUserData;
  };
}

// Tipo para resposta da API de sincronização
export interface SyncUserResponse {
  message: string;
  user?: ContentfulUserEntry;
  error?: string;
}

export interface UserData {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  userObject: Record<string, unknown>;
  userEvents?: UserEvents;
}
