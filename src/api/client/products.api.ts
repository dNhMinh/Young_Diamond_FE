//src/api/client/products.api.ts
import { httpPublic } from "../http";
import type { ApiResponse, ProductListQuery } from "../../types/client";
import type { ProductDetail } from "../../types/product";

export type ProductCardDTO = {
  _id: string;
  title: string;
  price: number;
  discount?: number;
  slug: string;
  thumbnail: string;
  position?: number;
};

export const productsApi = {
  list: async (query: ProductListQuery = {}) => {
    const res = await httpPublic.get<ApiResponse<ProductCardDTO[]>>(
      "/products",
      { params: query },
    );
    return res.data;
  },
  detailBySlug: async (slug: string) => {
    const res = await httpPublic.get<ApiResponse<ProductDetail>>(
      `/products/detail/${slug}`,
    );
    return res.data;
  },
};
