//src/api/client/home.api.ts
import { httpPublic } from "../http";
import type { ApiResponse } from "../../types/client";
import type { ProductDetailWithMeta } from "../../types/product";

export type HomeCategory = { _id: string; title: string; slug: string };

export type HomeBanner = {
  _id: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  position?: number;
  type?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export const homeApi = {
  getCategories: async () => {
    const res =
      await httpPublic.get<ApiResponse<HomeCategory[]>>("/home/categorys");
    return res.data;
  },
  getNewProducts: async () => {
    const res =
      await httpPublic.get<ApiResponse<ProductDetailWithMeta[]>>(
        "/home/products-new",
      );
    return res.data;
  },
  getBanners: async () => {
    const res =
      await httpPublic.get<ApiResponse<HomeBanner[]>>("/home/banners");
    return res.data;
  },
};
