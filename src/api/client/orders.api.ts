//src/api/client/orders.api.ts
import { httpPublic } from "../http";
import type { ApiResponse } from "../../types/client";
import type {
  OrderCreatePayload,
  OrderCreateResponse,
} from "../../types/order";

export const ordersApi = {
  create: async (payload: OrderCreatePayload) => {
    const res = await httpPublic.post<ApiResponse<OrderCreateResponse>>(
      "/orders/create",
      payload,
    );
    return res.data;
  },
};
