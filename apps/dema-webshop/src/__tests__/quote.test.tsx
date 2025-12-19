import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuoteProvider, useQuote } from '@/contexts/QuoteContext';
import { ReactNode } from 'react';

// Test component to access quote context
function TestQuoteConsumer() {
  const { quoteItems, addToQuote, removeFromQuote, updateQuantity, clearQuote } = useQuote();
  
  const totalItems = quoteItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div>
      <span data-testid="total-items">{totalItems}</span>
      <span data-testid="items-count">{quoteItems.length}</span>
      <ul data-testid="quote-items">
        {quoteItems.map((item) => (
          <li key={item.sku} data-testid={`item-${item.sku}`}>
            {item.name} - {item.quantity}
            <button onClick={() => updateQuantity(item.sku, item.quantity + 1)}>+</button>
            <button onClick={() => updateQuantity(item.sku, item.quantity - 1)}>-</button>
            <button onClick={() => removeFromQuote(item.sku)}>Remove</button>
          </li>
        ))}
      </ul>
      <button 
        data-testid="add-item"
        onClick={() => addToQuote({
          name: 'Test Product',
          sku: 'TEST-001',
          imageUrl: '/test.jpg',
          category: 'test-catalog',
        })}
      >
        Add Item
      </button>
      <button data-testid="clear-quote" onClick={clearQuote}>Clear</button>
    </div>
  );
}

// Wrapper with provider
function renderWithQuoteProvider(ui: ReactNode) {
  return render(
    <QuoteProvider>
      {ui}
    </QuoteProvider>
  );
}

describe('Quote Context', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('starts with empty quote', () => {
      renderWithQuoteProvider(<TestQuoteConsumer />);
      
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  describe('Adding Items', () => {
    it('adds item to quote', async () => {
      renderWithQuoteProvider(<TestQuoteConsumer />);
      
      fireEvent.click(screen.getByTestId('add-item'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('1');
        expect(screen.getByTestId('items-count')).toHaveTextContent('1');
      });
    });

    it('increments quantity when adding same item', async () => {
      renderWithQuoteProvider(<TestQuoteConsumer />);
      
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('add-item'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('2');
        expect(screen.getByTestId('items-count')).toHaveTextContent('1'); // Still 1 unique item
      });
    });
  });

  describe('Updating Quantity', () => {
    it('increases item quantity', async () => {
      renderWithQuoteProvider(<TestQuoteConsumer />);
      
      fireEvent.click(screen.getByTestId('add-item'));
      
      await waitFor(() => {
        expect(screen.getByTestId('item-TEST-001')).toBeInTheDocument();
      });
      
      const increaseButton = screen.getByTestId('item-TEST-001').querySelector('button');
      if (increaseButton) fireEvent.click(increaseButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('2');
      });
    });
  });

  describe('Removing Items', () => {
    it('removes item from quote', async () => {
      renderWithQuoteProvider(<TestQuoteConsumer />);
      
      fireEvent.click(screen.getByTestId('add-item'));
      
      await waitFor(() => {
        expect(screen.getByTestId('items-count')).toHaveTextContent('1');
      });
      
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('items-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Clearing Quote', () => {
    it('clears all items from quote', async () => {
      renderWithQuoteProvider(<TestQuoteConsumer />);
      
      // Add multiple items
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('add-item'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('2');
      });
      
      fireEvent.click(screen.getByTestId('clear-quote'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('0');
        expect(screen.getByTestId('items-count')).toHaveTextContent('0');
      });
    });
  });
});
