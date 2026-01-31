import { httpPublic } from "../http";
import type { ApiResponse } from "../../types/client";

export type SiteSettings = {
  _id: string;
  siteTitle: string;
  siteDescription?: string;
  siteLogoUrl?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  address?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  paymentQRImageUrl?: string;
};

export type ShippingCarrier = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  logoUrl?: string;
};

export type BankAccount = {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl?: string;
  isActive: boolean;
  _id: string;
};

export type PaymentMethod = {
  _id: string;
  code: string;
  name: string;
  type: "OFFLINE" | "ONLINE";
  isActive: boolean;
  bankAccounts: BankAccount[];
};

export const settingsApi = {
  getSettings: async () => {
    const res = await httpPublic.get<ApiResponse<SiteSettings>>("/settings");
    return res.data;
  },
  getShippingCarriers: async () => {
    const res = await httpPublic.get<ApiResponse<ShippingCarrier[]>>(
      "/settings/shipping-carriers",
    );
    return res.data;
  },
  getPaymentMethods: async () => {
    const res = await httpPublic.get<ApiResponse<PaymentMethod[]>>(
      "/settings/payment-methods",
    );
    return res.data;
  },
};
