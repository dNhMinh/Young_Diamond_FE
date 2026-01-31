import type { ProductListQuery } from "../../../types/client";

type Props = {
  query: ProductListQuery;
  onApply: (next: ProductListQuery) => void;
  onReset: () => void;
};

export default function ProductsFilterBar({ query, onApply, onReset }: Props) {
  const q = query.searchKey || "";
  const type = query.type || "";
  const minPrice = query.minPrice ?? "";
  const maxPrice = query.maxPrice ?? "";
  const sortKey = query.sortKey || "";
  const sortValue = query.sortValue || "";

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const searchKey = String(form.get("searchKey") || "").trim();
    const typeRaw = String(form.get("type") || "");
    const minRaw = String(form.get("minPrice") || "");
    const maxRaw = String(form.get("maxPrice") || "");
    const sortKeyRaw = String(form.get("sortKey") || "");
    const sortValueRaw = String(form.get("sortValue") || "");

    const minPriceNum = minRaw ? Number(minRaw) : undefined;
    const maxPriceNum = maxRaw ? Number(maxRaw) : undefined;

    onApply({
      ...query,
      page: 1, // apply filter thì reset về page 1
      searchKey: searchKey || undefined,
      type: (typeRaw === "new" || typeRaw === "sales" ? typeRaw : undefined) as
        | "new"
        | "sales"
        | undefined,
      minPrice:
        typeof minPriceNum === "number" && Number.isFinite(minPriceNum)
          ? minPriceNum
          : undefined,
      maxPrice:
        typeof maxPriceNum === "number" && Number.isFinite(maxPriceNum)
          ? maxPriceNum
          : undefined,
      sortKey:
        sortKeyRaw === "price" || sortKeyRaw === "createdAt"
          ? sortKeyRaw
          : undefined,
      sortValue:
        sortValueRaw === "asc" || sortValueRaw === "desc"
          ? sortValueRaw
          : undefined,
    });
  };

  return (
    <form onSubmit={submit} className="py-6 border-b border-neutral-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-2">
            Search
          </label>
          <input
            name="searchKey"
            defaultValue={q}
            placeholder="Tìm sản phẩm..."
            className="w-full h-10 px-4 rounded-md border border-neutral-300 outline-none focus:border-black"
          />
        </div>

        {/* Type */}
        <div className="md:col-span-2">
          <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-2">
            Type
          </label>
          <select
            name="type"
            defaultValue={type}
            className="w-full h-10 px-3 rounded-md border border-neutral-300 outline-none focus:border-black bg-white"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="sales">Sales</option>
          </select>
        </div>

        {/* Price */}
        <div className="md:col-span-3">
          <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-2">
            Price
          </label>
          <div className="flex gap-2">
            <input
              name="minPrice"
              defaultValue={minPrice}
              placeholder="Min"
              inputMode="numeric"
              className="w-full h-10 px-3 rounded-md border border-neutral-300 outline-none focus:border-black"
            />
            <input
              name="maxPrice"
              defaultValue={maxPrice}
              placeholder="Max"
              inputMode="numeric"
              className="w-full h-10 px-3 rounded-md border border-neutral-300 outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="md:col-span-3">
          <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-2">
            Sort
          </label>
          <div className="flex gap-2">
            <select
              name="sortKey"
              defaultValue={sortKey}
              className="w-full h-10 px-3 rounded-md border border-neutral-300 outline-none focus:border-black bg-white"
            >
              <option value="">None</option>
              <option value="price">Price</option>
              <option value="createdAt">CreatedAt</option>
            </select>

            <select
              name="sortValue"
              defaultValue={sortValue}
              className="w-full h-10 px-3 rounded-md border border-neutral-300 outline-none focus:border-black bg-white"
            >
              <option value="">—</option>
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-black text-white text-sm hover:opacity-90"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
