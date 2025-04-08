import React, { useState, useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import FilterSidebar from './FilterSidebar';

export default function SearchBar({ onApplyFilters }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const locationQuery = suggestion.display_name; // Use full display_name for word-based matching
    setSearchInput(locationQuery);
    setShowSuggestions(false);
    navigate(`/listings?location=${encodeURIComponent(locationQuery)}`);
  };

  const handleSearchClick = () => {
    if (searchInput.trim() === '') {
      navigate('/listings'); // No query parameters, show all listings
    } else {
      navigate(`/listings?location=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleClickOutside = (event) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container w-50 position-relative">
      <div className="input-group shadow d-flex gap-2 position-relative">
        <input
          type="text"
          className="form-control form-control-lg rounded"
          placeholder="Rechercher une ville, un quartier..."
          aria-label="Search"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button
          className="btn btn-primary btn-md rounded"
          type="button"
          onClick={handleSearchClick}
        >
          Rechercher
        </button>
        <button className="btn btn-light rounded-circle" onClick={toggleFilter}>
          <Filter className="w-5 h-5" />
        </button>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="list-group position-absolute w-75"
            style={{ top: '100%', zIndex: 1000 }}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="list-group-item list-group-item-action"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={`filter-sidebar bg-dark text-white ${isFilterOpen ? 'open' : ''}`}
        style={{ minWidth: '0px', zIndex: 1000 }}
      >
        <FilterSidebar
          onApplyFilters={onApplyFilters}
          onClose={() => setIsFilterOpen(false)}
          selectedLocation={searchInput}
        />
      </div>

      {isFilterOpen && (
        <div
          className="filter-overlay"
          onClick={toggleFilter}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        ></div>
      )}
    </div>
  );
}