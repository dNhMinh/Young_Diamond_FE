import baseApi from "../../api/baseApi";
import type {
  ApiResponse,
  CreateShippingCarrierPayload,
  ShippingCarrier,
  SystemSettings,
  UpdateShippingCarrierPayload,
} from "../../types/settings";

export const getAdminSettingsApi = () => {
  return baseApi.get<ApiResponse<SystemSettings>>("/admin/settings");
};

export const updateAdminSettingsApi = (payload: Partial<SystemSettings>) => {
  return baseApi.patch<ApiResponse<SystemSettings>>(
    "/admin/settings/update",
    payload,
  );
};

export const getShippingCarriersApi = () => {
  return baseApi.get<ApiResponse<ShippingCarrier[]>>(
    "/admin/settings/shipping-carriers",
  );
};

export const createShippingCarrierApi = (
  payload: CreateShippingCarrierPayload,
) => {
  return baseApi.post<ApiResponse<ShippingCarrier>>(
    "/admin/settings/shipping-carriers/create",
    payload,
  );
};

export const updateShippingCarrierApi = (
  shippingCarrierId: string,
  payload: UpdateShippingCarrierPayload,
) => {
  return baseApi.patch<ApiResponse<ShippingCarrier>>(
    `/admin/settings/shipping-carriers/update/${shippingCarrierId}`,
    payload,
  );
};

export const deleteShippingCarrierApi = (shippingCarrierId: string) => {
  return baseApi.delete<ApiResponse<ShippingCarrier>>(
    `/admin/settings/shipping-carriers/delete/${shippingCarrierId}`,
  );
};
