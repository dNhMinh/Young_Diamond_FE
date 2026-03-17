//src/components/client/common/Header.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { homeApi } from "../../../api/client/home.api";
import type { HomeCategory } from "../../../api/client/home.api";
import logoImg from "../../../assets/YDlogo.jpg";
import { useCart } from "../../../context/CartContext";

type MenuKey =
  | "home"
  | "shop"
  | "bracelet"
  | "necklace"
  | "earring"
  | "hat"
  | "agent_request";

const AGENT_ROUTE = "/agent-request";

const menu: Array<{ key: MenuKey; label: string }> = [
  { key: "home", label: "HOME" },
  { key: "shop", label: "SHOP" },
  { key: "bracelet", label: "VÒNG TAY" },
  { key: "necklace", label: "VÒNG CỔ" },
  { key: "earring", label: "KHUYÊN TAI" },
  { key: "hat", label: "MŨ" },
  { key: "agent_request", label: "ĐĂNG KÝ ĐẠI LÝ" },
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

/** label hiển thị cho category (an toàn nếu BE đổi field name) */
function getCategoryLabel(c: HomeCategory) {
  const maybe = c as unknown as {
    name?: string;
    title?: string;
    label?: string;
    slug?: string;
  };
  const raw =
    maybe.name || maybe.title || maybe.label || maybe.slug || "CATEGORY";
  return String(raw);
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.5 7h14l-1.2 7.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.6L5.7 4.8A1.8 1.8 0 0 0 4 3.5H2.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20.5a1 1 0 1 0 0.01 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 20.5a1 1 0 1 0 0.01 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [shopHoverOpen, setShopHoverOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { totals } = useCart();
  const cartCount = totals.itemCount;

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
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          if (alive) setCategories([]);
          return;
        }
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
        className="h-7 md:h-8 lg:h-9 w-auto object-contain select-none"
        loading="eager"
        draggable={false}
      />
    </div>
  );

  const getMenuLink = (key: MenuKey): string | null => {
    if (key === "home") return "/";
    if (key === "agent_request") return AGENT_ROUTE;
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
    if (location.pathname.startsWith(AGENT_ROUTE)) return "agent_request";

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

  // SHOP dropdown (desktop only)
  const renderShopDesktop = () => {
    const to = getMenuLink("shop") || "/";
    const active = activeKey === "shop";
    const linkClass = `text-xs tracking-[0.2em] uppercase pb-1 ${cnActive(active)}`;

    return (
      <div
        key="shop"
        className="relative inline-flex items-center"
        onMouseEnter={() => setShopHoverOpen(true)}
        onMouseLeave={() => setShopHoverOpen(false)}>
        <Link
          to={to}
          className={`${linkClass} inline-flex items-center gap-2 leading-none`}
          aria-haspopup="menu"
          aria-expanded={shopHoverOpen}
          onFocus={() => setShopHoverOpen(true)}
          onBlur={() => setShopHoverOpen(false)}>
          <span>SHOP</span>
          <span className={active ? "text-white" : "text-neutral-400"}>▾</span>
        </Link>

        {shopHoverOpen ? (
          <>
            <div className="absolute left-0 right-0 top-full h-3" aria-hidden />
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
              role="menu">
              <div className="min-w-[240px] bg-black/95 backdrop-blur border border-white/10 shadow-xl overflow-hidden">
                <div className="py-2">
                  {categories.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-neutral-400">
                      Đang tải danh mục...
                    </div>
                  ) : (
                    categories.map((c) => {
                      const catTo = buildProductsUrl({
                        product_category_id: c._id,
                        page: 1,
                        limit: 12,
                      });

                      return (
                        <Link
                          key={c._id}
                          to={catTo}
                          onClick={() => setShopHoverOpen(false)}
                          className="block px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 hover:text-white transition"
                          role="menuitem">
                          {getCategoryLabel(c)}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const renderNavItem = (
    it: (typeof menu)[number],
    variant: "desktop" | "mobile",
  ) => {
    if (variant === "desktop" && it.key === "shop") {
      return renderShopDesktop();
    }

    const to = getMenuLink(it.key);
    const disabled = isCategoryKey(it.key) && to === null;
    const active = activeKey === it.key;

    if (variant === "desktop") {
      if (disabled) {
        return (
          <span
            key={it.key}
            className="text-xs tracking-[0.2em] uppercase pb-1 text-neutral-600 border-b border-transparent cursor-not-allowed"
            title="Đang tải danh mục...">
            {it.label}
          </span>
        );
      }

      return (
        <Link
          key={it.key}
          to={to || "/"}
          className={`text-xs tracking-[0.2em] uppercase pb-1 ${cnActive(active)}`}>
          {it.label}
        </Link>
      );
    }

    if (disabled) {
      return (
        <span
          key={it.key}
          className="px-3 py-2 rounded-md border border-white/10 text-sm tracking-wide bg-black text-neutral-600 cursor-not-allowed"
          title="Đang tải danh mục...">
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
        ].join(" ")}>
        {it.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link to="/" className="shrink-0" aria-label="Young Diamond">
            {logo}
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-7 flex-1">
            {menu.map((it) => renderNavItem(it, "desktop"))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <form
              onSubmit={submitSearch}
              className="hidden md:flex items-center">
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

            <Link
              to="/cart"
              className={[
                "relative h-9 w-10 rounded-full border border-white/15",
                "flex items-center justify-center",
                "hover:bg-white/5 transition",
                "active:scale-[0.98]",
              ].join(" ")}
              aria-label="Cart"
              title="Giỏ hàng">
              <span className="text-white">
                <CartIcon />
              </span>

              {cartCount > 0 ? (
                <span
                  className="
                    absolute -top-1 -right-1
                    min-w-5 h-5 px-1
                    rounded-full
                    bg-white text-black
                    text-[11px] font-semibold
                    grid place-items-center
                    border border-black/20
                    select-none
                  "
                  aria-label={`Cart items: ${cartCount}`}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

            <button
              className="lg:hidden h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5"
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu">
              <span className="text-white">{open ? "✕" : "≡"}</span>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden border-t border-white/10 bg-black">
          <div className="max-w-7xl mx-auto px-4 py-4">
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
                className="h-10 px-4 rounded-full bg-white text-black text-sm hover:opacity-90">
                Search
              </button>
            </form>

            <div className="mt-4 grid gap-2">
              {menu.map((it) => renderNavItem(it, "mobile"))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
