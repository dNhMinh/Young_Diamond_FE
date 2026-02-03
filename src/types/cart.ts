// src/types/cart.ts
export type CartItem = {
  productId: string;

  title: string;
  image: string;

  price: number; // giá gốc
  discount?: number; // % giảm (0-100)

  quantity: number;

  // optional nếu bạn dùng size/color khi add-to-cart
  sizeId?: string | null;
  sizeLabel?: string | null;
  color?: string | null;
};

export type CartState = {
  items: CartItem[];
};

export type CartTotals = {
  subtotal: number; // tổng giá gốc
  discountAmount: number; // tổng tiền giảm
  total: number; // thành tiền
  itemCount: number; // tổng số lượng
};
