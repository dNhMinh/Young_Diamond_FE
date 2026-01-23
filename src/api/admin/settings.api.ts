import baseApi from "../../api/baseApi";
import type {
  ApiResponse,
  BankAccount,
  CreateBankAccountPayload,
  CreatePaymentMethodPayload,
  CreateShippingCarrierPayload,
  PaymentMethod,
  ShippingCarrier,
  SystemSettings,
  UpdateBankAccountPayload,
  UpdatePaymentMethodPayload,
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

export const getPaymentMethodsApi = () =>
  baseApi.get<ApiResponse<PaymentMethod[]>>("/admin/settings/payment-methods");

export const getPaymentMethodDetailApi = (id: string) =>
  baseApi.get<ApiResponse<BankAccount[]>>(
    `/admin/settings/payment-methods/${id}`,
  );

export const createPaymentMethodApi = (payload: CreatePaymentMethodPayload) =>
  baseApi.post<ApiResponse<PaymentMethod>>(
    "/admin/settings/payment-methods/create",
    payload,
  );

export const updatePaymentMethodApi = (
  id: string,
  payload: UpdatePaymentMethodPayload,
) =>
  baseApi.patch<ApiResponse<PaymentMethod>>(
    `/admin/settings/payment-methods/update/${id}`,
    payload,
  );

export const deletePaymentMethodApi = (id: string) =>
  baseApi.delete<ApiResponse<PaymentMethod>>(
    `/admin/settings/payment-methods/delete/${id}`,
  );

export const addBankAccountToPaymentMethodApi = (
  paymentMethodId: string,
  payload: CreateBankAccountPayload,
) =>
  baseApi.post<ApiResponse<PaymentMethod>>(
    `/admin/settings/payment-methods/${paymentMethodId}/add-bank-account`,
    payload,
  );

export const updateBankAccountInPaymentMethodApi = (
  paymentMethodId: string,
  bankAccountId: string,
  payload: UpdateBankAccountPayload,
) =>
  baseApi.patch<ApiResponse<PaymentMethod>>(
    `/admin/settings/payment-methods/${paymentMethodId}/update-bank-account/${bankAccountId}`,
    payload,
  );

export const deleteBankAccountInPaymentMethodApi = (
  paymentMethodId: string,
  bankAccountId: string,
) =>
  baseApi.delete<ApiResponse<PaymentMethod>>(
    `/admin/settings/payment-methods/${paymentMethodId}/delete-bank-account/${bankAccountId}`,
  );
