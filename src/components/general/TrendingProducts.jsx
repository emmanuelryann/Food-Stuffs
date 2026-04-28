import '../../styles/general/trendingProducts.css';

const TrendingProducts = () => {
  const products = [
    { id: 1, name: 'Tomatos', price: '$5.99', oldPrice: '$8.99', image: 'https://images.unsplash.com/photo-1561136594-7f68413a279f?w=300&h=300&fit=crop', rating: 4 },
    { id: 2, name: 'Lettuce', price: '$2.99', oldPrice: '$5.99', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop', rating: 5 },
    { id: 3, name: 'Corn', price: '$3.99', oldPrice: '$6.99', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop', rating: 4 },
    { id: 4, name: 'Cabbage', price: '$1.99', oldPrice: '$4.99', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300&h=300&fit=crop', rating: 5 },
  ];

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={i < count ? '#ffa726' : '#e0e0e0'}
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ));
  };

  return (
    <section className="trending-products">
      <div className="trending-container">
        <h2 className="section-title">Trending Products</h2>

        <div className="trending-grid">
          {products.map((product) => (
            <div key={product.id} className="trending-card">
              <div className="trending-card-image">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/300x300/e8f5e9/4caf50?text=${product.name}`;
                  }}
                />
                <button className="trending-cart-btn" aria-label={`Add ${product.name} to cart`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                  </svg>
                </button>
              </div>
              <div className="trending-card-info">
                <h3>{product.name}</h3>
                <div className="trending-stars">{renderStars(product.rating)}</div>
                <div className="trending-price-row">
                  <span className="trending-price">{product.price}</span>
                  <span className="trending-old-price">{product.oldPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
