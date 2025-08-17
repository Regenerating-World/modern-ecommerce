import { UserEvents } from "@/lib/client/event-types";
import { UserTag, QuestionnaireAnswer, Address } from "./ecommerce";

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

// Enhanced user data with tags and personalization
export interface EnhancedUserData {
  tags: UserTag[];
  questionnaireAnswers: QuestionnaireAnswer[];
  addresses: Address[];
  cashbackBalance: number;
  totalOrders: number;
  totalSpent: number;
  preferredPaymentMethod?: string;
  marketingConsent: boolean;
  lastActiveAt: string;
}

// Updated UserData interface
export interface UserData {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  userObject: Record<string, unknown>;
  userEvents?: UserEvents;
  enhancedData?: EnhancedUserData;
}

// Tipo para resposta da API de sincronização
export interface SyncUserResponse {
  message: string;
  user?: ContentfulUserEntry;
  error?: string;
}

// Session data for anonymous users
export interface AnonymousSession {
  sessionId: string;
  tags: UserTag[];
  cartId?: string;
  events: UserEvents;
  createdAt: string;
  lastActiveAt: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
    screenSize: string;
  };
  locationInfo?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}


