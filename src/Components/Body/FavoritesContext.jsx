import { createContext, useState, useEffect, useContext } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem('authToken'); // Adjust key if needed, e.g., 'authToken'

  // Function to fetch favorites from the server
  const fetchFavorites = async () => {
    console.log('Token:', token);
    if (!token) {
      setFavorites([]);
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/properties/favorites', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Fetch status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched favorites:', data);
        setFavorites(data);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Fetch favorites when the token changes or on initial mount
  useEffect(() => {
    fetchFavorites();
  }, [token]);

  // Function to check if a property is a favorite
  const isFavorite = (propertyId) => favorites.some((fav) => fav.id === propertyId);

  // Function to add a favorite
  const addFavorite = async (property) => {
    if (!token) return;
    console.log('Adding favorite:', property.id);
    try {
      const response = await fetch('http://localhost:3001/api/properties/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId: property.id }),
      });
      console.log('Add favorite response:', response.status);
      if (response.ok) {
        // Refresh favorites after adding
        await fetchFavorites();
      } else {
        const errorText = await response.text();
        console.error('Failed to add favorite:', errorText);
      }
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };

  // Function to remove a favorite
  const removeFavorite = async (propertyId) => {
    if (!token) return;
    console.log('Removing favorite:', propertyId);
    try {
      const response = await fetch(`http://localhost:3001/api/properties/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Remove favorite response:', response.status);
      if (response.ok) {
        // Refresh favorites after removing
        await fetchFavorites();
      } else {
        const errorText = await response.text();
        console.error('Failed to remove favorite:', errorText);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  // Function to handle favorite toggle
  const handleFavorite = async (propertyId) => {
    console.log('Handling favorite toggle for:', propertyId);
    if (isFavorite(propertyId)) {
      await removeFavorite(propertyId);
    } else {
      await addFavorite({ id: propertyId }); // Assuming property object with id
    }
  };

  // Context value including refreshFavorites
  const value = {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    handleFavorite,
    refreshFavorites: fetchFavorites, // Expose fetchFavorites as refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};