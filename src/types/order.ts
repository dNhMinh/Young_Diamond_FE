// // src/types/order.ts
// export type OrderStatus =
//   | "pending"
//   | "confirmed"
//   | "shipped"
//   | "delayed"
//   | "delivered"
//   | "failed";

// export type PaymentStatus = "pending" | "paid" | "failed";

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

// export interface ShippingInfo {
//   fullName: string;
//   address: string;
//   phoneNumber: string;
//   email: string;
//   note?: string;
// }

// export interface OrderProductLine {
//   productId: string;
//   quantity: number;
//   price: number;
//   _id?: string;
// }

// export interface PaymentInfo {
//   method?: string;
//   paymentDate?: string;
//   paymentStatus?: PaymentStatus;
//   imageCheckPayment?: string;
// }

// export interface OrderDetail {
//   _id: string;
//   orderCode: string;
//   shippingInfo: ShippingInfo;
//   products: OrderProductLine[];
//   totalAmount: number;
//   shippingCarrier?: string;
//   status: OrderStatus;
//   payment?: PaymentInfo;
//   failReason?: string | null;
//   createdAt?: string;
//   updatedAt?: string;
// }

// //client
// export type OrderCreatePayload = {
//   shippingInfo: {
//     fullName: string;
//     address: string;
//     phoneNumber: string;
//     email: string;
//     note?: string;
//   };
//   products: Array<{
//     productId: string;
//     quantity: number;
//     price: number; // theo API của bạn
//   }>;
//   payment: {
//     method: "cod" | "bank_transfer";
//     imageCheckPayment?: string; // required nếu bank_transfer
//   };
//   shippingCarrier: string; // code or id tuỳ backend bạn dùng
// };

// export type OrderCreateResponse = {
//   // backend bạn chưa đưa response mẫu => tạm để unknown fields
//   // bạn có thể bổ sung sau: orderCode, totalPrice, status...
//   [key: string]: any;
// };

// src/types/order.ts

// src/types/order.ts
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delayed"
  | "delivered"
  | "failed";

export type PaymentStatus = "pending" | "paid" | "failed";

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
  method?: "cod" | "bank_transfer" | string; // giữ compatible nếu BE trả string khác
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

  // BE của bạn có thể trả shippingCarrier hoặc shippingCarrierCode
  shippingCarrier?: string;
  shippingCarrierCode?: string;

  status: OrderStatus;
  payment?: PaymentInfo;

  failReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// client
export type OrderCreatePayload = {
  shippingInfo: {
    fullName: string;
    address: string;
    phoneNumber: string;
    email: string;
    note?: string;
  };
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
    color?: string;
  }>;
  payment: {
    method: "cod" | "bank_transfer";
    imageCheckPayment?: string; // required nếu bank_transfer
  };

  // ✅ Giữ backward compatible: FE vẫn gửi shippingCarrier như cũ
  shippingCarrier: string;

  // ✅ Thêm optional để bạn có thể gửi thêm (nếu backend đang dùng shippingCarrierCode)
  shippingCarrierCode?: string;
};

// ✅ Response create đúng theo raw bạn gửi: { message, data: OrderDetail }
export type OrderCreateResponse = OrderDetail;
