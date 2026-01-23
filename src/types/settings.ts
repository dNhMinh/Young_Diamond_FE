export type ApiResponse<T> = {
  success?: boolean;
  message: string;
  data: T;
};

export interface SystemSettings {
  _id?: string;
  siteTitle?: string;
  siteDescription?: string;
  siteLogoUrl?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  address?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  paymentQRImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type ShippingCarrier = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateShippingCarrierPayload = {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  logoUrl?: string;
};

export type UpdateShippingCarrierPayload = Partial<{
  code?: string;
  name: string;
  description?: string;
  isActive: boolean;
  logoUrl?: string;
}>;

export type PaymentMethodType = "ONLINE" | "OFFLINE";

export type BankAccount = {
  _id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl?: string;
  isActive: boolean;
};

export type PaymentMethod = {
  _id: string;
  code: string;
  name: string;
  type: PaymentMethodType;
  isActive: boolean;
  bankAccounts: BankAccount[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type CreatePaymentMethodPayload = {
  code: string;
  name: string;
  type: PaymentMethodType;
  isActive: boolean;
};

export type UpdatePaymentMethodPayload = Partial<{
  name: string;
  type: PaymentMethodType;
  isActive: boolean;
}>;

export type CreateBankAccountPayload = {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl?: string;
  isActive: boolean;
};

export type UpdateBankAccountPayload = Partial<{
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl?: string;
  isActive: boolean;
}>;
