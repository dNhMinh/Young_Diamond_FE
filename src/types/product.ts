//src/types/product.ts
export type ProductStatus = "active" | "inactive" | "out_of_stock";

export interface ProductListItem {
  _id: string;
  title: string;
  price: number;

  status: ProductStatus;
  slug: string;
  thumbnail: string;
  position?: number;
  deleted?: boolean;

  // backward-compatible
  image?: string;
  stock?: number;
}

export interface ProductSize {
  _id: string;
  size: string;
  type: string;
  freeSize: boolean;
}

export interface ProductVariant {
  _id?: string;
  color: string;
  images: string[];
  stock: number;
}

export interface ProductDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  product_category_id: string;
  thumbnail?: string;
  position?: number;
  isManageStock?: boolean;
  discount?: number;
  size: ProductSize[];
  variant?: ProductVariant[];
  status: ProductStatus;
  slug: string;

  // backward-compatible cho client cũ
  images?: string[];
  stock?: number;
  color?: string[];
}

//client
/** Một số endpoint (vd: /home/products-new) trả thêm metadata */
export interface ProductMetaFields {
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  titleNomalized?: string;
  __v?: number;
}

/** Product detail + metadata (dùng cho những endpoint trả dư field) */
export type ProductDetailWithMeta = ProductDetail & ProductMetaFields;
