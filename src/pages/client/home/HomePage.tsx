//src/pages/client/home/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
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
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);

        // banners
        const b = await homeApi.getBanners();

        // featured (ASSUMPTION: type=sales)
        const feat = await productsApi.list({
          page: 1,
          limit: 12,
          type: "sales",
        });

        // new products (API home trả detail, nhưng ta muốn card => map)
        const newRes = await homeApi.getNewProducts();

        // reviews
        const rv = await reviewsApi.list();

        if (!alive) return;

        setBanners(b.data || []);

        setFeatured(feat.data || []);

        // map ProductDetail -> ProductCardDTO
        const mappedNew: ProductCardDTO[] = (newRes.data || []).map(
          (p: ProductDetailWithMeta): ProductCardDTO => ({
            _id: p._id,
            title: p.title,
            price: p.price,
            discount: p.discount,
            slug: p.slug,
            image: p.images?.[0] || "",
          }),
        );
        setNewProducts(mappedNew);

        setReviews(rv.data || []);
      } catch (err) {
        // bạn có thể add toast sau
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
