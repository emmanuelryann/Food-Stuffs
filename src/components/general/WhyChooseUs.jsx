import '../../styles/general/whyChooseUs.css';

const WhyChooseUs = () => {
  const reasons = [
    {
      id: 1,
      title: '100% Organic Buono',
      description: 'Organically verified 100% pure and natural foods',
    },
    {
      id: 2,
      title: 'Best Quality Standards',
      description: 'Premium quality produce at affordable prices',
    },
    {
      id: 3,
      title: 'Reasonably 100% Fresh Food',
      description: 'Fresh delivery guaranteed within 24 hours',
    },
    {
      id: 4,
      title: 'Price Beyond Access',
      description: 'Simple and secure ordering with easy payments',
    },
  ];

  return (
    <section className="why-choose-us" id="about">
      <div className="why-container">
        <div className="why-content">
          <h2 className="why-title">Why Choose us?</h2>
          <p className="why-subtitle">
            We provide the best organic products with premium quality and fast delivery to your doorstep.
          </p>

          <div className="reasons-list">
            {reasons.map((reason) => (
              <div key={reason.id} className="reason-item">
                <div className="reason-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div className="reason-text">
                  <h4>{reason.title}</h4>
                  <p>{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="why-image-wrapper">
          <div className="why-image-bg"></div>
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=600&fit=crop"
            alt="Delivery person with fresh vegetables"
            className="why-image"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
