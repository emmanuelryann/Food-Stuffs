import { useState, useEffect, useRef } from 'react';
import '../../styles/general/specialDiscount.css';

const SpecialDiscount = () => {
  const targetDateRef = useRef(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));

  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const distance = targetDateRef.current.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <section className="special-discount">
      <div className="discount-container">
        <div className="discount-image-side">
          <img
            src="https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500&h=500&fit=crop"
            alt="Fresh organic fruits and vegetables"
            className="discount-img"
            loading="lazy"
          />
        </div>

        <div className="discount-content">
          <p className="discount-label">Fruits, Dairy, and Vegetables</p>
          <h2 className="discount-title">
            Special Discount for All<br />
            <span>Organics</span> for You
          </h2>

          <div className="countdown">
            <div className="countdown-item">
              <span className="countdown-value">{pad(timeLeft.days)}</span>
              <span className="countdown-label">Days</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <span className="countdown-value">{pad(timeLeft.hours)}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <span className="countdown-value">{pad(timeLeft.minutes)}</span>
              <span className="countdown-label">Minutes</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <span className="countdown-value">{pad(timeLeft.seconds)}</span>
              <span className="countdown-label">Seconds</span>
            </div>
          </div>

          <a href="#products" className="discount-btn">
            Shop Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SpecialDiscount;
