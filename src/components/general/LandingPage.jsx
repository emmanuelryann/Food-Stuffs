import Header from './Header';
import HeroSection from './HeroSection';
import FeatureIcons from './FeatureIcons';
import LatestProducts from './LatestProducts';
import WhyChooseUs from './WhyChooseUs';
import BannerSection from './BannerSection';
import TrendingProducts from './TrendingProducts';
import ClientTestimonials from './ClientTestimonials';
import SpecialDiscount from './SpecialDiscount';
import LatestBlog from './LatestBlog';
import Newsletter from './Newsletter';
import Footer from './Footer';
import '../../styles/general/landingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main>
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
