import { useState, useEffect, useCallback } from 'react';
import '../../styles/general/header.css';

const Header = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const openSideNav = () => {
    setIsSideNavOpen(true);
    document.body.classList.add('no-scroll');
  };

  const closeSideNav = useCallback(() => {
    setIsSideNavOpen(false);
    document.body.classList.remove('no-scroll');
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // Intersection Observer for Active Section
  useEffect(() => {
    const sections = ['home', 'about', 'products', 'blog', 'footer'];
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const id = href.substring(1);
      const target = document.getElementById(id);
      
      if (target) {
        closeSideNav();
        
        setTimeout(() => {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          setActiveSection(id);
        }, isSideNavOpen ? 300 : 0);
      }
    }
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Products', href: '#products' },
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '#footer' },
  ];

  return (
    <header className="header">
      {/* Top Row: Logo & Navigation */}
      <div className="header-top">
        <div className="header-top-inner">
          <div className="header-logo">
            <span className="logo-leaf" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" fill="#4caf50"/>
              </svg>
            </span>
            <h1 className="logo-text">Organigo</h1>
          </div>

          <nav className="header-nav">
            <ul className="nav-links">
              {navLinks.map((link) => {
                const sectionId = link.href.substring(1);
                const isActive = activeSection === sectionId;
                return (
                  <li key={link.href}>
                    <a 
                      href={link.href} 
                      onClick={handleNavClick}
                      className={isActive ? 'active' : ''}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Hamburger Button (Mobile Only) */}
          <button
            className={`hamburger-btn ${isSideNavOpen ? 'is-open' : ''}`}
            onClick={isSideNavOpen ? closeSideNav : openSideNav}
            aria-label={isSideNavOpen ? 'Close menu' : 'Open menu'}
            id="hamburger-btn"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Departments, Search, Icons */}
      <div className="header-bottom">
        <div className="header-bottom-inner">
          <div className="departments-wrapper">
            <button className="departments-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
              All Categories
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
          </div>

          <div className="header-search">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search Any Fruits, Vegetable..."
                className="search-input"
                id="header-search"
              />
              <button className="search-btn" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="header-icons">
            <button className="icon-btn" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <button className="icon-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </button>
            <button className="icon-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              <span className="cart-badge">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`side-nav-overlay ${isSideNavOpen ? 'is-visible' : ''}`}
        onClick={closeSideNav}
        aria-hidden="true"
      />

      {/* Side Navigation (Mobile) */}
      <aside className={`side-nav ${isSideNavOpen ? 'is-open' : ''}`}>
        <div className="side-nav-header">
          {/* <div className="header-logo">
            <span className="logo-leaf" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" fill="#4caf50"/>
              </svg>
            </span>
            <span className="logo-text">Organigo</span>
          </div> */}
          {/* <button className="close-btn" onClick={closeSideNav}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button> */}
        </div>
        <ul className="side-nav-links">
          {navLinks.map((link) => {
            const sectionId = link.href.substring(1);
            const isActive = activeSection === sectionId;
            return (
              <li key={link.href}>
                <a 
                  href={link.href} 
                  onClick={handleNavClick}
                  className={isActive ? 'active' : ''}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </aside>
    </header>
  );
};

export default Header;
