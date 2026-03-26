//src/types/client.ts
export type ApiResponse<T> = {
  success?: boolean;
  message: string;
  data: T;
};

// query cho GET /products
export type ProductListQuery = {
  page?: number;
  limit?: number;
  product_category_id?: string;
  searchKey?: string;
  type?: "new" | "sales";
  minPrice?: number;
  maxPrice?: number;
  sortKey?: "price" | "createdAt";
  sortValue?: "asc" | "desc";
};
