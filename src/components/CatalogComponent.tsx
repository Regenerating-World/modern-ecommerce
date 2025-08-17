"use client";

import { useState, useEffect } from "react";
import {
  Catalog,
  CatalogSection,
  Combo,
  ProductItem,
  CartCombo,
} from "@/types/ecommerce";
import { useCart } from "@/lib/client/cart-manager";
import { toast } from "react-toastify";

interface CatalogCartItem extends ProductItem {
  quantidade: number;
  precoFinal: number;
  comboId: string;
  comboName: string;
}

export default function CatalogComponent() {
  const { cart: globalCart, addCombo } = useCart();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("destaques");
  const [activeCombo, setActiveCombo] = useState<string | null>(null);
  const [catalogCart, setCatalogCart] = useState<CatalogCartItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando catálogo...");

      const response = await fetch("/api/catalog");

      if (!response.ok) {
        throw new Error("Falha ao buscar catálogo");
      }

      const data = await response.json();
      console.log("📦 Catálogo recebido:", data);

      setCatalog(data);

      // Definir primeira section como ativa
      if (data.sections && data.sections.length > 0) {
        setActiveSection(data.sections[0].id);
      }
    } catch (error) {
      console.error("💥 Erro ao buscar catálogo:", error);
      setError("Erro ao carregar catálogo");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (produto: ProductItem, combo: Combo): number => {
    // Se tem precoNesteCombo, usar esse valor
    if (produto.precoNesteCombo !== undefined) {
      return produto.precoNesteCombo;
    }

    // Caso contrário, aplicar desconto
    return produto.preco * (1 - combo.descontoAplicar);
  };

  const updateProductQuantity = (
    productId: string,
    quantity: number,
    combo: Combo
  ) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: quantity,
    }));

    // Encontrar o produto
    const produto = combo.produtos.find((p) => p.id === productId);
    if (!produto) return;

    const precoFinal = calculatePrice(produto, combo);

    setCatalogCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === productId);

      if (quantity === 0) {
        // Remover do carrinho
        return prev.filter((item) => item.id !== productId);
      }

      const cartItem: CatalogCartItem = {
        ...produto,
        quantidade: quantity,
        precoFinal: precoFinal,
        comboId: combo.id,
        comboName: combo.nome,
      };

      if (existingIndex >= 0) {
        // Atualizar quantidade
        const newCart = [...prev];
        newCart[existingIndex] = cartItem;
        return newCart;
      } else {
        // Adicionar novo item
        return [...prev, cartItem];
      }
    });
  };

  const getCartTotal = (): number => {
    return catalogCart.reduce(
      (total, item) => total + item.precoFinal * item.quantidade,
      0
    );
  };

  const addToGlobalCart = async () => {
    // Sempre pegar a versão mais atual do currentCombo
    const section = catalog?.sections.find((s) => s.id === activeSection);
    const combo = activeCombo
      ? section?.combos.find((c) => c.id === activeCombo)
      : null;

    if (!combo || catalogCart.length === 0) return;

    // Verificar pedido mínimo
    const totalQuantity = catalogCart.reduce(
      (sum, item) => sum + item.quantidade,
      0
    );
    const minimoProdutos =
      combo.minimoDeProdutos || section?.minimoDeProdutos || 1;

    // Debug
    console.log("🔍 Validação:", {
      combo: combo.nome,
      minimoDeProdutos: combo.minimoDeProdutos,
      totalQuantity,
      minimoProdutos,
      resultado: totalQuantity >= minimoProdutos ? "✅ OK" : "❌ INSUFICIENTE",
    });

    if (totalQuantity < minimoProdutos) {
      toast.warning(
        `❌ PEDIDO MÍNIMO: ${minimoProdutos} produto${
          minimoProdutos > 1 ? "s" : ""
        }!\n\nVocê selecionou apenas ${totalQuantity} produto${
          totalQuantity > 1 ? "s" : ""
        }.\nAdicione mais ${minimoProdutos - totalQuantity} produto${
          minimoProdutos - totalQuantity > 1 ? "s" : ""
        } para continuar.`,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }

    // Converter produtos do catálogo para formato do carrinho
    try {
      const comboForCart = {
        id: `catalog-${combo.id}-${Date.now()}`,
        name: combo.nome,
        description: combo.descricao,
        plateCount: totalQuantity,
        pricePerPlate: getCartTotal() / totalQuantity,
        totalPrice: getCartTotal(),
        availablePlates: catalogCart.map((item) => ({
          id: item.id,
          name: item.nome,
          description: item.descricao,
          basePrice: item.precoFinal,
          imageUrl: item.imagem || "",
          tags: [activeSection],
        })),
        tags: [activeSection],
        imageUrl: combo.imagemPrincipal || "",
        isActive: true,
      };

      const selectedPlates = catalogCart.map((item) => ({
        plateId: item.id,
        quantity: item.quantidade,
      }));

      await addCombo(comboForCart as unknown as CartCombo, selectedPlates);

      // Limpar carrinho do catálogo
      setCatalogCart([]);
      setSelectedProducts({});

      toast.success(
        `✅ ${totalQuantity} produto${totalQuantity > 1 ? "s" : ""} adicionado${
          totalQuantity > 1 ? "s" : ""
        } ao carrinho!\n\nTotal: R$ ${getCartTotal()
          .toFixed(2)
          .replace(".", ",")}`,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error(
        "❌ Erro ao adicionar produtos ao carrinho. Tente novamente.",
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const getProductQuantity = (productId: string): number => {
    return selectedProducts[productId] || 0;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Erro ao carregar catálogo
        </div>
        <p className="text-gray-600">{error || "Catálogo não encontrado"}</p>
      </div>
    );
  }

  const currentSection = catalog.sections.find((s) => s.id === activeSection);
  const currentCombo = activeCombo
    ? currentSection?.combos.find((c) => c.id === activeCombo)
    : null;

  // Debug: verificar se currentCombo tem minimoDeProdutos
  if (currentCombo && currentCombo.nome.includes("5 CAMPEÕES")) {
    console.log("🔍 currentCombo encontrado:", {
      id: currentCombo.id,
      nome: currentCombo.nome,
      minimoDeProdutos: currentCombo.minimoDeProdutos,
      todasAsPropriedades: Object.keys(currentCombo),
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          CATÁLOGO VEGALIA
        </h1>
        <p className="text-gray-600">Explore nossos produtos 100% vegetais</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center mb-8 border-b">
        {catalog.sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setActiveCombo(null);
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeSection === section.id
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-red-500"
            }`}
          >
            {section.nome}
          </button>
        ))}
      </div>

      {/* Content */}
      {!activeCombo ? (
        // Lista de combos da seção ativa
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSection?.combos.map((combo) => (
            <div
              key={combo.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setActiveCombo(combo.id)}
            >
              {combo.imagemPrincipal && (
                <img
                  src={combo.imagemPrincipal}
                  alt={combo.nome}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {combo.nome}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {combo.descricao}
                </p>

                {combo.descontoAplicar > 0 && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    {Math.round(combo.descontoAplicar * 100)}% OFF
                  </div>
                )}

                {combo.precoMinimo && (
                  <div className="text-lg font-bold text-green-600">
                    A partir de R${" "}
                    {combo.precoMinimo.toFixed(2).replace(".", ",")}
                  </div>
                )}

                <div className="text-sm text-gray-500 mt-2">
                  {combo.produtos.length} produto
                  {combo.produtos.length !== 1 ? "s" : ""} disponível
                  {combo.produtos.length !== 1 ? "is" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Visualização detalhada do combo selecionado
        <div>
          {/* Header do combo */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6 mb-6">
            <button
              onClick={() => setActiveCombo(null)}
              className="mb-4 text-white hover:text-red-200 transition-colors"
            >
              ← Voltar para {currentSection?.nome}
            </button>

            <h2 className="text-2xl font-bold mb-2">{currentCombo?.nome}</h2>
            <p className="text-red-100 mb-4">{currentCombo?.descricao}</p>

            {currentCombo?.descontoAplicar &&
            currentCombo.descontoAplicar > 0 ? (
              <div className="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-bold inline-block">
                🔥 {Math.round(currentCombo.descontoAplicar * 100)}% de desconto
                em todos os produtos!
              </div>
            ) : null}
          </div>

          {/* Lista de produtos */}
          <div className="space-y-4">
            {currentCombo?.produtos.map((produto) => {
              const precoFinal = currentCombo
                ? calculatePrice(produto, currentCombo)
                : produto.preco;
              const quantity = getProductQuantity(produto.id);
              const temDesconto =
                produto.precoNesteCombo === undefined &&
                currentCombo.descontoAplicar > 0;

              return (
                <div
                  key={produto.id}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        {produto.nome}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {produto.descricao}
                      </p>

                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold text-green-600">
                          R$ {precoFinal.toFixed(2).replace(".", ",")}
                        </div>

                        {temDesconto && (
                          <div className="text-sm text-gray-500 line-through">
                            R$ {produto.preco.toFixed(2).replace(".", ",")}
                          </div>
                        )}

                        {produto.peso && (
                          <div className="text-sm text-gray-500">
                            {produto.peso}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controles de quantidade */}
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() =>
                          updateProductQuantity(
                            produto.id,
                            Math.max(0, quantity - 1),
                            currentCombo
                          )
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700"
                        disabled={quantity === 0}
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-semibold">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateProductQuantity(
                            produto.id,
                            quantity + 1,
                            currentCombo
                          )
                        }
                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center font-bold text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo do carrinho */}
          {catalogCart.length > 0 && (
            <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-6 border-2 border-red-500 max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Resumo do Pedido
              </h3>

              <div className="space-y-2 mb-4">
                {catalogCart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantidade}x {item.nome}
                    </span>
                    <span>
                      R${" "}
                      {(item.precoFinal * item.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">
                    R$ {getCartTotal().toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <button
                  onClick={addToGlobalCart}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
