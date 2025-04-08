import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../Body/FavoritesContext'; // Adjust the import path as needed
import PropertyCard from '../Body/PropertyCard'; // Adjust the import path as needed
import Carousel from 'react-bootstrap/Carousel'; // Import Carousel from react-bootstrap

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, refreshFavorites } = useFavorites();
  const [activeIndex, setActiveIndex] = useState(0);

  // Refresh favorites when the component mounts
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const handleGoToSearch = () => {
    navigate('/listings');
  };

  const handleCardClick = (id) => {
    navigate(`/listing/${id}`);
  };

  // Group properties into chunks of 3 for the carousel
  const chunkSize = 3;
  const chunkedFavorites = [];
  for (let i = 0; i < favorites.length; i += chunkSize) {
    chunkedFavorites.push(favorites.slice(i, i + chunkSize));
  }

  // Handle carousel navigation
  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
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
        ) : favorites.length <= 3 ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {favorites.map((property) => (
              <div key={property.id} className="col">
                <PropertyCard
                  property={property}
                  onClick={() => handleCardClick(property.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="carousel-container">
            <Carousel 
              activeIndex={activeIndex}
              onSelect={handleSelect}
              indicators={true}
              controls={true}
              interval={null}
              className="custom-carousel"
            >
              {chunkedFavorites.map((chunk, index) => (
                <Carousel.Item key={index}>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 carousel-row">
                    {chunk.map((property) => (
                      <div key={property.id} className="col">
                        <PropertyCard
                          property={property}
                          onClick={() => handleCardClick(property.id)}
                        />
                      </div>
                    ))}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
            
            <div className="carousel-pagination mt-3 d-flex justify-content-center">
              {chunkedFavorites.map((_, index) => (
                <button
                  key={index}
                  className={`pagination-dot mx-1 btn ${activeIndex === index ? 'btn-warning' : 'btn-outline-secondary'}`}
                  onClick={() => handleSelect(index)}
                  aria-label={`Slide ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;