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

export interface ProductCategoryDetail {
  _id: string;
  title: string;
  description?: string;
  status: ProductCategoryStatus;
  deleted: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export interface GetAdminProductCategoriesParams {
  status?: ProductCategoryStatus; // nếu "all" => FE không truyền param
  deleted?: boolean; // nếu "all" => FE không truyền param
}

export interface GetAdminProductCategoriesResponse {
  message: string;
  data: ProductCategoryListItem[];
}

/** LIST */
export const getAdminProductCategoriesApi = (
  params?: GetAdminProductCategoriesParams,
) => {
  return baseApi.get<GetAdminProductCategoriesResponse>(
    "/admin/product-categories",
    { params },
  );
};

/** DETAIL: GET /admin/product-categories/detail/{slug} */
export const getProductCategoryDetailApi = (slug: string) => {
  return baseApi.get<ApiResponse<ProductCategoryDetail>>(
    `/admin/product-categories/detail/${slug}`,
  );
};

/** CREATE: POST /admin/product-categories/add */
export type CreateProductCategoryPayload = {
  title: string;
  description?: string;
  status: ProductCategoryStatus;
};

export const createProductCategoryApi = (
  payload: CreateProductCategoryPayload,
) => {
  return baseApi.post<ApiResponse<ProductCategoryDetail>>(
    "/admin/product-categories/add",
    payload,
  );
};

/** UPDATE: PATCH /admin/product-categories/update/{id} */
export type UpdateProductCategoryPayload =
  Partial<CreateProductCategoryPayload>;

export const updateProductCategoryApi = (
  id: string,
  payload: UpdateProductCategoryPayload,
) => {
  return baseApi.patch<ApiResponse<ProductCategoryDetail>>(
    `/admin/product-categories/update/${id}`,
    payload,
  );
};

/** SOFT DELETE: DELETE /admin/product-categories/delete-force/{id} */
export const softDeleteProductCategoryApi = (id: string) => {
  return baseApi.delete<ApiResponse<ProductCategoryDetail>>(
    `/admin/product-categories/delete-force/${id}`,
  );
};

/** RESTORE: PATCH /admin/product-categories/restore/{id} */
export const restoreProductCategoryApi = (id: string) => {
  return baseApi.patch<ApiResponse<ProductCategoryDetail>>(
    `/admin/product-categories/restore/${id}`,
  );
};

/** HARD DELETE: DELETE /admin/product-categories/delete/{id} */
export const hardDeleteProductCategoryApi = (id: string) => {
  return baseApi.delete<ApiResponse<ProductCategoryDetail>>(
    `/admin/product-categories/delete/${id}`,
  );
};
