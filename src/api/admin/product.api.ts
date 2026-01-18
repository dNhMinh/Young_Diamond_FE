import baseApi from "../../api/baseApi";
import type { ProductListItem } from "../../types/product";

export interface GetProductsParams {
  searchKey?: string;
  status?: "active" | "inactive" | "out_of_stock";
  deleted?: boolean;
  product_category_id?: string;
}

export interface GetProductsResponse {
  message: string;
  data: ProductListItem[];
}

export const getAdminProductsApi = (params?: GetProductsParams) => {
  return baseApi.get<GetProductsResponse>("/admin/products", {
    params,
  });
};

export const getProductDetailApi = (slug: string) => {
  return baseApi.get(`/admin/products/detail/${slug}`);
};

export const softDeleteProductApi = (productId: string) => {
  return baseApi.delete(`/admin/products/delete-force/${productId}`);
};

export const restoreProductApi = (productId: string) => {
  return baseApi.patch(`/admin/products/restore/${productId}`);
};
