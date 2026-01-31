import { useEffect, useMemo, useRef, useState } from "react";
import SectionTitle from "../common/SectionTitle";
import type { FeedbackReview } from "../../../api/client/reviews.api";

type Props = {
  reviews: FeedbackReview[];
  autoPlayMs?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function clampText(text: string, max = 320) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

function displayName(name: string) {
  const n = (name || "").trim();
  if (!n) return "ANONYMOUS";
  return n.toUpperCase();
}

export default function HomeReviews({ reviews, autoPlayMs = 3800 }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isHover, setIsHover] = useState(false);

  const pageRef = useRef(0);
  const pageCountRef = useRef(1);

  const canShow = useMemo(() => (reviews?.length || 0) > 0, [reviews]);

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

  useEffect(() => {
    const el = scrollerRef.current;
    if (!canShow || !el) return;

    let rafCompute = 0;
    let rafScroll = 0;

    rafCompute = window.requestAnimationFrame(() => computePages());

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
      rafCompute = window.requestAnimationFrame(() => computePages());
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafCompute) window.cancelAnimationFrame(rafCompute);
      if (rafScroll) window.cancelAnimationFrame(rafScroll);
    };
  }, [canShow, reviews.length]);

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
    <section className="py-16">
      <SectionTitle title="Customer Reviews." subtitle={undefined} />

      <div
        ref={scrollerRef}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="
          mt-10 flex gap-10 overflow-x-auto
          snap-x snap-mandatory scroll-smooth
          pb-10
          [-ms-overflow-style:none] [scrollbar-width:none]
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {reviews.map((r) => (
          <div
            key={r._id}
            className="
      snap-start shrink-0
      w-full
      sm:w-[calc((100%-2.5rem)/2)]
      lg:w-[calc((100%-7.5rem)/4)]
    "
          >
            <div className="min-h-[180px] flex flex-col">
              <p
                className="
          text-[15px] leading-[1.9]
          text-neutral-500 italic
          whitespace-pre-line
        "
              >
                “{clampText(r.content, 420)}”
              </p>

              <div className="text-center mt-[clamp(30px,1.6vh,18px)]">
                <div
                  className="
      text-[11px] md:text-[12px]
      tracking-[0.35em]
      font-semibold
      text-neutral-900
    "
                >
                  — {displayName(r.fullName)} —
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-3">
          {Array.from({ length: pageCount }).map((_, idx) => {
            const active = idx === page;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToPage(idx)}
                aria-label={`Go to review page ${idx + 1}`}
                className={[
                  "h-2 w-2 rounded-full transition-all",
                  active
                    ? "bg-neutral-800"
                    : "bg-neutral-200 hover:bg-neutral-300",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
