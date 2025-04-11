import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropertyGallery from './PropertyGallery';
import PropertyDetails from './PropertyDetails';
import PropertyMap from './PropertyMap';
import ContactAgent from './ContactAgent';
import './ListingCSS.css';

function ListingPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshAgentTrigger, setRefreshAgentTrigger] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/properties/${id}`);
        if (!response.ok) {
          throw new Error('Échec de récupération des détails de la propriété');
        }
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Listen for a global login event (emitted by Navbar after successful login)
  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log('Événement de connexion réussie reçu dans ListingPage');
      setRefreshAgentTrigger(prev => prev + 1); // Trigger ContactAgent to re-fetch agent data
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  if (loading) return <div className="min-vh-100 bg-light">Chargement...</div>;
  if (error) return <div className="min-vh-100 bg-light">Erreur: {error}</div>;
  if (!property) return <div className="min-vh-100 bg-light">Propriété non trouvée</div>;

  return (
    <>
      <div className="min-vh-100 bg-light">
        <main className="pt-0">
          <PropertyGallery /> {/* Add property prop if needed */}
          
          <div className="container py-4">
            <div className="row">
              <div className="col-lg-8">
                <PropertyDetails property={property} />
                <PropertyMap location={{ lat: property.lat, lng: property.long }} address={property.location} />
              </div>
              <div className="col-lg-4">
                <ContactAgent 
                  property={property} 
                  refreshAgent={refreshAgentTrigger} // Pass the trigger as a prop
                />
              </div>
            </div>
          </div>
        </main>
      </div>
     
    </>
  );
}

export default ListingPage;