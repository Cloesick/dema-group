'use client';

import { useState } from 'react';
import { Save, FolderOpen, Trash2, Edit2, Check, X, Clock, Package } from 'lucide-react';
import { useSavedQuotes } from '@/hooks/useSavedQuotes';
import { useQuote } from '@/contexts/QuoteContext';

export default function SavedQuotesManager() {
  const { savedQuotes, saveQuote, deleteQuote, renameQuote } = useSavedQuotes();
  const { quoteItems: currentItems, clearQuote, addToQuote } = useQuote();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [quoteName, setQuoteName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    if (!quoteName.trim() || currentItems.length === 0) return;
    
    saveQuote(quoteName.trim(), currentItems);
    setQuoteName('');
    setShowSaveDialog(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLoad = (quote: typeof savedQuotes[0]) => {
    clearQuote();
    quote.items.forEach(item => {
      addToQuote(item);
    });
    setShowLoadDialog(false);
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameQuote(id, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      <button
        onClick={() => setShowSaveDialog(true)}
        disabled={currentItems.length === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentItems.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : saveSuccess
              ? 'bg-green-500 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saveSuccess ? 'Saved!' : 'Save Quote'}
      </button>

      {/* Load Button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        disabled={savedQuotes.length === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          savedQuotes.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <FolderOpen className="w-4 h-4" />
        Load ({savedQuotes.length})
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save Quote</h3>
            <input
              type="text"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="Enter quote name..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="text-sm text-gray-500 mb-4">
              {currentItems.length} items will be saved
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!quoteName.trim()}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoadDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Saved Quotes</h3>
              <button
                onClick={() => setShowLoadDialog(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {savedQuotes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No saved quotes yet
                </div>
              ) : (
                savedQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {editingId === quote.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRename(quote.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h4 className="font-semibold text-gray-900 truncate">{quote.name}</h4>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {quote.items.length} items
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(quote.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(quote.id); setEditName(quote.name); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleLoad(quote)}
                      className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Load Quote
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
