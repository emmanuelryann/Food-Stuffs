import { useEffect, useRef } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import FeatureIcons from './FeatureIcons';
import LatestProducts from './LatestProducts';
import WhyChooseUs from './WhyChooseUs';
import BannerSection from './BannerSection';
import TrendingProducts from './TrendingProducts';
// import ClientTestimonials from './ClientTestimonials';
import SpecialDiscount from './SpecialDiscount';
import LatestBlog from './LatestBlog';
import Newsletter from './Newsletter';
import Footer from './Footer';
import '../../styles/general/landingPage.css';

const LandingPage = () => {
  const mainRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (mainRef.current) {
      const sections = mainRef.current.children;
      Array.from(sections).forEach((section) => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Header />
      <main ref={mainRef}>
        <HeroSection />
        <FeatureIcons />
        <LatestProducts />
        <WhyChooseUs />
        <BannerSection />
        <TrendingProducts />
        {/* <ClientTestimonials /> */}
        <SpecialDiscount />
        <LatestBlog />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
