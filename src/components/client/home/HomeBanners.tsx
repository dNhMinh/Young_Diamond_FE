import type { HomeBanner } from "../../../api/client/home.api";

type Props = {
  banners: HomeBanner[];
  index: number; // 0..2 (banner 1/2/3)
};

function isVideoUrl(url?: string) {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("/video/") ||
    u.endsWith(".mp4") ||
    u.endsWith(".webm") ||
    u.endsWith(".mov") ||
    u.endsWith(".m4v") ||
    u.endsWith(".ogg")
  );
}

export default function HomeBanners({ banners, index }: Props) {
  if (!banners || banners.length === 0) return null;

  const banner = banners[index] || banners[0];
  const isVideo = isVideoUrl(banner.imageUrl);

  return (
    <section className="py-6">
      <a
        href={banner.linkUrl || "#"}
        className="
          block overflow-hidden 
          bg-neutral-100
        "
      >
        <div
          className="
            w-full
            aspect-[16/10]
            md:aspect-[16/9]
            lg:aspect-[16/8]
            min-h-[280px]
            md:min-h-[360px]
            lg:min-h-[420px]
            bg-neutral-200
          "
        >
          {isVideo ? (
            <video
              src={banner.imageUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={banner.imageUrl}
              alt={banner.altText || "banner"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </a>
    </section>
  );
}
