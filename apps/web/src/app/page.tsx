import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProductTour } from '@/components/landing/ProductTour';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { FeatureSlider } from '@/components/landing/FeatureSlider';
import { LandingCompliance } from '@/components/landing/LandingCompliance';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingTestimonials } from '@/components/landing/LandingTestimonials';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white overflow-x-hidden">
      {/* 1. Sticky Nav */}
      <LandingNav />

      {/* 2. Hero — animated, live dashboard preview, count-up stats */}
      <LandingHero />

      {/* 3. Interactive Product Tour — 5 steps, auto-advancing, one-shot understanding */}
      <ProductTour />

      {/* 4. Live Demo — full interactive dashboard, NO login required */}
      <LiveDemo />

      {/* 5. Feature Slider — 6 modules with live visual previews */}
      <FeatureSlider />

      {/* 6. Compliance Coverage — Malaysia + Australia */}
      <LandingCompliance />

      {/* 7. Pricing — 3 tiers */}
      <LandingPricing />

      {/* 8. Testimonials — Roy Chen, Winne Ahmad, Jonne Williams, Priya Nair */}
      <LandingTestimonials />

      {/* 9. FAQ */}
      <LandingFAQ />

      {/* 10. Footer */}
      <LandingFooter />
    </main>
  );
}
