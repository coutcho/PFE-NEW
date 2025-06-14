import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TourSection = ({
  imageSrc = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
  imageAlt = 'Modern home interior with large windows and natural light',
  title = 'Trouvez votre lieu idéal, à votre façon',
  description = 'Explorez toutes les annonces du site grâce à des outils de recherche puissants. Filtrez par emplacement, prix, type et bien plus encore—naviguez librement, sans inscription requise.',
  buttonText = 'Toutes Les Annonces',

  navigate = useNavigate(), // <-- THIS IS THE KEY FIX
  onButtonClick = () => {
    navigate('/listings');
  },
}) => {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="img-fluid rounded"
            />
          </div>
          <div className="col-lg-6">
            <h2 className="fw-bold mb-3">{title}</h2>
            <p className="text-muted mb-4">{description}</p>
            <button
              type="button"
              className="btn btn-dark"
              onClick={onButtonClick}
              aria-label={buttonText}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

TourSection.propTypes = {
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
};

export default TourSection;