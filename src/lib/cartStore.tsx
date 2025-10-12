import { createContext, useContext, useState, ReactNode } from "react";
import { PricingSelection } from "../../contracts/cart/pricing-selection";

interface CartItem extends PricingSelection {
  cartItemId: string;
  serviceName: string;
  vendorName: string;
  packageName?: string;
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartItemId" | "addedAt">) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartStore | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "cartItemId" | "addedAt">) => {
    const newItem: CartItem = {
      ...item,
      cartItemId: crypto.randomUUID(),
      addedAt: new Date(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
