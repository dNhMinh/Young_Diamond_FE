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
}) => {
  const status =
    params?.status && params.status !== "all" ? params.status : undefined;

  return baseApi.get<ApiResponse<OrderListItem[]>>("/admin/orders", {
    params: { status },
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

export const updateOrderStatusApi = (orderId: string, status: OrderStatus) => {
  return baseApi.patch<ApiResponse<OrderDetail>>(
    `/admin/orders/update-status-order/${orderId}`,
    { status },
  );
};

export const updateMultiOrderStatusApi = (
  orderIds: string[],
  status: OrderStatus,
) => {
  return baseApi.patch<ApiResponse<MongoUpdateManyResult>>(
    `/admin/orders/update-multi-status-order`,
    { orderIds, status },
  );
};
