import baseApi from "../../api/baseApi";

export type BannerType = "homepage" | "sidebar" | "slideshow";

export type Banner = {
  _id: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  position: number;
  type: BannerType;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetBannersResponse = {
  success: true;
  data: Banner[];
};

export type BannerResponse = {
  success: true;
  data: Banner;
};

export type DeleteBannerResponse = {
  success: true;
  message: string;
};

export type CreateBannerPayload = {
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  position: number;
  type: BannerType;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
};

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

export const getBannersApi = () =>
  baseApi.get<GetBannersResponse>("/admin/banners");

export const createBannerApi = (payload: CreateBannerPayload) =>
  baseApi.post<BannerResponse>("/admin/banners/add", payload);

export const updateBannerApi = (
  bannerId: string,
  payload: UpdateBannerPayload,
) => baseApi.patch<BannerResponse>(`/admin/banners/edit/${bannerId}`, payload);

export const deleteBannerApi = (bannerId: string) =>
  baseApi.delete<DeleteBannerResponse>(`/admin/banners/delete/${bannerId}`);
