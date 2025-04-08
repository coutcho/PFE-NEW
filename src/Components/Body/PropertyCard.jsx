import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaBed, FaBath, FaRuler, FaBuilding, FaChair } from 'react-icons/fa';
import { useFavorites } from './FavoritesContext.jsx';

const PropertyCard = ({ property, onClick }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  if (!property) {
    return <div>Loading property...</div>;
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    console.log('Favorite button clicked for property:', property.id);
    if (isFavorite(property.id)) {
      removeFavorite(property.id);
    } else {
      addFavorite(property);
    }
  };

  // Function to translate status to French
  const getFrenchStatus = (status) => {
    if (!status) return 'Unknown';
    const lowerCaseStatus = status.toLowerCase();
    if (lowerCaseStatus === 'active') return 'À vendre';
    if (lowerCaseStatus === 'for rent') return 'À louer';
    return status; // Return original status if not recognized
  };

  const imageSrc = property.images_path && Array.isArray(property.images_path) && property.images_path.length > 0 
    ? `http://localhost:3001/${property.images_path[0]}` 
    : 'https://via.placeholder.com/800';

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <motion.div
      className="card pointer h-100"
      style={{ cursor: 'pointer' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="position-relative">
        <img
          src={imageSrc}
          className="card-img-top"
          alt={property.title || 'Property Image'}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
          {getFrenchStatus(property.status)}
        </span>
        <button
          className="position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-2"
          onClick={handleFavoriteClick}
        >
          {isFavorite(property.id) ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
      </div>
      <div className="card-body">
        <h5 className="card-title">{toTitleCase(property.title) || 'Untitled Property'}</h5>
        <h5 className="mb-2" style={{ color: '#007bff', fontSize: '1.4rem', fontWeight: 'bold' }}>
          {(typeof property.price === 'number' ? property.price : 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DA
        </h5>
        <div className="d-flex gap-3 mb-2">
          <span>
            <FaBed className="me-1" /> {property.bedrooms || 0} chambre
          </span>
          {property.bathrooms !== undefined && property.bathrooms !== null ? (
            <span>
              <FaBath className="me-1" /> {property.bathrooms} baths
            </span>
          ) : (
            <span>
              <FaBuilding className="me-1" /> 
              {property.etage !== undefined && property.etage !== null ? `${property.etage}${property.etage === 1 ? "er" : "ème"}` : "N/A"} etg
            </span>
          )}
          <span>
            <FaRuler className="me-1" /> {(property.square_footage || 0).toLocaleString('fr-DZ')} m²
          </span>
          <span>
            <FaChair className="me-1" /> {(property.equipped ?? false) ? 'oui' : 'non'}
          </span>
        </div>
        <p className="card-text text-muted">{property.location || 'Unknown Location'}</p>
      </div>
    </motion.div>
  );
};

export default PropertyCard;