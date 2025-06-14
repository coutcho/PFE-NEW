import React from 'react';
import PropertyCard from './PropertyCard';
import Footer from '../Footer/Footer'; // Import the Footer component
import "./StackedCSS.css";

const Stacked = ({ properties, onSelectProperty, selectedProperty }) => {
  return (
    <div className="property-list p-3">
      {properties.map((property) => (
        <div
          key={property.id}
          className={`mb-3 property-card ${
            selectedProperty?.id === property.id 
              ? 'border-primary selected shadow-lg' 
              : 'shadow-sm hover:shadow-md'
          }`}
          onClick={() => onSelectProperty(property)}
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <PropertyCard property={property} />
        </div>
      ))}
      <Footer /> {/* Add the Footer component here */}
    </div>
  );
};

export default Stacked;