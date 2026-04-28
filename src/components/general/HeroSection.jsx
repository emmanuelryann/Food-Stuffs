import '../../styles/general/heroSection.css';

const HeroSection = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-subtitle">Fresh &amp; Healthy</p>
          <h2 className="hero-title">
            Organics <span>Vegetables</span>
          </h2>
          <p className="hero-description">
            Get fresh organic vegetables delivered right to your doorstep. 
            We source only the finest naturally-grown produce for your family.
          </p>
          <a href="#products" className="hero-btn">
            Shop Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </a>
        </div>
        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=500&fit=crop"
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
