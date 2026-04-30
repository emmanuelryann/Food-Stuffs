import '../../styles/general/weLoveTrend.css';

const WeLoveTrend = () => {
  const products = [
    { id: 1, name: 'Tomatos', price: '$5.99 – $15.99', image: 'https://images.pexels.com/photos/209401/pexels-photo-209401.jpeg', rating: 4 },
    { id: 2, name: 'Limes', price: '$2.99 – $8.99', image: 'https://images.pexels.com/photos/13427978/pexels-photo-13427978.jpeg', rating: 5 },
    { id: 3, name: 'Broccoli', price: '$3.99 – $10.99', image: 'https://images.pexels.com/photos/4564501/pexels-photo-4564501.jpeg', rating: 4 },
    { id: 4, name: 'Cabbage', price: '$1.99 – $6.99', image: 'https://images.pexels.com/photos/13796758/pexels-photo-13796758.jpeg', rating: 5 },
    { id: 5, name: 'Lemon', price: '$0.99 – $3.99', image: 'https://images.pexels.com/photos/4090363/pexels-photo-4090363.jpeg', rating: 4 },
    { id: 6, name: 'Cucumber', price: '$2.99 – $7.99', image: 'https://media.istockphoto.com/id/492532141/photo/fresh-cucumber-on-the-wooden-table.jpg?b=1&s=612x612&w=0&k=20&c=ou_VjDds9-p9wY3n4KN7dKmbT2gnu0PUoTjUAPrGsks=', rating: 5 },
    { id: 7, name: 'Beetroot', price: '$3.99 – $9.99', image: 'https://media.istockphoto.com/id/599695694/photo/red-beetroot-with-green-leaves.jpg?b=1&s=612x612&w=0&k=20&c=i-hlI4ExXT2N-Uq1dOR6rpozW8it_rMGpSjgbWRK800=', rating: 4 },
    { id: 8, name: 'Potato', price: '$2.99 – $8.99', image: 'https://media.istockphoto.com/id/1475113258/photo/raw-potatoes-freshly-cut-in-half-isolated-on-white-background.jpg?b=1&s=612x612&w=0&k=20&c=1puUzCqolMdFTkXNb6z5WBWF00y0F917ElKt9Enc8x4=', rating: 5 },
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
                <p className="trend-price">{product.price}</p>
                <div className="trend-stars">{renderStars(product.rating)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeLoveTrend;
