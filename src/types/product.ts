export type ProductStatus = "active" | "inactive" | "out_of_stock";

export interface ProductListItem {
  _id: string;
  title: string;
  price: number;
  stock: number;
  status: ProductStatus;
  slug: string;
  image: string;
  deleted?: boolean;
}

export interface ProductSize {
  _id: string;
  size: string;
  type: string;
  freeSize: boolean;
}

export interface ProductDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  product_category_id: string;
  images: string[];
  stock: number;
  discount?: number;
  size: ProductSize[];
  status: "active" | "inactive" | "out_of_stock";
  slug: string;
  color: string[];
}
