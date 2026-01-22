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

// update theo swagger: body không cần code
export type UpdateShippingCarrierPayload = Partial<{
  code?: string;
  name: string;
  description?: string;
  isActive: boolean;
  logoUrl?: string;
}>;
