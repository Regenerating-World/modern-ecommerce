import AuthComponent from "@/components/AuthComponent";
import BannerContentfulContentTestingComponent from "@/components/BannerContentfulContentTestingComponent";
import FeatureContentfulContentTestingComponent from "@/components/FeatureContentfulContentTestingComponent";
import ProductCardContentfulContentTestingComponent from "@/components/ProductCardContentfulContentTestingComponent";
import TestimonialContentfulContentTestingComponent from "@/components/TestimonialContentfulContentTestingComponent";
import NewsletterContentfulContentTestingComponent from "@/components/NewsletterContentfulContentTestingComponent";
import IntersectionObserverComponent from "@/components/IntersectionObserverComponent";
import BatchStatsComponent from "@/components/BatchStatsComponent";

// Dados de produtos para teste
const products = [
  {
    id: "1234",
    name: "Combo 5 marmitas",
    price: 89.9,
    image: "🍱",
    description: "5 marmitas caseiras com arroz, feijão e carne",
  },
  {
    id: "5678",
    name: "Pizza Família",
    price: 45.0,
    image: "🍕",
    description: "Pizza grande com 4 sabores diferentes",
  },
  {
    id: "9012",
    name: "Hambúrguer Gourmet",
    price: 32.5,
    image: "🍔",
    description: "Hambúrguer artesanal com queijo e bacon",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthComponent />

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Seção 1: Banner Principal */}
          <section>
            <IntersectionObserverComponent>
              <BannerContentfulContentTestingComponent />
            </IntersectionObserverComponent>
          </section>

          {/* Seção 2: Produtos em Destaque */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Produtos em Destaque
              </h2>
              <p className="text-gray-600">
                Clique nos produtos para testar o tracking de eventos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product) => (
                <IntersectionObserverComponent
                  key={product.id}
                  productData={{
                    nomeDoProduto: product.name,
                    IDdoProduto: product.id,
                  }}
                >
                  <ProductCardContentfulContentTestingComponent
                    product={product}
                  />
                </IntersectionObserverComponent>
              ))}
            </div>
          </section>

          {/* Seção 3: Features */}
          <section>
            <IntersectionObserverComponent>
              <FeatureContentfulContentTestingComponent />
            </IntersectionObserverComponent>
          </section>

          {/* Seção 4: Depoimentos */}
          <section>
            <IntersectionObserverComponent>
              <TestimonialContentfulContentTestingComponent />
            </IntersectionObserverComponent>
          </section>

          {/* Seção 5: Newsletter */}
          <section>
            <IntersectionObserverComponent>
              <NewsletterContentfulContentTestingComponent />
            </IntersectionObserverComponent>
          </section>

          {/* Seção 6: Informações sobre Tracking */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                🎯 Sistema de Tracking Ativo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl mb-2">👁️</div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Visualizações
                  </h4>
                  <p className="text-blue-600">
                    Detectadas automaticamente quando você visualiza os
                    componentes
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl mb-2">🖱️</div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Mouse Over
                  </h4>
                  <p className="text-blue-600">
                    Registradas quando você passa o mouse sobre os produtos
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl mb-2">🖱️</div>
                  <h4 className="font-semibold text-blue-800 mb-2">Cliques</h4>
                  <p className="text-blue-600">
                    Registrados quando você clica nos botões dos produtos
                  </p>
                </div>
              </div>
              <p className="text-blue-700 mt-6 text-sm">
                <strong>Nota:</strong> Todos os eventos são salvos no Contentful
                apenas para usuários logados
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Componente de estatísticas do batch manager */}
      <BatchStatsComponent />
    </div>
  );
}
