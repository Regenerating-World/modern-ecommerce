"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/client/cart-manager";
import { Combo } from "@/types/ecommerce";

interface ComboSelectorProps {
  onComboSelect?: (combo: Combo, selectedPlates: { plateId: string; quantity: number }[]) => void;
}

export default function ComboSelector({ onComboSelect }: ComboSelectorProps) {
  const { addCombo } = useCart();
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [selectedPlates, setSelectedPlates] = useState<{ plateId: string; quantity: number }[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await fetch('/api/catalog?type=products');
        if (response.ok) {
          const products = await response.json();
          setCombos(products || []);
        } else {
          setError('Failed to load products from Contentful');
        }
      } catch (error) {
        console.error('Error fetching combos:', error);
        setError('Error connecting to Contentful');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCombos();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please make sure your Contentful content types are set up correctly.
          </p>
        </div>
      </div>
    );
  }

  if (combos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Available</h3>
          <p className="text-gray-600">
            No combos found in Contentful. Please add products to your Catalog entry.
          </p>
        </div>
      </div>
    );
  }

  const handleComboSelect = (combo: Combo) => {
    setSelectedCombo(combo);
    setSelectedPlates([]);
    setIsModalOpen(true);
  };

  const handlePlateQuantityChange = (plateId: string, quantity: number) => {
    setSelectedPlates(prev => {
      const existing = prev.find(p => p.plateId === plateId);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(p => p.plateId !== plateId);
        }
        return prev.map(p => p.plateId === plateId ? { ...p, quantity } : p);
      } else if (quantity > 0) {
        return [...prev, { plateId, quantity }];
      }
      return prev;
    });
  };

  const getTotalSelectedPlates = () => {
    return selectedPlates.reduce((sum, plate) => sum + plate.quantity, 0);
  };

  const handleAddToCart = () => {
    if (selectedCombo && selectedPlates.length > 0) {
      addCombo(selectedCombo, selectedPlates);
      onComboSelect?.(selectedCombo, selectedPlates);
      setIsModalOpen(false);
      setSelectedCombo(null);
      setSelectedPlates([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha seu Combo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <div key={combo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{combo.imageUrl || "🍱"}</div>
              <h3 className="text-lg font-semibold text-gray-900">{combo.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{combo.description}</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pratos:</span>
                <span className="font-medium">{combo.plateCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Por prato:</span>
                <span className="font-medium">R$ {combo.pricePerPlate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">R$ {combo.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={() => handleComboSelect(combo)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Selecionar Pratos
            </button>
          </div>
        ))}
      </div>

      {/* Modal for plate selection */}
      {isModalOpen && selectedCombo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedCombo.name}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Selecione {selectedCombo.plateCount} pratos para seu combo:
              </p>
              
              <div className="space-y-4 mb-6">
                {selectedCombo.availablePlates?.map((plate) => (
                  <div key={plate.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{plate.name}</h4>
                        <p className="text-sm text-gray-600">{plate.description}</p>
                        <p className="text-sm font-medium text-green-600">
                          R$ {plate.basePrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const current = selectedPlates.find(p => p.plateId === plate.id)?.quantity || 0;
                            handlePlateQuantityChange(plate.id, Math.max(0, current - 1));
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">
                          {selectedPlates.find(p => p.plateId === plate.id)?.quantity || 0}
                        </span>
                        <button
                          onClick={() => {
                            const current = selectedPlates.find(p => p.plateId === plate.id)?.quantity || 0;
                            if (getTotalSelectedPlates() < selectedCombo.plateCount) {
                              handlePlateQuantityChange(plate.id, current + 1);
                            }
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          disabled={getTotalSelectedPlates() >= selectedCombo.plateCount}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span>Pratos selecionados: {getTotalSelectedPlates()}/{selectedCombo.plateCount}</span>
                <span className="font-bold">Total: R$ {selectedCombo.totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={getTotalSelectedPlates() !== selectedCombo.plateCount}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
