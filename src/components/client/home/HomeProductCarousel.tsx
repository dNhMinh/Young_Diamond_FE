// src/components/client/home/HomeProductCarousel.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../products/ProductCard";
import SectionTitle from "../common/SectionTitle";
import type { ProductCardDTO } from "../../../api/client/products.api";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductCardDTO[];
  autoPlayMs?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function HomeProductCarousel({
  title,
  subtitle,
  products,
  autoPlayMs = 3200,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isHover, setIsHover] = useState(false);

  const pageRef = useRef(0);
  const pageCountRef = useRef(1);

  const canShow = useMemo(() => products?.length > 0, [products]);

  const computePages = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const sw = el.scrollWidth;

    if (w <= 0) {
      setPageCount((prev) => (prev === 1 ? prev : 1));
      pageCountRef.current = 1;
      setPage((prev) => (prev === 0 ? prev : 0));
      pageRef.current = 0;
      return;
    }

    const pages = Math.max(1, Math.ceil((sw - w) / w) + 1);
    const current = clamp(Math.round(el.scrollLeft / w), 0, pages - 1);

    setPageCount((prev) => (prev === pages ? prev : pages));
    pageCountRef.current = pages;

    setPage((prev) => (prev === current ? prev : current));
    pageRef.current = current;
  };

  const goToPage = (nextPage: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    const pages = pageCountRef.current;
    const p = clamp(nextPage, 0, pages - 1);

    const w = el.clientWidth || 1;
    el.scrollTo({ left: p * w, behavior: "smooth" });

    setPage((prev) => (prev === p ? prev : p));
    pageRef.current = p;
  };

  const goPrev = () => {
    const pages = pageCountRef.current;
    const next = pageRef.current <= 0 ? pages - 1 : pageRef.current - 1;
    goToPage(next);
  };

  const goNext = () => {
    const pages = pageCountRef.current;
    const next = (pageRef.current + 1) % pages;
    goToPage(next);
  };

  useEffect(() => {
    if (!canShow) return;

    const el = scrollerRef.current;
    if (!el) return;

    let rafCompute = 0;
    let rafScroll = 0;

    rafCompute = window.requestAnimationFrame(() => {
      computePages();
    });

    const onScroll = () => {
      if (rafScroll) return;
      rafScroll = window.requestAnimationFrame(() => {
        rafScroll = 0;

        const w = el.clientWidth || 1;
        const pages = pageCountRef.current;
        const current = clamp(Math.round(el.scrollLeft / w), 0, pages - 1);

        if (current !== pageRef.current) {
          pageRef.current = current;
          setPage(current);
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      if (rafCompute) window.cancelAnimationFrame(rafCompute);
      rafCompute = window.requestAnimationFrame(() => {
        computePages();
      });
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafCompute) window.cancelAnimationFrame(rafCompute);
      if (rafScroll) window.cancelAnimationFrame(rafScroll);
    };
  }, [canShow, products.length]);

  useEffect(() => {
    if (!canShow) return;
    if (pageCount <= 1) return;
    if (isHover) return;

    const id = window.setInterval(() => {
      const next = (pageRef.current + 1) % pageCountRef.current;
      goToPage(next);
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [canShow, pageCount, isHover, autoPlayMs]);

  if (!canShow) return null;

  return (
    <section className="py-12">
      <div className="flex items-end justify-between">
        <SectionTitle title={title} subtitle={subtitle} />
      </div>

      {/* <div
        ref={scrollerRef}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="
          mt-6 flex overflow-x-auto
          snap-x snap-mandatory scroll-smooth
          pb-2
          gap-6
          [-ms-overflow-style:none] [scrollbar-width:none]
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {products.map((p) => (
          <div
            key={p._id}
            className="
              snap-start shrink-0
              w-[88%]
              sm:w-[calc((100%-1.5rem)/2)]
              lg:w-[calc((100%-4.5rem)/4)]
            "
          >
            <ProductCard p={p} />
          </div>
        ))}
      </div> */}

      <div className="group relative mt-6">
        {pageCount > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous products"
              className="
    absolute left-3 top-1/2 z-10 -translate-y-1/2
    flex h-11 w-11 items-center justify-center
    rounded-full
    border border-white/70
    bg-white/75 text-black/80
    backdrop-blur-md
    shadow-[0_8px_24px_rgba(0,0,0,0.12)]
    opacity-0 group-hover:opacity-100
    transition-all duration-200
    hover:-translate-y-1/2 hover:scale-105 hover:bg-white hover:text-black hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)]
    active:scale-95
  ">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true">
                <path
                  d="M14.5 6.5L9 12L14.5 17.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next products"
              className="
    absolute right-3 top-1/2 z-10 -translate-y-1/2
    flex h-11 w-11 items-center justify-center
    rounded-full
    border border-white/70
    bg-white/75 text-black/80
    backdrop-blur-md
    shadow-[0_8px_24px_rgba(0,0,0,0.12)]
    opacity-0 group-hover:opacity-100
    transition-all duration-200
    hover:-translate-y-1/2 hover:scale-105 hover:bg-white hover:text-black hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)]
    active:scale-95
  ">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true">
                <path
                  d="M9.5 6.5L15 12L9.5 17.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        ) : null}

        <div
          ref={scrollerRef}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className="
      flex overflow-x-auto
      snap-x snap-mandatory scroll-smooth
      pb-2
      gap-6
      [-ms-overflow-style:none] [scrollbar-width:none]
    "
          style={{ WebkitOverflowScrolling: "touch" }}>
          <style>{`div::-webkit-scrollbar{display:none}`}</style>

          {products.map((p) => (
            <div
              key={p._id}
              className="
          snap-start shrink-0
          w-[88%]
          sm:w-[calc((100%-1.5rem)/2)]
          lg:w-[calc((100%-4.5rem)/4)]
        ">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          {Array.from({ length: pageCount }).map((_, idx) => {
            const active = idx === page;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToPage(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={[
                  "h-2 w-2 rounded-full transition-all",
                  active ? "bg-black" : "bg-neutral-300 hover:bg-neutral-400",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
