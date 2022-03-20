import TestimonialsSection from './components/Sections/testimonials/TestimonialsSection';
import BenefitsSection from './components/Sections/benefits/BenefitsSection';
import AboutSection from './components/Sections/about/AboutSection';
import HeroSection from './components/Sections/hero/HeroSection';
import NewsSection from './components/Sections/news/NewsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <TestimonialsSection />
      <BenefitsSection />
      <NewsSection />
    </>
  );
}
