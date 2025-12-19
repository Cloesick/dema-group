'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Bot, ExternalLink, Loader2, Minimize2, Maximize2, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/contexts/QuoteContext';

interface SuggestedProduct {
  name: string;
  catalog: string;
  image: string | null;
  variantCount: number;
  url: string;
  sku?: string;
  groupId?: string;
}

interface SuggestedSubcategory {
  name: string;
  slug: string;
  description: string;
  catalogs: string[];
  url: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedCatalogs?: Array<{ id: string; name: string; url: string }>;
  suggestedProducts?: SuggestedProduct[];
  suggestedSubcategories?: SuggestedSubcategory[];
  matchedCategory?: { name: string; slug: string; url: string };
}

interface ProductAssistantProps {
  language?: 'nl' | 'en' | 'fr';
}

// Floating suggestion questions that rotate
const FLOATING_QUESTIONS: Record<'nl' | 'en' | 'fr', Array<{ text: string; delay: number }>> = {
  nl: [
    { text: '💧 Welke pomp past bij mij?', delay: 0 },
    { text: '🔧 Makita gereedschap nodig?', delay: 2 },
    { text: '🌱 Irrigatie voor tuin?', delay: 4 },
    { text: '🔩 RVS of messing fittingen?', delay: 6 },
    { text: '📋 Offerte aanvragen?', delay: 8 },
  ],
  en: [
    { text: '💧 Which pump suits me?', delay: 0 },
    { text: '🔧 Need Makita tools?', delay: 2 },
    { text: '🌱 Garden irrigation?', delay: 4 },
    { text: '🔩 Stainless or brass fittings?', delay: 6 },
    { text: '📋 Request a quote?', delay: 8 },
  ],
  fr: [
    { text: '💧 Quelle pompe me convient?', delay: 0 },
    { text: '🔧 Besoin d\'outils Makita?', delay: 2 },
    { text: '🌱 Irrigation de jardin?', delay: 4 },
    { text: '🔩 Raccords inox ou laiton?', delay: 6 },
    { text: '📋 Demander un devis?', delay: 8 },
  ],
};

export default function ProductAssistant({ language = 'nl' }: ProductAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showFloatingQuestions, setShowFloatingQuestions] = useState(true);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [buttonPosition, setButtonPosition] = useState({ x: 24, y: 24 }); // bottom-left default
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToQuote, quoteItems, isQuoteOpen } = useQuote();

  // Handle touch/mouse drag for mobile
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (window.innerWidth > 640) return; // Only on mobile
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - buttonPosition.x, y: clientY - buttonPosition.y });
  };

  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = Math.max(10, Math.min(window.innerWidth - 70, clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 70, clientY - dragStart.y));
    
    setButtonPosition({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove drag event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const translations: Record<'nl' | 'en' | 'fr', {
    title: string;
    placeholder: string;
    send: string;
    greeting: string;
    suggestedCatalogs: string;
    suggestedProducts: string;
    viewProduct: string;
    variants: string;
    error: string;
    quickQuestions: string[];
    addToQuote: string;
    added: string;
    quantity: string;
  }> = {
    nl: {
      title: 'DEMA Product Assistent',
      placeholder: 'Stel een vraag over onze producten...',
      send: 'Verstuur',
      greeting: 'Hallo! Ik ben de DEMA Product Assistent. Hoe kan ik u helpen vandaag?',
      suggestedCatalogs: 'Aanbevolen catalogi:',
      suggestedProducts: 'Aanbevolen producten:',
      viewProduct: 'Bekijk',
      variants: 'varianten',
      error: 'Er is iets misgegaan. Probeer het opnieuw.',
      quickQuestions: [
        'Pompen voor landbouw',
        'Makita tuingereedschap',
        'Slangkoppelingen Bauer',
        'RVS fittingen',
      ],
      addToQuote: 'Toevoegen aan offerte',
      added: 'Toegevoegd!',
      quantity: 'Aantal',
    },
    en: {
      title: 'DEMA Product Assistant',
      placeholder: 'Ask a question about our products...',
      send: 'Send',
      greeting: 'Hello! I am the DEMA Product Assistant. How can I help you today?',
      suggestedCatalogs: 'Recommended catalogs:',
      suggestedProducts: 'Recommended products:',
      viewProduct: 'View',
      variants: 'variants',
      error: 'Something went wrong. Please try again.',
      quickQuestions: [
        'Pumps for agriculture',
        'Makita garden tools',
        'Bauer hose couplings',
        'Stainless steel fittings',
      ],
      addToQuote: 'Add to Quote',
      added: 'Added!',
      quantity: 'Quantity',
    },
    fr: {
      title: 'Assistant Produits DEMA',
      placeholder: 'Posez une question sur nos produits...',
      send: 'Envoyer',
      greeting: 'Bonjour! Je suis l\'Assistant Produits DEMA. Comment puis-je vous aider aujourd\'hui?',
      suggestedCatalogs: 'Catalogues recommandés:',
      suggestedProducts: 'Produits recommandés:',
      viewProduct: 'Voir',
      variants: 'variantes',
      error: 'Une erreur s\'est produite. Veuillez réessayer.',
      quickQuestions: [
        'Pompes pour l\'agriculture',
        'Outillage de jardin Makita',
        'Raccords Bauer',
        'Raccords inox',
      ],
      addToQuote: 'Ajouter au devis',
      added: 'Ajouté!',
      quantity: 'Quantité',
    },
  };

  const t = translations[language];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Add greeting message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: t.greeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t.greeting]);

  // Rotate floating questions
  useEffect(() => {
    if (isOpen || !showFloatingQuestions) return;
    
    const interval = setInterval(() => {
      setActiveQuestionIndex(prev => 
        (prev + 1) % FLOATING_QUESTIONS[language].length
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen, showFloatingQuestions, language]);

  // Hide floating questions after some time, but show again when chat is closed
  useEffect(() => {
    if (!isOpen) {
      // Show floating questions again when chat is closed
      const showTimer = setTimeout(() => {
        setShowFloatingQuestions(true);
      }, 1000); // Show after 1 second delay
      
      // Hide after 30 seconds
      const hideTimer = setTimeout(() => {
        setShowFloatingQuestions(false);
      }, 31000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen]);

  const handleFloatingQuestionClick = useCallback((questionText: string) => {
    setIsOpen(true);
    setShowFloatingQuestions(false);
    // Remove emoji from question for cleaner search
    const cleanQuestion = questionText.replace(/^[^\w\s]+\s*/, '');
    setTimeout(() => sendMessage(cleanQuestion), 500);
  }, []);

  // Position chatbot: right side normally, but don't hide when quote is open

  // Get quantity for a product
  const getQuantity = (productKey: string) => productQuantities[productKey] || 1;

  // Update quantity for a product
  const updateQuantity = (productKey: string, delta: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productKey]: Math.max(1, (prev[productKey] || 1) + delta),
    }));
  };

  // Handle adding product to quote
  const handleAddToQuote = (product: SuggestedProduct) => {
    const productKey = product.sku || product.groupId || `${product.catalog}-${product.name}`;
    const quantity = getQuantity(productKey);
    
    addToQuote({
      sku: product.sku || productKey,
      name: product.name,
      imageUrl: product.image || undefined,
      category: product.catalog,
    });
    
    // Mark as added
    setAddedProducts(prev => new Set(prev).add(productKey));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAddedProducts(prev => {
        const next = new Set(prev);
        next.delete(productKey);
        return next;
      });
    }, 2000);
  };

  // Navigate to product without closing chat
  const handleProductClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(url);
    // Don't close the chat - just navigate
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/product-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          quoteItems: quoteItems.map(item => ({
            sku: item.sku,
            name: item.name,
            category: item.category,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || t.error,
        timestamp: new Date(),
        suggestedCatalogs: data.suggestedCatalogs,
        suggestedProducts: data.suggestedProducts,
        suggestedSubcategories: data.suggestedSubcategories,
        matchedCategory: data.matchedCategory,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: t.error,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Floating button with DEMA logo and suggestion questions when chat is closed
  if (!isOpen) {
    const floatingQuestions = FLOATING_QUESTIONS[language];
    
    return (
      <div 
        ref={buttonRef}
        className={`fixed z-50 bottom-6 transition-all duration-300 ${isQuoteOpen ? 'left-6 hidden sm:block' : 'right-6'}`}
        style={{
          // On mobile, use draggable position via inline styles
          ...(typeof window !== 'undefined' && window.innerWidth <= 640 ? {
            left: buttonPosition.x,
            bottom: buttonPosition.y,
          } : {}),
        }}
      >
        {/* Floating suggestion questions - hidden on mobile */}
        {showFloatingQuestions && (
          <div className={`absolute bottom-20 flex-col gap-2 mb-2 hidden sm:flex ${isQuoteOpen ? 'left-0 items-start' : 'right-0 items-end'}`}>
            {floatingQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleFloatingQuestionClick(q.text)}
                className={`
                  bg-white text-gray-700 text-sm px-4 py-2 rounded-full shadow-lg border border-gray-200
                  hover:bg-primary hover:text-white hover:border-primary hover:scale-105
                  transition-all duration-300 whitespace-nowrap
                  ${idx === activeQuestionIndex 
                    ? 'opacity-100 translate-x-0 scale-105 ring-2 ring-primary ring-opacity-50' 
                    : 'opacity-60 translate-x-2 scale-95'}
                `}
                style={{
                  animationDelay: `${q.delay}s`,
                }}
              >
                {q.text}
              </button>
            ))}
          </div>
        )}
        
        {/* Main chat button with DEMA logo - draggable on mobile */}
        <button
          onClick={() => {
            if (!isDragging) {
              setIsOpen(true);
              setShowFloatingQuestions(false);
            }
          }}
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
          className={`relative bg-white hover:bg-gray-50 rounded-full p-2 shadow-xl border-2 border-primary transition-all duration-300 hover:scale-110 group ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-pointer sm:cursor-pointer'}`}
          aria-label="Open chat"
        >
          {/* DEMA Logo */}
          <div className="w-12 h-12 relative">
            <Image
              src="/icons/icon-96x96.png"
              alt="DEMA Assistant"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          
          {/* Pulsing notification dot */}
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg">
            💬
          </span>
          
          {/* Hover tooltip - desktop only */}
          <span className={`absolute top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block ${isQuoteOpen ? 'left-full ml-3' : 'right-full mr-3'}`}>
            {t.title}
            <span className="block text-xs text-gray-400">Klik om te chatten</span>
          </span>
          
          {/* Drag hint on mobile */}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap sm:hidden">
            {isDragging ? '📍' : 'Drag me'}
          </span>
        </button>
        
        {/* Animated ring around button - hidden when dragging */}
        {!isDragging && (
          <div className="absolute inset-0 -m-1 rounded-full border-2 border-primary opacity-30 animate-ping pointer-events-none" />
        )}
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed bottom-6 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-72 transition-all duration-300 ${isQuoteOpen ? 'left-6 hidden sm:block' : 'right-6'}`}>
        <div
          className="flex items-center justify-between p-3 bg-primary text-white rounded-t-lg cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <Image src="/icons/icon-72x72.png" alt="DEMA" width={24} height={24} className="rounded-full" />
            <span className="font-medium">{t.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full chat window
  return (
    <div className={`fixed bottom-0 sm:bottom-6 z-50 bg-white sm:rounded-xl shadow-2xl border border-gray-200 w-full sm:w-96 sm:max-w-[calc(100vw-3rem)] flex flex-col h-[100dvh] sm:h-auto sm:max-h-[600px] ${isQuoteOpen ? 'left-0 sm:left-6 hidden sm:flex' : 'right-0 sm:right-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary text-white sm:rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg">
            <Image src="/icons/icon-72x72.png" alt="DEMA" width={32} height={32} className="rounded" />
          </div>
          <div>
            <h3 className="font-semibold">{t.title}</h3>
            <p className="text-xs text-blue-100">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <Image src="/icons/icon-72x72.png" alt="DEMA" width={16} height={16} className="mt-0.5 flex-shrink-0 rounded" />
                )}
                <div 
                  className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium" target="_blank">$1</a>')
                      .replace(/^• /gm, '<span class="text-primary">•</span> ')
                  }}
                />
              </div>

              {/* Suggested Subcategories (when a main category is matched) */}
              {message.suggestedSubcategories && message.suggestedSubcategories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {language === 'nl' ? 'Kies een subcategorie:' : language === 'fr' ? 'Choisissez une sous-catégorie:' : 'Choose a subcategory:'}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {message.suggestedSubcategories.map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={(e) => {
                          e.preventDefault();
                          // Search for this subcategory
                          sendMessage(sub.name);
                        }}
                        className="flex flex-col items-start text-left bg-white border border-gray-200 p-2 rounded-lg hover:bg-primary/5 hover:border-primary/30 transition"
                      >
                        <span className="text-sm font-medium text-gray-900">{sub.name}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{sub.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Catalogs */}
              {message.suggestedCatalogs && message.suggestedCatalogs.length > 0 && !message.suggestedSubcategories?.length && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">{t.suggestedCatalogs}</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestedCatalogs.map((catalog) => (
                      <Link
                        key={catalog.id}
                        href={catalog.url}
                        className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 px-2 py-1 rounded-full hover:bg-gray-50 transition"
                      >
                        {catalog.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Products */}
              {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">{t.suggestedProducts}</p>
                  <div className="space-y-3">
                    {message.suggestedProducts.map((product, idx) => {
                      const productKey = product.sku || product.groupId || `${product.catalog}-${product.name}`;
                      const isAdded = addedProducts.has(productKey);
                      const quantity = getQuantity(productKey);
                      
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 p-3 rounded-lg"
                        >
                          {/* Product Info Row */}
                          <div className="flex items-center gap-2 mb-2">
                            {product.image && (
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={`/${product.image}`}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">
                                {product.variantCount} {t.variants}
                              </p>
                            </div>
                            {/* View Product Link */}
                            <button
                              onClick={(e) => handleProductClick(product.url, e)}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition"
                              title={t.viewProduct}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Quantity and Add to Quote Row */}
                          <div className="flex items-center gap-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() => updateQuantity(productKey, -1)}
                                className="p-1.5 hover:bg-gray-100 rounded-l-lg transition"
                                disabled={quantity <= 1}
                              >
                                <Minus className="w-3 h-3 text-gray-500" />
                              </button>
                              <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(productKey, 1)}
                                className="p-1.5 hover:bg-gray-100 rounded-r-lg transition"
                              >
                                <Plus className="w-3 h-3 text-gray-500" />
                              </button>
                            </div>
                            
                            {/* Add to Quote Button */}
                            <button
                              onClick={() => handleAddToQuote(product)}
                              disabled={isAdded}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                isAdded
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-primary text-white hover:bg-primary-dark'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  {t.added}
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  {t.addToQuote}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (only show if no messages yet) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {t.quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary hover:bg-blue-600 text-white p-2.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t.send}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
