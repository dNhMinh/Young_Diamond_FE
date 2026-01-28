// src/types/order.ts
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delayed"
  | "delivered"
  | "failed";

export type PaymentStatus = "pending" | "paid" | "failed";

export type ApiResponse<T> = {
  success?: boolean;
  message: string;
  data: T;
};

export type BulkUpdateResult = {
  acknowledged: boolean;
  modifiedCount: number;
  matchedCount: number;
  upsertedId: string | null;
  upsertedCount: number;
};

export type MongoUpdateManyResult = {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  upsertedId: unknown | null;
};

export interface OrderListItem {
  _id: string;
  orderCode: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingCarrierCode?: string;
  failReason?: string | null;
  createdAt?: string;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  phoneNumber: string;
  email: string;
  note?: string;
}

export interface OrderProductLine {
  productId: string;
  quantity: number;
  price: number;
  _id?: string;
}

export interface PaymentInfo {
  method?: string;
  paymentDate?: string;
  paymentStatus?: PaymentStatus;
  imageCheckPayment?: string;
}

export interface OrderDetail {
  _id: string;
  orderCode: string;
  shippingInfo: ShippingInfo;
  products: OrderProductLine[];
  totalAmount: number;
  shippingCarrier?: string;
  status: OrderStatus;
  payment?: PaymentInfo;
  failReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
