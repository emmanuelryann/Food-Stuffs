import '../../styles/general/weLoveTrend.css';

const WeLoveTrend = () => {
  const products = [
    { id: 1, name: 'Tomatos', price: '$5.99 – $15.99', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop', rating: 4 },
    { id: 2, name: 'Limes', price: '$2.99 – $8.99', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop', rating: 5 },
    { id: 3, name: 'Broccoli', price: '$3.99 – $10.99', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=300&fit=crop', rating: 4 },
    { id: 4, name: 'Cabbage', price: '$1.99 – $6.99', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300&h=300&fit=crop', rating: 5 },
    { id: 5, name: 'Lemon', price: '$0.99 – $3.99', image: 'https://images.unsplash.com/photo-1582287014914-3f3c1bbd9e65?w=300&h=300&fit=crop', rating: 4 },
    { id: 6, name: 'Cucumber', price: '$2.99 – $7.99', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=300&fit=crop', rating: 5 },
    { id: 7, name: 'Beetroot', price: '$3.99 – $9.99', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber7e1?w=300&h=300&fit=crop', rating: 4 },
    { id: 8, name: 'Potato', price: '$2.99 – $8.99', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber7e0?w=300&h=300&fit=crop', rating: 5 },
  ];

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={i < count ? '#ffa726' : '#e0e0e0'}
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ));
  };

  return (
    <section className="we-love-trend" id="products">
      <div className="trend-container">
        <h2 className="section-title">We Love Trend</h2>

        <div className="trend-grid">
          {products.map((product) => (
            <div key={product.id} className="trend-card">
              <div className="trend-card-image">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/300x300/e8f5e9/4caf50?text=${product.name}`;
                  }}
                />
              </div>
              <div className="trend-card-info">
                <h3>{product.name}</h3>
                <div className="trend-stars">{renderStars(product.rating)}</div>
                <p className="trend-price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeLoveTrend;
