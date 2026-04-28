import { useState } from 'react';
import '../../styles/general/newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setEmail('');
    }
  };

  const brands = ['OPPO', 'DELL', 'Lenovo', 'ASUS', 'Apple', 'SONY'];

  return (
    <section className="newsletter-section">
      {/* Brand Logos */}
      <div className="brands-bar">
        <div className="brands-container">
          {brands.map((brand) => (
            <span key={brand} className="brand-name">{brand}</span>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="newsletter">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Join Our Cosmetics News &amp; Offers</h2>
          <p className="newsletter-text">
            Subscribe to our newsletter and get exclusive deals, latest updates, and special offers delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
              id="newsletter-email"
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
