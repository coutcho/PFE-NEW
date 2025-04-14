import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import PropertyCard from './PropertyCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../App.css';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import './CarouselStyles.css';

const NewestListings = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Fetch newest listings from the backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        const response = await fetch('http://localhost:3001/api/analytics/newest-listings');

        if (!response.ok) {
          const contentType = response.headers.get('Content-Type');
          let errorData = {};

          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const errorText = await response.text();
            console.error('Non-JSON response:', errorText.slice(0, 100));
            errorData = { message: 'Unexpected response format' };
          }

          console.error('Fetch error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorData,
          });

          throw new Error(`Failed to fetch newest listings: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText.slice(0, 100));
          throw new Error('Response is not valid JSON');
        }

        const data = await response.json();
        
        // Filter out properties with "Sold" status
        const filteredProperties = data.filter(property => property.status !== 'Sold');
        setProperties(filteredProperties);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching newest listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.classList.contains('carousel-container')) {
        if (e.key === 'ArrowLeft') {
          sliderRef.current.slickPrev();
        } else if (e.key === 'ArrowRight') {
          sliderRef.current.slickNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Custom arrow components with improved accessibility
  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="carousel-arrow carousel-arrow-prev"
      aria-label="Previous slide"
    >
      <FaChevronLeft />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="carousel-arrow carousel-arrow-next"
      aria-label="Next slide"
    >
      <FaChevronRight />
    </button>
  );

  const settings = {
    dots: false,
    infinite: properties.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (current, next) => setActiveSlide(next),
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { 
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '30px'
        },
      },
    ],
    customPaging: i => (
      <button
        aria-label={`Go to slide ${i + 1}`}
        className={`carousel-dot ${activeSlide === i ? 'carousel-dot-active' : ''}`}
      />
    ),
    dotsClass: 'carousel-dots',
  };

  const handleListingClick = (id) => {
    navigate(`/listing/${id}`);
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading newest listings...</p>
    </div>
  );

  if (error) return (
    <div className="container py-5 alert alert-danger">
      <p>Error: {error}</p>
      <button 
        className="btn btn-outline-primary mt-2" 
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );

  if (properties.length === 0) {
    return (
      <div className="container py-5 text-center">
        <p>No newest listings available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-center align-items-center mb-4">
        <h2>Nouvelles Annonces</h2>
      </div>
      
      <div className="row justify-content-center">
        <div 
          className="col-12 position-relative carousel-container" 
          tabIndex="0" 
          aria-label="Newest property listings carousel"
        >
          <Slider ref={sliderRef} {...settings}>
            {properties.map((property) => (
              <div
                key={property.id}
                className="carousel-slide"
              >
                <div className="property-card-wrapper">
                  <PropertyCard 
                    property={property} 
                    onClick={() => handleListingClick(property.id)}
                  />
                  {property.featured && (
                    <span className="featured-badge">
                      <FaStar /> Featured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default NewestListings;