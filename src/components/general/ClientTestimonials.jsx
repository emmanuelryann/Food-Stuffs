import '../../styles/general/clientTestimonials.css';

const ClientTestimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      rating: 5,
      text: 'Best organic products I\'ve found! The delivery was super fast and everything was incredibly fresh. Highly recommend to anyone!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Health Enthusiast',
      rating: 5,
      text: 'Amazing quality vegetables and excellent customer service. I\'ve been ordering every week and have never been disappointed!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 3,
      name: 'Emma Davis',
      role: 'Home Chef',
      rating: 4,
      text: 'Great prices and fantastic selection. My family loves the fresh produce we get delivered. Will definitely continue ordering!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    },
  ];

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={i < count ? '#ffa726' : 'rgba(255,255,255,0.2)'}
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ));
  };

  return (
    <section className="client-testimonials" id="contact">
      <div className="testimonials-container">
        <h2 className="testimonials-title">Client Testimonials</h2>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-avatar">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/80x80/4caf50/fff?text=${testimonial.name.charAt(0)}`;
                  }}
                />
              </div>
              <div className="testimonial-stars">{renderStars(testimonial.rating)}</div>
              <p className="testimonial-text">&ldquo;{testimonial.text}&rdquo;</p>
              <h4 className="testimonial-name">{testimonial.name}</h4>
              <p className="testimonial-role">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientTestimonials;
