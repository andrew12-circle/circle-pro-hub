import { createRoot } from "react-dom/client";
import { CartProvider } from "@/state/cart/CartProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <CartProvider>
      <App />
    </CartProvider>
  </ErrorBoundary>
);
