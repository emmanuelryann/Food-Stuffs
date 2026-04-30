import '../../styles/general/heroSection.css';

const HeroSection = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-subtitle">Fresh & Healthy</p>
          <h2 className="hero-title">Organics Vegetables</h2>
          <p className="hero-description">
            Our store offers you always fresh vegetables all year round. Buy from a wide range of high quality organic vegetables.
          </p>
          <a href="#products" className="hero-btn">
            SHOP NOW
          </a>
        </div>
        <div className="hero-image-wrapper">
          <img
            src="https://images.pexels.com/photos/33975355/pexels-photo-33975355.jpeg"
            alt="Fresh organic vegetables in a basket"
            className="hero-image"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;