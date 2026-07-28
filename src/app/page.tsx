import { TopBar } from "@/components/layout/TopBar";
import { HeroSection } from "@/components/layout/HeroSection";
import { PricingPlansSection } from "@/components/pricing/PricingPlansSection";
import { HomepageCarousels } from "@/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <TopBar />
      <HeroSection />

      {/* ── Course discovery carousels ── */}
      <section className="mx-auto max-w-[1280px] px-6 py-12 xl:px-10">
        <HomepageCarousels />
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-16 xl:px-10">
        <PricingPlansSection heading="Plans that support every stage of your learning journey" intro="Students can start with the Free plan and upgrade when they want deeper tools, while instructors can unlock analytics and better learner engagement with Pro." />
      </section>
    </div>
  );
}