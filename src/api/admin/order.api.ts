// src/api/admin/order.api.ts
import baseApi from "../../api/baseApi";
import type {
  ApiResponse,
  BulkUpdateResult,
  MongoUpdateManyResult,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  PaymentStatus,
} from "../../types/order";

export const getAdminOrdersApi = (params?: {
  status?: "all" | OrderStatus;
  paymentStatus?: "all" | PaymentStatus;
}) => {
  const status =
    params?.status && params.status !== "all" ? params.status : undefined;
  const paymentStatus =
    params?.paymentStatus && params.paymentStatus !== "all"
      ? params.paymentStatus
      : undefined;

  return baseApi.get<ApiResponse<OrderListItem[]>>("/admin/orders", {
    params: { status, paymentStatus },
  });
};

export const getOrderDetailApi = (orderId: string) => {
  return baseApi.get<ApiResponse<OrderDetail>>(
    `/admin/orders/detail/${orderId}`,
  );
};

export const updateOrderPaymentStatusApi = (
  orderId: string,
  paymentStatus: PaymentStatus,
) => {
  return baseApi.patch<ApiResponse<OrderDetail>>(
    `/admin/orders/update-payment-status/${orderId}`,
    { paymentStatus },
  );
};

export const updateMultiOrderPaymentStatusApi = (
  orderIds: string[],
  paymentStatus: PaymentStatus,
) => {
  return baseApi.patch<ApiResponse<BulkUpdateResult>>(
    "/admin/orders/update-multi-payment-status",
    { orderIds, paymentStatus },
  );
};

export const updateOrderStatusApi = (
  orderId: string,
  status: OrderStatus,
  failReason?: string,
) => {
  const payload: Record<string, unknown> = { status };
  if (typeof failReason === "string") payload.failReason = failReason;

  return baseApi.patch<ApiResponse<OrderDetail>>(
    `/admin/orders/update-status-order/${orderId}`,
    payload,
  );
};

export const updateMultiOrderStatusApi = (
  orderIds: string[],
  status: OrderStatus,
  failReason?: string,
) => {
  const payload: Record<string, unknown> = { orderIds, status };
  if (typeof failReason === "string") payload.failReason = failReason;

  return baseApi.patch<ApiResponse<MongoUpdateManyResult>>(
    `/admin/orders/update-multi-status-order`,
    payload,
  );
};
