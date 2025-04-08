// src/Components/ListingPage/PropertyDetails.jsx
import React from 'react';
import { Bed, Bath, Square, Heart, Share, Building, Sofa } from 'lucide-react';
import { useFavorites } from '../Body/FavoritesContext'; // Adjusted relative path

export default function PropertyDetails({ property }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const handleSaveClick = (e) => {
    e.preventDefault();
    console.log('Save button clicked for property:', property.id);
    if (isFavorite(property.id)) {
      removeFavorite(property.id);
    } else {
      addFavorite(property);
    }
  };

  const handleShareClick = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        alert('Lien copié dans le presse-papiers !');
      })
      .catch((err) => {
        console.error('Échec de la copie : ', err);
      });
  };

  const capitalizeTitle = (title) => {
    if (!title) return '';
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 fw-bold">{capitalizeTitle(property.title)}</h1>
            <p className="text-muted fs-5">{property.location}</p>
            <p className="fs-3 fw-bold text-primary mt-3">
              {property.price.toLocaleString('en-US')} DA
            </p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className={`btn d-flex align-items-center gap-2 ${
                isFavorite(property.id) ? 'btn-danger' : 'btn-outline-secondary'
              }`}
              onClick={handleSaveClick}
            >
              <Heart 
                size={20} 
                fill={isFavorite(property.id) ? 'white' : 'none'} 
                className={isFavorite(property.id) ? 'text-white' : ''}
              />
              <span>{isFavorite(property.id) ? 'Enregistré' : 'Enregistrer'}</span>
            </button>
            <button 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleShareClick}
            >
              <Share size={20} />
              <span>Partager</span>
            </button>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Bed className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Chambres</small>
                <p className="mb-0 fw-semibold">{property.bedrooms}</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            {property.bathrooms !== undefined && property.bathrooms !== null ? (
              <div className="d-flex align-items-center">
                <Bath className="text-primary me-2" size={24} />
                <div>
                  <small className="text-muted">Salles de bain</small>
                  <p className="mb-0 fw-semibold">{property.bathrooms}</p>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Building className="text-primary me-2" size={24} />
                <div>
                  <small className="text-muted">Étage</small>
                  <p className="mb-0 fw-semibold">
                    {property.etage !== undefined && property.etage !== null 
                      ? `${property.etage}${property.etage === 1 ? "er" : "ème"}` 
                      : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Square className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Superficie (m²)</small>
                <p className="mb-0 fw-semibold">{property.square_footage.toLocaleString('fr-DZ')}</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Sofa className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Équipée</small>
                <p className="mb-0 fw-semibold">{property.equipped ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold">Description</h2>
          <p className="text-muted">{property.description}</p>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold">Caractéristiques et Équipements</h2>
          <div className="row mt-3">
            {property.features && property.features.length > 0 ? (
              property.features.map((feature, index) => (
                <div key={index} className="col-12 col-md-4 mb-2">
                  <div className="d-flex align-items-center">
                    <div className="feature-dot"></div>
                    <span>{feature}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucune caractéristique disponible</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}