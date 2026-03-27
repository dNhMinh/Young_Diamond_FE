// src/components/client/products/ProductCard.tsx
import { Link } from "react-router-dom";
import type { ProductCardDTO } from "../../../api/client/products.api";

export default function ProductCard({ p }: { p: ProductCardDTO }) {
  return (
    <Link to={`/products/${p.slug}`} className="group block bg-transparent">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-neutral-50">
        <img
          src={p.thumbnail}
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {/* Text */}
      <div className="pt-5 text-center">
        <h3
          className="
            text-[13px] md:text-sm
            font-semibold tracking-[0.14em] uppercase
            text-neutral-800
            transition-colors
            group-hover:text-black
          ">
          {p.title}
        </h3>

        <div className="mt-2 text-sm text-neutral-500">
          <span className="inline-block border-b border-transparent group-hover:border-neutral-400 transition">
            shop now →
          </span>
        </div>
      </div>
    </Link>
  );
}
