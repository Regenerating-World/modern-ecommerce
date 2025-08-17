// Core e-commerce types for the vegan food combo platform

export interface Plate {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  tags: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface CartCombo {
  id: string;
  name: string;
  description: string;
  plateCount: number; // 5, 10, 20, etc.
  pricePerPlate: number;
  totalPrice: number;
  availablePlates: Plate[];
  tags: string[];
  imageUrl?: string;
  isActive: boolean;
}

export interface CartItem {
  comboId: string;
  combo: CartCombo;
  selectedPlates: {
    plateId: string;
    quantity: number;
  }[];
  totalQuantity: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  sessionId?: string; // For anonymous users
  userId?: string; // For logged-in users
  items: CartItem[];
  subtotal: number;
  appliedCoupons: AppliedCoupon[];
  cashbackUsed: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "abandoned" | "converted";
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minimumOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  tags: string[];
  description: string;
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  discountAmount: number;
  appliedAt: string;
}

export interface UserTag {
  tag: string;
  source: "utm" | "device" | "time" | "location" | "questionnaire" | "behavior";
  value?: string;
  assignedAt: string;
}

export interface QuestionnaireAnswer {
  questionId: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  reward: {
    type: "coupon" | "cashback";
    value: number | string; // number for cashback, coupon code for coupon
  };
  questions: {
    id: string;
    question: string;
    type: "single" | "multiple" | "text";
    options?: {
      value: string;
      label: string;
      tags: string[];
    }[];
    required: boolean;
  }[];
  isActive: boolean;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  sessionId?: string;
  cart: Cart;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "processing"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  cashbackEarned: number;
  totalPaid: number;
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  trackingCode?: string;
}

export interface ContentAsset {
  id: string;
  type:
    | "banner"
    | "flyingBanner"
    | "product_highlight"
    | "testimonial"
    | "feature"
    | "entrega"
    | "catalog";
  title: string;
  content: {
    imageUrl?: string;
    text?: string;
    ctaText?: string;
    ctaUrl?: string;
    [key: string]: string | number | boolean | undefined;
  };
  tags: string[];
  priority: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: "stripe" | "mercadopago" | "pagseguro" | "paypal";
  isActive: boolean;
  config: Record<string, string | number | boolean>;
}

export interface DeliveryArea {
  id: string;
  nome: string;
  precoFrete: number;
  freteGratisAPartirDe: number;
  isActive: boolean;
}

export interface DeliveryData {
  areaDeEntrega: DeliveryArea[];
}

// Catálogo de Produtos
export interface ProductItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoNesteCombo?: number; // Se definido, usar este preço ao invés de aplicar desconto
  imagem?: string;
  peso?: string;
  disponivel: boolean;
}

export interface Combo {
  id: string;
  nome: string;
  descricao: string;
  descontoAplicar: number; // Ex: 0.1 = 10% de desconto
  produtos: ProductItem[];
  imagemPrincipal?: string;
  precoMinimo?: number;
  minimoDeProdutos?: number;
  disponivel: boolean;
}

export interface CatalogSection {
  id: string;
  nome: string;
  minimoDeProdutos: number;
  combos: Combo[];
  ordem: number;
  disponivel: boolean;
}

export interface Catalog {
  sections: CatalogSection[];
  ultimaAtualizacao: string;
  coupons?: Coupon[];
}

// Para Contentful - o catalog será acessado via API específica

// Contentful-specific types for optimized structure
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
    telefone?: string;
    userData: {
      // Basic Clerk data
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      imageUrl?: string;

      // Enhanced data
      tags: UserTag[];
      cashbackBalance: number;
      totalOrders: number;
      totalSpent: number;

      // Active cart
      activeCart?: Cart;

      // Cart history
      cartHistory: Cart[];

      // Orders
      orders: Order[];

      // Questionnaire submissions
      questionnaireSubmissions: {
        questionnaireId: string;
        answers: QuestionnaireAnswer[];
        submittedAt: string;
        tagsGenerated: UserTag[];
      }[];

      // Addresses
      addresses: Address[];

      // Events and behavior
      events: {
        clicks: Record<string, number>;
        views: Record<string, number>;
        purchases: Record<string, number>;
      };

      // Preferences
      preferredPaymentMethod?: string;
      marketingConsent: boolean;
      lastActiveAt: string;
    };
  };
}

export interface ContentfulComponentsEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    componentName: string;
    banners?: ContentAsset[];
    flyingBanners?: ContentAsset[];
    testimonials?: ContentAsset[];
    features?: ContentAsset[];
    productHighlights?: ContentAsset[];
    entrega?: ContentAsset[];
    faq?: ContentAsset[];
    newsletter?: ContentAsset[];
    footer?: ContentAsset[];
    header?: ContentAsset[];
    catalog?: ContentAsset[];
    isActive: boolean;
    lastUpdated: string;
  };
}

export interface ContentfulCatalogEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    catalogName: string;
    products: Combo[];
    coupons: Coupon[];
    categories?: {
      id: string;
      name: string;
      description: string;
      tags: string[];
    }[];
    inventory?: Record<
      string,
      {
        stock: number;
        reserved: number;
        available: number;
      }
    >;
    lastUpdated: string;
  };
}

export interface ContentfulCartEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    instanceName: string; // "AnonymousData"
    carts: Record<string, Cart>; // sessionId -> Cart
    sessions: Record<
      string,
      {
        sessionId: string;
        cartId?: string;
        tags: UserTag[];
        events: {
          clicks: Record<string, number>;
          views: Record<string, number>;
          purchases: Record<string, number>;
        };
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
    >; // sessionId -> Session
    analytics: {
      totalSessions: number;
      activeCarts: number;
      abandonedCarts: number;
      conversionRate: number;
      topUTMSources: string[];
      deviceBreakdown: {
        mobile: number;
        desktop: number;
      };
    };
    lastUpdated: string;
  };
}
