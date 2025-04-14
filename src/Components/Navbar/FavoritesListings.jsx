import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../Body/FavoritesContext'; // Adjust the import path as needed
import PropertyCard from '../Body/PropertyCard'; // Adjust the import path as needed
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Move arrow components outside the main function to prevent re-renders
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

function FavoritesPage() {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const { favorites, refreshFavorites } = useFavorites();
  const [activeSlide, setActiveSlide] = useState(0);

  // Refresh favorites when the component mounts
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

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

  const handleGoToSearch = () => {
    navigate('/listings');
  };

  const handleCardClick = (id) => {
    navigate(`/listing/${id}`);
  };

  const settings = {
    dots: false,
    infinite: favorites.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (current, next) => setActiveSlide(next),
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

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center">
      <div className="container py-5">
        <h1 className="mb-4 text-center">Favoris</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center">
            <h3 className="mb-4">
              Enregistrez tous vos logements favoris en un seul endroit.
            </h3>
            <button
              className="btn btn-warning btn-lg"
              onClick={handleGoToSearch}
            >
              Voir les Annonces
            </button>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div 
              className="col-12 position-relative carousel-container" 
              tabIndex="0" 
              aria-label="Favorite property listings carousel"
            >
              <Slider ref={sliderRef} {...settings}>
                {favorites.map((property) => (
                  <div
                    key={property.id}
                    className="carousel-slide"
                  >
                    <div className="property-card-wrapper">
                      <PropertyCard 
                        property={property} 
                        onClick={() => handleCardClick(property.id)}
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;