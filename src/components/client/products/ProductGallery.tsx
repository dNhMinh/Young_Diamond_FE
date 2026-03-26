//src/components/client/products/ProductGallery.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export default function ProductGallery({ images, title }: Props) {
  const safeImages = useMemo(() => images?.filter(Boolean) || [], [images]);
  const [active, setActive] = useState(0);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [isHover, setIsHover] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0, px: 50, py: 50 });

  useEffect(() => {
    setActive(0);
  }, [images]);
  const activeSrc = safeImages[active] || safeImages[0] || "";

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const px = Math.max(0, Math.min(100, (x / r.width) * 100));
    const py = Math.max(0, Math.min(100, (y / r.height) * 100));

    setLens({
      x: Math.max(0, Math.min(r.width, x)),
      y: Math.max(0, Math.min(r.height, y)),
      px,
      py,
    });
  };

  return (
    <div className="grid grid-cols-[84px_1fr] gap-6">
      {/* Thumbs */}
      <div className="hidden md:flex flex-col gap-4">
        {safeImages.map((src, idx) => {
          const activeThumb = idx === active;
          return (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={[
                "w-[72px] aspect-square overflow-hidden bg-white",
                activeThumb
                  ? "ring-1 ring-black"
                  : "ring-1 ring-black/10 hover:ring-black/30",
              ].join(" ")}
              aria-label={`View image ${idx + 1}`}>
              <img
                src={src}
                alt={title}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Main */}
      <div className="w-full">
        {/* Mobile thumbs (row) */}
        {safeImages.length > 1 ? (
          <div className="md:hidden mb-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
            <style>{`div::-webkit-scrollbar{display:none}`}</style>
            {safeImages.map((src, idx) => {
              const activeThumb = idx === active;
              return (
                <button
                  key={src + idx}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={[
                    "shrink-0 w-[64px] aspect-square overflow-hidden bg-white",
                    activeThumb ? "ring-1 ring-black" : "ring-1 ring-black/10",
                  ].join(" ")}>
                  <img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          ref={wrapRef}
          className="relative bg-white"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onMouseMove={onMove}>
          <div className="w-full aspect-square bg-neutral-50 overflow-hidden">
            <img
              src={activeSrc}
              alt={title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Lens (desktop) */}
          {isHover && activeSrc ? (
            <div
              className="hidden md:block pointer-events-none absolute"
              style={{
                left: lens.x,
                top: lens.y,
                transform: "translate(-50%, -50%)",
              }}>
              <div
                className="rounded-full border border-black/20 shadow-[0_10px_40px_rgba(0,0,0,0.18)]"
                style={{
                  width: 260,
                  height: 260,
                  backgroundImage: `url(${activeSrc})`,
                  backgroundRepeat: "no-repeat",
                  // zoom level:
                  backgroundSize: "240%",
                  backgroundPosition: `${lens.px}% ${lens.py}%`,
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
