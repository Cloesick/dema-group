'use client';

import { useState } from 'react';
import { ChevronRight, X, Loader2 } from 'lucide-react';

type CartItem = {
  id: string;
  name: string;
  name_nl: string;
  name_fr: string;
  price: number;
  quantity: number;
  image: string;
};

export default function CartPage() {
  const [language] = useState<'en' | 'nl' | 'fr'>('nl');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(language === 'nl' ? 'Winkelwagen laden...' : language === 'fr' ? 'Chargement du panier...' : 'Loading cart...');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Industrial Pump Model X',
      name_nl: 'Industriële Pomp Model X',
      name_fr: 'Pompe Industrielle Modèle X',
      price: 1299.99,
      quantity: 2,
      image: '/images/subcategories/centrifugal-pump.svg',
    },
    {
      id: '2',
      name: 'Butterfly Valve DN100',
      name_nl: 'Vlinderklep DN100',
      name_fr: 'Vanne Papillon DN100',
      price: 299.99,
      quantity: 1,
      image: '/images/subcategories/butterfly-valve.svg',
    },
  ]);

  const removeItem = (itemId: string) => {
    setLoading(true);
    setStatusMessage('Removing item...');
    const itemToRemove = cartItems.find(item => item.id === itemId);
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setTimeout(() => {
      setLoading(false);
      setStatusMessage(`${language === 'nl' ? 'Verwijderd' : language === 'fr' ? 'Supprimé' : 'Removed'}: ${itemToRemove ? (language === 'nl' ? itemToRemove.name_nl : language === 'fr' ? itemToRemove.name_fr : itemToRemove.name) : 'item'}`);
    }, 500);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLoading(true);
    setStatusMessage(language === 'nl' ? 'Winkelwagen bijwerken...' : language === 'fr' ? 'Mise à jour du panier...' : 'Updating cart...');
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    setTimeout(() => {
      setLoading(false);
      const item = cartItems.find(i => i.id === itemId);
      setStatusMessage(
        language === 'nl'
          ? `Aantal bijgewerkt naar ${newQuantity} voor ${item?.name_nl}`
          : language === 'fr'
          ? `Quantité mise à jour à ${newQuantity} pour ${item?.name_fr}`
          : `Updated quantity to ${newQuantity} for ${item?.name}`
      );
    }, 500);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {loading && (
          <div role="alert" className="sr-only" aria-live="assertive" aria-atomic="true" aria-label="Loading status">
            {language === 'nl' ? 'Winkelwagen laden...' : language === 'fr' ? 'Chargement du panier...' : 'Loading cart...'}
          </div>
        )}
        {statusMessage && (
          <div role="status" className="sr-only" aria-live="polite" aria-atomic="true" aria-label="Operation status">
            {statusMessage}
          </div>
        )}
        <div role="status" className="sr-only" aria-live="polite" aria-atomic="true" aria-label="Cart status">
          {cartItems.length} {language === 'nl' ? 'artikelen in winkelwagen' : language === 'fr' ? 'articles dans le panier' : 'items in cart'}
        </div>
        <h1 className="text-3xl font-bold mb-8">
          {language === 'nl' ? 'Winkelwagen' : language === 'fr' ? 'Panier' : 'Shopping Cart'}
        </h1>

        {loading && (
          <div role="status" className="flex items-center gap-2 text-blue-700 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating cart...</span>
          </div>
        )}

        {statusMessage && (
          <div
            role="alert"
            className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 border border-green-200"
            aria-live="polite"
          >
            {statusMessage}
          </div>
        )}

        <div role="status" className="sr-only" aria-live="polite">
          {cartItems.length} items in cart
        </div>

        {cartItems.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="divide-y">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.image}
                      alt={language === 'nl' ? item.name_nl : language === 'fr' ? item.name_fr : item.name}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-slate-900">
                      {language === 'nl'
                        ? item.name_nl
                        : language === 'fr'
                        ? item.name_fr
                        : item.name}
                    </h2>
                    <p className="text-slate-900">€{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 rounded"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center" aria-label="Quantity">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 rounded"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4 text-slate-900" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-b-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-900">
                  {language === 'nl' ? 'Totaal' : language === 'fr' ? 'Total' : 'Total'}
                </span>
                <span className="font-bold text-lg">€{total.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:bg-blue-800 flex items-center justify-center gap-2 font-medium"
                aria-label={
                  language === 'nl'
                    ? 'Ga naar checkout'
                    : language === 'fr'
                    ? 'Passer à la caisse'
                    : 'Proceed to checkout'
                }
              >
                {language === 'nl'
                  ? 'Ga naar checkout'
                  : language === 'fr'
                  ? 'Passer à la caisse'
                  : 'Proceed to checkout'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-slate-900">
              {language === 'nl'
                ? 'Je winkelwagen is leeg'
                : language === 'fr'
                ? 'Votre panier est vide'
                : 'Your cart is empty'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
