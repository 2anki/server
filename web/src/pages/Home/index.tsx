import TestimonialsSection from './components/Sections/testimonials';
import BenefitsSection from './components/Sections/benefits';
import AboutSection from './components/Sections/about';
import HeroSection from './components/Sections/hero';
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
