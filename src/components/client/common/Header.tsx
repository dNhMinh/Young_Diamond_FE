import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { homeApi } from "../../../api/client/home.api";
import type { HomeCategory } from "../../../api/client/home.api";
import logoImg from "../../../assets/YDlogo.jpg";

type MenuKey =
  | "home"
  | "shop"
  | "bracelet"
  | "necklace"
  | "earring"
  | "hat"
  | "contact";

const menu: Array<{ key: MenuKey; label: string }> = [
  { key: "home", label: "HOME" },
  { key: "shop", label: "SHOP" },
  { key: "bracelet", label: "VÒNG TAY" },
  { key: "necklace", label: "VÒNG CỔ" },
  { key: "earring", label: "KHUYÊN TAI" },
  { key: "hat", label: "MŨ" },
  { key: "contact", label: "LIÊN HỆ" },
];

function cnActive(active: boolean) {
  return active
    ? "text-white border-b border-white"
    : "text-neutral-400 hover:text-white border-b border-transparent hover:border-neutral-500";
}

function buildProductsUrl(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  return `/products?${sp.toString()}`;
}

/** match category theo slug (ổn định và đúng theo backend) */
function findCategoryIdBySlug(categories: HomeCategory[], slug: string) {
  const hit = categories.find((c) => c.slug === slug);
  return hit?._id;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // dùng ref để tránh setState trong effect
  const searchRefDesktop = useRef<HTMLInputElement | null>(null);
  const searchRefMobile = useRef<HTMLInputElement | null>(null);

  const urlSearchKey = searchParams.get("searchKey") || "";

  useEffect(() => {
    if (searchRefDesktop.current) searchRefDesktop.current.value = urlSearchKey;
    if (searchRefMobile.current) searchRefMobile.current.value = urlSearchKey;
  }, [urlSearchKey]);

  // fetch categories 1 lần
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await homeApi.getCategories();
        if (!alive) return;
        setCategories(res.data || []);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const categoryIds = useMemo(() => {
    return {
      bracelet: findCategoryIdBySlug(categories, "vong-tay"),
      necklace: findCategoryIdBySlug(categories, "vong-co"),
      earring: findCategoryIdBySlug(categories, "khuyen-tai"),
      hat: findCategoryIdBySlug(categories, "mu"),
    } as const;
  }, [categories]);

  const getSearchValue = () => {
    const v =
      searchRefMobile.current?.value || searchRefDesktop.current?.value || "";
    return v.trim();
  };

  const submitSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = getSearchValue();

    navigate(
      buildProductsUrl({
        searchKey: trimmed || undefined,
        page: 1,
        limit: 12,
      }),
    );

    setOpen(false);
  };

  const logo = (
    <div className="flex items-center">
      <img
        src={logoImg}
        alt="Young Diamond"
        className="
        h-7 md:h-8 lg:h-9
        w-auto
        object-contain
        select-none
      "
        loading="eager"
        draggable={false}
      />
    </div>
  );

  const getMenuLink = (key: MenuKey): string | null => {
    if (key === "home") return "/";
    if (key === "contact") return "/contact";
    if (key === "shop") return buildProductsUrl({ page: 1, limit: 12 });

    const id =
      key === "bracelet"
        ? categoryIds.bracelet
        : key === "necklace"
          ? categoryIds.necklace
          : key === "earring"
            ? categoryIds.earring
            : categoryIds.hat;

    return id
      ? buildProductsUrl({ product_category_id: id, page: 1, limit: 12 })
      : null;
  };

  const activeKey: MenuKey | null = useMemo(() => {
    if (location.pathname === "/") return "home";
    if (location.pathname.startsWith("/contact")) return "contact";

    if (location.pathname === "/products") {
      const sp = new URLSearchParams(location.search);
      const catId = sp.get("product_category_id");

      if (!catId) return "shop";

      if (catId === categoryIds.bracelet) return "bracelet";
      if (catId === categoryIds.necklace) return "necklace";
      if (catId === categoryIds.earring) return "earring";
      if (catId === categoryIds.hat) return "hat";

      return "shop";
    }

    return null;
  }, [
    location.pathname,
    location.search,
    categoryIds.bracelet,
    categoryIds.necklace,
    categoryIds.earring,
    categoryIds.hat,
  ]);

  const isCategoryKey = (k: MenuKey) =>
    k === "bracelet" || k === "necklace" || k === "earring" || k === "hat";

  const renderNavItem = (
    it: (typeof menu)[number],
    variant: "desktop" | "mobile",
  ) => {
    const to = getMenuLink(it.key);
    const disabled = isCategoryKey(it.key) && to === null;
    const active = activeKey === it.key;

    if (variant === "desktop") {
      if (disabled) {
        return (
          <span
            key={it.key}
            className="text-xs tracking-[0.2em] uppercase pb-1 text-neutral-600 border-b border-transparent cursor-not-allowed"
            title="Đang tải danh mục..."
          >
            {it.label}
          </span>
        );
      }

      return (
        <Link
          key={it.key}
          to={to || "/"}
          className={`text-xs tracking-[0.2em] uppercase pb-1 ${cnActive(active)}`}
        >
          {it.label}
        </Link>
      );
    }

    // mobile
    if (disabled) {
      return (
        <span
          key={it.key}
          className="px-3 py-2 rounded-md border border-white/10 text-sm tracking-wide bg-black text-neutral-600 cursor-not-allowed"
          title="Đang tải danh mục..."
        >
          {it.label}
        </span>
      );
    }

    return (
      <Link
        key={it.key}
        to={to || "/"}
        onClick={() => setOpen(false)}
        className={[
          "px-3 py-2 rounded-md border text-sm tracking-wide",
          active
            ? "bg-white text-black border-white"
            : "bg-black text-neutral-200 border-white/10 hover:bg-white/5 hover:border-white/20",
        ].join(" ")}
      >
        {it.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Left: Logo */}
          <Link to="/" className="shrink-0" aria-label="Young Diamond">
            {logo}
          </Link>

          {/* Center: Nav (desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-7 flex-1">
            {menu.map((it) => renderNavItem(it, "desktop"))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search (desktop) */}
            <form
              onSubmit={submitSearch}
              className="hidden md:flex items-center"
            >
              <div className="flex items-center border border-white/15 rounded-full px-3 h-9 bg-black/40">
                <span className="text-neutral-300 text-sm mr-2">⌕</span>
                <input
                  ref={searchRefDesktop}
                  defaultValue={urlSearchKey}
                  placeholder="Search..."
                  className="w-52 bg-transparent outline-none text-sm text-white placeholder:text-neutral-500"
                />
              </div>
            </form>

            {/* Cart */}
            <Link
              to="/cart"
              className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5"
              aria-label="Cart"
              title="Cart"
            >
              <span className="text-white">🛒</span>
            </Link>

            {/* Mobile menu */}
            <button
              className="lg:hidden h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5"
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              <span className="text-white">{open ? "✕" : "≡"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="lg:hidden border-t border-white/10 bg-black">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Search mobile */}
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <div className="flex items-center border border-white/15 rounded-full px-3 h-10 flex-1 bg-black/40">
                <span className="text-neutral-300 text-sm mr-2">⌕</span>
                <input
                  ref={searchRefMobile}
                  defaultValue={urlSearchKey}
                  placeholder="Search products..."
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-neutral-500"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-full bg-white text-black text-sm hover:opacity-90"
              >
                Search
              </button>
            </form>

            {/* Menu items */}
            <div className="mt-4 grid gap-2">
              {menu.map((it) => renderNavItem(it, "mobile"))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
