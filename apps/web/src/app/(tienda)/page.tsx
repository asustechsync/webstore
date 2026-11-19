import { BrandBanner } from "@/components/home/brand-banner";
import { Collections } from "@/components/home/collections";
import { DealsRail } from "@/components/home/deals-rail";
import { HeroBanners } from "@/components/home/hero-banners";
import { ProductShowcase } from "@/components/home/product-showcase";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-[88rem] flex-col gap-4 px-4 py-4">
      <HeroBanners />
      <DealsRail />
      <ProductShowcase />
      <Collections />
      <BrandBanner />
    </div>
  );
}
