// src/api/admin/productCategory.api.ts
import baseApi from "../../api/baseApi";

export type ProductCategoryStatus = "active" | "inactive";

export interface ProductCategoryListItem {
  _id: string;
  title: string;
  description?: string;

  status?: ProductCategoryStatus;
  deleted?: boolean;
  slug?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface GetAdminProductCategoriesParams {
  status?: ProductCategoryStatus; // nếu "all" => FE không truyền param
  deleted?: boolean; // nếu "all" => FE không truyền param
}

export interface GetAdminProductCategoriesResponse {
  message: string;
  data: ProductCategoryListItem[];
}

export const getAdminProductCategoriesApi = (
  params?: GetAdminProductCategoriesParams,
) => {
  return baseApi.get<GetAdminProductCategoriesResponse>(
    "/admin/product-categories",
    { params },
  );
};
