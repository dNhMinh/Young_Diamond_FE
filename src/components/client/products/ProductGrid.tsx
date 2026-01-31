import ProductCard from "./ProductCard";
import type { ProductCardDTO } from "../../../api/client/products.api";

type Props = {
  products: ProductCardDTO[];
};

export default function ProductGrid({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="py-10 text-sm text-neutral-500">
        Không có sản phẩm phù hợp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p._id} p={p} />
      ))}
    </div>
  );
}
