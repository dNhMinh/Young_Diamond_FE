// //src/api/admin/product.api.ts
// import baseApi from "../../api/baseApi";
// import type { ProductDetail, ProductListItem } from "../../types/product";

// /* =========================
//  * LIST PRODUCTS
//  * ========================= */
// export interface GetProductsParams {
//   searchKey?: string;
//   status?: "active" | "inactive" | "out_of_stock";
//   deleted?: boolean;
//   product_category_id?: string;
// }

// export interface GetProductsResponse {
//   message: string;
//   data: ProductListItem[];
// }

// export const getAdminProductsApi = (params?: GetProductsParams) => {
//   return baseApi.get<GetProductsResponse>("/admin/products", { params });
// };

// /* =========================
//  * PRODUCT TYPES (DETAIL / CREATE / UPDATE)
//  * ========================= */
// export type ProductStatus = "active" | "inactive" | "out_of_stock";

// export type SizeItemApi = {
//   _id?: string;
//   freeSize?: boolean;
//   size: string;
//   type: string;
// };

// export type ApiResponse<T> = {
//   message: string;
//   data: T;
// };

// /* =========================
//  * DETAIL
//  * ========================= */
// export const getProductDetailApi = (slug: string) => {
//   return baseApi.get<ApiResponse<ProductDetail>>(
//     `/admin/products/detail/${slug}`,
//   );
// };

// /* =========================
//  * DELETE / RESTORE
//  * ========================= */
// export const softDeleteProductApi = (productId: string) => {
//   return baseApi.delete(`/admin/products/delete-force/${productId}`);
// };

// export const restoreProductApi = (productId: string) => {
//   return baseApi.patch(`/admin/products/restore/${productId}`);
// };

// export const hardDeleteProductApi = (productId: string) => {
//   return baseApi.delete<{ message: string }>(
//     `/admin/products/delete/${productId}`,
//   );
// };

// /* =========================
//  * CREATE
//  * ========================= */
// export type CreateProductPayload = {
//   title: string;
//   description: string;
//   price: number;
//   product_category_id: string;
//   images: string[];
//   stock: number;
//   discount?: number;
//   size?: Array<{ freeSize?: boolean; size: string; type: string }>;
//   status: ProductStatus;
//   color?: string[];
// };

// export const createProductApi = (payload: CreateProductPayload) => {
//   return baseApi.post<ApiResponse<ProductDetail>>(
//     "/admin/products/add",
//     payload,
//   );
// };

// /* =========================
//  * UPDATE: PATCH /admin/products/update/{product_id}
//  * ========================= */
// export type UpdateProductPayload = Partial<CreateProductPayload>;

// export const updateProductApi = (
//   productId: string,
//   payload: UpdateProductPayload,
// ) => {
//   return baseApi.patch<ApiResponse<ProductDetail>>(
//     `/admin/products/update/${productId}`,
//     payload,
//   );
// };

import baseApi from "../../api/baseApi";
import type {
  ProductDetail,
  ProductListItem,
  ProductSize,
  ProductStatus,
  ProductVariant,
} from "../../types/product";

/* =========================
 * LIST PRODUCTS
 * ========================= */
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
  return baseApi.get<GetProductsResponse>("/admin/products", { params });
};

/* =========================
 * COMMON
 * ========================= */
export type SizeItemApi = ProductSize;
export type VariantItemApi = ProductVariant;

export type ApiResponse<T> = {
  message: string;
  data: T;
};

/* =========================
 * DETAIL
 * ========================= */
export const getProductDetailApi = (slug: string) => {
  return baseApi.get<ApiResponse<ProductDetail>>(
    `/admin/products/detail/${slug}`,
  );
};

/* =========================
 * DELETE / RESTORE
 * ========================= */
export const softDeleteProductApi = (productId: string) => {
  return baseApi.delete(`/admin/products/delete-force/${productId}`);
};

export const restoreProductApi = (productId: string) => {
  return baseApi.patch(`/admin/products/restore/${productId}`);
};

export const hardDeleteProductApi = (productId: string) => {
  return baseApi.delete<{ message: string }>(
    `/admin/products/delete/${productId}`,
  );
};

/* =========================
 * CREATE
 * ========================= */
export type CreateProductPayload = {
  title: string;
  description: string;
  price: number;
  product_category_id: string;
  thumbnail: string;
  position: number;
  isManageStock: boolean;
  discount?: number;
  size?: Array<{ freeSize?: boolean; size: string; type: string }>;
  variant?: Array<{ color: string; images: string[]; stock: number }>;
  status: ProductStatus;
};

export const createProductApi = (payload: CreateProductPayload) => {
  return baseApi.post<ApiResponse<ProductDetail>>(
    "/admin/products/add",
    payload,
  );
};

/* =========================
 * UPDATE
 * ========================= */
export type UpdateProductPayload = Partial<CreateProductPayload>;

export const updateProductApi = (
  productId: string,
  payload: UpdateProductPayload,
) => {
  return baseApi.patch<ApiResponse<ProductDetail>>(
    `/admin/products/update/${productId}`,
    payload,
  );
};
