//src/pages/client/products/ProductsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsApi } from "../../../api/client/products.api";
import type { ProductCardDTO } from "../../../api/client/products.api";
import type { ProductListQuery } from "../../../types/client";
// import ProductsFilterBar from "../../../components/client/products/ProductsFilterBar";
import ProductGrid from "../../../components/client/products/ProductGrid";
import PaginationLite from "../../../components/client/products/PaginationLite";

function toNumber(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toStringOrUndefined(v: string | null): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

function buildQueryFromSearchParams(sp: URLSearchParams): ProductListQuery {
  const page = toNumber(sp.get("page")) ?? 1;
  const limit = toNumber(sp.get("limit")) ?? 12;

  const product_category_id = toStringOrUndefined(
    sp.get("product_category_id"),
  );
  const searchKey = toStringOrUndefined(sp.get("searchKey"));

  const typeRaw = sp.get("type");
  const type = typeRaw === "new" || typeRaw === "sales" ? typeRaw : undefined;

  const minPrice = toNumber(sp.get("minPrice"));
  const maxPrice = toNumber(sp.get("maxPrice"));

  const sortKeyRaw = sp.get("sortKey");
  const sortKey =
    sortKeyRaw === "price" || sortKeyRaw === "createdAt"
      ? sortKeyRaw
      : undefined;

  const sortValueRaw = sp.get("sortValue");
  const sortValue =
    sortValueRaw === "asc" || sortValueRaw === "desc"
      ? sortValueRaw
      : undefined;

  return {
    page,
    limit,
    product_category_id,
    searchKey,
    type,
    minPrice,
    maxPrice,
    sortKey,
    sortValue,
  };
}

function setSearchParamsFromQuery(
  setSp: (next: URLSearchParams) => void,
  query: ProductListQuery,
) {
  const next = new URLSearchParams();

  // default: page=1 limit=12 -> vẫn set để URL rõ ràng
  next.set("page", String(query.page ?? 1));
  next.set("limit", String(query.limit ?? 12));

  if (query.product_category_id)
    next.set("product_category_id", query.product_category_id);
  if (query.searchKey) next.set("searchKey", query.searchKey);
  if (query.type) next.set("type", query.type);
  if (typeof query.minPrice === "number")
    next.set("minPrice", String(query.minPrice));
  if (typeof query.maxPrice === "number")
    next.set("maxPrice", String(query.maxPrice));
  if (query.sortKey) next.set("sortKey", query.sortKey);
  if (query.sortValue) next.set("sortValue", query.sortValue);

  setSp(next);
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => buildQueryFromSearchParams(searchParams),
    [searchParams],
  );

  const [products, setProducts] = useState<ProductCardDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await productsApi.list(query);

        if (!alive) return;

        setProducts(res.data || []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErrorMsg("Không tải được danh sách sản phẩm. Vui lòng thử lại.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [query]);

  const hasNext = products.length === (query.limit ?? 12);

  // const onApply = (next: ProductListQuery) => {
  //   setSearchParamsFromQuery(setSearchParams, next);
  // };

  // const onReset = () => {
  //   // giữ category nếu bạn muốn reset mà vẫn ở category
  //   const keepCategory = query.product_category_id;
  //   setSearchParamsFromQuery(setSearchParams, {
  //     page: 1,
  //     limit: 12,
  //     product_category_id: keepCategory,
  //   });
  // };

  const onPrev = () => {
    const page = query.page ?? 1;
    const next = { ...query, page: Math.max(1, page - 1) };
    setSearchParamsFromQuery(setSearchParams, next);
  };

  const onNext = () => {
    const page = query.page ?? 1;
    const next = { ...query, page: page + 1 };
    setSearchParamsFromQuery(setSearchParams, next);
  };

  return (
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="pt-6">
          <div className="text-xs tracking-[0.2em] uppercase text-neutral-500">
            Young Diamond
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold">Products</h1>
        </div>

        {/* <ProductsFilterBar query={query} onApply={onApply} onReset={onReset} /> */}

        {loading ? (
          <div className="py-8 text-sm text-neutral-500">Loading...</div>
        ) : errorMsg ? (
          <div className="py-8 text-sm text-red-600">{errorMsg}</div>
        ) : (
          <>
            <div className="py-8">
              <ProductGrid products={products} />
              <PaginationLite
                page={query.page ?? 1}
                limit={query.limit ?? 12}
                hasNext={hasNext}
                onPrev={onPrev}
                onNext={onNext}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
