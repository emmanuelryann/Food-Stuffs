import '../../styles/general/bannerSection.css';

const BannerSection = () => {
  return (
    <section className="banner-section">
      <div className="banners-container">
        <div className="banner banner-green">
          <div className="banner-content">
            <h3 className="banner-title">Natural Vegetables</h3>
            <p className="banner-text">Get 40% off on all organic vegetables</p>
            <a href="#products" className="banner-btn">
              Shop Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
          </div>
          <div className="banner-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
              alt="Fresh natural vegetables"
              loading="lazy"
            />
          </div>
        </div>

        <div className="banner banner-light">
          <div className="banner-content">
            <h3 className="banner-title">Specially Fresh</h3>
            <p className="banner-text">Only fresh &amp; organic foods daily</p>
            <a href="#products" className="banner-btn banner-btn-outline">
              Shop Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
          </div>
          <div className="banner-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=300&fit=crop"
              alt="Fresh specialty vegetables"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
