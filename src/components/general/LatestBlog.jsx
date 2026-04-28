import '../../styles/general/latestBlog.css';

const LatestBlog = () => {
  const blogs = [
    {
      id: 1,
      title: 'Organic Foods Are Helping For Your Body Health',
      date: 'Jan 15, 2024',
      category: 'Health',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=280&fit=crop',
    },
    {
      id: 2,
      title: 'Organic Fruits Are Helping For Your Health',
      date: 'Jan 10, 2024',
      category: 'Nutrition',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=280&fit=crop',
    },
    {
      id: 3,
      title: 'Organics Habits Are Helping To Your Health',
      date: 'Jan 05, 2024',
      category: 'Wellness',
      image: 'https://images.unsplash.com/photo-1457296898342-cdd24585d095?w=400&h=280&fit=crop',
    },
  ];

  return (
    <section className="latest-blog" id="blog">
      <div className="blog-container">
        <h2 className="section-title">Our Latest Blog</h2>

        <div className="blog-grid">
          {blogs.map((blog) => (
            <article key={blog.id} className="blog-card">
              <div className="blog-card-image">
                <img
                  src={blog.image}
                  alt={blog.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/400x280/e8f5e9/4caf50?text=Blog`;
                  }}
                />
                <span className="blog-category">{blog.category}</span>
              </div>
              <div className="blog-card-content">
                <h3 className="blog-card-title">{blog.title}</h3>
                <div className="blog-card-meta">
                  <span className="blog-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                    </svg>
                    {blog.date}
                  </span>
                  <a href="#blog" className="blog-read-more">
                    Read More
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestBlog;
