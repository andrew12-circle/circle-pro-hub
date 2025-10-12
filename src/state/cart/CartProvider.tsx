// src/state/cart/CartProvider.tsx
'use client';
import * as React from 'react';
import type { PricingSelection } from '../../../contracts/cart/pricing-selection';

export type CartItem = PricingSelection & { 
  id: string;
  serviceName: string;
  vendorName: string;
  packageName?: string;
  addedAt: Date;
};

type CartState = { items: CartItem[] };

type CartActions =
  | { type: 'ADD'; payload: Omit<CartItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'CLEAR' };

type CartContextType = CartState & {
  add: (sel: Omit<CartItem, 'id' | 'addedAt'>) => void;
  remove: (id: string) => void;
  clear: () => void;
  itemCount: number;
};

const NS = 'circle_cart_v1';

const CartContext = React.createContext<CartContextType | null>(null);

function reducer(state: CartState, action: CartActions): CartState {
  switch (action.type) {
    case 'ADD': {
      const id = `${action.payload.serviceId}:${action.payload.mode}:${action.payload.vendorPartnerId ?? ''}:${Date.now()}`;
      return { 
        items: [...state.items, { 
          ...action.payload, 
          id,
          addedAt: new Date()
        }] 
      };
    }
    case 'REMOVE': {
      return { items: state.items.filter((i) => i.id !== action.payload.id) };
    }
    case 'CLEAR': {
      return { items: [] };
    }
    default:
      return state;
  }
}

function load(): CartState {
  try {
    const raw = localStorage.getItem(NS);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    // Rehydrate Date objects
    const items = parsed.items.map((item: CartItem & { addedAt: string }) => ({
      ...item,
      addedAt: new Date(item.addedAt)
    }));
    return { items };
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, load);

  React.useEffect(() => {
    try {
      localStorage.setItem(NS, JSON.stringify(state));
    } catch {}
  }, [state]);

  const ctx: CartContextType = React.useMemo(
    () => ({
      items: state.items,
      itemCount: state.items.length,
      add: (sel) => dispatch({ type: 'ADD', payload: sel }),
      remove: (id) => dispatch({ type: 'REMOVE', payload: { id } }),
      clear: () => dispatch({ type: 'CLEAR' })
    }),
    [state.items]
  );

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
