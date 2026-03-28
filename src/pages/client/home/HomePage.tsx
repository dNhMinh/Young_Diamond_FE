//src/pages/client/home/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HomeBanners from "../../../components/client/home/HomeBanners";
import HomeProductCarousel from "../../../components/client/home/HomeProductCarousel";
import HomeReviews from "../../../components/client/home/HomeReviews";

import { homeApi } from "../../../api/client/home.api";
import { productsApi } from "../../../api/client/products.api";
import { reviewsApi } from "../../../api/client/reviews.api";

import type { HomeBanner } from "../../../api/client/home.api";
import type { ProductCardDTO } from "../../../api/client/products.api";
import type { FeedbackReview } from "../../../api/client/reviews.api";
import type { ProductDetailWithMeta } from "../../../types/product";

export default function HomePage() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [featured, setFeatured] = useState<ProductCardDTO[]>([]);
  const [newProducts, setNewProducts] = useState<ProductCardDTO[]>([]);
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState(true);

  const featuredTitle = useMemo(() => "Featured", []);
  const newTitle = useMemo(() => "New Arrivals", []);

  useEffect(() => {
    document.title = "Young Diamond Store";
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);

        // banners
        let bannerData: HomeBanner[] = [];
        try {
          const b = await homeApi.getBanners();
          bannerData = b.data || [];
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            bannerData = [];
          } else {
            throw err;
          }
        }

        // featured (ASSUMPTION: type=sales)
        const feat = await productsApi.list({
          page: 1,
          limit: 12,
          type: "sales",
        });

        // new products (API home trả detail, nhưng ta muốn card => map)
        let newProductsData: ProductDetailWithMeta[] = [];
        try {
          const newRes = await homeApi.getNewProducts();
          newProductsData = newRes.data || [];
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            newProductsData = [];
          } else {
            throw err;
          }
        }

        // reviews
        const rv = await reviewsApi.list();

        if (!alive) return;

        setBanners(bannerData);

        const mappedFeatured: ProductCardDTO[] = [...(feat.data || [])]
          .sort((a, b) => {
            const posA =
              typeof a.position === "number"
                ? a.position
                : Number.MAX_SAFE_INTEGER;
            const posB =
              typeof b.position === "number"
                ? b.position
                : Number.MAX_SAFE_INTEGER;

            return posA - posB;
          })
          .map((p) => ({
            ...p,
            thumbnail: p.thumbnail || "",
          }));

        setFeatured(mappedFeatured);

        // NEW ARRIVALS:
        // sort theo position tăng dần, nhỏ hơn đứng trước
        const mappedNew: ProductCardDTO[] = [...newProductsData]
          .sort((a, b) => {
            const posA =
              typeof a.position === "number"
                ? a.position
                : Number.MAX_SAFE_INTEGER;
            const posB =
              typeof b.position === "number"
                ? b.position
                : Number.MAX_SAFE_INTEGER;

            return posA - posB;
          })
          .map(
            (p: ProductDetailWithMeta): ProductCardDTO => ({
              _id: p._id,
              title: p.title,
              price: p.price,
              discount: p.discount,
              slug: p.slug,
              thumbnail: p.thumbnail || p.variant?.[0]?.images?.[0] || "",
            }),
          );

        setNewProducts(mappedNew);
        setReviews(rv.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner 1 */}
        <HomeBanners banners={banners} index={0} />

        {/* Featured */}
        <HomeProductCarousel
          title={featuredTitle}
          subtitle="Nổi bật"
          products={featured}
        />

        {/* Banner 2 */}
        <HomeBanners banners={banners} index={1} />

        {/* New products */}
        <HomeProductCarousel
          title={newTitle}
          subtitle="Sản phẩm mới nhất"
          products={newProducts}
        />

        {/* Banner 3 */}
        <HomeBanners banners={banners} index={2} />

        {/* Reviews */}
        <HomeReviews reviews={reviews} />

        {loading ? (
          <div className="py-6 text-sm text-neutral-500">Loading...</div>
        ) : null}
      </div>
    </div>
  );
}
