import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Building, MapPin, User, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { useNavigate } from 'react-router-dom';

// Utility function for authenticated API calls
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found. Please sign in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`card border-0 shadow-sm h-100 stat-card ${color}`}>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="icon-circle me-3">
            <Icon size={24} />
          </div>
          <h6 className="card-subtitle text-muted mb-0">{title}</h6>
        </div>
        <h2 className="card-title display-6 mb-0 fw-bold">{value}</h2>
      </div>
    </div>
  );
};

// PropertyCard Component
const PropertyCard = ({ property, onClick }) => {
  if (!property) return <div>Chargement de la propriété...</div>;

  const imageSrc = property.images_path && Array.isArray(property.images_path) && property.images_path.length > 0
    ? `http://localhost:3001/${property.images_path[0]}`
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';

  return (
    <div className="card h-100 property-card border-0 shadow-sm" onClick={() => onClick(property.id)}>
      <div className="position-relative">
        <img
          src={imageSrc}
          className="card-img-top"
          alt={property.name || 'Image de la propriété'}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        {property.favorite_count && (
          <span className="position-absolute top-0 end-0 m-2 badge bg-primary">
            <Star size={14} className="me-1" />
            {property.favorite_count}
          </span>
        )}
      </div>
      <div className="card-body">
        <h5 className="card-title mb-2">{property.name || 'Propriété sans titre'}</h5>
        <p className="card-text text-muted d-flex align-items-center">
          <MapPin size={16} className="me-2" />
          {property.location || 'Lieu inconnu'}
        </p>
      </div>
    </div>
  );
};

// AgentCard Component
const AgentCard = ({ name, avatar, rating, bio }) => {
  return (
    <div className="card border-0 shadow-sm mb-3 agent-card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="agent-avatar me-3">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
              alt={name}
              className="rounded-circle"
              width="60"
              height="60"
            />
          </div>
          <div>
            <h6 className="mb-1 fw-bold">{name}</h6>
            <div className="text-warning">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>
        <p className="card-text mt-3 text-muted small">{bio}</p>
      </div>
    </div>
  );
};

// PendingListingsCarousel Component
const PendingListingsCarousel = ({ pendingListings, loading, error, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0">
          <h5 className="mb-0 fw-bold">Propriétés en attene</h5>
        </div>
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0">
          <h5 className="mb-0 fw-bold">Propriétés en attene</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-danger mb-0">{error}</div>
        </div>
      </div>
    );
  }

  if (!pendingListings || pendingListings.length === 0) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0">
          <h5 className="mb-0 fw-bold">Propriétés en attene</h5>
        </div>
        <div className="card-body">
          <p className="text-muted text-center mb-0">Aucune liste en attente trouvée</p>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === pendingListings.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? pendingListings.length - 1 : prevIndex - 1
    );
  };

  const currentListing = pendingListings[currentIndex];
  const imageSrc = currentListing.images_path && Array.isArray(currentListing.images_path) && currentListing.images_path.length > 0
    ? `http://localhost:3001/${currentListing.images_path[0]}`
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';

  const handleStatusUpdate = async (propertyId, newStatus) => {
    try {
      await fetchWithAuth(`http://localhost:3001/api/properties/${propertyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating property status:', err);
    }
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Propriétés en attene</h5>
        <div>
          <span className="badge bg-warning me-2">{pendingListings.length} listes</span>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="position-relative">
          <img
            src={imageSrc}
            className="w-100"
            alt={currentListing.name || "Image de la propriété"}
            style={{ height: "200px", objectFit: "cover" }}
          />
          <div className="carousel-controls">
            <button
              className="btn btn-light btn-sm rounded-circle position-absolute start-0 top-50 translate-middle-y ms-2"
              onClick={prevSlide}
            >
              <span>&lsaquo;</span>
            </button>
            <button
              className="btn btn-light btn-sm rounded-circle position-absolute end-0 top-50 translate-middle-y me-2"
              onClick={nextSlide}
            >
              <span>&rsaquo;</span>
            </button>
          </div>
          <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-50 text-white">
            <h6 className="mb-0">{currentListing.name || "Propriété sans titre"}</h6>
            <div className="d-flex align-items-center small mt-1">
              <MapPin size={14} className="me-1" />
              <span>{currentListing.location || "Lieu inconnu"}</span>
            </div>
          </div>
          <span className="position-absolute top-0 end-0 m-2 badge bg-warning">{currentListing.status}</span>
        </div>
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="mb-0 text-muted small">Soumis par</p>
              <p className="mb-0 fw-medium">{currentListing.agent_name || "Agent inconnu"}</p>
            </div>
            <div className="text-end">
              <p className="mb-0 text-muted small">Date de soumission</p>
              <p className="mb-0 fw-medium">{currentListing.created_at || "Date inconnue"}</p>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleStatusUpdate(currentListing.id, 'Active')}
            >
              Rejeter
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleStatusUpdate(currentListing.id, 'Sold')}
            >
              Approuver
            </button>
          </div>
        </div>
      </div>
      <div className="card-footer bg-white border-0 pt-0">
        <div className="carousel-indicators">
          {pendingListings.map((_, index) => (
            <button
              key={index}
              className={`btn btn-sm rounded-circle mx-1 ${index === currentIndex ? 'btn-primary' : 'btn-light'}`}
              style={{ width: "10px", height: "10px", padding: 0 }}
              onClick={() => setCurrentIndex(index)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};



// Map Component
const AlgiersMap = ({ properties }) => {
  const defaultCenter = [36.7783, 3.0757];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-bold">Appartements autour d'Alger</h5>
      </div>
      <div className="card-body p-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {properties.map((property) => {
            if (!property.lat || !property.long) return null;
            return (
              <Marker
                key={property.id}
                position={[property.lat, property.long]}
              >
                <Popup>
                  <div>
                    <h5>{property.name}</h5>
                    <p>{property.location}</p>
                    <p>{property.price} DA</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

// ExpertStats Component
const ExpertStats = ({ expertStats, loadingExpertStats, errorExpertStats }) => {
  if (loadingExpertStats) {
    return <div className="text-center py-4">Chargement des statistiques des experts...</div>;
  }

  if (errorExpertStats) {
    return <div className="alert alert-danger">{errorExpertStats}</div>;
  }

  const maxRequests = Math.max(...expertStats.map(expert => expert.request_count)) || 1;

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-bold">Statistiques des experts</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nom de l'expert</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {expertStats.map((expert) => {
                const performanceRating = Math.round((expert.request_count / maxRequests) * 5);
                return (
                  <tr key={expert.expert_id}>
                    <td className="fw-medium">{expert.expert_name}</td>
                    <td>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < performanceRating ? 'text-warning' : 'text-muted'}
                          fill={i < performanceRating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [totalProperties, setTotalProperties] = useState(0);
  const [forRentCount, setForRentCount] = useState(0);
  const [forSaleCount, setForSaleCount] = useState(0);
  const [soldPropertiesCount, setSoldPropertiesCount] = useState(0); // New state for sold properties count
  const [popularProperties, setPopularProperties] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [algiersProperties, setAlgiersProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(null);

  // State for expert statistics
  const [expertStats, setExpertStats] = useState([]);
  const [loadingExpertStats, setLoadingExpertStats] = useState(true);
  const [errorExpertStats, setErrorExpertStats] = useState(null);

  // State for pending listings
  const [pendingListings, setPendingListings] = useState([]);
  const [loadingPendingListings, setLoadingPendingListings] = useState(true);
  const [errorPendingListings, setErrorPendingListings] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await fetchWithAuth('http://localhost:3001/api/users/me');
        setUserRole(userData.role); // e.g., "admin", "agent", "expert"
        setIsAuthenticated(true);

        if (userData.role === 'admin') {
          fetchAdminData();
        } else {
          fetchRegularData();
        }
      } catch (error) {
        setError(error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (localStorage.getItem('authToken')) {
      fetchUserData();
    } else {
      window.location.href = 'http://localhost:5173/signin';
    }
  }, []);

  useEffect(() => {
    const fetchExpertStats = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:3001/api/analytics/home-values/expert-stats');
        setExpertStats(response);
      } catch (err) {
        setErrorExpertStats(err.message);
      } finally {
        setLoadingExpertStats(false);
      }
    };

    fetchExpertStats();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      // Start loading pending listings
      setLoadingPendingListings(true);

      const [
        totalProps,
        propsByStatus,
        inquiriesPerProperty,
        propsPerAgent,
        mostFavoritedProperties,
        pendingProps,
        soldPropsCount, // New fetch for sold properties count
      ] = await Promise.all([
        fetchWithAuth('http://localhost:3001/api/analytics/properties/total'),
        fetchWithAuth('http://localhost:3001/api/analytics/properties/by-status'),
        fetchWithAuth('http://localhost:3001/api/analytics/inquiries/per-property'),
        fetchWithAuth('http://localhost:3001/api/analytics/properties/per-agent'),
        fetchWithAuth('http://localhost:3001/api/analytics/most-favorited'),
        fetchWithAuth('http://localhost:3001/api/analytics/properties/pending'),
      ]);

      // Set pending listings
      setPendingListings(pendingProps.map(listing => ({
        ...listing,
        submission_date: new Date(listing.created_at).toLocaleDateString()
      })));
      setLoadingPendingListings(false);

      setTotalProperties(totalProps.totalProperties || 0);
      const forRent = propsByStatus.find((s) => s.status.toLowerCase() === 'for rent');
      const forSale = propsByStatus.find((s) => s.status.toLowerCase() === 'active');
      const soldCount = propsByStatus.find((s) => s.status.toLowerCase() === 'sold');
      setForRentCount(forRent ? forRent.count : 0);
      setForSaleCount(forSale ? forSale.count : 0);
      setSoldPropertiesCount(soldCount ? soldCount.count : 0);

      setPopularProperties(mostFavoritedProperties);

      const sortedAgents = propsPerAgent
        .sort((a, b) => b.propertycount - a.propertycount)
        .slice(0, 2);

      // Calculate maximum properties to determine performance scaling
      const maxProperties = Math.max(...sortedAgents.map(agent => agent.propertycount)) || 1;

      setTopAgents(
        sortedAgents.map((agent) => {
          // Calculate performance rating (1-5 stars)
          const performanceRating = Math.round((agent.propertycount / maxProperties) * 5);
          return {
            name: agent.agentname,
            avatar: agent.avatar || 'default-avatar.png',
            rating: performanceRating,
            bio: agent.bio || 'Aucune bio disponible',
          };
        })
      );

      setRecentMessages([]); // Placeholder

      // Fetch properties around Algiers
      const algiersProps = await fetchWithAuth('http://localhost:3001/api/analytics/properties/in-algiers');
      setAlgiersProperties(algiersProps);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(`Error fetching data: ${error.message}`);
      setErrorPendingListings(error.message);
    } finally {
      setIsLoading(false);
      setLoadingPendingListings(false);
    }
  };

  const fetchRegularData = async () => {
    try {
      const totalProps = await fetchWithAuth('http://localhost:3001/api/analytics/properties/total');
      setTotalProperties(totalProps.totalProperties || 0);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching regular data:', error);
    }
  };

  const handleListingClick = (id) => {
    navigate(`/listing/${id}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur</h4>
          <p>{error}</p>
          <hr />
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.removeItem('authToken');
              setIsAuthenticated(false);
            }}
          >
            Se connecter à nouveau
          </button>
        </div>
      </div>
    );
  }

  if (userRole && userRole !== 'admin') {
    window.location.href = 'http://localhost:5173/user-dashboard';
    return null;
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <h1 className="mb-4">Tableau de bord</h1>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard
            title="Total des propriétés"
            value={totalProperties}
            icon={Home}
            color="bg-primary-subtle"
          />
        </div>
        {userRole === 'admin' && (
          <>
            <div className="col-md-3">
              <StatCard
                title="À louer"
                value={forRentCount}
                icon={DollarSign}
                color="bg-success-subtle"
              />
            </div>
            <div className="col-md-3">
              <StatCard
                title="À vendre"
                value={forSaleCount}
                icon={Building}
                color="bg-warning-subtle"
              />
            </div>
            <div className="col-md-3">
              <StatCard
                title="Vendues"
                value={soldPropertiesCount}
                icon={Building}
                color="bg-danger-subtle"
              />
            </div>
          </>
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0 fw-bold">Propriétés populaires</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {popularProperties.map((property, index) => (
                  <div key={index} className="col-md-6">
                    <PropertyCard
                      property={{
                        id: property.id,
                        name: property.title,
                        location: property.location,
                        images_path: property.images_path,
                        favorite_count: property.favorite_count
                      }}
                      onClick={handleListingClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AlgiersMap properties={algiersProperties} />
        </div>

        <div className="col-lg-4">
          {userRole === 'admin' && (
            <>
              <ExpertStats
                expertStats={expertStats}
                loadingExpertStats={loadingExpertStats}
                errorExpertStats={errorExpertStats}
              />

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0 fw-bold">Meilleurs agents</h5>
                </div>
                <div className="card-body">
                  {topAgents.map((agent, index) => (
                    <AgentCard
                      key={index}
                      name={agent.name}
                      rating={agent.rating}
                    />
                  ))}
                </div>
              </div>

              {/* Add Pending Listings Carousel here */}
              <PendingListingsCarousel
                pendingListings={pendingListings}
                loading={loadingPendingListings}
                error={errorPendingListings}
                onUpdate={fetchAdminData}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
