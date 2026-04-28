# Organigo Landing Page Components

## Overview
This folder contains all the React components for the Organigo organic vegetables e-commerce landing page, based on the provided design image.

## Components Structure

### Components Included:

1. **Header** - Navigation bar with logo, menu, search, and icons
2. **HeroSection** - Main hero section with CTA button and product showcase
3. **FeatureIcons** - Four feature cards (Best Product, Fast Delivery, Health Foods, Money Delivery)
4. **WeLoveTrend** - Product carousel showing trending vegetables
5. **WhyChooseUs** - Benefits section with reasons to choose Organigo
6. **BannerSection** - Two promotional banners with CTAs
7. **TrendingProducts** - Grid display of trending products with ratings
8. **ClientTestimonials** - Customer reviews and testimonials
9. **SpecialDiscount** - Special offer section with countdown timer
10. **LatestBlog** - Blog posts section with latest articles
11. **Newsletter** - Newsletter signup form
12. **Footer** - Footer with links, social media, and copyright
13. **LandingPage** - Main landing page component that combines all sections

## Corresponding Styles

All components have corresponding CSS files in the `styles/general/` folder:
- `header.css`
- `heroSection.css`
- `featureIcons.css`
- `weLoveTrend.css`
- `whyChooseUs.css`
- `bannerSection.css`
- `trendingProducts.css`
- `clientTestimonials.css`
- `specialDiscount.css`
- `latestBlog.css`
- `newsletter.css`
- `footer.css`
- `landingPage.css`

## Usage

### Import Individual Components:
```jsx
import { Header, HeroSection, FeatureIcons } from './components/general';
```

### Import the Complete Landing Page:
```jsx
import { LandingPage } from './components/general';

function App() {
  return <LandingPage />;
}
```

## Features

- **Responsive Design**: All components are mobile-friendly and work on all screen sizes
- **Interactive Elements**: Includes carousels, countdown timers, form submissions
- **Smooth Animations**: CSS animations for enhanced UX
- **Modern Color Scheme**: Green (#7bc043) and white theme matching Organigo branding
- **Accessibility**: Focus states and semantic HTML
- **Reusable Components**: Each section is independent and can be used separately

## Customization

### Colors:
- Primary Green: `#7bc043`
- Dark Green: `#1a3a1a`
- Light Gray: `#f9f9f9`

### Font Family:
All components use the system default font: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`

## Dependencies

- React (for component structure)
- CSS (for styling - no external CSS libraries required)

## Notes

- The countdown timer in SpecialDiscount is set to 5 days from the current time
- Product prices, names, and testimonials use sample data - replace with dynamic data from your backend
- The Newsletter form and Blog links are placeholder implementations
- All emoji icons can be replaced with proper image assets
