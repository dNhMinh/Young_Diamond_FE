/* eslint-disable react-refresh/only-export-components */
// src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { CartItem, CartState, CartTotals } from "../types/cart";

const LS_KEY = "yd_cart_v1";

type Action =
  | { type: "INIT"; payload: CartState }
  | { type: "ADD"; payload: CartItem }
  | {
      type: "REMOVE";
      payload: {
        productId: string;
        sizeId?: string | null;
        color?: string | null;
      };
    }
  | {
      type: "SET_QTY";
      payload: {
        productId: string;
        quantity: number;
        sizeId?: string | null;
        color?: string | null;
      };
    }
  | { type: "CLEAR" };

function sameVariant(
  a: { productId: string; sizeId?: string | null; color?: string | null },
  b: { productId: string; sizeId?: string | null; color?: string | null },
) {
  return (
    a.productId === b.productId &&
    (a.sizeId ?? null) === (b.sizeId ?? null) &&
    (a.color ?? null) === (b.color ?? null)
  );
}

function calcDiscountedUnitPrice(price: number, discount?: number) {
  if (typeof discount !== "number" || discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

function calcTotals(state: CartState): CartTotals {
  let subtotal = 0;
  let total = 0;
  let itemCount = 0;

  for (const it of state.items) {
    const qty = Math.max(1, Math.floor(it.quantity || 1));
    itemCount += qty;

    subtotal += it.price * qty;
    total += calcDiscountedUnitPrice(it.price, it.discount) * qty;
  }

  return {
    subtotal,
    total,
    discountAmount: Math.max(0, subtotal - total),
    itemCount,
  };
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "INIT":
      return action.payload;

    case "ADD": {
      const incoming = action.payload;
      const idx = state.items.findIndex((x) =>
        sameVariant(
          { productId: x.productId, sizeId: x.sizeId, color: x.color },
          {
            productId: incoming.productId,
            sizeId: incoming.sizeId,
            color: incoming.color,
          },
        ),
      );

      if (idx >= 0) {
        const next = [...state.items];
        next[idx] = {
          ...next[idx],
          quantity: (next[idx].quantity || 1) + (incoming.quantity || 1),
        };
        return { items: next };
      }

      return { items: [incoming, ...state.items] };
    }

    case "REMOVE":
      return {
        items: state.items.filter(
          (x) =>
            !sameVariant(
              { productId: x.productId, sizeId: x.sizeId, color: x.color },
              action.payload,
            ),
        ),
      };

    case "SET_QTY": {
      const q = Math.max(1, Math.floor(action.payload.quantity));
      const next = state.items.map((x) => {
        if (
          sameVariant(
            { productId: x.productId, sizeId: x.sizeId, color: x.color },
            action.payload,
          )
        ) {
          return { ...x, quantity: q };
        }
        return x;
      });
      return { items: next };
    }

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

type CartContextValue = {
  state: CartState;
  totals: CartTotals;

  addItem: (item: CartItem) => void;
  removeItem: (
    productId: string,
    sizeId?: string | null,
    color?: string | null,
  ) => void;
  setQty: (
    productId: string,
    quantity: number,
    sizeId?: string | null,
    color?: string | null,
  ) => void;
  clear: () => void;

  discountedUnitPrice: (price: number, discount?: number) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // init from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;

      if (
        typeof parsed === "object" &&
        parsed &&
        Array.isArray((parsed as { items?: unknown }).items)
      ) {
        dispatch({ type: "INIT", payload: parsed as CartState });
      }
    } catch {
      // ignore
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const totals = useMemo(() => calcTotals(state), [state]);

  const value: CartContextValue = useMemo(
    () => ({
      state,
      totals,
      addItem: (item) => dispatch({ type: "ADD", payload: item }),
      removeItem: (productId, sizeId, color) =>
        dispatch({ type: "REMOVE", payload: { productId, sizeId, color } }),
      setQty: (productId, quantity, sizeId, color) =>
        dispatch({
          type: "SET_QTY",
          payload: { productId, quantity, sizeId, color },
        }),
      clear: () => dispatch({ type: "CLEAR" }),
      discountedUnitPrice: calcDiscountedUnitPrice,
    }),
    [state, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider />");
  return ctx;
}
