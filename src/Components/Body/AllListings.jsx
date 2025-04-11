import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Stacked from './Stacked';
import AllMap from './AllMap';
import SearchBar from '../Navbar/Searchbar';

function AllListings() {
  const [fetchedProperties, setFetchedProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchAndFilterProperties = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        console.log('AllListings: Query Parameters:', Object.fromEntries(queryParams));

        const typeFilter = queryParams.get('type');
        const url = typeFilter
          ? `http://localhost:3001/api/properties?type=${typeFilter}`
          : 'http://localhost:3001/api/properties';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('AllListings: Fetched properties:', data);
        setFetchedProperties(data);

        const isEquippedParam = queryParams.get('equipped');
        const isEquipped = isEquippedParam === 'true' 
          ? true 
          : isEquippedParam === 'false' 
            ? false 
            : null;

        const filters = {
          minPrice: parseInt(queryParams.get('minPrice')) || 0,
          maxPrice: queryParams.get('maxPrice') ? parseInt(queryParams.get('maxPrice')) : Infinity,
          minSurface: parseInt(queryParams.get('minSurface')) || 0,
          maxSurface: queryParams.get('maxSurface') ? parseInt(queryParams.get('maxSurface')) : Infinity,
          minRooms: parseInt(queryParams.get('minRooms')) || 0,
          maxRooms: queryParams.get('maxRooms') ? parseInt(queryParams.get('maxRooms')) : Infinity,
          selectedWilaya: queryParams.get('location') || '',
          propertyType: queryParams.get('type') || '',
          engagementType: queryParams.get('engagement') || '',
          isEquipped: isEquipped,
        };
        console.log('AllListings: Parsed Filters:', filters);

        const filteredProperties = applyFilters(data, filters);
        console.log('AllListings: Filtered properties:', filteredProperties);
        setProperties(filteredProperties);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilterProperties();
  }, [location.search]);

  const applyFilters = (properties, filters) => {
    let filtered = [...properties];

    const cleanText = (text) => text
      .replace(/[^\w\s]/g, '')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word);

    if (filters.selectedWilaya) {
      const searchPhrases = filters.selectedWilaya
        .split(',')
        .map(phrase => phrase.trim().toLowerCase())
        .filter(phrase => phrase.length > 0);

      filtered = filtered.filter(p => {
        const locationText = (p.location || '').toLowerCase();
        const matches = searchPhrases.some(phrase => locationText.includes(phrase));
        console.log(`Location: "${p.location}" matches any of "${filters.selectedWilaya}" -> ${matches}`);
        return matches;
      });
    }

    if (filters.minPrice > 0) {
      filtered = filtered.filter(p => {
        const price = p.price || 0;
        const matches = price >= filters.minPrice;
        console.log(`Price: ${price} >= ${filters.minPrice} -> ${matches}`);
        return matches;
      });
    }

    if (filters.maxPrice !== Infinity) {
      filtered = filtered.filter(p => {
        const price = p.price || 0;
        const matches = price <= filters.maxPrice;
        console.log(`Price: ${price} <= ${filters.maxPrice} -> ${matches}`);
        return matches;
      });
    }

    if (filters.minSurface > 0) {
      filtered = filtered.filter(p => {
        const sf = p.square_footage || 0;
        const matches = sf >= filters.minSurface;
        console.log(`Square Footage: ${sf} >= ${filters.minSurface} -> ${matches}`);
        return matches;
      });
    }

    if (filters.maxSurface !== Infinity) {
      filtered = filtered.filter(p => {
        const sf = p.square_footage || 0;
        const matches = sf <= filters.maxSurface;
        console.log(`Square Footage: ${sf} <= ${filters.maxSurface} -> ${matches}`);
        return matches;
      });
    }

    if (filters.minRooms > 0) {
      filtered = filtered.filter(p => {
        const beds = p.bedrooms || 0;
        const matches = beds >= filters.minRooms;
        console.log(`Bedrooms: ${beds} >= ${filters.minRooms} -> ${matches}`);
        return matches;
      });
    }

    if (filters.maxRooms !== Infinity) {
      filtered = filtered.filter(p => {
        const beds = p.bedrooms || 0;
        const matches = beds <= filters.maxRooms;
        console.log(`Bedrooms: ${beds} <= ${filters.maxRooms} -> ${matches}`);
        return matches;
      });
    }

    if (filters.propertyType) {
      filtered = filtered.filter(p => {
        const type = (p.type || '').toLowerCase();
        const matches = type === filters.propertyType.toLowerCase();
        console.log(`Type: "${type}" === "${filters.propertyType}" -> ${matches}`);
        return matches;
      });
    }

    if (filters.engagementType) {
      const statusMap = {
        achat: 'Active',
        location: 'For Rent',
      };
      const status = statusMap[filters.engagementType];
      if (status) {
        filtered = filtered.filter(p => {
          const propStatus = (p.status || '').toLowerCase();
          const filterStatus = status.toLowerCase();
          const matches = propStatus === filterStatus;
          console.log(`Status: "${propStatus}" === "${filterStatus}" -> ${matches}`);
          return matches;
        });
      }
    }

    if (filters.isEquipped !== null) {
      filtered = filtered.filter(p => {
        const propEquipped = p.equipped === true || p.equipped === 'oui';
        const matches = propEquipped === filters.isEquipped;
        console.log(`Equipped: ${propEquipped} === ${filters.isEquipped} -> ${matches}`);
        return matches;
      });
    }

    return filtered;
  };

  const handleApplyFilters = (newFilters) => {
    console.log('AllListings: Received filters:', newFilters);
    const filteredProperties = applyFilters(fetchedProperties, newFilters);
    setProperties(filteredProperties);
  };

  return (
    <div className="position-fixed w-100 h-100 d-flex flex-column">
      <div className="position-absolute top-0 w-100 bg-white shadow-sm z-3 py-2 d-flex justify-content-center">
        <SearchBar onApplyFilters={handleApplyFilters} />
      </div>
      
      <div className="d-flex h-100 mt-5">
        {/* Listings Panel */}
        <div 
          className="listings-panel bg-white shadow-sm" 
          style={{ width: '600px', height: 'calc(100vh - 56px)', overflowY: 'auto' }}
        >
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3" role="alert">
              Error: {error}
            </div>
          ) : properties.length === 0 ? (
            <p className="mt-3">
              No properties found.
            </p>
          ) : (
            <Stacked
              properties={properties}
              onSelectProperty={setSelectedProperty}
              selectedProperty={selectedProperty}
            />
          )}
        </div>

        {/* Map Container */}
        <div className="flex-grow-1 position-relative">
          <div className="position-absolute top-0 start-0 w-100 h-100">
            <AllMap 
              properties={properties} 
              selectedProperty={selectedProperty} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllListings;